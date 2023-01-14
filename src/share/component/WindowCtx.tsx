/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  createContext,
  PropsWithChildren,
  useLayoutEffect,
  useState,
} from "react";

export interface TWindowCtx {
  height: number;
  width: number;
  scrollX: number;
  scrollY: number;
}

function getLatest() {
  return {
    height: window.innerHeight,
    width: window.innerWidth,
    scrollX: window.scrollX + Math.random() * 0.001,
    scrollY: window.scrollY + Math.random() * 0.001,
  };
}

export const windowCtx = createContext<TWindowCtx>(getLatest());

const WindowCtxProv = windowCtx.Provider;

export function WindowCtxProvider({ children }: PropsWithChildren) {
  const [ctx, setCtx] = useState(() => getLatest());

  useLayoutEffect(() => {
    function onUpdate() {
      setCtx(getLatest());
    }

    window.addEventListener("resize", onUpdate);
    window.addEventListener("scroll", onUpdate, true);

    return () => {
      window.removeEventListener("resize", onUpdate);
      window.removeEventListener("scroll", onUpdate, true);
    };
  }, []);

  return <WindowCtxProv value={ctx}>{children}</WindowCtxProv>;
}
