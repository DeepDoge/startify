import Gtk from "@girs/Gtk";
import Pango from "@girs/Pango";
import { SPACING } from "../common/constants.ts";
import { Launcher } from "../common/launchers.ts";
import { html } from "../common/markup.ts";
import { Page } from "../components/Page.ts";

export function LauncherPage(launcher: Launcher) {
	const self = Page();

	const icon = Gtk.Image.new();
	if (launcher.data.icon?.startsWith("/")) {
		icon.set_from_file(launcher.data.icon);
	} else {
		icon.set_from_icon_name(launcher.data.icon);
	}
	icon.set_icon_size(Gtk.IconSize.LARGE);
	icon.set_pixel_size(120);

	const title = Gtk.Label.new();
	title.set_wrap(true);
	title.set_wrap_mode(Pango.WrapMode.WORD_CHAR);
	title.set_markup(html`
		<span size="x-large"><b>${launcher.data.name}</b></span>
	`);

	const launchButton = Gtk.Button.new();
	launchButton.set_label("Launch");
	launchButton.get_style_context().add_class("suggested-action");
	launchButton.set_hexpand(false);
	launchButton.set_halign(Gtk.Align.START);
	launchButton.connect("clicked", () => {
		const cmd = new Deno.Command("bash", {
			args: ["-c", `nohup ${launcher.data.exec} >/dev/null 2>&1 &`],
		});
		cmd.spawn().unref();
	});

	const header = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING * 1.5);
	const header_info = Gtk.Box.new(Gtk.Orientation.VERTICAL, SPACING);
	header_info.set_valign(Gtk.Align.CENTER);

	header.append(icon);
	header.append(header_info);
	header_info.append(title);
	header_info.append(launchButton);

	self.content.append(header);

	return self;
}
