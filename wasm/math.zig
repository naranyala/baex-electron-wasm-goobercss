const std = @import("std");

pub fn add(a: i32, b: i32) i32 { return a + b; }

pub fn factorial(n: i32) i32 {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

pub fn gcd(a: i32, b: i32) i32 {
    var x = @as(i32, @intCast(@abs(a)));
    var y = @as(i32, @intCast(@abs(b)));
    while (y != 0) {
        const temp = y;
        y = @rem(x, y);
        x = temp;
    }
    return x;
}

pub fn isPrime(n: i32) i32 {
    if (n <= 1) return 0;
    if (n <= 3) return 1;
    if (@rem(n, 2) == 0 or @rem(n, 3) == 0) return 0;
    var i: i32 = 5;
    while (i * i <= n) {
        if (@rem(n, i) == 0 or @rem(n, i + 2) == 0) return 0;
        i += 6;
    }
    return 1;
}

pub fn fibonacci(n: i32) i32 {
    if (n <= 1) return n;
    var a: i32 = 0;
    var b: i32 = 1;
    for (0..@as(usize, @intCast(n))) |_| {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return a;
}

test "math functions" {
    try std.testing.expectEqual(@as(i32, 5), add(2, 3));
    try std.testing.expectEqual(@as(i32, 120), factorial(5));
    try std.testing.expectEqual(@as(i32, 6), gcd(12, 18));
    try std.testing.expectEqual(@as(i32, 1), isPrime(7));
    try std.testing.expectEqual(@as(i32, 0), isPrime(10));
    try std.testing.expectEqual(@as(i32, 13), fibonacci(7));
}
