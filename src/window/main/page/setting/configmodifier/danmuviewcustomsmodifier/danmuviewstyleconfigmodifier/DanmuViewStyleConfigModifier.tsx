import React, { ReactNode } from "react";
import { DanmuViewStyleConfig } from "../../../../../../../utils/config/Config";
import { FunctionCard } from "../../../../../../../component/functioncard/FunctionCard";
import { TextIconStyleModifier } from "./texticonstylemodifier/TextIconStyleModifier";

class Props {
  style: DanmuViewStyleConfig;
  setStyle: (style: DanmuViewStyleConfig) => void;
}

export class DanmuViewStyleConfigModifier extends React.Component<Props> {
  render(): ReactNode {
    const style = this.props.style;
    const setStyle = this.props.setStyle;

    return (
      <FunctionCard name={"样式设置"}>
        <label>列表外边距: </label>
        <input
          value={style.listMargin}
          onChange={(event) => {
            setStyle({ ...style, listMargin: event.target.value });
          }}
        />
        <br />

        <label>背景颜色: </label>
        <input
          value={style.mainStyle.backgroundColor}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: {
                ...style.mainStyle,
                backgroundColor: event.target.value,
              },
            });
          }}
        />
        <br />
        <label>缩放: </label>
        <input
          value={style.mainStyle.zoom}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: {
                ...style.mainStyle,
                zoom: parseFloat(event.target.value),
              },
            });
          }}
        />
        <br />
        <label>字体大小: </label>
        <input
          value={style.mainStyle.fontSize}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: { ...style.mainStyle, fontSize: event.target.value },
            });
          }}
        />
        <br />
        <label>字体: </label>
        <input
          value={style.mainStyle.fontFamily}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: { ...style.mainStyle, fontFamily: event.target.value },
            });
          }}
        />
        <br />
        <label>字重: </label>
        <input
          value={style.mainStyle.fontWeight}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: {
                ...style.mainStyle,
                fontWeight: parseInt(event.target.value),
              },
            });
          }}
        />
        <br />
        <label>行高: </label>
        <input
          value={style.mainStyle.lineHeight}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: { ...style.mainStyle, lineHeight: event.target.value },
            });
          }}
        />
        <br />
        <label>文字颜色: </label>
        <input
          value={style.mainStyle.color}
          onChange={(event) => {
            setStyle({
              ...style,
              mainStyle: { ...style.mainStyle, color: event.target.value },
            });
          }}
        />
        <br />

        <label>礼物图标高度: </label>
        <input
          value={style.giftIcon.height}
          onChange={(event) => {
            setStyle({
              ...style,
              giftIcon: { ...style.giftIcon, height: event.target.value },
            });
          }}
        />
        <br />

        {/*text icons*/}

        <br />
        <TextIconStyleModifier
          name={"VIP图标"}
          style={style.vipIcon}
          setStyle={(iconStyle) => {
            setStyle({ ...style, vipIcon: iconStyle });
          }}
        />
        <br />

        <br />
        <TextIconStyleModifier
          name={"SVIP图标"}
          style={style.svipIcon}
          setStyle={(iconStyle) => {
            setStyle({ ...style, svipIcon: iconStyle });
          }}
        />
        <br />

        <br />
        <TextIconStyleModifier
          name={"房管图标"}
          style={style.adminIcon}
          setStyle={(iconStyle) => {
            setStyle({ ...style, adminIcon: iconStyle });
          }}
        />
        <br />

        <label>用户名颜色: </label>
        <input
          value={style.userName.color}
          onChange={(event) => {
            setStyle({
              ...style,
              userName: { ...style.userName, color: event.target.value },
            });
          }}
        />
        <br />
        <label>弹幕内容颜色: </label>
        <input
          value={style.danmuContent.color}
          onChange={(event) => {
            setStyle({
              ...style,
              danmuContent: {
                ...style.danmuContent,
                color: event.target.value,
              },
            });
          }}
        />
        <br />
      </FunctionCard>
    );
  }
}
