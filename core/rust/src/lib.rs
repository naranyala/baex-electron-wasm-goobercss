use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use tracing::{info, error, instrument};
use tracing_wasm::{WASMLayerConfigBuilder, WASMLayer};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::Registry;

mod utils;
mod state;

/// Intermediate Representation (IR) Command used for communication between TS and Rust.
/// Encapsulated as a tagged union to support various operation types.
#[derive(Deserialize, Debug, PartialEq)]
#[serde(tag = "type", content = "payload")]
enum IRCommand {
    /// Adds two integers.
    Add { a: i32, b: i32 },
    /// Computes the nth Fibonacci number.
    Fibonacci { n: i32 },
    /// Computes the factorial of n.
    Factorial { n: i32 },
    /// Reverses the provided string.
    ReverseString { text: String },
    /// Checks if the provided string is a palindrome.
    PalindromeCheck { text: String },
    /// Sends a greeting to the user.
    Greet { name: String },
    /// Reports a system anomaly for logging purposes.
    ReportAnomaly { message: String },
    /// Queries the rules/schema of the current IR format.
    RulesQuery,
    /// Generates a system fetch report based on a raw snapshot.
    SystemFetch { snapshot: String },
    /// Optimizes a UI template by extracting dynamic bindings.
    OptimizeUI { template: String },
}

/// Represents a pre-processed UI structure for high-performance rendering.
#[derive(Serialize)]
pub struct UIBlueprint {
    pub base_html: String,
    pub dynamic_slots: Vec<usize>,
    pub events: Vec<UIEvent>,
}

#[derive(Serialize)]
pub struct UIEvent {
    pub event_type: String,
    pub handler_id: String,
}

/// Raw system data structure for processing.
#[derive(Deserialize)]
struct SystemSnapshot {
    os: String,
    kernel: String,
    arch: String,
    cpu: String,
    uptime: u64,
    total_mem: u64,
    free_mem: u64,
}

/// Raw system data structure for processing.
#[derive(Deserialize)]
struct SystemInfo {
    os: String,
    kernel: String,
    arch: String,
    cpu: String,
    uptime: u64,
    total_mem: u64,
    free_mem: u64,
}

// --- Compiler Implementation ---
// OpCodes for the EXBA Bytecode format
const OP_ADD: u8 = 0x01;
const OP_FIB: u8 = 0x02;
const OP_FACT: u8 = 0x03;
const OP_REV: u8 = 0x04;
const OP_PAL: u8 = 0x05;
const OP_GRT: u8 = 0x06;
const OP_ANO: u8 = 0x07;
const OP_RUL: u8 = 0x08;
const OP_SYS: u8 = 0x09;
const OP_OPT: u8 = 0x0a;

/// Compiles a JSON-encoded IR command into a binary bytecode format.
/// 
/// # Arguments
/// * `command_json` - A JSON string representing an `IRCommand`.
/// 
/// # Returns
/// * `Ok(Vec<u8>)` - The compiled bytecode sequence.
/// * `Err(JsValue)` - An error if the JSON is invalid.
#[wasm_bindgen]
pub fn compile_ir(command_json: &str) -> Result<Vec<u8>, JsValue> {
    let command: IRCommand = serde_json::from_str(command_json)
        .map_err(|e| JsValue::from_str(&format!("Parse error: {}", e)))?;

    let mut bytecode = Vec::new();
    match command {
        IRCommand::Add { a, b } => {
            bytecode.push(OP_ADD);
            bytecode.extend_from_slice(&a.to_le_bytes());
            bytecode.extend_from_slice(&b.to_le_bytes());
        }
        IRCommand::Fibonacci { n } => {
            bytecode.push(OP_FIB);
            bytecode.extend_from_slice(&n.to_le_bytes());
        }
        IRCommand::Factorial { n } => {
            bytecode.push(OP_FACT);
            bytecode.extend_from_slice(&n.to_le_bytes());
        }
        IRCommand::ReverseString { text } => {
            bytecode.push(OP_REV);
            let bytes = text.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::PalindromeCheck { text } => {
            bytecode.push(OP_PAL);
            let bytes = text.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::Greet { name } => {
            bytecode.push(OP_GRT);
            let bytes = name.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::ReportAnomaly { message } => {
            bytecode.push(OP_ANO);
            let bytes = message.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::RulesQuery => {
            bytecode.push(OP_RUL);
        }
        IRCommand::SystemFetch { snapshot } => {
            bytecode.push(OP_SYS);
            let bytes = snapshot.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::OptimizeUI { template } => {
            bytecode.push(OP_OPT);
            let bytes = template.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
    }
    Ok(bytecode)
}

/// Executes a pre-compiled bytecode sequence and returns the result.
/// 
/// # Arguments
/// * `bytecode` - A slice of bytes containing the opcode and payload.
/// 
/// # Returns
/// * `Ok(JsValue)` - The result of the operation encoded as a JS value.
/// * `Err(JsValue)` - An error if bytecode is empty or opcode is unknown.
#[wasm_bindgen]
pub fn execute_bytecode(bytecode: &[u8]) -> Result<JsValue, JsValue> {
    if bytecode.is_empty() {
        return Err(JsValue::from_str("Empty bytecode"));
    }

    let opcode = bytecode[0];
    let mut cursor = 1;

    let result = match opcode {
        OP_ADD => {
            let a = i32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap());
            let b = i32::from_le_bytes(bytecode[cursor+4..cursor+8].try_into().unwrap());
            IRResult::Number(a + b)
        }
        OP_FIB => {
            let n = i32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap());
            IRResult::Number(fibonacci_internal(n))
        }
        OP_FACT => {
            let n = i32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap());
            IRResult::Number(factorial_internal(n))
        }
        OP_REV => {
            let len = u32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap()) as usize;
            let text = std::str::from_utf8(&bytecode[cursor+4..cursor+4+len])
                .map_err(|e| JsValue::from_str(&format!("UTF8 error: {}", e)))?;
            IRResult::Rules { schema: text.chars().rev().collect() }
        }
        OP_PAL => {
            let len = u32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap()) as usize;
            let text = std::str::from_utf8(&bytecode[cursor+4..cursor+4+len])
                .map_err(|e| JsValue::from_str(&format!("UTF8 error: {}", e)))?;
            let reversed: String = text.chars().rev().collect();
            IRResult::Number(if text == reversed { 1 } else { 0 })
        }
        OP_GRT => {
            let len = u32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap()) as usize;
            let name = std::str::from_utf8(&bytecode[cursor+4..cursor+4+len])
                .map_err(|e| JsValue::from_str(&format!("UTF8 error: {}", e)))?;
            extended_greet_internal(name);
            IRResult::Void
        }
        OP_ANO => {
            let len = u32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap()) as usize;
            let message = std::str::from_utf8(&bytecode[cursor+4..cursor+4+len])
                .map_err(|e| JsValue::from_str(&format!("UTF8 error: {}", e)))?;
            error!("Anomaly Reported via Bytecode: {}", message);
            IRResult::Void
        }
        OP_RUL => {
            IRResult::Rules { 
                schema: "Binary-IR bytecode format, OpCode + Payload".to_string() 
            }
        }
        OP_SYS => {
            let len = u32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap()) as usize;
            let snapshot = std::str::from_utf8(&bytecode[cursor+4..cursor+4+len])
                .map_err(|e| JsValue::from_str(&format!("UTF8 error: {}", e)))?;
            
            match serde_json::from_str::<SystemSnapshot>(snapshot) {
                Ok(snap) => {
                    let used_mem = (snap.total_mem - snap.free_mem) / 1024 / 1024;
                    let total_mem = snap.total_mem / 1024 / 1024;
                    let uptime_h = snap.uptime / 3600;
                    let uptime_m = (snap.uptime % 3600) / 60;
                    let report = format!(
"          _---_
         /     \\
        | () () |     OS: EXBA Browser OS ({})
         \\  ^  /      Kernel: {}
          |||||       CPU: {}
          |||||       Memory: {}MB / {}MB
                      Uptime: {}h {}m
                      Arch: {}",
                        snap.os, snap.kernel, snap.cpu, used_mem, total_mem, uptime_h, uptime_m, snap.arch
                    );
                    IRResult::SystemInfo { report }
                },
                Err(e) => IRResult::Error { message: format!("Snapshot parse error: {}", e) }
            }
        }
        OP_OPT => {
            let len = u32::from_le_bytes(bytecode[cursor..cursor+4].try_into().unwrap()) as usize;
            let template = std::str::from_utf8(&bytecode[cursor+4..cursor+4+len])
                .map_err(|e| JsValue::from_str(&format!("UTF8 error: {}", e)))?;
            
            let mut dynamic_slots = Vec::new();
            let mut events = Vec::new();
            
            let mut scan_cursor = 0;
            while let Some(pos) = template[scan_cursor..].find("data-dyn-id=\"") {
                let start = scan_cursor + pos + 13;
                if let Some(end) = template[start..].find("\"") {
                    if let Ok(id) = template[start..start+end].parse::<usize>() {
                        dynamic_slots.push(id);
                    }
                    scan_cursor = start + end;
                } else { break; }
            }

            scan_cursor = 0;
            while let Some(pos) = template[scan_cursor..].find("data-exba-evt-") {
                let attr_start = scan_cursor + pos;
                if let Some(eq_pos) = template[attr_start..].find("=\"") {
                    let event_type = &template[attr_start+14..attr_start+eq_pos];
                    let val_start = attr_start + eq_pos + 2;
                    if let Some(val_end) = template[val_start..].find("\"") {
                        let handler_id = &template[val_start..val_start+val_end];
                        events.push(UIEvent {
                            event_type: event_type.to_string(),
                            handler_id: handler_id.to_string(),
                        });
                        scan_cursor = val_start + val_end;
                    } else { break; }
                } else { break; }
            }

            let result = UIBlueprint {
                base_html: template.to_string(),
                dynamic_slots,
                events,
            };
            
            match serde_json::to_string(&result) {
                Ok(json) => IRResult::Rules { schema: json },
                Err(e) => IRResult::Error { message: format!("Blueprint error: {}", e) }
            }
        }
        _ => return Err(JsValue::from_str("Unknown OpCode")),
    };

    Ok(serde_wasm_bindgen::to_value(&result)?)
}

/// The possible results of an IR operation.
#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(tag = "type", content = "payload")]
enum IRResult {
    /// A numerical result.
    Number(i32),
    /// No result returned.
    Void,
    /// An error result with a descriptive message.
    Error { message: String },
    /// A structural or schema result.
    Rules { schema: String },
    /// A system info report.
    SystemInfo { report: String },
}

/// Wasm entry point. Initializes the tracing subscriber for browser logging.
#[wasm_bindgen(start)]
pub fn start() {
    let config = WASMLayerConfigBuilder::new().build();
    tracing::subscriber::set_global_default(
        Registry::default().with(WASMLayer::new(config))
    ).unwrap();
}

/// Internal logic for processing IR commands. Used by both `process_ir` and `execute_bytecode`.
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
        IRCommand::SystemFetch { snapshot } => {
            info!("System Fetch requested");
            match serde_json::from_str::<SystemSnapshot>(&snapshot) {
                Ok(snap) => {
                    let used_mem = (snap.total_mem - snap.free_mem) / 1024 / 1024;
                    let total_mem = snap.total_mem / 1024 / 1024;
                    let uptime_h = snap.uptime / 3600;
                    let uptime_m = (snap.uptime % 3600) / 60;

                    let report = format!(
"          _---_
         /     \\
        | () () |     OS: EXBA Browser OS ({})
         \\  ^  /      Kernel: {}
          |||||       CPU: {}
          |||||       Memory: {}MB / {}MB
                      Uptime: {}h {}m
                      Arch: {}",
                        snap.os, snap.kernel, snap.cpu, used_mem, total_mem, uptime_h, uptime_m, snap.arch
                    );
                    IRResult::SystemInfo { report }
                },
                Err(e) => IRResult::Error { message: format!("Snapshot parse error: {}", e) }
            }
        },
        IRCommand::OptimizeUI { template } => {
            info!("UI Optimization requested");
            let mut dynamic_slots = Vec::new();
            let mut events = Vec::new();
            
            let mut scan_cursor = 0;
            while let Some(pos) = template[scan_cursor..].find("data-dyn-id=\"") {
                let start = scan_cursor + pos + 13;
                if let Some(end) = template[start..].find("\"") {
                    if let Ok(id) = template[start..start+end].parse::<usize>() {
                        dynamic_slots.push(id);
                    }
                    scan_cursor = start + end;
                } else { break; }
            }

            scan_cursor = 0;
            while let Some(pos) = template[scan_cursor..].find("data-exba-evt-") {
                let attr_start = scan_cursor + pos;
                if let Some(eq_pos) = template[attr_start..].find("=\"") {
                    let event_type = &template[attr_start+14..attr_start+eq_pos];
                    let val_start = attr_start + eq_pos + 2;
                    if let Some(val_end) = template[val_start..].find("\"") {
                        let handler_id = &template[val_start..val_start+val_end];
                        events.push(UIEvent {
                            event_type: event_type.to_string(),
                            handler_id: handler_id.to_string(),
                        });
                        scan_cursor = val_start + val_end;
                    } else { break; }
                } else { break; }
            }

            let result = UIBlueprint {
                base_html: template.clone(),
                dynamic_slots,
                events,
            };
            
            match serde_json::to_string(&result) {
                Ok(json) => IRResult::Rules { schema: json },
                Err(e) => IRResult::Error { message: format!("Blueprint error: {}", e) }
            }
        }
    }
}

/// Processes an IR command sent as a JSON string.
/// 
/// # Arguments
/// * `command_json` - A JSON string representing an `IRCommand`.
/// 
/// # Returns
/// * `Ok(JsValue)` - The result of the operation.
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

/// Simple addition helper exported to WASM.
#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

/// Internal iterative implementation of Fibonacci.
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

/// Internal implementation of Factorial.
fn factorial_internal(n: i32) -> i32 {
    if n <= 0 { return 1; }
    (1..=n).product()
}

/// Calculates the nth Fibonacci number.
#[wasm_bindgen]
pub fn fibonacci(n: i32) -> i32 {
    fibonacci_internal(n)
}

/// Updates the browser document title as a greeting.
fn extended_greet_internal(name: &str) {
    let greeting = format!("Hello from Rust Wasm, {}", name);
    
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
