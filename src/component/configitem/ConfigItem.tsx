/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Form, Input, InputNumber, Popover, Space, Switch } from "antd";
import React, { ReactNode } from "react";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { TConfigContext } from "../../window/main/utils/ConfigContext";

class Props {
  configContext?: TConfigContext;
  type: "number" | "string" | "boolean" | "color";
  value?: unknown;
  valueKey?: string;
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
    const p = this.props;
    let { get, set }: TConfigContext = {
      get: null,
      set: null,
      updateConfig: null,
    };
    if (p.configContext) {
      get = p.configContext.get;
      set = p.configContext.set;
    } else {
      get = () => {
        return p.value;
      };
      set = (key, value) => {
        switch (p.type) {
          case "number":
            if (p.setNumber) {
              p.setNumber(value as number);
            }
            break;
          case "string":
            if (p.setString) {
              p.setString(value as string);
            }
            break;
          case "boolean":
            if (p.setBoolean) {
              p.setBoolean(value as boolean);
            }
            break;
        }
      };
    }

    let item = <></>;

    switch (this.props.type) {
      case "number": {
        item = (
          <InputNumber
            disabled={p.disabled}
            value={get(p.valueKey) as number}
            min={p.min}
            max={p.max}
            step={p.step}
            onChange={(value) => {
              if (p.setNumber) {
                p.setNumber(value as number);
              } else {
                set(p.valueKey, value);
              }
            }}
          />
        );
        break;
      }
      case "string": {
        item = (
          <Input
            disabled={p.disabled}
            value={get(p.valueKey) as string}
            onChange={(value) => {
              if (p.setString) {
                p.setString(value.target.value);
              } else {
                set(p.valueKey, value.target.value);
              }
            }}
          />
        );
        break;
      }
      case "boolean": {
        item = (
          <Switch
            disabled={p.disabled}
            checked={get(p.valueKey) as boolean}
            onChange={(value) => {
              if (p.setBoolean) {
                p.setBoolean(value as boolean);
                console.log("1");
              } else {
                set(p.valueKey, value);
              }
            }}
          />
        );
        break;
      }
      case "color": {
        item = (
          <Input
            disabled={p.disabled}
            type={"color"}
            style={{ minWidth: "5em" }}
            value={get(p.valueKey) as string}
            onChange={(value) => {
              if (p.setString) {
                p.setString(value.target.value);
              } else {
                set(p.valueKey, value.target.value);
              }
            }}
          />
        );
        break;
      }
    }

    return (
      <Form.Item label={p.name}>
        <Space>
          {item}
          {p.description && (
            <Popover content={p.description}>
              <QuestionCircleOutlined />
            </Popover>
          )}
        </Space>
      </Form.Item>
    );
  }
}
