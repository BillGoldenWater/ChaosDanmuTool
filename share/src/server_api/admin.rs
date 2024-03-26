pub mod key_register;

#[macro_export]
macro_rules! server_api_route_admin {
    ($( $route:tt )*) => {
        ::std::concat!("/admin", $( $route )*)
    };
}
