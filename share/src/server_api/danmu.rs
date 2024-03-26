pub mod end;
pub mod heartbeat;
pub mod start;

#[macro_export]
macro_rules! server_api_route_danmu {
    ($( $route:tt )*) => {
        ::std::concat!("/danmu", $( $route )*)
    };
}
