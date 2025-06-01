import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import Pango from "@girs/Pango";
import { SPACING } from "../common/constants.ts";
import { formatLauncherTypeName, Launcher } from "../common/launchers.ts";
import { html } from "../common/utils/markup.ts";
import { Page } from "../components/Page.ts";
import { buttonClass } from "../common/utils/buttonClass.ts";
import { bind } from "../common/utils/bind.ts";
import { formatBytes } from "../common/utils/format.ts";
import { removeChildren } from "../common/utils/gtk.ts";
import { computed } from "../common/signals.ts";

export function LauncherPage(launcher: Launcher) {
	const self = Page();

	const header = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING * 1.5);
	const header_content = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
	header_content.set_valign(Gtk.Align.CENTER);
	header.append(header_content);

	const icon = Gtk.Image.new();
	if (launcher.desktop.icon?.startsWith("/")) {
		icon.set_from_file(launcher.desktop.icon);
	} else {
		icon.set_from_icon_name(launcher.desktop.icon);
	}
	icon.set_pixel_size(120);
	header.prepend(icon);

	const title = Gtk.Label.new();
	title.set_halign(Gtk.Align.START);
	title.set_wrap(true);
	title.set_wrap_mode(Pango.WrapMode.WORD_CHAR);
	title.set_markup(html`
		<span size="x-large"><b>${launcher.desktop.name}</b></span>
	`);
	title.set_margin_bottom(SPACING * .25);
	header_content.append(title);

	const subtitle = Gtk.Label.new();
	subtitle.set_halign(Gtk.Align.START);
	subtitle.set_wrap(true);
	subtitle.set_wrap_mode(Pango.WrapMode.WORD_CHAR);
	subtitle.set_opacity(.65);
	subtitle.set_markup(html`
		<small>${launcher.desktop.description ?? formatLauncherTypeName(launcher.info.type)}</small>
	`);
	header_content.append(subtitle);

	const launchButton = Gtk.Button.new();
	launchButton.set_label("Launch");
	launchButton.set_css_classes(buttonClass("suggested-action"));
	launchButton.set_halign(Gtk.Align.START);
	launchButton.connect("clicked", () => {
		const cmd = new Deno.Command("bash", {
			args: ["-c", `nohup ${launcher.desktop.exec} >/dev/null 2>&1 &`],
		});
		cmd.spawn().unref();
	});
	launchButton.set_margin_top(SPACING);
	header_content.append(launchButton);

	const content = Gtk.Box.new(Gtk.Orientation.VERTICAL, SPACING);

	const info = launcher.info;
	const sizeGroup = Adw.PreferencesGroup.new();
	sizeGroup.set_title("Size");
	content.append(sizeGroup);

	if (info.type === "appimage") {
		const appImageRow = AppImageSizeRow(info);
		sizeGroup.add(appImageRow);

		const portableHomeRow = PortableHomeRow(info);
		sizeGroup.add(portableHomeRow);

		const totalRow = TotalSizeRow(info);
		sizeGroup.add(totalRow);
	}

	self.container.append(header);
	self.container.append(content);

	return self;
}

function PortableHomeRow(info: Launcher.Info & { type: "appimage" }) {
	const row = Adw.ActionRow.new();
	row.set_activatable(false);
	const rowContent = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING);
	rowContent.set_margin_top(SPACING);
	rowContent.set_margin_bottom(SPACING);
	rowContent.set_margin_start(SPACING);
	rowContent.set_margin_end(SPACING);
	row.set_child(rowContent);

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
		info.portable.size.follow((size) => {
			sizeText.set_markup(html`
				<small>${formatBytes(size)}</small>
			`);
		}, true));
	sizeText.set_opacity(.65);
	infoBox.append(sizeText);

	const actionBox = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING * .25);
	rowContent.append(actionBox);
	bind(actionBox, (box) =>
		info.portable.exist.follow((portable) => {
			removeChildren(box);

			if (portable) {
				const clearButton = Gtk.Button.new();
				clearButton.set_css_classes(buttonClass("destructive-action flat"));
				clearButton.set_label("Clear");
				clearButton.set_halign(Gtk.Align.START);
				clearButton.connect("clicked", () => {
					info.portable.clear();
				});
				box.append(clearButton);

				const deleteButton = Gtk.Button.new();
				deleteButton.set_label("Delete");
				deleteButton.set_css_classes(buttonClass("destructive-action"));
				deleteButton.set_halign(Gtk.Align.START);
				deleteButton.connect("clicked", () => {
					info.portable.delete();
				});
				box.append(deleteButton);
			} else {
				const createButton = Gtk.Button.new();
				createButton.set_css_classes(buttonClass("suggested-action"));
				createButton.set_label("Create");
				createButton.set_halign(Gtk.Align.START);
				createButton.connect("clicked", () => {
					info.portable.create();
				});
				box.append(createButton);
			}
		}, true));

	return row;
}

function AppImageSizeRow(info: Launcher.Info & { type: "appimage" }) {
	const row = Adw.ActionRow.new();
	row.set_activatable(false);
	const rowContent = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING);
	rowContent.set_margin_top(SPACING);
	rowContent.set_margin_bottom(SPACING);
	rowContent.set_margin_start(SPACING);
	rowContent.set_margin_end(SPACING);
	row.set_child(rowContent);

	const infoBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
	infoBox.set_hexpand(true);
	rowContent.append(infoBox);

	const label = Gtk.Label.new();
	label.set_halign(Gtk.Align.START);
	label.set_markup(html`
		<b>AppImage</b>
	`);
	infoBox.append(label);

	const sizeText = Gtk.Label.new();
	sizeText.set_halign(Gtk.Align.START);
	bind(sizeText, () =>
		info.appimage.size.follow((size) => {
			sizeText.set_markup(html`
				<small>${formatBytes(size)}</small>
			`);
		}, true));
	sizeText.set_opacity(.65);
	infoBox.append(sizeText);

	return row;
}

function TotalSizeRow(info: Launcher.Info & { type: "appimage" }) {
	const row = Adw.ActionRow.new();
	row.set_activatable(false);
	const rowContent = Gtk.Box.new(Gtk.Orientation.HORIZONTAL, SPACING);
	rowContent.set_margin_top(SPACING);
	rowContent.set_margin_bottom(SPACING);
	rowContent.set_margin_start(SPACING);
	rowContent.set_margin_end(SPACING);
	row.set_child(rowContent);

	const infoBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, 0);
	infoBox.set_hexpand(true);
	rowContent.append(infoBox);

	const label = Gtk.Label.new();
	label.set_halign(Gtk.Align.START);
	label.set_markup(html`
		<b>Total</b>
	`);
	infoBox.append(label);

	const sizeText = Gtk.Label.new();
	sizeText.set_halign(Gtk.Align.START);
	const totalSize = computed(() => info.appimage.size.get() + info.portable.size.get());
	bind(sizeText, () =>
		totalSize.follow((size) => {
			sizeText.set_markup(html`
				<small>${formatBytes(size)}</small>
			`);
		}, true));
	sizeText.set_opacity(.65);
	infoBox.append(sizeText);

	return row;
}
