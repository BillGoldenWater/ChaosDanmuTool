import React, { ReactNode } from "react";
import { Collapse } from "antd";
import { MainConfigModifier } from "./configmodifier/mainconfigmodifier/MainConfigModifier";

export class Settings extends React.Component {
  render(): ReactNode {
    return (
      <div>
        <Collapse defaultActiveKey={"mainSettings"}>
          <Collapse.Panel key={"mainSettings"} header={"主要设置"}>
            <MainConfigModifier />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  }
}
