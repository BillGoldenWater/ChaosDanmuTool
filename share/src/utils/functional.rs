use std::fmt::{Debug, Display};

pub trait Functional {
    fn then<R>(self, f: impl FnOnce(Self) -> R) -> R
    where
        Self: Sized,
    {
        f(self)
    }

    fn some(self) -> Option<Self>
    where
        Self: Sized,
    {
        Some(self)
    }

    fn unit_result<E>(self) -> Result<(), E>
    where
        Self: ResultExt<E> + Sized,
    {
        self.map_unit()
    }

    fn println(&self)
    where
        Self: Display,
    {
        println!("{self}");
    }

    fn println_dbg(&self)
    where
        Self: Debug,
    {
        println!("{self:#?}");
    }

    fn println_ret(self) -> Self
    where
        Self: Sized + Display,
    {
        println!("{self}");
        self
    }

    fn println_ret_dbg(self) -> Self
    where
        Self: Sized + Debug,
    {
        println!("{self:#?}");
        self
    }
}

impl<T> Functional for T {}

pub trait ResultExt<E> {
    fn map_unit(self) -> Result<(), E>;
}

impl<T, E> ResultExt<E> for Result<T, E> {
    fn map_unit(self) -> Result<(), E> {
        self.map(|_| ())
    }
}
