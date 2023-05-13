/*
 * Copyright 2021-2023 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import styled from "styled-components";
import { UserInfo } from "../../type/rust/types/user_info";
import { defaultUserInfo } from "../../app/Defaults";

interface UserAvatarProps {
  userInfo: UserInfo;

  size?: string;
}

export function UserAvatar({
  userInfo: { face, faceFrame },
  size,
}: UserAvatarProps) {
  const frame = faceFrame ? <UserAvatarFrame src={faceFrame} /> : null;

  return (
    <UserAvatarBase $size={size ? size : "1.25rem"}>
      <UserAvatarContent src={face || defaultUserInfo.face || ""} />
      {frame}
    </UserAvatarBase>
  );
}

interface UserAvatarBaseProps {
  $size: string;
}

const UserAvatarBase = styled.div<UserAvatarBaseProps>`
  display: inline-block;
  position: relative;

  vertical-align: bottom;

  width: ${(p) => p.$size};
  height: ${(p) => p.$size};
  min-width: ${(p) => p.$size};
  min-height: ${(p) => p.$size};
  max-width: ${(p) => p.$size};
  max-height: ${(p) => p.$size};
`;

const UserAvatarContent = styled.img`
  display: block;
  aspect-ratio: 1 / 1;

  width: 100%;
  height: 100%;

  border-radius: 50%;
`;

const UserAvatarFrame = styled.img`
  display: block;
  position: absolute;

  width: 176.48%;
  height: 176.48%;

  top: -38.33%;
  left: -38.33%;

  z-index: 1;
`;
