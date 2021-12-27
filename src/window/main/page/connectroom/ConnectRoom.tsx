import React, { ReactNode } from "react";
import { Button, Form, InputNumber, Space } from "antd";
import { ConfigContext } from "../../utils/ConfigContext";
import { ReceiverStatus } from "../../../../utils/command/ReceiverStatusUpdate";

class Props {
  receiverStatus: ReceiverStatus;
}

export class ConnectRoom extends React.Component<Props> {
  render(): ReactNode {
    const props = this.props;

    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          const open = props.receiverStatus == "open";
          const connecting = this.props.receiverStatus == "connecting" && {
            delay: 100,
          };

          return (
            <div>
              <Form.Item label="房间号">
                <Space>
                  <InputNumber
                    min={0}
                    value={config.danmuReceiver.roomid}
                    onChange={(value) => {
                      setConfig({
                        ...config,
                        danmuReceiver: {
                          ...config.danmuReceiver,
                          roomid: value,
                        },
                      });
                    }}
                  />
                  <Button
                    type={"primary"}
                    loading={connecting}
                    onClick={() => {
                      if (open) {
                        window.electron.disconnect();
                      } else {
                        window.electron.connect(config.danmuReceiver.roomid);
                      }
                    }}
                  >
                    {!open ? "连接" : "断开"}
                  </Button>
                </Space>
              </Form.Item>
            </div>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
