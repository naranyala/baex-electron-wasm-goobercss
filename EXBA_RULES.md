# EXBA Intermediate Representation (IR) Rules & Anomalies

This document defines the architectural constraints and error-handling paradigms for the EXBA framework.

## 📜 RULES (Communication Contract)
1.  **JSON-Only:** All communication between TypeScript and Rust MUST be serialized as JSON strings.
2.  **Schema Enforcement:** Every `IRCommand` MUST have a `type` tag and a `payload` object.
3.  **Result Consistency:** Every `IRResult` MUST follow the same `type` + `payload` structure for consistent parsing in TypeScript.
4.  **Immutability:** Once an IR command is sent, it is considered atomic and idempotent from the Rust perspective unless stated otherwise.
5.  **Logging:** Every `IRCommand` and `IRResult` MUST be logged via `console` in the development build for tracing.

## ⚠️ ANOMALIES (Error Handling)
1.  **Serialization Failure:** If Rust cannot deserialize an `IRCommand`, it MUST return an `IRResult::Error` containing the deserialization message.
2.  **Runtime Exceptions:** Any unhandled panic in Rust MUST be caught and returned as `IRResult::Error`.
3.  **Command Mismatch:** If a command type is unknown, Rust MUST return `IRResult::Error`.
4.  **Logging Anomalies:** If an anomaly occurs, it MUST be logged at `console.error` level in both TypeScript and Rust layers.

## 🏗️ Future-Proofing
- The IR structure allows for adding new command variants without breaking existing TypeScript clients.
- Always prefer backward-compatible changes to `IRCommand` and `IRResult`.
