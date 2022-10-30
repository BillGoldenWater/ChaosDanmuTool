use log::error;

pub fn print_trace() {
  print_trace_message("trace")
}

pub fn print_trace_message(msg: &str) {
  let bt = backtrace::Backtrace::new();
  let bt_str = format!("{bt:?}")
    .split("\n")
    .into_iter()
    .filter(|it| it.contains(env!("CARGO_PKG_NAME")))
    .collect::<Vec<&str>>()
    .join("\n");

  if std::env::var("BACKTRACE_DETAIL").is_ok() {
    error!("{msg}: \n{bt:?}");
  } else {
    error!("{msg}: \n{bt_str}");
  }
}
