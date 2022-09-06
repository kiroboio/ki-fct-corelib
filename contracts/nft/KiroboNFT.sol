// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

/** @notice this is the Kirobo first utility NFT
this NFT returns gas fees according to the NFT logic defined in the Kirobo site
https://www.kirobo.io/
the NFT is connected to a GasReturn contract and each NFT id has it's own
amount of gas fees to be returned for the gas used via the kirobo liquid vault */

//import "openzeppelin-solidity/contracts/token/ERC721/ERC721.sol";
import "openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "openzeppelin-solidity/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "openzeppelin-solidity/contracts/security/Pausable.sol";
import "openzeppelin-solidity/contracts/access/AccessControl.sol";
import "openzeppelin-solidity/contracts/token/ERC20/utils/SafeERC20.sol";
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/utils/Strings.sol";
import "../interfaces/IGasReturn.sol";

contract KiroboNFT is
  //ERC721,
  ERC721Enumerable,
  ERC721URIStorage,
  Pausable,
  AccessControl
{
  using Strings for uint256;

  bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
  bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
  string private constant TABLE =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  bytes32 private s_alternativeURIHash;
  address private s_gasReturnContract;
  string private s_NFTBaseURI;
  string private s_penaltyFreeDate;

  /** CONSTRUCTOR **************************************************
    @param baseUri - the initial baseUri - the path to the hidden pictures
    @param alternativeURIHash - a hash that is made from the path of the pictures after the reveal
    @param minter - minter contract address */
  constructor(
    string memory baseUri,
    bytes32 alternativeURIHash,
    address minter
  ) ERC721("Kirobo NFT", "KFT") {
    s_NFTBaseURI = baseUri;
    s_alternativeURIHash = alternativeURIHash;
    _grantRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _grantRole(MINTER_ROLE, minter);
    _grantRole(PAUSER_ROLE, _msgSender());
  }

  /** @dev this function updated the GasReturn Contract address
    @param gasReturnContract address of the GasReturn contract */
  function updateGasReturnContractAddress(address gasReturnContract)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    s_gasReturnContract = gasReturnContract;
  }

  /**@dev return gas contract address */
  function getGasReturnContractAddress() external view returns (address) {
    return s_gasReturnContract;
  }

  /** @notice this function replaces the URI path in order to be able to hide the NFT's data before the reveal.
    the path for the NFT's after the reveal is loaded as a hash to the contract at the contractor
    (so it can't be changed), and after the reveal a new path is sent and only if the new
    path's has is identical the uri base address is replaced
    @param NewUri - input - the new uri path */
  function _updateBaseURI(string memory NewUri)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    require(
      keccak256(abi.encodePacked(NewUri)) == s_alternativeURIHash,
      "new URI address doesn't match"
    );
    s_NFTBaseURI = NewUri;
  }

  function getBaseUri() external view returns (string memory) {
    return s_NFTBaseURI;
  }

  /** @dev a minting function that can only be activated from the minter contract
    @param to - input - address that receives the NFT
    @param id - input - the NFT ID that was issued in the mint
    @param uri - input - the file picture file name assosiated with the specific NFT ID */
  function mint(
    address to,
    uint256 id,
    string memory uri
  ) external onlyRole(MINTER_ROLE) whenNotPaused() {
    _mint(to, id);
    super._setTokenURI(id, string(abi.encodePacked(s_NFTBaseURI, "/", uri)));
  }

  /** @notice a future date in the format of DD/MM/YYYY, that is the date where all the
    funds are aligible for collect without and penalty.
    @param input - penalty free date */
  function setPenaltyFreeDate(string memory input)
    external
    onlyRole(DEFAULT_ADMIN_ROLE)
  {
    s_penaltyFreeDate = input;
  }

  function getPenaltyFreeDate() external view returns (string memory) {
    return s_penaltyFreeDate;
  }

  function _beforeConsecutiveTokenTransfer(
        address,
        address,
        uint256,
        uint96
    ) internal virtual override (ERC721Enumerable, ERC721){
        revert("ERC721Enumerable: consecutive transfers not supported");
    }

  function pause() external onlyRole(PAUSER_ROLE) {
    _pause();
  }

  function unpause() external onlyRole(PAUSER_ROLE) {
    _unpause();
  }

  /** @notice a public function that returns the remaining Gas to be used in the GasReturn contract for this specific NFT
    and the available kiro amount that can be collected (penaly included).
    @dev the data received is comming from the GasReturn contract via the interface
    @param i_id NFT ID
    @param gasRemaining - output
    @param kiroToCollect - output */
  function getProperties(uint256 i_id)
    external
    view
    returns (uint256 gasRemaining, uint256 kiroToCollect)
  {
    gasRemaining = IGasReturn(s_gasReturnContract).getGasRemaining(i_id);
    kiroToCollect = IGasReturn(s_gasReturnContract).getKiroAvailableToCollect(
      i_id
    );
  }

  /** @dev returns a string that represents the URI for the NFT: the picture,
    properties and all related attributes
    @param tokenId NFT ID */
  function tokenURI(uint256 tokenId)
    public
    view
    override(ERC721, ERC721URIStorage)
    returns (string memory)
  {
    string memory metadata = string(
      abi.encodePacked(
        '{"name": "Kirobo NFT",',
        '"description": "Kirobo first NFT token.<br /><br />Buyers: make sure you check the updated balance of the NFT token.",',
        '"image": "',
        super.tokenURI(tokenId),
        '", "attributes":',
        compileAttributes(tokenId),
        "}"
      )
    );

    return
      string(
        abi.encodePacked(
          "data:application/json;base64,",
          base64(bytes(metadata))
        )
      );
  }

  function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, ERC721Enumerable, AccessControl)
    returns (bool)
  {
    return super.supportsInterface(interfaceId);
  }

  function _beforeTokenTransfer(
    address from,
    address to,
    uint256 tokenId
  ) internal virtual override(ERC721, ERC721Enumerable) whenNotPaused {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  /** @notice a function that stops the sale of this NFT in case the funds that are related to it
    are curently in a status that is able to be collected.
    @param from - sender
    @param to - receiver
    @param tokenId - NFT ID */
  function _transfer(
    address from,
    address to,
    uint256 tokenId
  ) internal override {
    require(IGasReturn(s_gasReturnContract).isRequestedToCollect(tokenId) == false, "Can't sell NFT while there is a Pending/Approved collect reward request");
    _beforeTokenTransfer(from, to, tokenId);
    super._transfer(from, to, tokenId);
  }

  function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  /** @notice the values of "Free Gas left in kiro" and "Kiro to collect"
    will be displayed rounded up to 10**18
    @dev creates attributes for Opensea display
    @param tokenId NFT ID */
  function compileAttributes(uint256 tokenId)
    internal
    view
    returns (string memory)
  {
    uint256 gasRemaining = (
      IGasReturn(s_gasReturnContract).getGasRemaining(tokenId)
    ) / (10**18);
    uint256 kiroToCollect = (
      IGasReturn(s_gasReturnContract).getKiroAvailableToCollect(tokenId)
    ) / (10**18);

    string memory attributes = string(
      abi.encodePacked(
        attributeForTypeAndValue("Penalty free date", s_penaltyFreeDate, false),
        ",",
        attributeForTypeAndValue(
          "Free Gas left in kiro",
          gasRemaining.toString(),
          false
        ),
        ",",
        attributeForTypeAndValue(
          "Kiro to collect",
          kiroToCollect.toString(),
          false
        )
      )
    );

    attributes = string(
      abi.encodePacked(
        attributes,
        ',{"trait_type":"Last Refreshed date","display_type":"date","value":',
        block.timestamp.toString(),
        "}"
      )
    );

    return string(abi.encodePacked("[", attributes, "]"));
  }

  function attributeForTypeAndValue(
    string memory traitType,
    string memory value,
    bool isNumber
  ) internal pure returns (string memory) {
    return
      string(
        abi.encodePacked(
          '{"trait_type":"',
          traitType,
          '","value":',
          isNumber ? "" : '"',
          value,
          isNumber ? "" : '"',
          "}"
        )
      );
  }

  /* function _baseURI() internal pure override returns (string memory) {
    return "";
  } */

  function base64(bytes memory data) internal pure returns (string memory) {
    if (data.length == 0) return "";

    // load the table into memory
    string memory table = TABLE;

    // multiply by 4/3 rounded up
    uint256 encodedLen = 4 * ((data.length + 2) / 3);

    // add some extra buffer at the end required for the writing
    string memory result = new string(encodedLen + 32);

    assembly {
      // set the actual output length
      mstore(result, encodedLen)

      // prepare the lookup table
      let tablePtr := add(table, 1)

      // input ptr
      let dataPtr := data
      let endPtr := add(dataPtr, mload(data))

      // result ptr, jump over length
      let resultPtr := add(result, 32)

      // run over the input, 3 bytes at a time
      for {

      } lt(dataPtr, endPtr) {

      } {
        dataPtr := add(dataPtr, 3)

        // read 3 bytes
        let input := mload(dataPtr)

        // write 4 characters
        mstore(
          resultPtr,
          shl(248, mload(add(tablePtr, and(shr(18, input), 0x3F))))
        )
        resultPtr := add(resultPtr, 1)
        mstore(
          resultPtr,
          shl(248, mload(add(tablePtr, and(shr(12, input), 0x3F))))
        )
        resultPtr := add(resultPtr, 1)
        mstore(
          resultPtr,
          shl(248, mload(add(tablePtr, and(shr(6, input), 0x3F))))
        )
        resultPtr := add(resultPtr, 1)
        mstore(resultPtr, shl(248, mload(add(tablePtr, and(input, 0x3F)))))
        resultPtr := add(resultPtr, 1)
      }

      // padding with '='
      switch mod(mload(data), 3)
      case 1 {
        mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
      }
      case 2 {
        mstore(sub(resultPtr, 1), shl(248, 0x3d))
      }
    }

    return result;
  }
}
