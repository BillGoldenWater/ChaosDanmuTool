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
    fn unit_result<E>(self) -> Result<(), E>
    where
        Self: ResultExt<E> + Sized,
    {
        self.map_unit()
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

pub trait ResultExt<E> {
    fn map_unit(self) -> Result<(), E>;
}

impl<T, E> ResultExt<E> for Result<T, E> {
    #[inline(always)]
    fn map_unit(self) -> Result<(), E> {
        self.map(|_| ())
    }
}
