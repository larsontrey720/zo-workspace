import type { Context } from "hono";
export default (c: Context) => c.json({ ok: true });
