import React, { ReactNode } from "react";
import {
  getDefaultTextReplacerConfig,
  TextReplacerConfig,
} from "../../../../../../../utils/config/Config";
import { Button, Space } from "antd";
import { PlusCircleOutlined } from "@ant-design/icons";
import { Columns, SortableTable } from "../sortabletable/SortableTable";

class Props {
  list: TextReplacerConfig[];
  setList: (list: TextReplacerConfig[]) => void;
}

export class TextReplacerModifier extends React.Component<Props> {
  render(): ReactNode {
    const columns: Columns<TextReplacerConfig> = [
      {
        title: "匹配",
        dataIndex: "searchValue",
        inputType: "text",
      },
      {
        title: "替换为",
        dataIndex: "replaceValue",
        inputType: "text",
      },
      {
        title: "正则",
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
              getDefaultTextReplacerConfig(),
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
