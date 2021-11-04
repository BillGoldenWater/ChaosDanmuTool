import React, { ReactNode } from "react";
import { TextIconStyleConfig } from "../../../../../../../../utils/config/Config";
import { FunctionCard } from "../../../../../../../../component/functioncard/FunctionCard";
import { TextIcon } from "../../../../../../../../component/bilibili/texticon/TextIcon";

class Props {
  name: string;
  style: TextIconStyleConfig;
  setStyle: (iconStyle: TextIconStyleConfig) => void;
}

export class TextIconStyleModifier extends React.Component<Props> {
  render(): ReactNode {
    const style = this.props.style;
    const setStyle = this.props.setStyle;

    return (
      <FunctionCard name={this.props.name}>
        <label>文字: </label>
        <input
          value={style.text}
          onChange={(event) => {
            setStyle({ ...style, text: event.target.value });
          }}
        />
        <br />

        <label>文字颜色: </label>
        <input
          value={style.style.color}
          type={"color"}
          onChange={(event) => {
            setStyle({
              ...style,
              style: { ...style.style, color: event.target.value },
            });
          }}
        />
        <br />
        <label>背景颜色: </label>
        <input
          value={style.style.backgroundColor}
          type={"color"}
          onChange={(event) => {
            setStyle({
              ...style,
              style: { ...style.style, backgroundColor: event.target.value },
            });
          }}
        />
        <br />
        <label>边框颜色: </label>
        <input
          value={style.style.borderColor}
          type={"color"}
          onChange={(event) => {
            setStyle({
              ...style,
              style: { ...style.style, borderColor: event.target.value },
            });
          }}
        />
        <br />

        <label>预览: </label>
        <TextIcon style={style.style}>{style.text}</TextIcon>
      </FunctionCard>
    );
  }
}
