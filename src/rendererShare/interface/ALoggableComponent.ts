/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";

export abstract class ALoggableComponent<P, S> extends React.Component<P, S> {
  abstract location: string;

  log(location: string, message: string, additionalInfo?: string) {
    console.log(
      `[${this.location}.${location}] ${message}${
        additionalInfo ? `\n${additionalInfo}` : ""
      }`
    );
  }

  error(location: string, message: string, additionalInfo?: string) {
    console.error(
      `[${this.location}.${location}] ${message}${
        additionalInfo ? `\n${additionalInfo}` : ""
      }`
    );
  }
}
