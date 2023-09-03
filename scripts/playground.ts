export interface JsonFragmentType {
  /**
   *  The parameter name.
   */
  readonly name: string;
  /**
   *  If the parameter is indexed.
   */
  readonly indexed?: boolean;
  /**
   *  The type of the parameter.
   */
  readonly type: string;
  /**
   *  The internal Solidity type.
   */
  readonly internalType?: string;
  /**
   *  The components for a tuple.
   */
  readonly components?: ReadonlyArray<JsonFragmentType>;
}

export interface JsonFragment {
  /**
   *  The name of the error, event, function, etc.
   */
  readonly name: string;
  /**
   *  The type of the fragment (e.g. ``event``, ``"function"``, etc.)
   */
  readonly type?: string;
  /**
   *  If the event is anonymous.
   */
  readonly anonymous?: boolean;
  /**
   *  If the function is payable.
   */
  readonly payable?: boolean;
  /**
   *  If the function is constant.
   */
  readonly constant?: boolean;
  /**
   *  The mutability state of the function.
   */
  readonly stateMutability?: string;
  /**
   *  The input parameters.
   */
  readonly inputs?: ReadonlyArray<JsonFragmentType>;
  /**
   *  The output parameters.
   */
  readonly outputs?: ReadonlyArray<JsonFragmentType>;
  /**
   *  The gas limit to use when sending a transaction for this function.
   */
  readonly gas?: string;
}

type Outputs<
  T extends readonly JsonFragmentType[] | undefined,
  N extends string
> = T extends readonly JsonFragmentType[]
  ? {
      [key: number]: { type: "output"; id: { nodeId: N } };
    }
  : never;

const data = [{ internalType: "uint256", name: "", type: "uint256" }] as const;

type T = Outputs<typeof data>;
