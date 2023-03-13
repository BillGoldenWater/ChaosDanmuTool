/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from "react";
import { TState } from "../type/TState";

export function useHoverState(): TState<boolean> {
  const [hover, setHover] = useState(false);
  useEffect(() => {
    function onWindowBlur() {
      setHover(false);
    }

    window.addEventListener("blur", onWindowBlur);

    return () => {
      window.removeEventListener("blur", onWindowBlur);
    };
  }, [hover]);

  return [hover, setHover];
}
