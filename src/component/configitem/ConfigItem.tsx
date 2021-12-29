import { Form, Input, InputNumber, Popover, Space, Switch } from "antd";
import React, { ReactNode } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { TConfigContext } from "../../window/main/utils/ConfigContext";

class Props {
  configContext: TConfigContext;
  type: "number" | "string" | "boolean" | "color";
  valueKey: string;
  disabled?: boolean;
  setNumber?: (value: number) => void;
  setString?: (value: string) => void;
  setBoolean?: (value: boolean) => void;
  min?: number;
  max?: number;
  step?: number;
  name: string;
  description?: ReactNode;
}

export class ConfigItem extends React.Component<Props> {
  render(): ReactNode {
    const props = this.props;
    const { get, set } = props.configContext;

    let item = <></>;

    switch (this.props.type) {
      case "number": {
        item = (
          <InputNumber
            disabled={props.disabled}
            value={get(props.valueKey) as number}
            min={props.min}
            max={props.max}
            step={props.step}
            onChange={(value) => {
              if (props.setNumber) {
                props.setNumber(value as number);
              } else {
                set(props.valueKey, value);
              }
            }}
          />
        );
        break;
      }
      case "string": {
        item = (
          <Input
            disabled={props.disabled}
            value={get(props.valueKey) as string}
            onChange={(value) => {
              if (props.setString) {
                props.setString(value.target.value);
              } else {
                set(props.valueKey, value.target.value);
              }
            }}
          />
        );
        break;
      }
      case "boolean": {
        item = (
          <Switch
            disabled={props.disabled}
            checked={get(props.valueKey) as boolean}
            onChange={(value) => {
              if (props.setBoolean) {
                props.setBoolean(value as boolean);
                console.log("1");
              } else {
                set(props.valueKey, value);
              }
            }}
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
            value={get(props.valueKey) as string}
            onChange={(value) => {
              if (props.setString) {
                props.setString(value.target.value);
              } else {
                set(props.valueKey, value.target.value);
              }
            }}
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
