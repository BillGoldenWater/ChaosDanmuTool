/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ResultStatus } from "./TResultStatus";

export type UpdateUtilsResult<T> = {
  status: ResultStatus;
  result: T;
  message: string;
};
