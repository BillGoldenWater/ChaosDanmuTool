/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TReceiverStatus =
  | "open"
  | "close"
  | "error"
  | "connecting"
  | "reconnecting";

export type TReceiverStatusUpdate = {
  cmd: "receiverStatusUpdate";
  status: TReceiverStatus;
};

export function getReceiverStatusUpdateCommand(
  status: TReceiverStatus
): TReceiverStatusUpdate {
  return {
    cmd: "receiverStatusUpdate",
    status: status,
  };
}
