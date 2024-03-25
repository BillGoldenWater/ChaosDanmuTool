use std::fmt::{Debug, Display};

pub trait Functional {
    #[inline(always)]
    fn then<R>(self, f: impl FnOnce(Self) -> R) -> R
    where
        Self: Sized,
    {
        f(self)
    }

    #[inline(always)]
    fn then_ref<R>(self, f: impl FnOnce(&Self) -> R) -> R
    where
        Self: Sized,
    {
        f(&self)
    }

    #[inline(always)]
    fn then_mut<R>(mut self, f: impl FnOnce(&mut Self) -> R) -> R
    where
        Self: Sized,
    {
        f(&mut self)
    }

    #[inline(always)]
    fn then_as_ref<T, R>(self, f: impl FnOnce(&T) -> R) -> R
    where
        Self: Sized + AsRef<T>,
        T: ?Sized,
    {
        f(self.as_ref())
    }

    #[inline(always)]
    fn then_as_mut<T, R>(mut self, f: impl FnOnce(&mut T) -> R) -> R
    where
        Self: Sized + AsMut<T>,
        T: ?Sized,
    {
        f(self.as_mut())
    }

    #[inline(always)]
    fn some(self) -> Option<Self>
    where
        Self: Sized,
    {
        Some(self)
    }

    #[inline(always)]
    fn into_ok<E>(self) -> Result<Self, E>
    where
        Self: Sized,
    {
        Ok(self)
    }

    #[inline(always)]
    fn into_err<T>(self) -> Result<T, Self>
    where
        Self: Sized,
    {
        Err(self)
    }

    #[inline(always)]
    fn unit_result<T, E>(self) -> Result<(), E>
    where
        Self: ResultExt<T, E> + Sized,
    {
        self.map_unit()
    }

    #[inline(always)]
    fn err_into<T, E, R>(self) -> Result<T, R>
    where
        Self: ResultExt<T, E> + Sized,
        E: Into<R>,
    {
        self.map_err_into()
    }

    #[inline(always)]
    fn println(&self)
    where
        Self: Display,
    {
        println!("{self}");
    }

    #[inline(always)]
    fn println_dbg(&self)
    where
        Self: Debug,
    {
        println!("{self:#?}");
    }

    #[inline(always)]
    fn println_ret(self) -> Self
    where
        Self: Sized + Display,
    {
        println!("{self}");
        self
    }

    #[inline(always)]
    fn println_ret_dbg(self) -> Self
    where
        Self: Sized + Debug,
    {
        println!("{self:#?}");
        self
    }
}

impl<T> Functional for T {}

pub trait ResultExt<T, E> {
    fn map_unit(self) -> Result<(), E>;

    fn map_err_into<R>(self) -> Result<T, R>
    where
        E: Into<R>;
}

impl<T, E> ResultExt<T, E> for Result<T, E> {
    #[inline(always)]
    fn map_unit(self) -> Result<(), E> {
        self.map(|_| ())
    }

    #[inline(always)]
    fn map_err_into<R>(self) -> Result<T, R>
    where
        E: Into<R>,
    {
        self.map_err(Into::into)
    }
}
