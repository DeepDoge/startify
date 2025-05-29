import GLib from "@girs/GLib";

export function html(template: TemplateStringsArray, ...substitutions: unknown[]) {
	return String.raw(template, ...substitutions.map((item) => GLib.markup_escape_text(String(item), -1))).trim();
}
