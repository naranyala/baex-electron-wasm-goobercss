import { z } from 'zod';

// ─── XSS Protection ───────────────────────────────────────────
const ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

// ─── HLIR Schema ──────────────────────────────────────────────
export const HLIRSchema = z.union([
  z.object({
    type: z.literal('UpdateState'),
    payload: z.object({ patch: z.string() }),
  }),
  z.object({
    type: z.literal('Navigate'),
    payload: z.object({ path: z.string() }),
  }),
  z.object({
    type: z.literal('Notify'),
    payload: z.object({ level: z.string(), msg: z.string() }),
  }),
  z.object({
    type: z.literal('InvokeJS'),
    payload: z.object({ func: z.string(), args: z.any() }),
  }),
  z.object({
    type: z.literal('SyncData'),
    payload: z.object({ key: z.string() }),
  }),
  z.object({
    type: z.literal('UIUpdate'),
    target_screen: z.string(),
    state: z.string(),
  }),
]);

// ─── LLIR Schema ──────────────────────────────────────────────
export const LLIRSchema = z.union([
  z.object({ type: z.literal('UpdateText'), id: z.string(), text: z.string() }),
  z.object({
    type: z.literal('SetAttribute'),
    id: z.string(),
    attr: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal('RemoveAttribute'),
    id: z.string(),
    attr: z.string(),
  }),
  z.object({
    type: z.literal('AddClass'),
    id: z.string(),
    class: z.string(),
  }),
  z.object({
    type: z.literal('RemoveClass'),
    id: z.string(),
    class: z.string(),
  }),
  z.object({
    type: z.literal('ToggleClass'),
    id: z.string(),
    class: z.string(),
  }),
  z.object({
    type: z.literal('SetStyle'),
    id: z.string(),
    prop: z.string(),
    value: z.string(),
  }),
  z.object({
    type: z.literal('TriggerEvent'),
    id: z.string(),
    event: z.string(),
  }),
  z.object({ type: z.literal('Log'), message: z.string() }),
  z.object({
    type: z.literal('Anomaly'),
    code: z.string(),
    details: z.string(),
  }),
]);

// ─── IR Bundle Schema ─────────────────────────────────────────
export const IRBundleSchema = z.object({
  version: z.string(),
  hlir: z.array(HLIRSchema).nullable(),
  llir: z.array(LLIRSchema),
});

export type HLIR = z.infer<typeof HLIRSchema>;
export type LLIR = z.infer<typeof LLIRSchema>;
export type IRBundle = z.infer<typeof IRBundleSchema>;
