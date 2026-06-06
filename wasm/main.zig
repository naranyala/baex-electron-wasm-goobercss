const std = @import("std");
const math = @import("math.zig");

var heap_ptr: usize = 0;
const HEAP_SIZE = 65536;
var heap: [HEAP_SIZE]u8 = undefined;

// --- Host Imports ---
// These functions are provided by JavaScript during instantiation
extern "env" fn host_log(ptr: [*]const u8, len: i32) void;
extern "env" fn host_set_document_title(ptr: [*]const u8, len: i32) void;

// --- Extended API Functions ---

export fn extended_greet(name_ptr: [*]u8, name_len: i32) void {
    // Create a greeting string in memory
    const greeting = "Hello from Zig Wasm, ";
    const g_len = greeting.len;
    
    // Allocate space for combined string
    const total_len = g_len + @as(usize, @intCast(name_len));
    const out_ptr = alloc(total_len);
    
    // Copy greeting and name
    @memcpy(out_ptr[0..g_len], greeting);
    @memcpy(out_ptr[g_len..total_len], name_ptr[0..@as(usize, @intCast(name_len))]);
    
    // Call host functions to interact with browser
    host_log(out_ptr, @intCast(total_len));
    host_set_document_title(out_ptr, @intCast(total_len));
    
    free(out_ptr, total_len);
}

// --- Exported Math Functions ---

export fn add(a: i32, b: i32) i32 { return math.add(a, b); }
export fn factorial(n: i32) i32 { return math.factorial(n); }
export fn gcd(a: i32, b: i32) i32 { return math.gcd(a, b); }
export fn isPrime(n: i32) i32 { return math.isPrime(n); }
export fn fibonacci(n: i32) i32 { return math.fibonacci(n); }

export fn alloc(len: usize) [*]u8 {
    if (heap_ptr + len > HEAP_SIZE) @panic("Out of memory");
    const ptr = &heap[heap_ptr];
    heap_ptr += len;
    return @ptrCast(ptr);
}

export fn free(_ptr: [*]u8, _len: usize) void {
    _ = _ptr; _ = _len;
}
