import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";
import { AppContext } from "../app.ts";
import { getLaunchers, Launcher } from "../common/launchers.ts";
import { LauncherItemBox } from "../components/LauncherItemBox.ts";
import { MoreBox } from "../components/MoreBox.ts";
import { Page } from "../components/Page.ts";

export function AppsPage(ctx: AppContext) {
	const self = Page();

	const launchers = getLaunchers();
	const appImageLaunchers = launchers.filter((launcher) => launcher.data.typeInfo.type === "appimage");

	self.container.append(LaunchersGroup(ctx, {
		title: "All",
		description: "All Applications",
		launchers,
		take: 4,
	}));

	self.container.append(Gtk.Box.new(Gtk.Orientation.VERTICAL, 0));

	self.container.append(LaunchersGroup(ctx, {
		title: "AppImages",
		description: "Installed AppImage Applications",
		launchers: appImageLaunchers,
		take: 4,
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
			const cmd = new Deno.Command("bash", {
				args: ["-c", `nohup ${launcher.data.exec} >/dev/null 2>&1 &`],
			});
			cmd.spawn().unref();
		});
		row.set_child(LauncherItemBox(launcher));

		self.add(row);
	}

	if (launchers.length > take) {
		const moreRow = Adw.ActionRow.new();
		moreRow.set_activatable(true);
		moreRow.connect("activated", () => {
			const self = Page();
			self.container.append(LaunchersGroup(ctx, { ...options, take: Infinity }));
			navigation.push({ title: title, content: self.host });
		});
		moreRow.set_child(MoreBox());
		self.add(moreRow);
	}

	return self;
}
