/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { InputBase } from "./InputBase";
import { LayoutProps } from "framer-motion";
import { TTextInput } from "./TInput";
import { TextBaseInput } from "./TextBaseInput";

export function TextInput(props: Omit<TTextInput, "type"> & LayoutProps) {
  return (
    <InputBase>
      <TextBaseInput
        {...props}
        parser={(v) => v}
        stringifier={(v) => v}
        checkValid={() => true}
      />
    </InputBase>
  );
}
