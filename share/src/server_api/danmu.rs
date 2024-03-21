pub mod end;
pub mod heartbeat;
pub mod start;

#[macro_export]
macro_rules! server_api_route_danmu {
    ($( $route:tt )*) => {
        $crate::server_api_route!(std::concat!("/danmu", $( $route )*))
    };
}
