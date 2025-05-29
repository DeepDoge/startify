import * as path from "jsr:@std/path@1.0.9";

export const HOME = Deno.env.get("HOME")!;
export const PATH = (Deno.env.get("PATH") ?? "").split(":").map((p) => path.resolve(p));
export const SPACING = 12;
