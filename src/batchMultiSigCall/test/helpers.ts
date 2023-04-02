import { getDate } from "../../helpers";
import { BatchMultiSigCall } from "../batchMultiSigCall";
import BaseTestFCT from "./FCT.json";

export const TestFCT = BaseTestFCT;

export const buildTestFCT = () => {
  const FCT = BatchMultiSigCall.from(TestFCT);
  // Update options
  FCT.setOptions({
    validFrom: getDate(),
    expiresAt: getDate(1),
  });
};
