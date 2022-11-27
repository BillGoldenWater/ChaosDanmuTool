/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { CSSProp } from "styled-components";

declare module "react" {
  interface Attributes {
    css?: CSSProp;
  }
}
