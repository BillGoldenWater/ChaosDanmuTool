/*
 * Copyright 2021-2022 Golden_Water
 * SPDX-License-Identifier: AGPL-3.0-only
 */

#[macro_export]
macro_rules! dialog_notice {
  (@info $(,$msg:expr)? $(,@r$rawMsg:expr)? $(,@o$okTxt:expr)?) => {
    $crate::dialog_notice!(@info raw $(,format!("{__msg__}", __msg__ = $msg))? $(,@r $rawMsg)? $(,@o $okTxt)?)
  };
  (@success $(,$msg:expr)? $(,@r$rawMsg:expr)? $(,@o$okTxt:expr)?) => {
    $crate::dialog_notice!(@success raw $(,format!("{__msg__}", __msg__ = $msg))? $(,@r $rawMsg)? $(,@o $okTxt)?)
  };
  (@warn $(,$msg:expr)? $(,@r$rawMsg:expr)? $(,@o$okTxt:expr)?) => {
    $crate::dialog_notice!(@warn raw $(,format!("{__msg__}, 请检查日志或联系开发者", __msg__ = $msg))? $(,@r $rawMsg)? $(,@o $okTxt)?)
  };
  (@error $(,$msg:expr)? $(,@r$rawMsg:expr)? $(,@o$okTxt:expr)?) => {
    $crate::dialog_notice!(@error raw $(,format!("{__msg__}, 请检查日志或联系开发者", __msg__ = $msg))? $(,@r $rawMsg)? $(,@o $okTxt)?)
  };

  (@$type:ident raw $(,$msg:expr)? $(,@r$rawMsg:expr)? $(,@o$okTxt:expr)?) => {{
    #[allow(unused_assignments)]
    #[allow(unused_mut)]
    let mut msg: String = "".to_string();
    $(
      msg = format!(
          "{__msg__}\n{__location_info__}",
          __msg__ = $msg,
          __location_info__ = $crate::location_info!()
        );
    )?
    $(msg = $rawMsg;)?

    #[allow(unused_assignments)]
    #[allow(unused_mut)]
    let mut ok_txt: String = "确定".to_string();
    $(ok_txt = $okTxt;)?

    $crate::dialog_notice!(@$type msg.as_str(), ok_txt)
  }};

  (@info $msg:expr, $okTxt:expr) => {
    $crate::dialog_notice!("信息", Info, $msg, $okTxt)
  };

  (@success $msg:expr, $okTxt:expr) => {
    $crate::dialog_notice!("成功", Info, $msg, $okTxt)
  };

  (@warn $msg:expr, $okTxt:expr) => {
    $crate::dialog_notice!("警告", Warning, $msg, $okTxt)
  };

  (@error $msg:expr, $okTxt:expr) => {
    $crate::dialog_notice!("错误", Error, $msg, $okTxt)
  };

  ($title:literal, $level:ident, $msg:expr, $okTxt:expr) => {{
    rfd::MessageDialog::new()
      .set_title($title)
      .set_level(rfd::MessageLevel::$level)
      .set_buttons(rfd::MessageButtons::OkCustom($okTxt))
      .set_description($msg)
      .show();
  }};
}

#[macro_export]
macro_rules! dialog_ask {
  (@$type:ident$(,$msg:expr)?$(,@r$rawMsg:expr)?$(,@o$okTxt:expr)?$(,@c$cancelTxt:expr)?) => {{
    #[allow(unused_assignments)]
    #[allow(unused_mut)]
    let mut msg: String = "".to_string();
    $(
      msg = format!(
          "{__msg__}\n{__location_info__}",
          __msg__ = $msg,
          __location_info__ = $crate::location_info!()
        );
    )?
    $(msg = $rawMsg;)?

    #[allow(unused_assignments)]
    #[allow(unused_mut)]
    let mut ok_txt: String = "确定".to_string();
    $(ok_txt = $okTxt;)?

    #[allow(unused_assignments)]
    #[allow(unused_mut)]
    let mut cancel_txt: String = "取消".to_string();
    $(cancel_txt = $cancelTxt;)?

    $crate::dialog_ask!(@$type msg.as_str(), ok_txt, cancel_txt)
  }};

  (@info $msg:expr, $okTxt:expr, $cancelTxt:expr) => {
    $crate::dialog_ask!("信息", Info, $msg, $okTxt, $cancelTxt)
  };

  (@warn $msg:expr, $okTxt:expr, $cancelTxt:expr) => {
    $crate::dialog_ask!("警告", Warning, $msg, $okTxt, $cancelTxt)
  };

  (@error $msg:expr, $okTxt:expr, $cancelTxt:expr) => {
    $crate::dialog_ask!("错误", Error, $msg, $okTxt, $cancelTxt)
  };

  ($title:literal, $level:ident, $msg:expr, $okTxt:expr, $cancelTxt:expr) => {
    rfd::MessageDialog::new()
      .set_title($title)
      .set_level(rfd::MessageLevel::$level)
      .set_buttons(rfd::MessageButtons::OkCancelCustom($okTxt, $cancelTxt))
      .set_description($msg)
      .show()
  };
}
