/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

insert or
replace into user_info (uid, name, userLevel, face, faceFrame, isVip, isSvip, isMainVip, isManager, title, levelColor,
                        nameColor, hasMedal)
values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);