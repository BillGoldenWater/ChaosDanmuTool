use crate::error;

pub fn print_trace() {
  let bt = backtrace::Backtrace::new();
  let bt_str = format!("{bt:?}")
    .split("\n")
    .into_iter()
    .filter(|it| it.contains(env!("CARGO_PKG_NAME")))
    .collect::<Vec<&str>>()
    .join("\n");

  if std::env::var("BACKTRACE_DETAIL").is_ok() {
    error!("trace: \n{bt:?}");
  } else {
    error!("trace: \n{bt_str}");
  }
}
