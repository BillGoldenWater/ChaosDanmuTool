import { Form, Input, InputNumber, Popover, Space, Switch } from "antd";
import React, { ReactNode } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";

class Props {
  type: "number" | "string" | "boolean" | "color";
  name: string;
  description?: ReactNode;
  disabled?: boolean;
  value: number | string | boolean;
  setNumber?: (value: number) => void;
  setString?: (value: string) => void;
  setBoolean?: (value: boolean) => void;
  min?: number;
  max?: number;
  step?: number;
}

export class ConfigItem extends React.Component<Props> {
  render(): ReactNode {
    const props = this.props;

    let item = <></>;

    switch (this.props.type) {
      case "number": {
        item = (
          <InputNumber
            disabled={props.disabled}
            value={props.value as number}
            min={props.min}
            max={props.max}
            step={props.step}
            onChange={(value) => props.setNumber(value)}
          />
        );
        break;
      }
      case "string": {
        item = (
          <Input
            disabled={props.disabled}
            value={props.value as string}
            onChange={(value) => props.setString(value.target.value)}
          />
        );
        break;
      }
      case "boolean": {
        item = (
          <Switch
            disabled={props.disabled}
            checked={props.value as boolean}
            onChange={(value) => props.setBoolean(value)}
          />
        );
        break;
      }
      case "color": {
        item = (
          <Input
            disabled={props.disabled}
            type={"color"}
            style={{ minWidth: "5em" }}
            value={props.value as string}
            onChange={(value) => props.setString(value.target.value)}
          />
        );
        break;
      }
    }

    return (
      <Form.Item label={props.name}>
        <Space>
          {item}
          {props.description && (
            <Popover content={props.description}>
              <QuestionCircleOutlined />
            </Popover>
          )}
        </Space>
      </Form.Item>
    );
  }
}
