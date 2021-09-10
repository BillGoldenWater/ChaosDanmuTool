import React from "react";
import { NavBar } from "../component/navbar/NavBar";

class Page {
  name: string;
}

const pages: Page[] = [
  { name: "pageA" },
  { name: "pageB" },
  { name: "pageC" },
  { name: "pageD" },
];

export class Root extends React.Component {
  render(): JSX.Element {
    return (
      <div>
        <NavBar
          items={pages.map((value: Page) => {
            return value.name;
          })}
          default={0}
          onSwitch={this.onPageSwitch.bind(this)}
        />
      </div>
    );
  }

  onPageSwitch(index: number): void {
    console.log("switchTo " + pages[index].name);
  }
}
