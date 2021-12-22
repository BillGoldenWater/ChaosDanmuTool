import React, { ReactNode } from "react";
import {
  BlackListMatchConfig,
  getDefaultBlackListMatchConfig,
} from "../../../../../../../utils/config/Config";
import { Button, Space } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Columns, SortableTable } from "../sortabletable/SortableTable";

class Props {
  list: BlackListMatchConfig[];
  setList: (list: BlackListMatchConfig[]) => void;
}

export class BlackListMatchModifier extends React.Component<Props> {
  render(): ReactNode {
    const columns: Columns<BlackListMatchConfig> = [
      {
        title: "关键词/正则",
        dataIndex: "searchValue",
        inputType: "text",
      },
      {
        title: "是否正则",
        dataIndex: "isRegExp",
        inputType: "boolean",
      },
    ];

    return (
      <Space direction={"vertical"}>
        <Button
          icon={<PlusCircleOutlined />}
          onClick={() => {
            this.props.list.unshift();
            this.props.setList([
              getDefaultBlackListMatchConfig(),
              ...this.props.list,
            ]);
          }}
        />
        <SortableTable
          list={this.props.list}
          setList={this.props.setList}
          columns={columns}
          delBtn
        />
      </Space>
    );
  }
}
