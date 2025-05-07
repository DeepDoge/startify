import Adw from "gi/Adw";
import GLib from "gi/GLib";
import Gtk from "gi/Gtk";
import Pango from "gi/Pango";
import { Page } from "../components/Page.ts";
import { AppLauncher, getAppLaunchers } from "../common/launchers.ts";
import { SPACING } from "../common/constants.ts";
import { AppNavigation } from "../app.ts";

export function AllPage(params: { navigation: AppNavigation }) {
	const { navigation } = params;
	const self = Page();

	const launchersGroup = Adw.PreferencesGroup.new();
	self.content.append(launchersGroup);
	launchersGroup.set_title("Launchers");
	launchersGroup.set_description("Installed Apps");

	const launchers = getAppLaunchers();

	for (const launcher of launchers.values().take(3)) {
		const row = Adw.ActionRow.new();
		row.set_activatable(true);
		row.connect("activated", () => {
			const cmd = new Deno.Command("bash", {
				args: ["-c", `nohup ${launcher.parsed.exec} >/dev/null 2>&1 &`],
			});
			cmd.spawn().unref();
		});
		row.set_child(TitlesAndIconBox({
			icon: launcher.parsed.icon,
			title: launcher.parsed.name,
			subtitle: launcher.parsed.exec,
		}));

		launchersGroup.add(row);
	}
	{
		const moreRow = Adw.ActionRow.new();
		moreRow.set_activatable(true);
		moreRow.connect("activated", () => {
			navigation.push({ title: "Launchers", content: AllLaunchersPage(launchers).scroller });
		});
		moreRow.set_child(MoreBox());
		launchersGroup.add(moreRow);
	}

	return self;
}

function AllLaunchersPage(launchers: AppLauncher[]) {
	const self = Page();

	const launchersGroup = Adw.PreferencesGroup.new();
	self.content.append(launchersGroup);
	launchersGroup.set_title("Launchers");
	launchersGroup.set_description("Installed Apps");

	for (const launcher of launchers) {
		const row = Adw.ActionRow.new();
		row.set_activatable(true);
		row.connect("activated", () => {
			const cmd = new Deno.Command("bash", {
				args: ["-c", `nohup ${launcher.parsed.exec} >/dev/null 2>&1 &`],
			});
			cmd.spawn().unref();
		});
		row.set_child(TitlesAndIconBox({
			icon: launcher.parsed.icon,
			title: launcher.parsed.name,
			subtitle: launcher.parsed.exec,
		}));

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
	subtitle.set_opacity(.5);
	subtitle.set_ellipsize(Pango.EllipsizeMode.END);
	subtitle.set_single_line_mode(false);
	subtitle.set_markup(`<small>${GLib.markup_escape_text(params.subtitle, -1)}</small>`);

	return self;
}
