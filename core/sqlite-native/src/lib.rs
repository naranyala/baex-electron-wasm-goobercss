use napi_derive::napi;
use rusqlite::{Connection, Statement};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};
use napi::Error;

#[derive(Serialize, Deserialize)]
struct QueryResult {
    columns: Vec<String>,
    rows: Vec<Vec<serde_json::Value>>,
}

static DB_CONN: Mutex<Option<Arc<Mutex<Connection>>>> = Mutex::new(None);

#[napi]
pub fn open_db(path: String) -> Result<String, Error> {
    let conn = Connection::open(path).map_err(|e| Error::from_reason(e.to_string()))?;
    let mut global_conn = DB_CONN.lock().unwrap();
    *global_conn = Some(Arc::new(Mutex::new(conn)));
    Ok("Database opened successfully".to_string())
}

#[napi]
pub fn execute_sql(sql: String) -> Result<i32, Error> {
    let global_conn_lock = DB_CONN.lock().unwrap();
    let conn_arc = global_conn_lock.as_ref().ok_or_else(|| Error::from_reason("Database not opened"))?;
    let conn = conn_arc.lock().unwrap();
    
    conn.execute(&sql, []).map(|count| count as i32).map_err(|e| Error::from_reason(e.to_string()))
}

#[napi]
pub fn query_sql(sql: String) -> Result<String, Error> {
    let global_conn_lock = DB_CONN.lock().unwrap();
    let conn_arc = global_conn_lock.as_ref().ok_or_else(|| Error::from_reason("Database not opened"))?;
    let conn = conn_arc.lock().unwrap();
    
    let mut stmt = conn.prepare(&sql).map_err(|e| Error::from_reason(e.to_string()))?;
    let col_count = stmt.column_count();
    let column_names: Vec<String> = stmt.column_names().into_iter().map(|s| s.to_string()).collect();
    
    let rows_iter = stmt.query_map([], |row| {
        let mut row_values = Vec::new();
        for i in 0..col_count {
            let val: serde_json::Value = row.get_ref(i).map(|val| {
                serde_json::Value::String(format!("{:?}", val))
            }).unwrap_or(serde_json::Value::Null);
            row_values.push(val);
        }
        Ok(row_values)
    }).map_err(|e| Error::from_reason(e.to_string()))?;
    
    let mut rows = Vec::new();
    for row in rows_iter {
        rows.push(row.map_err(|e| Error::from_reason(e.to_string()))?);
    }
    
    let result = QueryResult { 
        columns: column_names, 
        rows 
    };
    serde_json::to_string(&result).map_err(|e| Error::from_reason(e.to_string()))
}
