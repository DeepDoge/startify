import Gtk from "@girs/Gtk";

export function removeChildren(box: Gtk.Box) {
	while (true) {
		const child = box.get_first_child();
		if (!child) break;
		box.remove(child);
	}
}
