pub mod reload;
pub mod version;

#[macro_export]
macro_rules! server_api_route_status {
    ($( $route:tt )*) => {
        ::std::concat!("/status", $( $route )*)
    };
}
