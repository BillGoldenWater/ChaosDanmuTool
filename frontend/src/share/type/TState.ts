/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dispatch, SetStateAction } from "react";

export type TState<T> = [T, Dispatch<SetStateAction<T>>];
