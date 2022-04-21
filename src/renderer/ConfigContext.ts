/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { MainState } from "./MainState";
import { MainEventTarget } from "./MainEventTarget";

export type TConfigContext = {
  state: MainState;
  setState: React.Component["setState"];
  eventTarget: MainEventTarget;
};

const defaultContext: TConfigContext = {
  state: null,
  setState: () => null,
  eventTarget: new MainEventTarget(),
};

export const ConfigContext = React.createContext(defaultContext);

export const ConfigP = ConfigContext.Provider;
export const ConfigC = ConfigContext.Consumer;
