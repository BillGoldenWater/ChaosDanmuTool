use proc_macro::TokenStream;

use quote::quote;
use syn::DeriveInput;

#[proc_macro_derive(StaticObject)]
pub fn derive_static_object(input: TokenStream) -> TokenStream {
  let input = syn::parse_macro_input!(input as DeriveInput);

  let name = &input.ident;
  let (ig, tg, wc) = input.generics.split_for_impl();

  let expanded = quote! {
    impl #ig static_object::StaticObject for #name #tg #wc {
      fn i() -> &'static mut Self {
        use std::sync::Once;

        static mut INSTANCE: *mut #name = 0 as *mut #name;
        static ONCE: Once = Once::new();

        unsafe {
          ONCE.call_once(|| {
            INSTANCE = Box::leak(Box::new(#name::new()));
          });

          &mut (*INSTANCE)
        }
      }
    }
  };

  TokenStream::from(expanded)
}
