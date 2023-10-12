import { expect } from "chai";

import { freshTestFCT } from "../../test/helpers";
import { SessionID } from ".";

describe("BatchMultiSigCall SessionId", () => {
  const FCT = freshTestFCT({ chainId: "1" });
  const sessionID = new SessionID(FCT);

  it("Should be able to generate a session ID", () => {
    const id = sessionID.asString();

    expect(id).to.be.a("string");
    expect(id).to.have.lengthOf(66);
    expect(id).to.be.eq(`0x${FCT.randomId}00010101000000000000009fc545c0000000000000000006fc23ac001c`);
  });

  it("Should be able to generate options from session ID", () => {
    const id = sessionID.asString();

    const options = SessionID.asOptions(id);

    // Expect options is object
    expect(options).to.be.an("object");
  });
});
