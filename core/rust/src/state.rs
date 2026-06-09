use serde::{Serialize, Deserialize};
use wasm_bindgen::prelude::*;
use std::sync::{Mutex, OnceLock};

/// The global application state.
/// This is the "Single Source of Truth" (SSOT).
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppState {
    pub user_name: String,
    pub theme: String,
    pub project_name: String,
    pub is_loading: bool,
    pub notifications: Vec<String>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            user_name: "Guest".to_string(),
            theme: "dark".to_string(),
            project_name: "New Project".to_string(),
            is_loading: false,
            notifications: Vec::new(),
        }
    }
}

/// Commands that can be dispatched to mutate the state.
#[derive(Deserialize, Debug)]
#[serde(tag = "type", content = "payload")]
pub enum AppCommand {
    SetUserName { name: String },
    SetTheme { theme: String },
    SetProjectName { name: String },
    SetLoading { loading: bool },
    AddNotification { message: String },
    ResetState,
}

/// The StateStore manages the current state and processes commands.
pub struct StateStore {
    state: AppState,
}

impl StateStore {
    pub fn new() -> Self {
        Self {
            state: AppState::default(),
        }
    }

    pub fn dispatch(&mut self, command: AppCommand) -> AppState {
        match command {
            AppCommand::SetUserName { name } => {
                self.state.user_name = name;
            }
            AppCommand::SetTheme { theme } => {
                self.state.theme = theme;
            }
            AppCommand::SetProjectName { name } => {
                self.state.project_name = name;
            }
            AppCommand::SetLoading { loading } => {
                self.state.is_loading = loading;
            }
            AppCommand::AddNotification { message } => {
                self.state.notifications.push(message);
            }
            AppCommand::ResetState => {
                self.state = AppState::default();
            }
        }
        self.state.clone()
    }

    pub fn get_state(&self) -> AppState {
        self.state.clone()
    }
}

/// Global instance of the state store.
static STORE: OnceLock<Mutex<StateStore>> = OnceLock::new();

fn get_store() -> &'static Mutex<StateStore> {
    STORE.get_or_init(|| Mutex::new(StateStore::new()))
}

/// WASM export to dispatch commands and get the updated state.
#[wasm_bindgen]
pub fn dispatch_app_command(command_json: &str) -> Result<JsValue, JsValue> {
    let command: AppCommand = serde_json::from_str(command_json)
        .map_err(|e| JsValue::from_str(&format!("Command parse error: {}", e)))?;

    let mut store = get_store().lock().map_err(|_| JsValue::from_str("Mutex lock failed"))?;
    let updated_state = store.dispatch(command);

    serde_wasm_bindgen::to_value(&updated_state).map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// WASM export to get current state.
#[wasm_bindgen]
pub fn get_app_state() -> Result<JsValue, JsValue> {
    let store = get_store().lock().map_err(|_| JsValue::from_str("Mutex lock failed"))?;
    let state = store.get_state();
    serde_wasm_bindgen::to_value(&state).map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}
