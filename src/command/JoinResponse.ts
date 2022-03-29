/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type JoinResponseCmd = "joinResponse";

export type JoinResponse = {
  cmd: JoinResponseCmd;
  code: number;
};

export function getJoinResponseMessage(code: number): JoinResponse {
  return {
    cmd: "joinResponse",
    code: code,
  };
}

export function getJoinResponseMessageCmd(): JoinResponseCmd {
  return "joinResponse";
}
