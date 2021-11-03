import React, { ReactNode } from "react";
import { FunctionCard } from "../../../../../component/functioncard/FunctionCard";
import { DanmuReceiverConfigModifier } from "./danmureceiverconfigmodifier/DanmuReceiverConfigModifier";
import { DanmuViewConfigModifier } from "./danmuviewconfigmodifier/DanmuViewConfigModifier";
import { DanmuViewCustomsModifier } from "./danmuviewcustomsmodifier/DanmuViewCustomsModifier";

export class ConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <FunctionCard name={"设置"}>
        <DanmuReceiverConfigModifier />
        <DanmuViewConfigModifier />
        <DanmuViewCustomsModifier />
      </FunctionCard>
    );
  }
}
