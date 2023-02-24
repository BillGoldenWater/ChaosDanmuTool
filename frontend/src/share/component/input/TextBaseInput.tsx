/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { InputBase } from "./InputBase";
import styled from "styled-components";
import { LayoutProps, motion } from "framer-motion";
import { TTextBaseInput } from "./TInput";
import {
  ChangeEventHandler,
  FocusEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";
import { border, color, dynamicSelect, padding, radius } from "../ThemeCtx";

export function TextBaseInput<T>(
  props: Omit<TTextBaseInput<T>, "type"> & LayoutProps
) {
  const {
    defaultValue,
    value,
    onChange,
    checkValid,
    parser,
    stringifier,
    ...passableProps
  } = props;

  const [cachedValue, setCachedValue] = useState<string>(
    () => toString(stringifier, value || defaultValue) || ""
  );
  const [focused, setFocused] = useState(false);

  const syncFromProps = useCallback(() => {
    if (value != undefined) {
      if (stringifier) {
        setCachedValue(stringifier(value));
      } else {
        setCachedValue(value.toString());
      }
    }
  }, [stringifier, value]);

  useEffect(() => {
    if (!focused) {
      syncFromProps();
    }
  }, [focused, syncFromProps]);

  // region event
  const onChangeEvent = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setCachedValue(event.target.value);
    },
    []
  );

  const onBlur = useCallback<FocusEventHandler<HTMLInputElement>>(() => {
    setFocused(false);

    const isValid = checkValid ? checkValid(cachedValue) : true;

    if (isValid) {
      onChange?.(parser(cachedValue));
    }
  }, [cachedValue, checkValid, onChange, parser]);
  // endregion

  return (
    <InputBase>
      <TextBaseInputBase
        {...passableProps}
        value={cachedValue}
        onChange={onChangeEvent}
        onFocus={setFocused.bind(null, true)}
        onBlur={onBlur}
      />
    </InputBase>
  );
}

const TextBaseInputBase = styled(motion.input)`
  ${dynamicSelect};
  ${padding.input};
  ${border.normal};
  ${radius.normal};

  color: ${color.txt};
  border-color: ${color.bgItem};
  background-color: ${color.bgItem};

  transition: all 0.2s ease-out;

  &:not(:disabled):hover {
    border-color: ${color.bgHover};
    background-color: ${color.bgHover};
  }

  &:not(:disabled):focus {
    transition: all 0.1s ease-out;
    border-color: ${color.bgHover};
    background-color: ${color.bgContent};
  }

  :is(&:disabled, &::placeholder) {
    color: ${color.txtSecond};
  }

  outline: transparent;
`;

function toString<T>(stringifier: TTextBaseInput<T>["stringifier"], value?: T) {
  return value ? stringifier(value) : undefined;
}
