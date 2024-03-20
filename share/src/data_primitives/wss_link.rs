crate::define_data_primitive!(WssLink(Box<str>));

impl WssLink {
    pub fn into_inner(self) -> Box<str> {
        self.0
    }
}
