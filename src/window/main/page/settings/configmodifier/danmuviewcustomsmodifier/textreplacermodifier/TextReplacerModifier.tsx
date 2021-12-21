import React, { ReactNode } from "react";
import { TextReplacerConfig } from "../../../../../../../utils/config/Config";
import { v4 as uuid4 } from "uuid";
import { Button, Input, Space, Switch, Table } from "antd";
import {
  CloseCircleOutlined,
  DownCircleOutlined,
  PlusCircleOutlined,
  UpCircleOutlined,
} from "@ant-design/icons";

class Props {
  list: TextReplacerConfig[];
  setList: (list: TextReplacerConfig[]) => void;
}

export class TextReplacerModifier extends React.Component<Props> {
  render(): ReactNode {
    const columns = [
      {
        title: "匹配",
        dataIndex: "searchValue",
        render: (value: string, record: TextReplacerConfig) => (
          <Space>
            <Input
              value={value}
              onChange={(e) => {
                record.searchValue = e.target.value;
                this.props.setList(this.props.list);
              }}
            />
          </Space>
        ),
      },
      {
        title: "替换为",
        dataIndex: "replaceValue",
        render: (value: string, record: TextReplacerConfig) => (
          <Space>
            <Input
              value={value}
              onChange={(e) => {
                record.replaceValue = e.target.value;
                this.props.setList(this.props.list);
              }}
            />
          </Space>
        ),
      },
      {
        title: "正则",
        dataIndex: "isRegExp",
        render: (value: boolean, record: TextReplacerConfig) => (
          <Switch
            checked={value}
            onChange={(value) => {
              record.isRegExp = value;
              this.props.setList(this.props.list);
            }}
          />
        ),
      },
      {
        title: "操作",
        render: (record: TextReplacerConfig) => (
          <Space>
            <Button
              icon={<UpCircleOutlined />}
              onClick={() => {
                const i = this.props.list.indexOf(record);
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
                const i = this.props.list.indexOf(record);
                if (i < this.props.list.length - 1) {
                  const temp = this.props.list[i + 1];
                  this.props.list[i + 1] = record;
                  this.props.list[i] = temp;
                  this.props.setList(this.props.list);
                }
              }}
            />
            <Button
              icon={<CloseCircleOutlined />}
              danger={true}
              onClick={() => {
                this.props.setList(
                  this.props.list.filter((value) => value != record)
                );
              }}
            />
          </Space>
        ),
      },
    ];

    return (
      <div>
        <Space direction={"vertical"}>
          <Button
            icon={<PlusCircleOutlined />}
            onClick={() => {
              this.props.list.unshift();
              this.props.setList([
                {
                  searchValue: "",
                  replaceValue: "",
                  isRegExp: false,
                },
                ...this.props.list,
              ]);
            }}
          />
          <Table
            columns={columns}
            dataSource={this.props.list}
            pagination={false}
            rowKey={() => uuid4()}
          />
        </Space>
      </div>
    );
  }
}
