import React, { ReactNode } from "react";
import { Collapse } from "antd";
import { MainConfigModifier } from "./configmodifier/mainconfigmodifier/MainConfigModifier";
import { DanmuViewConfigModifier } from "./configmodifier/danmuviewconfigmodifier/DanmuViewConfigModifier";

export class Settings extends React.Component {
  render(): ReactNode {
    return (
      <div>
        <Collapse defaultActiveKey={"mainSettings"}>
          <Collapse.Panel key={"mainSettings"} header={"主要设置"}>
            <MainConfigModifier />
          </Collapse.Panel>
          <Collapse.Panel key={"danmuViewSettings"} header={"弹幕查看器设置"}>
            <DanmuViewConfigModifier />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
