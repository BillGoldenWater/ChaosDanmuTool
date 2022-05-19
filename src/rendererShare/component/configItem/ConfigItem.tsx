/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import "./ConfigItem.less";
import { Input } from "../input/Input";
import { Switch } from "../switch/Switch";
import { AObject, ObjectPath } from "../../../share/type/TObjectPath";
import { TDotPropContext } from "../../state/TDotPropContext";

//region defineProps
class PropsBase {
  name: string;
  description?: string;
}

class PropsStringBase extends PropsBase {
  type: "string";
}

class PropsNumberBase extends PropsBase {
  type: "number";
  max?: number;
  min?: number;
}

class PropsBooleanBase extends PropsBase {
  type: "boolean";
}

class PropsString extends PropsStringBase {
  defaultValue: string;
  onChange: (value: string) => void;
}

class PropsNumber extends PropsNumberBase {
  defaultValue: number;
  onChange: (value: number) => void;
}

class PropsBoolean extends PropsBooleanBase {
  defaultValue: boolean;
  onChange: (value: boolean) => void;
}

class PropsStringDotProp<T extends AObject> extends PropsStringBase {
  context: TDotPropContext<T>;
  path: ObjectPath<T>;
  defaultValue?: string;
}

class PropsNumberDotProp<T extends AObject> extends PropsNumberBase {
  context: TDotPropContext<T>;
  path: ObjectPath<T>;
  defaultValue?: number;
}

class PropsBooleanDotProp<T extends AObject> extends PropsBooleanBase {
  context: TDotPropContext<T>;
  path: ObjectPath<T>;
  defaultValue?: boolean;
}

type Props<T extends AObject> =
  | PropsString
  | PropsNumber
  | PropsBoolean
  | PropsStringDotProp<T>
  | PropsNumberDotProp<T>
  | PropsBooleanDotProp<T>;

//endregion

export class ConfigItem<T extends AObject> extends React.Component<Props<T>> {
  render(): ReactNode {
    const { name, description, type } = this.props;

    let inputElement: ReactNode = <></>;

    //region constructor input element
    switch (type) {
      case "string": {
        if ((this.props as PropsString).defaultValue) {
          const p = this.props as PropsString;
          inputElement = (
            <Input
              type={"text"}
              defaultValue={p.defaultValue}
              onChange={(event) => p.onChange(event.target.value)}
            />
          );
        } else {
          const p = this.props as PropsStringDotProp<T>;
          inputElement = (
            <Input
              type={"text"}
              defaultValue={p.context.get(p.path, p.defaultValue) as string}
              onChange={(event) => {
                p.context.set(p.path, event.target.value);
              }}
            />
          );
        }
        break;
      }
      case "number": {
        if ((this.props as PropsNumber).defaultValue) {
          const p = this.props as PropsNumber;
          inputElement = (
            <Input
              type={"number"}
              defaultValue={p.defaultValue}
              max={p.max}
              min={p.min}
              onChange={(event) => {
                if (isNaN(event.target.valueAsNumber)) return;
                p.onChange(event.target.valueAsNumber);
              }}
            />
          );
        } else {
          const p = this.props as PropsNumberDotProp<T>;
          inputElement = (
            <Input
              type={"number"}
              defaultValue={p.context.get(p.path, p.defaultValue) as number}
              max={p.max}
              min={p.min}
              onChange={(event) => {
                if (isNaN(event.target.valueAsNumber)) return;
                p.context.set(p.path, event.target.valueAsNumber);
              }}
            />
          );
        }
        break;
      }
      case "boolean": {
        if ((this.props as PropsBoolean).defaultValue) {
          const p = this.props as PropsBoolean;
          inputElement = (
            <Switch
              defaultValue={p.defaultValue}
              onChange={(value) => p.onChange(value)}
            />
          );
        } else {
          const p = this.props as PropsBooleanDotProp<T>;
          inputElement = (
            <Switch
              defaultValue={p.context.get(p.path, p.defaultValue) as boolean}
              onChange={(value) => {
                p.context.set(p.path, value);
              }}
            />
          );
        }
        break;
      }
    }
    //endregion

    return (
      <div className={"ConfigItem"}>
        <div className={"ConfigItemNameAndInput"}>
          <div className={"ConfigItemName"}>{name}:</div>
          {inputElement}
        </div>
        <div className={"ConfigItemDescription"}>{description}</div>
      </div>
    );
  }
}
