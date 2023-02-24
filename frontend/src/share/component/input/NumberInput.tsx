/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { TNumberInput, TTextBaseInput } from "./TInput";
import { LayoutProps } from "framer-motion";
import { useCallback } from "react";
import { TextBaseInput } from "./TextBaseInput";
import { isFloat, isInt } from "../../utils/NumberUtils";

export function NumberInput(props: Omit<TNumberInput, "type"> & LayoutProps) {
  const { acceptFloat, checkValid, parser, stringifier, ...passableProps } =
    props;

  const validator = useCallback<TTextBaseInput<number>["checkValid"]>(
    (value) => {
      if (checkValid) {
        return checkValid(value);
      } else {
        if (acceptFloat) {
          return isFloat(value);
        } else {
          return isInt(value, 10);
        }
      }
    },
    [acceptFloat, checkValid]
  );

  const parse = useCallback<TTextBaseInput<number>["parser"]>(
    (value) => {
      if (parser) {
        return parser(value);
      } else {
        if (acceptFloat) {
          return Number.parseFloat(value);
        } else {
          return Number.parseInt(value, 10);
        }
      }
    },
    [acceptFloat, parser]
  );

  const stringify = useCallback<TTextBaseInput<number>["stringifier"]>(
    (value) => {
      if (stringifier) {
        return stringifier(value);
      } else {
        return value.toString(10);
      }
    },
    [stringifier]
  );

  return (
    <TextBaseInput
      {...passableProps}
      checkValid={validator}
      parser={parse}
      stringifier={stringify}
    />
  );
}
