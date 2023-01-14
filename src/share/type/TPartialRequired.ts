/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TPartialRequired<T, K extends keyof T> = Pick<T, K> & Partial<T>;
