use share::define_data_primitive;

define_data_primitive!(AuthKeyNote(Box<str>));

impl AuthKeyNote {
    pub fn new(note: Box<str>) -> Self {
        Self(note)
    }
}
