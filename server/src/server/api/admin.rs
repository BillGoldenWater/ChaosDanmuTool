pub mod key_gen;

#[macro_export]
macro_rules! server_api_route_admin {
    ($( $route:tt )*) => {
        $crate::server_api_route!(std::concat!("/admin", $( $route )*))
    };
}
