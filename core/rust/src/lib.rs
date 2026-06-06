use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use tracing::{info, error, instrument};
use tracing_wasm::{WASMLayerConfigBuilder, WASMLayer};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::Registry;

#[derive(Deserialize, Debug, PartialEq)]
#[serde(tag = "type", content = "payload")]
enum IRCommand {
    Add { a: i32, b: i32 },
    Fibonacci { n: i32 },
    Factorial { n: i32 },
    ReverseString { text: String },
    PalindromeCheck { text: String },
    Greet { name: String },
    ReportAnomaly { message: String },
    RulesQuery,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(tag = "type", content = "payload")]
enum IRResult {
    Number(i32),
    Void,
    Error { message: String },
    Rules { schema: String },
}

#[wasm_bindgen(start)]
pub fn start() {
    let config = WASMLayerConfigBuilder::new().build();
    tracing::subscriber::set_global_default(
        Registry::default().with(WASMLayer::new(config))
    ).unwrap();
}

#[instrument]
fn process_ir_logic(command: IRCommand) -> IRResult {
    match command {
        IRCommand::Add { a, b } => {
            info!("Adding {} and {}", a, b);
            IRResult::Number(a + b)
        },
        IRCommand::Fibonacci { n } => {
            info!("Calculating Fibonacci({})", n);
            IRResult::Number(fibonacci_internal(n))
        },
        IRCommand::Factorial { n } => {
            info!("Calculating Factorial({})", n);
            IRResult::Number(factorial_internal(n))
        },
        IRCommand::ReverseString { text } => {
            info!("Reversing string: {}", text);
            IRResult::Rules { schema: text.chars().rev().collect() }
        },
        IRCommand::PalindromeCheck { text } => {
            info!("Checking palindrome: {}", text);
            let reversed: String = text.chars().rev().collect();
            IRResult::Number(if text == reversed { 1 } else { 0 })
        },
        IRCommand::Greet { name } => {
            info!("Greeting {}", name);
            #[cfg(target_arch = "wasm32")]
            extended_greet_internal(&name);
            IRResult::Void
        }
        IRCommand::ReportAnomaly { message } => {
            error!("Anomaly Reported: {}", message);
            IRResult::Void
        }
        IRCommand::RulesQuery => {
            info!("Rules requested");
            IRResult::Rules { 
                schema: "JSON-based IR, tag-content payload".to_string() 
            }
        },
    }
}

#[wasm_bindgen]
pub fn process_ir(command_json: &str) -> Result<JsValue, JsValue> {
    info!("IR Command received: {}", command_json);

    let command: IRCommand = match serde_json::from_str(command_json) {
        Ok(cmd) => cmd,
        Err(e) => {
            let err_msg = format!("Invalid JSON: {}", e);
            error!("{}", err_msg);
            return Ok(serde_wasm_bindgen::to_value(&IRResult::Error { message: err_msg })?);
        }
    };

    let result = process_ir_logic(command);

    info!("IR Result produced: {:?}", result);

    Ok(serde_wasm_bindgen::to_value(&result)?)
}

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn fibonacci_internal(n: i32) -> i32 {
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

fn factorial_internal(n: i32) -> i32 {
    (1..=n).product()
}

#[wasm_bindgen]
pub fn fibonacci(n: i32) -> i32 {
    fibonacci_internal(n)
}

fn extended_greet_internal(name: &str) {
    let greeting = format!("Hello from Rust Wasm, {}", name);
    
    // Logging here is handled by tracing-wasm now, so we can remove console::log_1 if we want, 
    // but keeping it doesn't hurt.
    
    #[cfg(target_arch = "wasm32")]
    {
        use web_sys::window;
        if let Some(window) = window() {
            if let Some(document) = window.document() {
                document.set_title(&greeting);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_process_ir_add() {
        let command = IRCommand::Add { a: 10, b: 20 };
        let result = process_ir_logic(command);
        assert_eq!(result, IRResult::Number(30));
    }

    #[test]
    fn test_process_ir_anomaly() {
        let command = IRCommand::ReportAnomaly { message: "test anomaly".to_string() };
        let result = process_ir_logic(command);
        assert_eq!(result, IRResult::Void);
    }
}
