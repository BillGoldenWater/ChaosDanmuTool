import { ResultStatus } from "./TResultStatus";

export type UpdateUtilsResult<T> = {
  status: ResultStatus;
  result: T;
  message: string;
};
