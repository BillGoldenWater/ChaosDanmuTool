/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { ResultStatus } from "./TResultStatus";

export type Result<T> = {
  status: ResultStatus;
  result: T;
  message: string;
};
