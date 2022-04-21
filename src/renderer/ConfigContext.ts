/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { MainState } from "./MainState";

export type TConfigContext = {
  state: MainState;
  setState: React.Component["setState"];
  eventTarget: EventTarget;
};

const defaultContext: TConfigContext = {
  state: null,
  setState: () => null,
  eventTarget: new EventTarget(),
};

export const ConfigContext = React.createContext(defaultContext);

export const ConfigProvider = ConfigContext.Provider;
export const ConfigConsumer = ConfigContext.Consumer;
