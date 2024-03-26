use crate::define_data_primitive;

define_data_primitive!(Version(Box<str>));

impl From<semver::Version> for Version {
    fn from(value: semver::Version) -> Self {
        Self(value.to_string().into())
    }
}

impl TryFrom<Version> for semver::Version {
    type Error = semver::Error;

    fn try_from(value: Version) -> Result<Self, Self::Error> {
        Self::parse(&value.0)
    }
}
