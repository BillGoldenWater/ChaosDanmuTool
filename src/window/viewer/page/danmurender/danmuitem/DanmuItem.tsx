import React from "react";
import { DanmuMessage } from "../../../../../utils/command/DanmuMessage";
import { DanmuMsg } from "./item/danmumsg/DanmuMsg";
import { parseDanmuMsg } from "../../../../../type/TDanmuMsg";
import { SuperChatMessage } from "./item/superchatmessage/SuperChatMessage";
import { InteractWord } from "./item/interactword/InteractWord";
import { SendGift } from "./item/sendgift/SendGift";
import { RoomBlockMsg } from "./item/roomblockmsg/RoomBlockMsg";
import { RoomStatusChange } from "./item/roomstatuschange/RoomStatusChange";
import { getStatusUpdateMessageCmd } from "../../../../../utils/command/ReceiverStatusUpdate";
import { StatusUpdate } from "./item/statusupdate/StatusUpdate";
import { GuardBuy } from "./item/guardbuy/GuardBuy";
import { TInteractWord } from "../../../../../type/TInteractWord";
import { TSendGift } from "../../../../../type/TSendGift";
import { TSuperChatMessage } from "../../../../../type/TSuperChatMessage";
import { TPreparing } from "../../../../../type/TPreparing";
import { TLive } from "../../../../../type/TLive";
import { TGuardBuy } from "../../../../../type/TGuardBuy";

class Props {
  message: DanmuMessage;
}

export class DanmuItem extends React.Component<Props> {
  render(): JSX.Element {
    const msg: DanmuMessage = this.props.message;
    switch (msg.cmd) {
      case getStatusUpdateMessageCmd(): {
        return <StatusUpdate msg={msg} />;
      }
      case "INTERACT_WORD": {
        return <InteractWord interactWord={msg as TInteractWord} />;
      }
      case "SEND_GIFT": {
        return <SendGift sendGift={msg as TSendGift} />;
      }
      case "DANMU_MSG": {
        return <DanmuMsg data={parseDanmuMsg(msg)} />;
      }
      case "SUPER_CHAT_MESSAGE": {
        return <SuperChatMessage superChatMessage={msg as TSuperChatMessage} />;
      }
      case "ROOM_BLOCK_MSG": {
        return <RoomBlockMsg msg={msg} />;
      }
      case "PREPARING":
      case "LIVE": {
        return <RoomStatusChange changeMsg={msg as TPreparing | TLive} />;
      }
      case "GUARD_BUY": {
        return <GuardBuy guardBuy={msg as TGuardBuy} />;
      }
    }
    console.log("unknown: ");
    console.log(msg);
    return null;
  }
}
