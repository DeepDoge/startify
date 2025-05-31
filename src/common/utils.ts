import Gtk from "@girs/Gtk";

export function bind<T extends Gtk.Widget>(widget: T, startStop: (widget: T) => () => void) {
	let stop: (() => void) | undefined | void;
	widget.connect("realize", () => {
		stop?.();
		stop = startStop(widget);
	});
	widget.connect("unrealize", () => {
		stop?.();
	});
}

export function removeChildren(box: Gtk.Box) {
	while (true) {
		const child = box.get_first_child();
		if (!child) break;
		box.remove(child);
	}
}
