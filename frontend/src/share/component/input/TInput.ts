/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export type TInput<T> =
  | TTextBaseInput<T>
  | TTextInput
  | TNumberInput
  | TSwitchInput
  | TSelectInput;

export interface TInputBase<T> {
  defaultValue?: T;
  value?: T;
  onChange?: (value: T) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export interface TInputWithValidation<Value, InputData> {
  checkValid: (value: InputData) => boolean;
  stringifier: (value: Value) => InputData;
  parser: (value: InputData) => Value;
}

// region text base input
export interface TTextBaseInput<T>
  extends TInputBase<T>,
    TInputWithValidation<T, string> {
  type: "textbase";
}

// endregion

// region text
export interface TTextInput extends TInputBase<string> {
  type: "text";
}

// endregion

// region number
export interface TNumberInput
  extends TInputBase<number>,
    Partial<TInputWithValidation<number, string>> {
  type: "number";
  acceptFloat?: boolean;
}

// endregion

// region switch
export interface TSwitchInput extends TInputBase<boolean> {
  type: "switch";
}

// endregion

// region select
export interface TSelectInput extends TInputBase<string> {
  type: "select";
  options: TSelectInputItem[];
}

export interface TSelectInputItem {
  key: string;
  name?: string;
  render?: JSX.Element;
}

// endregion
