import Adw from "@girs/Adw";
import GLib from "@girs/GLib";
import Gtk from "@girs/Gtk";
import Pango from "@girs/Pango";
import { AppContext } from "../app.ts";
import { AppLauncher, getAppLaunchers } from "../common/applaunchers.ts";
import { SPACING } from "../common/constants.ts";
import { Page } from "../components/Page.ts";

export function AllPage(ctx: AppContext) {
	const self = Page();

	const launchers = getAppLaunchers();
	const appImageLaunchers = launchers.filter((launcher) => launcher.data.typeInfo.type === "appimage");

	self.content.append(AppLaunchersGroup({
		title: "All",
		description: "All Applications",
		launchers,
	}, ctx));

	self.content.append(AppLaunchersGroup({
		title: "AppImages",
		description: "Installed AppImage Applications",
		launchers: appImageLaunchers,
	}, ctx));

	self.content.append(AppLaunchersGroup({
		title: "Auto Start",
		description: "Startup Applications",
		launchers,
	}, ctx));

	self.content.append(Gtk.Box.new(Gtk.Orientation.VERTICAL, 0));

	return self;
}

function AppLaunchersGroup(options: {
	title: string;
	description: string;
	launchers: AppLauncher[];
}, ctx: AppContext) {
	const { title, description, launchers } = options;
	const { navigation } = ctx;

	const self = Adw.PreferencesGroup.new();
	self.set_title(title);
	self.set_description(description);

	for (const launcher of launchers.values().take(3)) {
		const row = Adw.ActionRow.new();
		row.set_activatable(true);
		row.connect("activated", () => {
			const cmd = new Deno.Command("bash", {
				args: ["-c", `nohup ${launcher.data.exec} >/dev/null 2>&1 &`],
			});
			cmd.spawn().unref();
		});
		row.set_child(LauncherItemBox(launcher));

		self.add(row);
	}

	const moreRow = Adw.ActionRow.new();
	moreRow.set_activatable(true);
	moreRow.connect("activated", () => {
		navigation.push({ title: title, content: AllLaunchersPage(options).host });
	});
	moreRow.set_child(MoreBox());
	self.add(moreRow);

	return self;
}

function AllLaunchersPage(options: {
	title: string;
	description: string;
	launchers: AppLauncher[];
}) {
	const { title, description, launchers } = options;

	const self = Page();

	const launchersGroup = Adw.PreferencesGroup.new();
	self.content.append(launchersGroup);
	launchersGroup.set_title(title);
	launchersGroup.set_description(description);

	for (const launcher of launchers) {
		const row = Adw.ActionRow.new();
		row.set_activatable(true);
		row.connect("activated", () => {
			const cmd = new Deno.Command("bash", {
				args: ["-c", `nohup ${launcher.data.exec} >/dev/null 2>&1 &`],
			});
			cmd.spawn().unref();
		});
		row.set_child(LauncherItemBox(launcher));

		launchersGroup.add(row);
	}

	return self;
}

function MoreBox() {
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

function LauncherItemBox(launcher: AppLauncher) {
	return TitlesAndIconBox({
		title: launcher.data.name,
		subtitle: JSON.stringify(launcher.data.typeInfo),
		icon: launcher.data.icon,
	});
}

function TitlesAndIconBox(params: { title: string; subtitle: string; icon: string | null }) {
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
