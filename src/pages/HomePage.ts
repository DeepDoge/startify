import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import { AppContext } from "../app.ts";
import { getLaunchers, Launcher } from "../common/launchers.ts";
import { LauncherItemBox } from "../components/LauncherItemBox.ts";
import { MoreBox } from "../components/MoreBox.ts";
import { Page } from "../components/Page.ts";
import { LauncherPage } from "./LauncherPage.ts";

export function HomePage(ctx: AppContext) {
	const self = Page();

	const launchers = getLaunchers();
	const appImageLaunchers = launchers.filter((launcher) => launcher.info.type === "appimage");
	const distroboxLaunchers = launchers.filter((launcher) => launcher.info.type === "distrobox");
	const otherLaunchers = launchers.filter((launchers) => launchers.info.type === "unknown");

	self.content.append(LaunchersGroup(ctx, {
		title: "AppImage Launchers",
		description: "Launchers for AppImages you have.",
		launchers: appImageLaunchers,
		take: Infinity,
	}));

	self.content.append(Gtk.Box.new(Gtk.Orientation.VERTICAL, 0));

	self.content.append(LaunchersGroup(ctx, {
		title: "Distrobox Launchers",
		description: "Distrobox launchers you have.",
		launchers: distroboxLaunchers,
		take: Infinity,
	}));

	self.content.append(Gtk.Box.new(Gtk.Orientation.VERTICAL, 0));

	self.content.append(LaunchersGroup(ctx, {
		title: "Others",
		description: "Other launchers you have.",
		launchers: otherLaunchers,
		take: Infinity,
	}));

	return self;
}

function LaunchersGroup(
	ctx: AppContext,
	options: {
		title: string;
		description: string;
		launchers: Launcher[];
		take: number;
	},
) {
	const { title, description, launchers, take } = options;
	const { navigation } = ctx;

	const self = Adw.PreferencesGroup.new();
	self.set_title(title);
	self.set_description(description);

	for (const launcher of launchers.values().take(take)) {
		const row = Adw.ActionRow.new();
		row.set_activatable(true);
		row.connect("activated", () => {
			navigation.push({ title: launcher.desktop.name, page: LauncherPage(launcher) });
		});
		row.set_child(LauncherItemBox(launcher));

		self.add(row);
	}

	if (launchers.length > take) {
		const moreRow = Adw.ActionRow.new();
		moreRow.set_activatable(true);
		moreRow.connect("activated", () => {
			const morePage = Page();
			morePage.content.append(LaunchersGroup(ctx, { ...options, take: Infinity }));
			navigation.push({ title: title, page: morePage });
		});
		moreRow.set_child(MoreBox());
		self.add(moreRow);
	}

	return self;
}
