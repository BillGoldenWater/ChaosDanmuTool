import React, { ReactNode } from "react";
import { ConfigContext } from "../../utils/ConfigContext";

class Props {
  mergePer: number;
}

export class DanmuAnalysis extends React.Component<Props> {
  render(): ReactNode {
    const p = this.props;

    return (
      <ConfigContext.Consumer>
        {({ state }) => {
          const s = state;

          return (
            <div>
              DanmuAnalysis {p.mergePer}{" "}
              {s.danmuHistory.length > 0 && s.danmuHistory[0].uuid}
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
