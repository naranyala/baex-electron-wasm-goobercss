const std = @import("std");

// We use 'export' and 'callconv(.C)' to make functions compatible with C FFI
export fn engine_add(a: i32, b: i32) i32 {
    return a + b;
}

export fn engine_multiply(a: i32, b: i32) i32 {
    return a * b;
}

export fn engine_get_version() [*]const u8 {
    return "Zig Engine v1.0.0";
}
