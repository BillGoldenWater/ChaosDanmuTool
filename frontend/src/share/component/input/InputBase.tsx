/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { AnimatePresence, LayoutProps, motion } from "framer-motion";
import { PropsWithChildren, useState } from "react";
import { usePopper } from "react-popper";
import { zIndex } from "../ThemeCtx";

export interface InputBaseProps {
  extra?: JSX.Element;
}

export function InputBase({
  children,
  extra,
  ...layoutProps
}: PropsWithChildren<InputBaseProps> & LayoutProps) {
  const [focus, setFocus] = useState(false);
  const [hoverExtra, setHoverExtra] = useState(false);

  const [mainRef, setMainRef] = useState<HTMLDivElement | null>(null);
  const [extraRef, setExtraRef] = useState<HTMLDivElement | null>(null);
  const { styles, attributes } = usePopper(mainRef, extraRef);

  const expand = focus || hoverExtra;
  return (
    <InputBaseContainer
      {...layoutProps}
      onFocus={setFocus.bind(null, true)}
      onBlur={setFocus.bind(null, false)}
    >
      <MainContainer {...layoutProps} ref={setMainRef}>
        {children}
      </MainContainer>
      <AnimatePresence>
        {expand && (
          <ExtraContainer
            {...layoutProps}
            ref={setExtraRef}
            style={styles.popper}
            $expand={focus}
            initial={{ height: "fit-content" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", damping: 50, stiffness: 600 }}
            onHoverStart={setHoverExtra.bind(null, true)}
            onHoverEnd={setHoverExtra.bind(null, false)}
            {...attributes.popper}
          >
            {extra}
          </ExtraContainer>
        )}
      </AnimatePresence>
    </InputBaseContainer>
  );
}

const InputBaseContainer = styled(motion.div)`
  display: inline-flex;
`;

const MainContainer = styled(motion.div)`
  display: flex;
`;

const ExtraContainer = styled(motion.div)<{ $expand: boolean }>`
  position: absolute;

  ${(p) => (p.$expand ? "overflow-y: auto;" : "overflow-y: hidden;")};

  max-height: 50vh;

  ${zIndex.popper}
`;
