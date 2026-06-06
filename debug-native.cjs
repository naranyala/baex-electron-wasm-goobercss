const path = require('path');
const native = require('./native/sqlite-native/index.node');
console.log('Native module keys:', Object.keys(native));
console.log('Native module content:', native);
