import { id } from "ethers/lib/utils";

export enum Flow {
  OK_CONT_FAIL_REVERT = "OK_CONT_FAIL_REVERT",
  OK_CONT_FAIL_STOP = "OK_CONT_FAIL_STOP",
  OK_CONT_FAIL_CONT = "OK_CONT_FAIL_CONT",
  OK_REVERT_FAIL_CONT = "OK_REVERT_FAIL_CONT",
  OK_REVERT_FAIL_STOP = "OK_REVERT_FAIL_STOP",
  OK_STOP_FAIL_CONT = "OK_STOP_FAIL_CONT",
  OK_STOP_FAIL_REVERT = "OK_STOP_FAIL_REVERT",
  OK_STOP_FAIL_STOP = "OK_STOP_FAIL_STOP",
}

export const flows = {
  OK_CONT_FAIL_REVERT: {
    text: "continue on success, revert on fail",
    value: "0",
  },
  OK_CONT_FAIL_STOP: {
    text: "continue on success, stop on fail",
    value: "1",
  },
  OK_CONT_FAIL_CONT: {
    text: "continue on success, continue on fail",
    value: "2",
  },
  OK_REVERT_FAIL_CONT: {
    text: "revert on success, continue on fail",
    value: "3",
  },
  OK_REVERT_FAIL_STOP: {
    text: "revert on success, stop on fail",
    value: "4",
  },
  OK_STOP_FAIL_CONT: {
    text: "stop on success, continue on fail",
    value: "5",
  },
  OK_STOP_FAIL_REVERT: {
    text: "stop on success, revert on fail",
    value: "6",
  },
  OK_STOP_FAIL_STOP: {
    text: "stop on success, stop on fail",
    value: "7",
  },
};

export const flowsHashes = {
  OK_CONT_FAIL_REVERT: id(flows.OK_CONT_FAIL_REVERT.text),
  OK_CONT_FAIL_STOP: id(flows.OK_CONT_FAIL_STOP.text),
  OK_CONT_FAIL_CONT: id(flows.OK_CONT_FAIL_CONT.text),
  OK_REVERT_FAIL_CONT: id(flows.OK_REVERT_FAIL_CONT.text),
  OK_REVERT_FAIL_STOP: id(flows.OK_REVERT_FAIL_STOP.text),
  OK_STOP_FAIL_CONT: id(flows.OK_STOP_FAIL_CONT.text),
  OK_STOP_FAIL_REVERT: id(flows.OK_STOP_FAIL_REVERT.text),
  OK_STOP_FAIL_STOP: id(flows.OK_STOP_FAIL_STOP.text),
};
