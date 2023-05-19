/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled, { css } from "styled-components";
import { HTMLMotionProps, motion, MotionProps } from "framer-motion";
import { border, color, paddingValue, radius } from "./ThemeCtx";
import { memo, PropsWithChildren, useMemo } from "react";

export interface ButtonProps {
  primary?: boolean;
  isIcon?: boolean;
  disabled?: boolean;
}

interface ButtonBaseProps {
  $primary?: boolean;
  $isIcon?: boolean;
  disabled?: boolean;
}

const btnNormal = css`
  ${border.normal};

  transition: color 0.2s ease-out, background-color 0.2s ease-out;

  border-color: ${color.bgItem};
  background-color: ${color.bgContent};

  color: ${color.txt};

  &:not(:disabled):hover {
    border-color: ${color.bgHover};
    background-color: ${color.bgHover};
  }

  &:not(:disabled):active {
    transition: all 0.05s ease-out;
    border-color: ${color.bgItem};
    background-color: ${color.bgItem};
  }

  :is(&:disabled) {
    color: ${color.txtSecond};
  }
`;

const btnPrimary = css`
  ${border.normal};

  transition: color 0.2s ease-out, background-color 0.2s ease-out;

  --btnBgColor: ${color.theme};
  border-color: var(--btnBgColor);
  background-color: var(--btnBgColor);

  color: ${color.txtBlack};

  &:not(:disabled):hover {
    --btnBgColor: ${color.thHover};
  }

  &:not(:disabled):active {
    transition: all 0.05s ease-out;
    --btnBgColor: ${color.theme};
  }

  :is(&:disabled) {
    color: ${color.txtSecond};
  }
`;

export const Button = memo(ButtonInner);

function ButtonInner({
  primary,
  isIcon,
  ...props
}: PropsWithChildren<ButtonProps & HTMLMotionProps<"button"> & MotionProps>) {
  const defaultMotion: MotionProps = useMemo(() => {
    if (props.disabled) return {};

    return {
      whileHover: {
        scale: 1.05,
        transition: { type: "spring", damping: 30, stiffness: 800 },
      },
      whileTap: {
        scale: 0.95,
        transition: { type: "spring", damping: 30, stiffness: 2400 },
      },
    };
  }, [props.disabled]);

  return (
    <ButtonBase
      $primary={primary}
      $isIcon={isIcon}
      {...defaultMotion}
      {...props}
    />
  );
}

export const ButtonBase = styled(motion.button)<ButtonBaseProps>`
  display: flex;

  padding: ${(p) =>
    p.$isIcon ? `${paddingValue.input}` : `${paddingValue.input} 16rem`};
  ${radius.normal};

  ${(p) => (p.$primary ? btnPrimary : btnNormal)}
`;
