import React, { ReactNode } from "react";
import { BlackListMatchConfig } from "../../../../../../../utils/config/Config";

class Props {
  list: BlackListMatchConfig[];
  setList: (list: BlackListMatchConfig[]) => void;
}

export class BlackListMatchModifier extends React.Component<Props> {
  render(): ReactNode {
    return (
      <div>
        <h1>BlackListMatchModifier</h1>
      </div>
    );
  }
}
