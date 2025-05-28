import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import { SPACING } from "../common/constants.ts";

export type Page = {
	host: Gtk.ScrolledWindow;
	content: Gtk.Box;
	container: Gtk.Box;
};

export function Page(): Page {
	const host = Gtk.ScrolledWindow.new();
	host.set_vexpand(true);
	host.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC);
	const viewport = Gtk.Viewport.new();
	host.set_child(viewport);
	const clamp = Adw.Clamp.new();
	viewport.set_child(clamp);
	const content = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
	clamp.set_child(content);
	const container = Gtk.Box.new(Gtk.Orientation.VERTICAL, SPACING);
	content.append(container);
	container.set_margin_start(SPACING);
	container.set_margin_end(SPACING);
	container.set_margin_top(SPACING);
	container.set_margin_bottom(SPACING);

	return {
		host,
		content,
		container,
	};
}
