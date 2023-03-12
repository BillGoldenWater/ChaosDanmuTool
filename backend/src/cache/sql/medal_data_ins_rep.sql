/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

insert or
replace
into medal_data (uid, targetId, isLighted, guardLevel, color, colorBorder, colorStart, colorEnd, level)
values (?, ?, ?, ?, ?, ?, ?, ?, ?);