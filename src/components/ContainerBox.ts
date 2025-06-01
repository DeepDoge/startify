import Gtk from "@girs/Gtk";
import { SPACING } from "../common/constants.ts";

export function ContainerBox(...args: Parameters<typeof Gtk.Box.new>) {
	const container = Gtk.Box.new(...args);
	container.set_margin_start(SPACING);
	container.set_margin_end(SPACING);
	container.set_margin_top(SPACING);
	container.set_margin_bottom(SPACING);

	return container;
}
