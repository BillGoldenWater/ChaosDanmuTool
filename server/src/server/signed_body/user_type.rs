use share::define_data_type;

define_data_type!(
    enum UserType {
        Guest,
        Registered,
        Admin,
    }
);

impl UserType {
    pub fn is_guest(&self) -> bool {
        matches!(self, UserType::Guest)
    }

    pub fn is_registered(&self) -> bool {
        matches!(self, UserType::Registered)
    }

    pub fn is_admin(&self) -> bool {
        matches!(self, UserType::Admin)
    }
}
