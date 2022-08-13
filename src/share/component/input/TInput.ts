/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { randomUUID } from "crypto";
import type Color from "color";

export type TInput =
  | TTextInput
  | TNumberInput
  | TSwitchInput
  | TSelectInput
  | TColorInput
  | TSliderInput
  | TCheckboxInput
  | TRadioInput;

export type TInputBase<T> = {
  value?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
};

// region text
export type TTextInput = {
  type: "text";
} & TInputBase<string>;
// endregion

// region number
export type TNumberInput = {
  type: "number";
  acceptFloat?: boolean;
} & TInputBase<number>;
// endregion

// region switch
export type TSwitchInput = {
  type: "switch";
} & TInputBase<boolean>;
// endregion

// region select
export type TSelectInputItem = {
  key: string;
  name?: string;
  element?: HTMLDivElement;
};

export type TSelectInput = {
  type: "select";
  options: TSelectInputItem[];
} & TInputBase<string>;
// endregion

// region color
export type TColorInput = {
  type: "color";
  withAlpha?: boolean;
} & TInputBase<Color>;
// endregion

// region slider
export type TSliderInputNormal = {
  type: "slider";
};

export type TSliderInputWithInputBox = TSliderInputNormal & {
  withInputBox: boolean;
  stringifier?: (value: number) => string;
  parser?: (value: string) => number;
};

export type TSliderInput = (TSliderInputNormal | TSliderInputWithInputBox) &
  TInputBase<number>;
// endregion

// region checkbox
export type TCheckboxInput = {
  type: "checkbox";
} & TInputBase<boolean>;
// endregion

// region radio
export class RadioInputContext {
  _event: "select";
  _cb: (event: typeof this._event) => void;
  manager: Map<string, typeof this._cb> = new Map();

  addListener(callback: typeof this._cb): string {
    let id = randomUUID();
    this.manager.set(id, callback);
    return id;
  }

  removeListener(id: string) {
    this.manager.delete(id);
  }

  call(event: typeof this._event) {
    for (let cb of this.manager.values()) {
      cb(event);
    }
  }
}

export type TRadioInput = {
  type: "radio";
  context: RadioInputContext;
} & TInputBase<boolean>;
// endregion
