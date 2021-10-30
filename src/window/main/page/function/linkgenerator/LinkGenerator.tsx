import React, { ReactNode } from "react";
import { ConfigContext } from "../../../utils/ConfigContext";

class Props {}

class State {
  selectedStyle: string;
}

export class LinkGenerator extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selectedStyle: "",
    };
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config }) => {
          const styleOptions = config.danmuViewCustoms.map((value) => {
            return (
              <option key={JSON.stringify(value)} value={value.name}>
                {value.name}
              </option>
            );
          });
          return (
            <div>
              使用样式:
              <select
                value={this.state.selectedStyle}
                onChange={(event) => {
                  this.setState({ selectedStyle: event.target.value });
                }}
              >
                {styleOptions}
              </select>
              <br />
              链接:{" "}
              <input // http://localhost:3000/viewer?address=localhost&port=25555&maxReconnectAttemptNum=5&name=internal
                value={
                  "http://localhost:" +
                  config.danmuViewConfig.webServer.port +
                  "/viewer?" +
                  "address=" +
                  config.danmuViewConfig.websocketServer.host +
                  "&port=" +
                  config.danmuViewConfig.websocketServer.port +
                  "&maxReconnectAttemptNum=" +
                  config.danmuViewConfig.maxReconnectAttemptNumber +
                  "&name=" +
                  (this.state.selectedStyle || config.danmuViewCustoms[0].name)
                }
                readOnly={true}
              />
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
