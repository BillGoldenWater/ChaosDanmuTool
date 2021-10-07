import { Data } from "../DanmuReceiver";

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
): string {
  const messageObj: ErrorMessage = {
    cmd: "errorMessage",
    data: {
      errorMessage: errorMessage,
      errorData: errorData,
    },
  };
  return JSON.stringify(messageObj);
}

export function getErrorMessageMessageCmd(): ErrorMessageCmd {
  return "errorMessage";
}
