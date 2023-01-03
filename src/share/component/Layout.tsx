/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PropsWithChildren, useContext, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { Icon } from "@iconscout/react-unicons";
import { Tooltip } from "./Tooltip";
import { Spacer } from "./Spacer";
import { themeCtx } from "./ThemeCtx";
import Color from "color";
import { AnimatePresence, motion } from "framer-motion";
import { buttonTransition } from "./ButtonTransition";

const layoutSpacing = "0.8em";
const menuSpacing = "0.4em";

// region layout
export interface LayoutProps {
  menu: MenuProps;
  extraPageIdent?: string; // for same page but switch content
}

const LayoutBase = styled.div`
  display: flex;

  height: 100vh;
  width: 100vw;
  padding: ${layoutSpacing};
`;

const LayoutContent = styled(motion.div)`
  padding: ${layoutSpacing};
  border-radius: 0.5em;

  background-color: ${(p) => p.theme.consts.contentBackground};
  height: 100%;
  flex-grow: 1;

  overflow-y: auto;
`;

export function Layout({
  menu,
  extraPageIdent,
  children,
}: PropsWithChildren<LayoutProps>) {
  const ident = `${menu.selected} ${extraPageIdent}`;

  const prevSel = useRef(menu.selected);

  // null for same page
  let switchDown: boolean | null = null;
  if (prevSel.current !== menu.selected) {
    const prevIndex = menu.menuItems.findIndex(
      (it) => it.itemKey === prevSel.current
    );
    const curIndex = menu.menuItems.findIndex(
      (it) => it.itemKey === menu.selected
    );
    switchDown = prevIndex < curIndex;
    prevSel.current = menu.selected;
  }

  const extraIdentSet =
    extraPageIdent !== undefined &&
    /* ignore switch from other page */ switchDown == null;
  // doesn't need to detect ident change because it will be filter by react prop compare

  // when extraPageIdent is set, scroll from right
  // otherwise depends on is or not switching down
  const initialY = extraIdentSet ? "" : switchDown ? "100%" : "-100%";
  const initialX = extraIdentSet ? "100%" : "";

  return (
    <LayoutBase>
      <Menu {...menu} />
      <AnimatePresence mode={"popLayout"} initial={false}>
        <LayoutContent
          key={ident}
          initial={{ y: initialY, x: initialX, opacity: 0 }}
          animate={{ y: 0, x: 0, opacity: 1 }}
          exit={{ y: 0, x: "-50%", opacity: 0, scale: 0, filter: "blur(1em)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {children}
        </LayoutContent>
      </AnimatePresence>
    </LayoutBase>
  );
}

// endregion

// region item
export interface TMenuItem {
  itemKey: string;
  text: string | JSX.Element;

  icon: Icon | JSX.Element;
  spinning?: boolean;
}

export interface MenuProps {
  selected: string;
  menuItems: TMenuItem[];
  menuOnClick: (key: string) => void;
}

const MenuBase = styled.div`
  display: flex;
  flex-direction: column;

  margin-right: ${layoutSpacing};

  padding: ${menuSpacing};
  border-radius: 0.5em;

  background-color: ${(props) => props.theme.consts.contentBackground};

  ${(p) => (p.theme.selectable ? "" : "user-select: none")};

  //overflow: hidden; weird issue
`;

function Menu({ selected, menuItems, menuOnClick }: MenuProps) {
  return (
    <MenuBase>
      {menuItems.map((it) => (
        <div key={it.itemKey}>
          <MenuItem
            {...it}
            active={selected === it.itemKey}
            onClick={menuOnClick}
          />
          <Spacer size={menuSpacing} vertical />
        </div>
      ))}
    </MenuBase>
  );
}

// endregion

// region menuItem
export interface MenuItemProps extends TMenuItem {
  active: boolean;

  onClick: (key: string) => void;
}

const MenuItemBase = styled.div<{ active: boolean; background: Color }>`
  ${buttonTransition};

  display: flex;

  padding: calc(${menuSpacing} / 2);

  border-radius: 0.25em;

  ${(p) => (p.active ? `background-color: ${p.background.string()}` : "")};
  ${(p) => (p.active ? `transform: scale(1.05)` : "")};

  &:hover {
    background-color: ${(p) => p.background.opaquer(0.5).string()};
    ${(p) => (p.active ? `transform: scale(1.1)` : "")};
  }

  &:active {
    background-color: ${(p) => p.background.fade(0.1).string()};
    ${(p) => (p.active ? `transform: scale(0.95)` : "")};
  }
`;

const spinning_keyframes = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const SpinningIcon = styled.div`
  display: flex;
  animation: ${spinning_keyframes} 2s linear infinite;
`;

function MenuItem({
  itemKey,
  text,
  icon,
  spinning,
  active,
  onClick,
}: MenuItemProps) {
  const theme = useContext(themeCtx);

  // region construct icon
  const Icon: Icon = icon as Icon;
  let newIcon: JSX.Element;
  if (typeof icon === "function") {
    newIcon = (
      <Icon
        size={"1.8em"}
        color={active ? theme.consts.theme : theme.consts.text}
      />
    );
  } else {
    newIcon = icon;
  }
  if (spinning) {
    newIcon = <SpinningIcon>{newIcon}</SpinningIcon>;
  }
  // endregion

  return (
    <Tooltip tooltip={text} lazyLoad>
      <MenuItemBase
        onClick={onClick.bind(undefined, itemKey)}
        active={active}
        background={
          active
            ? theme.consts.raw.menuItemActiveBackground
            : theme.consts.raw.menuItemBackground
        }
      >
        {newIcon}
      </MenuItemBase>
    </Tooltip>
  );
}

// endregion
