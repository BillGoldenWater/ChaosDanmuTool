/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./DanmuViewerLinkGenerator.less";
import { ConfigC } from "../../../../../rendererShare/state/ConfigContext";
import { getParam } from "../../../../../share/utils/UrlUtils";
import { Select } from "../../../../../rendererShare/component/select/Select";
import { Spacer } from "../../../../../rendererShare/component/spacer/Spacer";
import { defaultViewCustomInternalUUID } from "../../../../../share/config/Config";

export const danmuViewerCustomKey = "danmuViewerCustomKey";

export class DanmuViewerLinkGenerator extends React.Component {
  render(): ReactNode {
    return (
      <ConfigC>
        {({ state: { path, config }, get, setPathOption }) => {
          const selected =
            getParam(path, danmuViewerCustomKey) ||
            config.danmuViewCustoms[0].uuid;

          const url = new URL(`http://localhost/viewer`);

          url.port = get("httpServerPort").toString();

          if (selected != defaultViewCustomInternalUUID) {
            url.searchParams.append("uuid", selected);
          }

          return (
            <div>
              <div className={"DanmuViewerLinkGeneratorChooser"}>
                样式配置:
                <Spacer half />
                <Select
                  defaultSelect={selected}
                  list={config.danmuViewCustoms.map((value) => ({
                    key: value.uuid,
                    value: value.name,
                  }))}
                  onChange={(key) => {
                    setPathOption(danmuViewerCustomKey, key);
                  }}
                />
              </div>
              <Spacer quarter vertical />
              <div>链接: {url.toString()}</div>
            </div>
          );
        }}
      </ConfigC>
    );
  }
}
