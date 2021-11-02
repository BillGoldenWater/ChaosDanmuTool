import React, { ReactNode } from "react";
import { ConfigContext } from "../../../../utils/ConfigContext";
import { FunctionCard } from "../../../../../../component/functioncard/FunctionCard";
import {
  DanmuViewCustomConfig,
  defaultDanmuViewCustom,
} from "../../../../../../utils/config/Config";
import { DanmuViewStyleConfigModifier } from "./danmuviewstyleconfigmodifier/DanmuViewStyleConfigModifier";
import { Button } from "../../../../../../component/button/Button";

class Props {}

class State {
  selected: string;
}

export class DanmuViewCustomsModifier extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      selected: "internal",
    };
  }

  render(): ReactNode {
    return (
      <ConfigContext.Consumer>
        {({ config, setConfig }) => {
          if (config.danmuViewCustoms.length == 0) {
            config.danmuViewCustoms.push({
              ...defaultDanmuViewCustom,
              name: "internal",
            });
          }

          const danmuViewCustomConfig =
            config.danmuViewCustoms.filter((value) => {
              return value.name == this.state.selected;
            })[0] || config.danmuViewCustoms[0];

          const setDanmuViewCustomConfig = (
            viewCustomConfig: DanmuViewCustomConfig
          ) => {
            const tempList = config.danmuViewCustoms.filter((value) => {
              return value.name != danmuViewCustomConfig.name;
            });
            tempList.push(viewCustomConfig);
            setConfig({ ...config, danmuViewCustoms: tempList });
            this.setState({ selected: viewCustomConfig.name });
          };

          return (
            <FunctionCard name={"弹幕查看器设置"}>
              <FunctionCard>
                <label>当前修改: </label>
                <select
                  value={this.state.selected}
                  onChange={(event) => {
                    event.preventDefault();
                    this.setState({ selected: event.target.value });
                  }}
                >
                  {config.danmuViewCustoms.map((value, index) => {
                    console.log(value.name);
                    return (
                      <option
                        key={JSON.stringify(value) + index}
                        value={value.name}
                      >
                        {value.name}
                      </option>
                    );
                  })}
                </select>
                <Button
                  onClick={() => {
                    const tempList = config.danmuViewCustoms;
                    tempList.push({ ...defaultDanmuViewCustom, name: "new" });
                    setConfig({ ...config, danmuViewCustoms: tempList });
                    this.setState({ selected: "new" });
                  }}
                >
                  新建
                </Button>
                <Button
                  onClick={() => {
                    setConfig({
                      ...config,
                      danmuViewCustoms: config.danmuViewCustoms.filter(
                        (value) => {
                          return value.name != danmuViewCustomConfig.name;
                        }
                      ),
                    });
                    this.setState({ selected: "internal" });
                  }}
                >
                  删除
                </Button>
              </FunctionCard>
              <br />

              <label>名称: </label>
              <input
                value={danmuViewCustomConfig.name}
                onChange={(event) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    name: event.target.value,
                  });
                }}
              />
              <br />

              <label>最大显示弹幕数: </label>
              <input
                value={danmuViewCustomConfig.maxDanmuNumber}
                onChange={(event) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    maxDanmuNumber: parseInt(event.target.value, 10),
                  });
                }}
              />
              <br />

              <label>显示状态栏: </label>
              <input
                type={"checkbox"}
                checked={danmuViewCustomConfig.statusBarDisplay}
                onChange={(event) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    statusBarDisplay: event.target.checked,
                  });
                }}
              />
              <br />

              <label>SC置顶: </label>
              <input
                type={"checkbox"}
                checked={danmuViewCustomConfig.superChatAlwaysOnTop}
                onChange={(event) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    superChatAlwaysOnTop: event.target.checked,
                  });
                }}
              />
              <br />

              <label>格式化人气: </label>
              <input
                type={"checkbox"}
                checked={danmuViewCustomConfig.numberFormat.formatActivity}
                onChange={(event) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    numberFormat: {
                      ...danmuViewCustomConfig.numberFormat,
                      formatActivity: event.target.checked,
                    },
                  });
                }}
              />
              <br />
              <label>格式化粉丝数: </label>
              <input
                type={"checkbox"}
                checked={danmuViewCustomConfig.numberFormat.formatFansNum}
                onChange={(event) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    numberFormat: {
                      ...danmuViewCustomConfig.numberFormat,
                      formatFansNum: event.target.checked,
                    },
                  });
                }}
              />
              <br />
              <br />
              <DanmuViewStyleConfigModifier
                style={danmuViewCustomConfig.style}
                setStyle={(style) => {
                  setDanmuViewCustomConfig({
                    ...danmuViewCustomConfig,
                    style: style,
                  });
                }}
              />
            </FunctionCard>
          );
        }}
      </ConfigContext.Consumer>
    );
  }
}
