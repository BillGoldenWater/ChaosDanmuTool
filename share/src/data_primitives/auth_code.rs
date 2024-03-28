crate::define_data_primitive!(AuthCode(Box<str>));

impl AuthCode {
    pub fn new(code: Box<str>) -> Self {
        Self(code)
    }
}
