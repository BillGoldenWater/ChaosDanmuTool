/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Data } from "../../utils/client/DanmuReceiver";

export type ErrorMessageCmd = "errorMessage";

export type ErrorMessage = {
  cmd: ErrorMessageCmd;
  data: {
    errorMessage: string;
    errorData: Data;
  };
};

export function getErrorMessageMessage(
  errorMessage: string,
  errorData: Data
): ErrorMessage {
  return {
    cmd: "errorMessage",
    data: {
      errorMessage: errorMessage,
      errorData: errorData,
    },
  };
}

export function getErrorMessageMessageCmd(): ErrorMessageCmd {
  return "errorMessage";
}
