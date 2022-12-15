/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  PropsWithChildren,
  useContext,
  useLayoutEffect,
  useState,
} from "react";
import styled from "styled-components";
import { windowCtx } from "./WindowCtx";

export interface TooltipProps {
  tooltip: string | JSX.Element;

  position?: "auto" | "top" | "right" | "bottom" | "left";
}

const TooltipPopupBase = styled.div.attrs<{
  left: number;
  top: number;
}>((p) => ({
  style: {
    left: `${p.left}px`,
    top: `${p.top}px`,
  },
}))<{
  left: number;
  top: number;
  marginPos: TooltipProps["position"];
}>`
  transition: visibility linear 0.2s, opacity ease-out 0.2s;

  position: fixed;

  visibility: hidden;
  opacity: 0;

  padding: 0.5em;

  background-color: ${(p) => p.theme.consts.tooltipBackground};
  box-shadow: 0.1em 0.1em 0.2em 0.1em ${(p) =>
    p.theme.consts.raw.tooltipBackground.opaquer(0.8)};
  backdrop-filter: blur(0.5em);

  border-radius: 0.5em;

  &:hover {
    visibility: visible;
    opacity: 1;
  }

  margin-${(p) => p.marginPos}: 0.2em;
`;

const TooltipBase = styled.div`
  display: inline-block;

  &:hover > ${TooltipPopupBase} {
    visibility: visible;
    opacity: 1;
  }
`;

export function Tooltip({
  children,
  tooltip,
  position,
}: PropsWithChildren<TooltipProps>) {
  const windowInfo = useContext(windowCtx);

  const [ref, setRef] = useState<HTMLDivElement | null>(null);
  const [tipRef, setTipRef] = useState<HTMLDivElement | null>(null);

  const [offset, setOffset] = useState([0, 0]); // left top
  const [marginPos, setMarginPos] = useState<TooltipProps["position"]>("left");

  useLayoutEffect(() => {
    if (ref == null || tipRef == null) {
      setOffset([0, 0]);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const rect = ref!.getBoundingClientRect();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tipRect = tipRef!.getBoundingClientRect();

    const available: Record<string, number> = {
      top: rect.top,
      right: windowInfo.width - (rect.left + rect.width),
      bottom: windowInfo.height - (rect.top + rect.height),
      left: rect.left,
    };

    let pos = position;
    switch (position) {
      case undefined:
      case "auto": {
        const max = Math.max(...Object.values(available));
        const maxKey = Object.keys(available).find(
          (it) => available[it] === max
        );

        pos = maxKey as TooltipProps["position"];
        break;
      }
    }

    const xCenter = rect.left + rect.width / 2;
    const yCenter = rect.top + rect.height / 2;
    const tipWidthHalf = tipRect.width / 2;
    const tipHeightHalf = tipRect.height / 2;

    switch (pos) {
      case "top": {
        setOffset([xCenter - tipWidthHalf, rect.top - tipRect.height]);

        setMarginPos("bottom");
        break;
      }
      case "right": {
        setOffset([rect.right, yCenter - tipHeightHalf]);

        setMarginPos("left");
        break;
      }
      case "bottom": {
        setOffset([xCenter - tipWidthHalf, rect.bottom]);

        setMarginPos("top");
        break;
      }
      case "left": {
        setOffset([rect.left - tipRect.width, yCenter - tipHeightHalf]);

        setMarginPos("right");
        break;
      }
    }
  }, [
    position,
    ref,
    tipRef,
    windowInfo.height,
    windowInfo.width,
    windowInfo.scrollX,
    windowInfo.scrollY,
  ]);

  return (
    <TooltipBase ref={setRef}>
      {children}
      <TooltipPopupBase
        ref={setTipRef}
        left={Math.max(offset[0], 0)}
        top={Math.max(offset[1], 0)}
        marginPos={marginPos}
      >
        {tooltip}
      </TooltipPopupBase>
    </TooltipBase>
  );
}
