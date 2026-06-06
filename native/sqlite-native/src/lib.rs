use napi_derive::napi;
use rusqlite::{Connection, Result as SqliteResult};
use serde_json::{json, Value};

#[napi]
pub fn execute_sql(db_path: String, sql: String) -> Result<String, napi::Error> {
    let conn = Connection::open(db_path)
        .map_err(|e| napi::Error::from_reason(format!("Failed to open DB: {}", e)))?;
    
    conn.execute(&sql, [])
        .map_err(|e| napi::Error::from_reason(format!("SQL Execution Error: {}", e)))?;
    
    Ok("Success".to_string())
}

#[napi]
pub fn query_sql(db_path: String, sql: String) -> Result<String, napi::Error> {
    let conn = Connection::open(db_path)
        .map_err(|e| napi::Error::from_reason(format!("Failed to open DB: {}", e)))?;
    
    let mut stmt = conn.prepare(&sql)
        .map_err(|e| napi::Error::from_reason(format!("Prepare Error: {}", e)))?;
    
    let column_names: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
    
    let rows = stmt.query_map([], |row| {
        let mut map = serde_json::Map::new();
        for (i, col_name) in column_names.iter().enumerate() {
            let value: Value = match row.get_ref(i)? {
                rusqlite::types::ValueRef::Null => Value::Null,
                rusqlite::types::ValueRef::Integer(i) => json!(i),
                rusqlite::types::ValueRef::Real(f) => json!(f),
                rusqlite::types::ValueRef::Text(t) => {
                    let s = std::str::from_utf8(t).unwrap_or("Invalid UTF-8");
                    json!(s)
                },
                rusqlite::types::ValueRef::Blob(b) => {
                    json!(format!("{:?}", b))
                },
            };
            map.insert(col_name.clone(), value);
        }
        Ok(Value::Object(map))
    }).map_err(|e| napi::Error::from_reason(format!("Query Error: {}", e)))?;

    let mut results = Vec::new();
    for row in rows {
        results.push(row.map_err(|e| napi::Error::from_reason(format!("Row Error: {}", e)))?);
    }

    Ok(serde_json::to_string(&results).map_err(|e| napi::Error::from_reason(e.to_string()))?)
}
