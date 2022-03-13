/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import { v4 as uuid4 } from "uuid";
import { Button, Input, Space, Switch, Table } from "antd";
import { ColumnGroupType, ColumnType } from "antd/lib/table/interface";
import {
  CloseCircleOutlined,
  DownCircleOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";

type AnyObject = { [key: string]: unknown };

type Column = {
  inputType?: "text" | "boolean";
  uuid?: string;
};

export type Columns<T> = ((ColumnGroupType<T> | ColumnType<T>) & Column)[];

class Props<T> {
  list: T[];
  setList: (list: T[]) => void;
  columns: Columns<T>;
  delBtn?: boolean;
}

export class SortableTable<T extends AnyObject> extends React.Component<
  Props<T>
> {
  render(): ReactNode {
    const props = this.props;
    const columns = props.columns.map((value) => {
      switch (value.inputType) {
        case "text": {
          value.render = (text: string, record) => (
            <Space>
              <Input
                value={text}
                onChange={(e) => {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  record[value.dataIndex] = e.target.value;
                  this.props.setList(this.props.list);
                }}
              />
            </Space>
          );
          break;
        }
        case "boolean": {
          value.render = (bool: boolean, record) => (
            <Switch
              checked={bool}
              onChange={(val) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                record[value.dataIndex] = val;
                this.props.setList(this.props.list);
              }}
            />
          );
          break;
        }
        default: {
          break;
        }
      }
      return value;
    });

    columns.push({
      title: "操作",
      render: (text: string, record: T, i: number) => (
        <Space>
          <Button
            icon={<UpCircleOutlined />}
            onClick={() => {
              if (i > 0) {
                const temp = this.props.list[i - 1];
                this.props.list[i - 1] = record;
                this.props.list[i] = temp;
                this.props.setList(this.props.list);
              }
            }}
          />
          <Button
            icon={<DownCircleOutlined />}
            onClick={() => {
              if (i < this.props.list.length - 1) {
                const temp = this.props.list[i + 1];
                this.props.list[i + 1] = record;
                this.props.list[i] = temp;
                this.props.setList(this.props.list);
              }
            }}
          />
          {props.delBtn && (
            <Button
              icon={<CloseCircleOutlined />}
              danger={true}
              onClick={() => {
                this.props.setList(
                  this.props.list.filter((value) => value != record)
                );
              }}
            />
          )}
        </Space>
      ),
    });

    const list = this.props.list.map((value) => {
      if (value["uuid"] == null) {
        (value as AnyObject)["uuid"] = uuid4();
      }
      return value;
    });
    return (
      <Table
        columns={columns}
        dataSource={list}
        rowKey={"uuid"}
        pagination={false}
      />
    );
  }
}
