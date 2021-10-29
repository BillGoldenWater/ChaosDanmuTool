import React from "react";
import style from "./DanmuContent.module.css";
import { EmojiData } from "../../../utils/command/bilibili/EmojiData";
import { ConfigContext } from "../../../window/viewer/utils/ConfigContext";

class Props {
  content?: string;
  emojiData?: EmojiData;
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
            style={{ ...config.style.danmuContent, color: this.props.color }}
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
