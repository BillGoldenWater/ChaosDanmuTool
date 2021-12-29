import React, { ReactNode } from "react";
import { Form, Popover, Space } from "antd";
import { TextIcon } from "../../../../../../../component/bilibili/texticon/TextIcon";
import { TConfigContext } from "../../../../../utils/ConfigContext";
import { ConfigItem } from "../../../../../../../component/configitem/ConfigItem";

class Props {
  styleContext: TConfigContext;
  valueKey: string;
  name: string;
}

export class TextIconModifier extends React.Component<Props> {
  render(): ReactNode {
    const props = this.props;
    const { get } = props.styleContext;
    const key = props.valueKey;

    return (
      <Form.Item label={this.props.name}>
        <Popover
          placement={"right"}
          content={
            <div>
              <ConfigItem
                configContext={props.styleContext}
                type={"string"}
                valueKey={`${key}.text`}
                name={"文本"}
              />
              <ConfigItem
                configContext={props.styleContext}
                type={"color"}
                valueKey={`${key}.style.color`}
                name={"文字颜色"}
              />
              <ConfigItem
                configContext={props.styleContext}
                type={"color"}
                valueKey={`${key}.style.backgroundColor`}
                name={"背景颜色"}
              />
              <ConfigItem
                configContext={props.styleContext}
                type={"color"}
                valueKey={`${key}.style.borderColor`}
                name={"边框颜色"}
              />
            </div>
          }
        >
          <Space>
            <div>
              <TextIcon style={get(`${key}.style`)}>
                {get(`${key}.text`)}
              </TextIcon>
            </div>
          </Space>
        </Popover>
      </Form.Item>
    );
  }
}
