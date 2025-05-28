import Gtk from "@girs/Gtk";
import { SPACING } from "../common/constants.ts";
import Pango from "@girs/Pango";
import GLib from "@girs/GLib";

export function TitlesAndIconBox(params: { title: string; subtitle: string; icon: string | null }) {
	const self = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING);
	self.set_margin_start(SPACING);
	self.set_margin_end(SPACING);
	self.set_margin_top(SPACING);
	self.set_margin_bottom(SPACING);

	const image = Gtk.Image.new();
	self.append(image);
	if (params.icon?.startsWith("/")) {
		image.set_from_file(params.icon);
	} else {
		image.set_from_icon_name(params.icon);
	}
	image.set_icon_size(Gtk.IconSize.LARGE);

	const infoBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
	self.append(infoBox);

	const title = Gtk.Label.new();
	infoBox.append(title);
	title.set_halign(Gtk.Align.START);
	title.set_text(params.title);
	title.set_ellipsize(Pango.EllipsizeMode.END);
	title.set_single_line_mode(true);

	const subtitle = Gtk.Label.new();
	infoBox.append(subtitle);
	subtitle.set_halign(Gtk.Align.START);
	subtitle.set_opacity(.5);
	subtitle.set_ellipsize(Pango.EllipsizeMode.END);
	subtitle.set_single_line_mode(false);
	subtitle.set_markup(`<small>${GLib.markup_escape_text(params.subtitle, -1)}</small>`);

	return self;
}
