/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useEffect, useState } from "react";

export function isWindowVisible(): boolean {
  return document.visibilityState === "visible";
}

export function useWindowVisible(): boolean {
  const [visible, setVisible] = useState(isWindowVisible);

  useEffect(() => {
    function onVisibilityChange() {
      setVisible(isWindowVisible);
    }

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return visible;
}
