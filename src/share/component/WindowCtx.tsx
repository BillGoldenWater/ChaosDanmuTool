/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {createContext, PropsWithChildren, useLayoutEffect, useState} from "react";

export interface TWindowCtx {
  height: number,
  width: number,
}

export const windowCtx = createContext<TWindowCtx>({height: window.innerHeight, width: window.innerWidth});

const WindowCtxProv = windowCtx.Provider;

export function WindowCtxProvider({children}: PropsWithChildren) {
  const [height, setHeight] = useState(window.innerHeight);
  const [width, setWidth] = useState(window.innerWidth);


  useLayoutEffect(() => {
    function onResize() {
      setHeight(window.innerHeight);
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
    }
  }, [setHeight, setWidth])

  const ctx = {
    height,
    width
  }

  return <WindowCtxProv value={ctx}>{children}</WindowCtxProv>
}