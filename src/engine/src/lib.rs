use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use tracing::{info, error, instrument};
use tracing_wasm::{WASMLayerConfigBuilder, WASMLayer};
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::Registry;
use std::sync::{Mutex, OnceLock};

mod utils;
mod state;

/// Represents a detailed system performance and hardware report.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct SystemInfoReport {
    /// The operating system name.
    pub os: String,
    /// The browser or runtime environment.
    pub browser: String,
    /// Number of logical CPU cores.
    pub cpu_cores: i32,
    /// Total system memory in Gigabytes.
    pub ram_gb: f64,
    /// Current screen resolution (e.g., "1920x1080").
    pub screen_res: String,
    /// Graphics processor information.
    pub gpu: String,
    /// System uptime in milliseconds.
    pub uptime_ms: f64,
    /// Primary system language.
    pub language: String,
    /// Formatted ASCII report for display.
    pub report: String,
}

/// A task item for the Kanban board demonstration.
#[derive(Serialize, Deserialize, Debug, Clone, PartialEq)]
pub struct KanbanTask {
    /// Unique identifier for the task.
    pub id: String,
    /// Short title or summary of the task.
    pub title: String,
    /// Current column/status (e.g., "todo", "in-progress", "done").
    pub col: String,
    /// Categorical tags for the task.
    pub tags: Vec<String>,
    /// Importance level (High, Medium, Low).
    pub priority: String,
}

static KANBAN_TASKS: OnceLock<Mutex<Vec<KanbanTask>>> = OnceLock::new();

/// Internal helper to retrieve and initialize the global Kanban task store.
fn get_kanban_tasks() -> &'static Mutex<Vec<KanbanTask>> {
    KANBAN_TASKS.get_or_init(|| {
        Mutex::new(vec![
            KanbanTask {
                id: "1".to_string(),
                title: "WASM Memory Allocation".to_string(),
                col: "todo".to_string(),
                tags: vec!["wasm".to_string(), "perf".to_string()],
                priority: "High".to_string(),
            },
            KanbanTask {
                id: "2".to_string(),
                title: "Hot Reload Pipeline".to_string(),
                col: "in-progress".to_string(),
                tags: vec!["dev".to_string(), "vite".to_string()],
                priority: "Medium".to_string(),
            },
            KanbanTask {
                id: "3".to_string(),
                title: "Base Component Signal Store".to_string(),
                col: "done".to_string(),
                tags: vec!["core".to_string(), "signals".to_string()],
                priority: "Low".to_string(),
            },
        ])
    })
}

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
    SystemFetch { snapshot: Option<String> },
    /// Optimizes a UI template by extracting dynamic bindings.
    OptimizeUI { template: String },
    /// Fetches all Kanban tasks.
    KanbanFetch,
    /// Moves a Kanban task to the next column status.
    MoveTask { id: String },
}

/// Represents a pre-processed UI structure for high-performance rendering.
#[derive(Serialize)]
pub struct UIBlueprint {
    /// The base HTML string with placeholder slots.
    pub base_html: String,
    /// Indices of elements that require dynamic data binding.
    pub dynamic_slots: Vec<usize>,
    /// Event listeners to be wired up during hydration.
    pub events: Vec<UIEvent>,
}

/// Meta-instructions sent from Rust to the TS Framework Meta-Layer.
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct MetaCommand {
    pub action: String,
    pub plugin_target: Option<String>,
    pub payload: serde_json::Value,
}

/// Defines a UI event listener to be hydrated by the framework.
#[derive(Serialize)]
pub struct UIEvent {
    /// The DOM event type (e.g., "click", "input").
    pub event_type: String,
    /// The unique identifier for the event handler.
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
            let empty = "".to_string();
            let val = snapshot.as_ref().unwrap_or(&empty);
            let bytes = val.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::OptimizeUI { template } => {
            bytecode.push(OP_OPT);
            let bytes = template.as_bytes();
            bytecode.extend_from_slice(&(bytes.len() as u32).to_le_bytes());
            bytecode.extend_from_slice(bytes);
        }
        IRCommand::KanbanFetch => {
            bytecode.push(0xff);
        }
        IRCommand::MoveTask { id } => {
            bytecode.push(0xfe);
            let bytes = id.as_bytes();
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
            
            let mut info_report = SystemInfoReport {
                os: "Web Browser".to_string(),
                browser: "Vite Dev / WASM Native".to_string(),
                cpu_cores: 8,
                ram_gb: 16.0,
                screen_res: "1920x1080".to_string(),
                gpu: "WebGL Direct Mode".to_string(),
                uptime_ms: 12000.0,
                language: "en-US".to_string(),
                report: "".to_string(),
            };

            if let Ok(snap) = serde_json::from_str::<SystemSnapshot>(snapshot) {
                info_report.os = snap.os;
                info_report.browser = format!("Electron (Kernel: {})", snap.kernel);
                info_report.cpu_cores = 8;
                info_report.ram_gb = (snap.total_mem as f64) / 1024.0 / 1024.0 / 1024.0;
                info_report.uptime_ms = (snap.uptime * 1000) as f64;
                info_report.gpu = format!("{} / Arch: {}", snap.cpu, snap.arch);
            }

            let used_mem = (info_report.ram_gb * 0.4) as i32;
            let total_mem = info_report.ram_gb as i32;
            let uptime_s = (info_report.uptime_ms / 1000.0) as u64;
            let uptime_h = uptime_s / 3600;
            let uptime_m = (uptime_s % 3600) / 60;

            info_report.report = format!(
"          _---_
         /     \\
        | () () |     OS: EXBA Browser OS ({})
         \\  ^  /      Runtime: {}
          |||||       CPU Model: {}
          |||||       Memory: {}GB / {}GB
                      Uptime: {}h {}m",
                info_report.os, info_report.browser, info_report.gpu, used_mem, total_mem, uptime_h, uptime_m
            );

            IRResult::SystemInfo(info_report)
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
    SystemInfo(SystemInfoReport),
    /// Kanban task data return.
    KanbanData(Vec<KanbanTask>),
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
            let mut info_report = SystemInfoReport {
                os: "Web Browser".to_string(),
                browser: "Vite Dev / WASM Native".to_string(),
                cpu_cores: 8,
                ram_gb: 16.0,
                screen_res: "1920x1080".to_string(),
                gpu: "WebGL Direct Mode".to_string(),
                uptime_ms: 12000.0,
                language: "en-US".to_string(),
                report: "".to_string(),
            };

            if let Some(snap_str) = snapshot {
                if let Ok(snap) = serde_json::from_str::<SystemSnapshot>(&snap_str) {
                    info_report.os = snap.os;
                    info_report.browser = format!("Electron (Kernel: {})", snap.kernel);
                    info_report.cpu_cores = 8;
                    info_report.ram_gb = (snap.total_mem as f64) / 1024.0 / 1024.0 / 1024.0;
                    info_report.uptime_ms = (snap.uptime * 1000) as f64;
                    info_report.gpu = format!("{} / Arch: {}", snap.cpu, snap.arch);
                }
            }

            let used_mem = (info_report.ram_gb * 0.4) as i32;
            let total_mem = info_report.ram_gb as i32;
            let uptime_s = (info_report.uptime_ms / 1000.0) as u64;
            let uptime_h = uptime_s / 3600;
            let uptime_m = (uptime_s % 3600) / 60;

            info_report.report = format!(
"          _---_
         /     \\
        | () () |     OS: EXBA Browser OS ({})
         \\  ^  /      Runtime: {}
          |||||       CPU Model: {}
          |||||       Memory: {}GB / {}GB
                      Uptime: {}h {}m",
                info_report.os, info_report.browser, info_report.gpu, used_mem, total_mem, uptime_h, uptime_m
            );

            IRResult::SystemInfo(info_report)
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
        },
        IRCommand::KanbanFetch => {
            info!("Kanban Fetch requested");
            let tasks = get_kanban_tasks().lock().unwrap().clone();
            IRResult::KanbanData(tasks)
        },
        IRCommand::MoveTask { id } => {
            info!("Move Task requested: {}", id);
            let mut tasks_guard = get_kanban_tasks().lock().unwrap();
            if let Some(task) = tasks_guard.iter_mut().find(|t| t.id == id) {
                task.col = match task.col.as_str() {
                    "todo" => "in-progress".to_string(),
                    "in-progress" => "done".to_string(),
                    "done" => "todo".to_string(),
                    _ => "todo".to_string(),
                };
            }
            IRResult::KanbanData(tasks_guard.clone())
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

/// Represents a bundle of IR commands and layout instructions.
#[derive(Serialize)]
pub struct IRBundle {
    /// The version of the IR protocol.
    pub version: String,
    /// High-level semantic commands.
    pub hlir: Vec<serde_json::Value>,
    /// Low-level DOM manipulation instructions.
    pub llir: Vec<serde_json::Value>,
    /// Meta-commands for the TS framework meta-layer.
    pub meta: Vec<MetaCommand>,
}

/// Processes a specific action identified by an ID and returns an IR bundle.
#[wasm_bindgen]
pub fn process_action(id: &str) -> Result<JsValue, JsValue> {
    let bundle = IRBundle {
        version: "1.0.0".to_string(),
        hlir: vec![serde_json::json!({
            "type": "Notify",
            "payload": {
                "level": "info",
                "msg": format!("Action '{}' processed by Rust WASM Core!", id)
            }
        })],
        llir: vec![],
        meta: vec![MetaCommand {
            action: "log_action".to_string(),
            plugin_target: None,
            payload: serde_json::json!({ "id": id, "timestamp": 123456789 }),
        }],
    };
    serde_wasm_bindgen::to_value(&bundle)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
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
