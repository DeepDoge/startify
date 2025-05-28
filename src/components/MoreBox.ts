import Gtk from "@girs/Gtk";
import { SPACING } from "../common/constants.ts";

export function MoreBox() {
	const self = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING);
	self.set_margin_start(SPACING);
	self.set_margin_end(SPACING);
	self.set_margin_top(SPACING);
	self.set_margin_bottom(SPACING);

	const image = Gtk.Image.new();
	image.set_from_icon_name("view-more-symbolic");
	image.set_hexpand(true);
	image.set_vexpand(true);
	image.set_halign(Gtk.Align.CENTER);
	image.set_valign(Gtk.Align.CENTER);
	self.append(image);

	return self;
}
