const std = @import("std");

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});

    const optimize = b.standardOptimizeOption(.{});

    const exe = b.addExecutable(.{
        .name = "main",
        .root_source_file = b.path("wasm/main.zig"),
        .target = target,
        .optimize = optimize,
    });

    exe.rdynamic = true;
    exe.strip = true;

    b.installArtifact(exe);
}
