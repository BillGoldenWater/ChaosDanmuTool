/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from "react";
import { TState } from "../type/TState";

export function useHoverState(): {
  hover: boolean;
  setHover: TState<boolean>[1];
  onEnter: () => void;
  onLeave: () => void;
} {
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

  return {
    hover,
    setHover,
    onEnter: setHover.bind(null, true),
    onLeave: setHover.bind(null, false),
  };
}
