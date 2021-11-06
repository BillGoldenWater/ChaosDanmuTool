import React, { ReactNode } from "react";
import { DanmuReceiverConfig } from "../../../../../../utils/config/Config";
import { FunctionCard } from "../../../../../../component/functioncard/FunctionCard";
import { ConfigContext } from "../../../../utils/ConfigContext";

export class DanmuReceiverConfigModifier extends React.Component {
  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const danmuReceiverConfig = config.danmuReceiver;
          const setDanmuReceiverConfig = (
            receiverConfig: DanmuReceiverConfig
          ): void => {
            setConfig({
              ...config,
              danmuReceiver: receiverConfig,
            });
          };
          return (
            <FunctionCard name={"弹幕接收器"}>
              <label>服务器URL: </label>
              <input
                value={danmuReceiverConfig.serverUrl}
                onChange={(event) => {
                  setDanmuReceiverConfig({
                    ...danmuReceiverConfig,
                    serverUrl: event.target.value,
                  });
                }}
              />
              <br />
              <label>房间号: </label>
              <input
                value={danmuReceiverConfig.roomid}
                onChange={(event) => {
                  setDanmuReceiverConfig({
                    ...danmuReceiverConfig,
                    roomid: parseInt(event.target.value, 10),
                  });
                }}
              />
              <br />
              <label>心跳包间隔(人气更新间隔)(秒): </label>
              <input
                value={danmuReceiverConfig.heartBeatInterval}
                onChange={(event) => {
                  setDanmuReceiverConfig({
                    ...danmuReceiverConfig,
                    heartBeatInterval: parseInt(event.target.value, 10),
                  });
                }}
              />
            </FunctionCard>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
