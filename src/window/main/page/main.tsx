import React from "react";
import { NavBar } from "../../../component/navbar/NavBar";
import { Function } from "./function";
import { Document } from "./document";
import { Setting } from "./setting";

class Props {}

class State {
  pageIndex: number;
}

class Page {
  name: string;
  pageClass: typeof React.Component;
}

const pages: Page[] = [
  { name: "文档", pageClass: Document },
  { name: "功能", pageClass: Function },
  { name: "设置", pageClass: Setting },
];

export class Main extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      pageIndex: 0,
    };
  }

  render(): JSX.Element {
    const CPage = pages[this.state.pageIndex].pageClass;
    return (
      <div>
        <NavBar
          items={pages.map((value: Page) => {
            return value.name;
          })}
          default={0}
          onSwitch={this.onPageSwitch.bind(this)}
        />
        <CPage />
      </div>
    );
  }

  onPageSwitch(index: number): void {
    this.setState({ pageIndex: index });
  }
}
