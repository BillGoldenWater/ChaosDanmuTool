/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { PropsWithChildren, useContext } from "react";
import styled, { keyframes } from "styled-components";
import { Icon } from "@iconscout/react-unicons";
import { Tooltip } from "./Tooltip";
import { Spacer } from "./Spacer";
import { themeCtx } from "./ThemeCtx";
import Color from "color";

const layoutSpacing = "0.8em";
const menuSpacing = "0.4em";

// region layout
export interface LayoutProps {
  menu: MenuProps;
}

const LayoutBase = styled.div`
  display: flex;

  height: 100vh;
  width: 100vw;
  padding: ${layoutSpacing};
`;

const LayoutContent = styled.div`
  padding: ${layoutSpacing};
  border-radius: 0.5em;

  background-color: ${(p) => p.theme.consts.contentBackground};
  flex-grow: 1;
`;

export function Layout({ menu, children }: PropsWithChildren<LayoutProps>) {
  return (
    <LayoutBase>
      <Menu {...menu} />
      <LayoutContent>{children}</LayoutContent>
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
  defaultKey: string;
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

  //overflow: hidden; weird issue
`;

function Menu({ defaultKey, menuItems, menuOnClick }: MenuProps) {
  return (
    <MenuBase>
      {menuItems.map((it) => (
        <div key={it.itemKey}>
          <MenuItem
            {...it}
            active={defaultKey === it.itemKey}
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
  transition: background-color ease-out 0.2s,
    transform cubic-bezier(0.3, 0, 0.4, 1) 0.1s;

  display: flex;

  padding: calc(${menuSpacing} / 2);

  border-radius: 0.25em;

  ${(p) => (p.active ? `background-color: ${p.background.string()}` : "")};
  ${(p) => (p.active ? `transform: scale(1.05)` : "")};

  &:hover {
    background-color: ${(p) => p.background.opaquer(0.5).string()};
    transform: scale(1.1);
  }

  &:active {
    background-color: ${(p) => p.background.fade(0.1).string()};
    transform: scale(0.9);
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
    newIcon = (
      <div
        css={`
          display: flex;
          animation: ${spinning_keyframes} 2s linear infinite;
        `}
      >
        {newIcon}
      </div>
    );
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
