/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode } from "react";
import {
  BlackListMatchConfig,
  getDefaultBlackListMatchConfig,
} from "../../../../../../../utils/config/Config";
import { Button, Divider } from "antd";
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
      <div>
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
        <Divider />
        <SortableTable
          list={this.props.list}
          setList={this.props.setList}
          columns={columns}
          delBtn
        />
      </div>
    );
  }
}
