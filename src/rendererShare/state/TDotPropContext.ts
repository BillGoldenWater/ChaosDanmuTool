/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { AObject, ObjectPath } from "../../share/type/TObjectPath";

export type TDotPropContext<T extends AObject> = {
  get?: (path: ObjectPath<T>, defaultValue?: unknown) => unknown;
  set?: (path: ObjectPath<T>, value: unknown) => void;
};
