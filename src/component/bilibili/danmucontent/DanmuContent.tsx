/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React from "react";
import style from "./DanmuContent.module.css";
import { TEmojiData } from "../../../type/bilibili/TEmojiData";
import { ConfigContext } from "../../../window/viewer/utils/ConfigContext";

class Props {
  content?: string;
  emojiData?: TEmojiData;
  color?: string;
}

export class DanmuContent extends React.Component<Props> {
  render(): JSX.Element {
    const content = this.props.content;
    const emojiData = this.props.emojiData;

    return (
      <ConfigContext.Consumer>
        {({ config }) => (
          <div
            className={style.DanmuContent}
            style={{
              ...config.style.danmuContent,
              color: this.props.color
                ? this.props.color
                : config.style.danmuContent.color,
            }}
          >
            {typeof emojiData == "string" || !emojiData ? (
              content
            ) : (
              <img
                className={style.DanmuContent_emoji}
                style={{ maxHeight: config.style.mainStyle.lineHeight }}
                src={emojiData.url}
                alt={content}
              />
            )}
          </div>
        )}
      </ConfigContext.Consumer>
    );
  }
}
