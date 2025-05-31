import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import Pango from "@girs/Pango";
import { SPACING } from "../common/constants.ts";
import { formatLauncherTypeName, Launcher } from "../common/launchers.ts";
import { html } from "../common/markup.ts";
import { bind, buttonClass, formatBytes, removeChildren } from "../common/utils.ts";
import { Page } from "../components/Page.ts";

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
		const sizeGroup = Adw.PreferencesGroup.new();
		sizeGroup.set_title("Size");
		content.append(sizeGroup);

		{
			const row = Adw.ActionRow.new();
			row.set_activatable(false);
			const rowContent = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING);
			rowContent.set_margin_top(SPACING);
			rowContent.set_margin_bottom(SPACING);
			rowContent.set_margin_start(SPACING);
			rowContent.set_margin_end(SPACING);
			row.set_child(rowContent);
			sizeGroup.add(row);

			const infoBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
			infoBox.set_hexpand(true);
			rowContent.append(infoBox);

			const label = Gtk.Label.new();
			label.set_halign(Gtk.Align.START);
			label.set_markup(html`
				<b>Portable Home</b>
			`);
			infoBox.append(label);

			const sizeText = Gtk.Label.new();
			sizeText.set_halign(Gtk.Align.START);
			bind(sizeText, () =>
				type.portable.size.follow((size) => {
					sizeText.set_markup(html`
						<small>${formatBytes(size)}</small>
					`);
				}, true));
			sizeText.set_opacity(.65);
			infoBox.append(sizeText);

			const actionBox = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING * .5);
			rowContent.append(actionBox);
			bind(actionBox, (box) =>
				type.portable.exist.follow((portable) => {
					removeChildren(box);

					if (portable) {
						const clearButton = Gtk.Button.new();
						clearButton.set_css_classes(buttonClass("destructive-action"));
						clearButton.set_label("Clear");
						clearButton.set_halign(Gtk.Align.START);
						clearButton.connect("clicked", () => {
							type.portable.clear();
						});
						box.append(clearButton);

						const deleteButton = Gtk.Button.new();
						deleteButton.set_label("Delete");
						deleteButton.set_css_classes(buttonClass("destructive-action"));
						deleteButton.set_halign(Gtk.Align.START);
						deleteButton.connect("clicked", () => {
							type.portable.delete();
						});
						box.append(deleteButton);
					} else {
						const createButton = Gtk.Button.new();
						createButton.set_css_classes(buttonClass("pill"));
						createButton.set_label("Create Portable Home");
						createButton.set_halign(Gtk.Align.START);
						createButton.connect("clicked", () => {
							type.portable.create();
						});
						box.append(createButton);
					}
				}, true));
		}
	}

	self.content.append(header);
	self.content.append(content);

	return self;
}
