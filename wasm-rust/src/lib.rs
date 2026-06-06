use wasm_bindgen::prelude::*;
use web_sys::{window, console};

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn factorial(n: i32) -> i32 {
    if n <= 1 { return 1; }
    n * factorial(n - 1)
}

#[wasm_bindgen]
pub fn gcd(a: i32, b: i32) -> i32 {
    let mut x = a.abs();
    let mut y = b.abs();
    while y != 0 {
        let temp = y;
        y = x % y;
        x = temp;
    }
    x
}

#[wasm_bindgen]
pub fn isPrime(n: i32) -> i32 {
    if n <= 1 { return 0; }
    if n <= 3 { return 1; }
    if n % 2 == 0 || n % 3 == 0 { return 0; }
    let mut i = 5;
    while i * i <= n {
        if n % i == 0 || n % (i + 2) == 0 { return 0; }
        i += 6;
    }
    1
}

#[wasm_bindgen]
pub fn fibonacci(n: i32) -> i32 {
    if n <= 1 { return n; }
    let mut a = 0;
    let mut b = 1;
    for _ in 0..n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    a
}

#[wasm_bindgen]
pub fn extended_greet(name: &str) {
    let greeting = format!("Hello from Rust Wasm, {}", name);
    
    // Log to console
    console::log_1(&greeting.clone().into());
    
    // Set document title
    if let Some(window) = window() {
        if let Some(document) = window.document() {
            document.set_title(&greeting);
        }
    }
}
