import React, { ReactNode } from "react";
import { TextIconStyleConfig } from "../../../../../../../utils/config/Config";
import { Form, Input, Popover, Space } from "antd";
import { TextIcon } from "../../../../../../../component/bilibili/texticon/TextIcon";

class Props {
  name: string;
  style: TextIconStyleConfig;
  setStyle: (iconStyle: TextIconStyleConfig) => void;
}

export class TextIconModifier extends React.Component<Props> {
  render(): ReactNode {
    const iconStyle = this.props.style;
    const setStyle = this.props.setStyle;

    return (
      <Form.Item label={this.props.name}>
        <Popover
          placement={"right"}
          content={
            <div>
              <Form.Item label={"文字颜色"}>
                <Space>
                  <Input
                    type={"color"}
                    style={{ minWidth: "5em" }}
                    value={iconStyle.style.color}
                    onChange={(event) => {
                      setStyle({
                        ...iconStyle,
                        style: {
                          ...iconStyle.style,
                          color: event.target.value,
                        },
                      });
                    }}
                  />
                </Space>
              </Form.Item>
              <Form.Item label={"背景颜色"}>
                <Space>
                  <Input
                    type={"color"}
                    style={{ minWidth: "5em" }}
                    value={iconStyle.style.backgroundColor}
                    onChange={(event) => {
                      setStyle({
                        ...iconStyle,
                        style: {
                          ...iconStyle.style,
                          backgroundColor: event.target.value,
                        },
                      });
                    }}
                  />
                </Space>
              </Form.Item>
              <Form.Item label={"边框颜色"}>
                <Space>
                  <Input
                    type={"color"}
                    style={{ minWidth: "5em" }}
                    value={iconStyle.style.borderColor}
                    onChange={(event) => {
                      setStyle({
                        ...iconStyle,
                        style: {
                          ...iconStyle.style,
                          borderColor: event.target.value,
                        },
                      });
                    }}
                  />
                </Space>
              </Form.Item>
            </div>
          }
        >
          <Space>
            <div>
              <TextIcon style={iconStyle.style}>{iconStyle.text}</TextIcon>
            </div>
          </Space>
        </Popover>
      </Form.Item>
    );
  }
}
