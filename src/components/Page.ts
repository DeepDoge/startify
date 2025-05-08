import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import { SPACING } from "../common/constants.ts";

export type Page = {
	scroller: Gtk.ScrolledWindow;
	content: Gtk.Box;
};

export function Page(): Page {
	const scroller = Gtk.ScrolledWindow.new();
	scroller.set_policy(Gtk.PolicyType.AUTOMATIC, Gtk.PolicyType.AUTOMATIC);
	const viewport = Gtk.Viewport.new();
	scroller.set_child(viewport);
	const clamp = Adw.Clamp.new();
	viewport.set_child(clamp);
	const content = Gtk.Box.new(Gtk.Orientation.VERTICAL, SPACING);
	clamp.set_child(content);
	content.set_margin_start(SPACING);
	content.set_margin_end(SPACING);
	content.set_margin_top(SPACING);
	content.set_margin_bottom(SPACING);

	return {
		scroller,
		content,
	};
}
