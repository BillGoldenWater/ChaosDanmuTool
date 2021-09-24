import React from "react";
import style from "./ReceiverStatusIndicator.module.css";
import { ReceiverStatus } from "../../utils/command/ReceiverStatusUpdate";

class Props {
  status: ReceiverStatus;
}

export class ReceiverStatusIndicator extends React.Component<Props> {
  render(): JSX.Element {
    let statusClassName = "";
    switch (this.props.status) {
      case "open": {
        statusClassName = style.receiverStatusIndicator_open;
        break;
      }
      case "close": {
        statusClassName = style.receiverStatusIndicator_close;
        break;
      }
      case "error": {
        statusClassName = style.receiverStatusIndicator_error;
        break;
      }
    }

    return (
      <div>
        <div className={style.receiverStatusIndicator + " " + statusClassName}>
          R
        </div>
      </div>
    );
  }
}
