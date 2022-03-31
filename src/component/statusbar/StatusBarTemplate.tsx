/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode, RefObject } from "react";
import "./StatusBar.css";

class Props {
  className: string;
  message: string | ReactNode;
  style?: React.CSSProperties;
}

export class StatusBarTemplate extends React.Component<Props> {
  contentRef: RefObject<HTMLDivElement> = React.createRef();
  childrenRef: RefObject<HTMLDivElement> = React.createRef();

  constructor(props: Props) {
    super(props);
  }

  render(): JSX.Element {
    const contentWidth = this.contentRef.current
      ? window.getComputedStyle(this.contentRef.current).width
      : "0";

    const childrenWidth = this.childrenRef.current
      ? window.getComputedStyle(this.childrenRef.current).width
      : "0";

    return (
      <div className={this.props.className}>
        <div
          ref={this.contentRef}
          className="statusBar_content"
          style={this.props.style}
        >
          <div
            className={"statusBar_statusMessage"}
            style={{
              maxWidth: `calc(${contentWidth} - ${childrenWidth})`,
            }}
          >
            {this.props.message}
          </div>
          <div ref={this.childrenRef} className="statusBar_itemList">
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}
