import Gtk from "@girs/Gtk";
import Pango from "@girs/Pango";
import { SPACING } from "../common/constants.ts";
import { formatLauncherTypeName, Launcher } from "../common/launchers.ts";
import { html } from "../common/markup.ts";
import { Page } from "../components/Page.ts";
import { bind, buttonClass, removeChildren } from "../common/utils.ts";

export function LauncherPage(launcher: Launcher) {
	const self = Page();

	const header = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING * 1.5);
	const header_content = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
	header_content.set_valign(Gtk.Align.CENTER);
	header.append(header_content);

	const icon = Gtk.Image.new();
	if (launcher.data.icon?.startsWith("/")) {
		icon.set_from_file(launcher.data.icon);
	} else {
		icon.set_from_icon_name(launcher.data.icon);
	}
	icon.set_pixel_size(120);
	header.prepend(icon);

	const title = Gtk.Label.new();
	title.set_halign(Gtk.Align.START);
	title.set_wrap(true);
	title.set_wrap_mode(Pango.WrapMode.WORD_CHAR);
	title.set_markup(html`
		<span size="x-large"><b>${launcher.data.name}</b></span>
	`);
	title.set_margin_bottom(SPACING * .25);
	header_content.append(title);

	const subtitle = Gtk.Label.new();
	subtitle.set_halign(Gtk.Align.START);
	subtitle.set_wrap(true);
	subtitle.set_wrap_mode(Pango.WrapMode.WORD_CHAR);
	subtitle.set_opacity(.65);
	subtitle.set_markup(html`
		<small>${launcher.data.description ?? formatLauncherTypeName(launcher.data.type.name)}</small>
	`);
	header_content.append(subtitle);

	const launchButton = Gtk.Button.new();
	launchButton.set_label("Launch");
	launchButton.set_css_classes(buttonClass("suggested-action"));
	launchButton.set_halign(Gtk.Align.START);
	launchButton.connect("clicked", () => {
		const cmd = new Deno.Command("bash", {
			args: ["-c", `nohup ${launcher.data.exec} >/dev/null 2>&1 &`],
		});
		cmd.spawn().unref();
	});
	launchButton.set_margin_top(SPACING);
	header_content.append(launchButton);

	const content = Gtk.Box.new(Gtk.Orientation.VERTICAL, SPACING);

	const type = launcher.data.type;
	if (type.name === "appimage") {
		bind(content, () =>
			type.portable.follow((portable) => {
				removeChildren(content);

				// TODO: Have a whole section for portable home, show its current size and full path and stuff.
				// TODO: And if its a symlink also detect it and show it on the GUI is well
				if (portable) {
					const clearButton = Gtk.Button.new();
					clearButton.set_css_classes(buttonClass("destructive-action pill"));
					clearButton.set_label("Clear Portable Home");
					clearButton.set_halign(Gtk.Align.START);
					clearButton.connect("clicked", () => {
						type.clearPortableHome();
					});
					content.append(clearButton);

					const deleteButton = Gtk.Button.new();
					deleteButton.set_label("Delete Portable Home");
					deleteButton.set_css_classes(buttonClass("destructive-action pill"));
					deleteButton.set_halign(Gtk.Align.START);
					deleteButton.connect("clicked", () => {
						type.deletePortableHome();
					});
					content.append(deleteButton);
				} else {
					const createButton = Gtk.Button.new();
					createButton.set_css_classes(buttonClass("pill"));
					createButton.set_label("Create Portable Home");
					createButton.set_halign(Gtk.Align.START);
					createButton.connect("clicked", () => {
						type.createPortableHome();
					});
					content.append(createButton);
				}
			}, true));
	}

	self.content.append(header);
	self.content.append(content);

	return self;
}
