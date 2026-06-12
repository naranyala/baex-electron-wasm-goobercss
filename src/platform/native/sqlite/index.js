const path = require('path');

// Load the native binary
const binaryPath = process.env.NATIVE_BINARY_PATH || path.join(__dirname, 'index.node');
const native = require(binaryPath);

module.exports = {
  execute_sql: native.executeSql,
  query_sql: native.querySql,
};
