import GLib from "@girs/GLib";

export function html(template: TemplateStringsArray, ...substitutions: string[]) {
	return String.raw(template, ...substitutions.map((item) => GLib.markup_escape_text(item, -1))).trim();
}
