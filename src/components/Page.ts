import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import { ContainerBox } from "./ContainerBox.ts";
import { SPACING } from "../common/constants.ts";

export type Page = {
	host: Gtk.ScrolledWindow;
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
	const container = ContainerBox(Gtk.Orientation.VERTICAL, SPACING);
	clamp.set_child(container);

	return {
		host,
		container,
	};
}
