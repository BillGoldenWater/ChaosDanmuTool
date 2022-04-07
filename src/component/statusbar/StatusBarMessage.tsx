/*
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { ReactNode, RefObject } from "react";
import "./StatusBar.css";
import { v4 as uuidv4 } from "uuid";
import { MainState } from "../../window/viewer/page/main";

class Props {
  state: MainState;
  id?: string;
}

const updatePerMS = 10;

type MessageDetail = {
  uuid: string;
  timestamp: number;
  message: ReactNode;
  ref: RefObject<HTMLDivElement>;
};

class State {
  messageList: MessageDetail[];
}

export class StatusBarMessage extends React.Component<Props, State> {
  listenerId: string;
  timerId: number;

  contentRef: RefObject<HTMLDivElement> = React.createRef();
  scrollLeft = 0;

  constructor(props: Props) {
    super(props);

    this.state = {
      messageList: [],
    };

    const { state, id } = this.props;

    this.listenerId = "statusBar" + (id ? `-${id}` : "");

    state.addMessageListener(this.listenerId, this.onMessage.bind(this));

    this.timerId = window.setInterval(this.update.bind(this), updatePerMS);
  }

  update() {
    if (this.contentRef.current) {
      const content = this.contentRef.current;
      const list = this.state.messageList;

      let totalWidth = 0;
      let latestWidth = 0;

      list.forEach((value) => {
        const c = value.ref.current;
        if (c) {
          const style = window.getComputedStyle(c);
          totalWidth += Number.parseFloat(style.width);
          latestWidth = Number.parseFloat(style.width);
        }
      });

      const targetScroll = totalWidth - latestWidth;
      const needScroll = targetScroll - this.scrollLeft;
      this.scrollLeft += Math.min(
        needScroll / 8,
        targetScroll / (900 / updatePerMS)
      );

      if (needScroll < 0.5 && this.scrollLeft > 1) {
        this.setState(
          (prev: State) => {
            return {
              messageList: [prev.messageList[prev.messageList.length - 1]],
            };
          },
          () => {
            this.scrollLeft = 0;
          }
        );
      }

      content.scrollLeft = this.scrollLeft;
    }
  }

  onMessage(node: ReactNode) {
    this.setState((prevState: State) => {
      const ref: RefObject<HTMLDivElement> = React.createRef();
      const uuid = uuidv4();

      const message: ReactNode = (
        <div ref={ref} key={uuid}>
          {node}
        </div>
      );

      prevState.messageList.push({
        uuid: uuid,
        timestamp: new Date().getTime() / 1000,
        message: message,
        ref: ref,
      });
      return prevState;
    });
  }

  componentWillUnmount() {
    this.props.state.removeMessageListener(this.listenerId);
    window.clearTimeout(this.timerId);
  }

  render() {
    return (
      <div ref={this.contentRef} className={"statusBar_statusMessage"}>
        {this.state.messageList.map((value) => value.message)}
        <div
          key={"1"}
          style={{
            opacity: "0",
            minWidth: "100vw",
          }}
        />
      </div>
    );
  }
}
