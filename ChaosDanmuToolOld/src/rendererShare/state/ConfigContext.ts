/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import { MainState } from "./MainState";
import { MainEventTarget } from "../event/MainEventTarget";
import { Config } from "../../share/config/Config";
import { TDotPropContext } from "./TDotPropContext";

export type TConfigContext = TDotPropContext<Config> & {
  state: MainState;
  setState: React.Component["setState"];
  eventTarget: MainEventTarget;

  setPathOption?: (key: string, value: string) => void;
};

const defaultContext: TConfigContext = {
  state: null,
  setState: () => null,
  eventTarget: new MainEventTarget(),
};

export const ConfigContext = React.createContext(defaultContext);

export const ConfigP = ConfigContext.Provider;
export const ConfigC = ConfigContext.Consumer;
