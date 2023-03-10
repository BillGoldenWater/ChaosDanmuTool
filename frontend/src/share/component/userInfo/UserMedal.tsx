/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { MedalData } from "../../type/rust/cache/userInfo/MedalData";
import styled, { css } from "styled-components";
import { borderValue, color, font, radius, themeCtx } from "../ThemeCtx";
import { Property } from "csstype";
import { useContext } from "react";
import { rgbI2S } from "../../utils/ColorUtils";

interface UserMedalProps {
  medalData: MedalData;
}

export function UserMedal(props: UserMedalProps) {
  const { medalData } = props;
  const {
    color,
    colorBorder,
    colorEnd,
    colorStart,
    guardLevel,
    info,
    isLighted,
    level,
  } = medalData;
  const { medalName } = info;

  const theme = useContext(themeCtx);

  const txtColor = color != null ? rgbI2S(color) : theme.consts.theme;
  const borderColor =
    colorBorder != null ? rgbI2S(colorBorder) : theme.consts.theme;
  const bgStartColor =
    colorStart != null ? rgbI2S(colorStart) : theme.consts.theme;
  const bgEndColor = colorEnd != null ? rgbI2S(colorEnd) : theme.consts.theme;

  let guardIcon = <></>;
  if (guardLevel != null && guardLevel > 0) {
    guardIcon = <GuardIcon src={guardIconUrl(guardLevel as 1 | 2 | 3)} />;
  }

  return (
    <UserMedalBase
      isLighted={isLighted}
      borderColor={borderColor}
      bgStartColor={bgStartColor}
      bgEndColor={bgEndColor}
    >
      <div>{medalName}</div>
      <UserMedalLevel color={txtColor}>{level}</UserMedalLevel>
      {guardIcon}
    </UserMedalBase>
  );
}

interface UserMedalBaseProps {
  borderColor: Property.Color;
  bgStartColor: Property.Color;
  bgEndColor: Property.Color;
  isLighted?: boolean | null;
}

const UserMedalBase = styled.div<UserMedalBaseProps>`
  ${(p) => (p.isLighted ? "" : "filter: grayscale(1);")};

  display: inline-flex;
  align-items: center;
  gap: ${borderValue.normal};

  padding: ${borderValue.normal};

  ${radius.small};

  background: linear-gradient(
    45deg,
    ${(p) => p.bgStartColor},
    ${(p) => p.bgEndColor}
  );

  & > * {
    ${font.userName};
  }
`;

interface UserMedalIconProps {
  color: Property.Color;
}

const icon = css`
  display: flex;
  align-items: center;
  justify-content: center;

  background-color: ${color.txtWhite};

  border-radius: 0.1875rem;
`;

const UserMedalLevel = styled.div<UserMedalIconProps>`
  ${icon};

  color: ${(p) => p.color};

  padding: ${borderValue.small};
`;

const GuardIcon = styled.img`
  ${icon};

  padding: ${borderValue.normal};

  box-sizing: content-box;

  height: 0.75rem;
`;

function guardIconUrl(level: 1 | 2 | 3) {
  return `https://i0.hdslb.com/bfs/activity-plat/static/20200716/1d0c5a1b042efb59f46d4ba1286c6727/icon-guard${level}.png`;
}
