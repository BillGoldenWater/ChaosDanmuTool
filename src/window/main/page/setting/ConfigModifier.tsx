import React, { ReactNode } from "react";
import { FunctionCard } from "../../../../component/functioncard/FunctionCard";
import { DanmuReceiverConfigModifier } from "./configfilemanager/danmureceiverconfigmodifier/DanmuReceiverConfigModifier";
import { DanmuViewConfigModifier } from "./configfilemanager/danmuviewconfigmodifier/DanmuViewConfigModifier";

export class ConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <FunctionCard name={"设置"}>
        <DanmuReceiverConfigModifier />
        <DanmuViewConfigModifier />
      </FunctionCard>
    );
  }
}
