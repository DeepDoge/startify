import Adw from "@girs/Adw";
import Gio from "@girs/Gio";
import Gtk from "@girs/Gtk";
import { HOME, SPACING } from "./common/constants.ts";
import { Page } from "./components/Page.ts";
import { LaunchersPage } from "./pages/HomePage.ts";
import { SettingsWindow } from "./windows/SettingsWindow.ts";
import { getLaunchers } from "./common/launchers.ts";
import * as path from "@std/path";
import { ContainerBox } from "./components/ContainerBox.ts";

Adw.init();

const app = Adw.Application.new(
	"com.example.MyApp",
	Gio.ApplicationFlags.DEFAULT_FLAGS,
);

export type AppNavigation = {
	push(params: { title: string; page: Page }): void;
};

export type AppContext = { navigation: AppNavigation };

app.connect("activate", () => {
	const win = Adw.ApplicationWindow.new(app);
	win.set_default_size(600, 525);

	const breakpoint = Adw.Breakpoint.new(Adw.breakpoint_condition_parse("max-width: 500px"));
	win.add_breakpoint(breakpoint);

	const navigationView = Adw.NavigationView.new();
	win.set_content(navigationView);
	const navigation: AppNavigation = {
		push({ page, title }) {
			const toolbarView = Adw.ToolbarView.new();
			const headerBar = Adw.HeaderBar.new();
			headerBar.set_show_back_button(true);
			toolbarView.add_top_bar(headerBar);
			toolbarView.set_content(page.host);
			navigationView.push(Adw.NavigationPage.new(toolbarView, title));
		},
	};

	const toolbarView = Adw.ToolbarView.new();
	navigationView.push(Adw.NavigationPage.new(toolbarView, "Home"));

	const headerBar = new Adw.HeaderBar();
	headerBar.set_centering_policy(Adw.CenteringPolicy.LOOSE);
	toolbarView.add_top_bar(headerBar);

	const searchButton = Gtk.Button.new_from_icon_name("system-search-symbolic");
	searchButton.set_valign(Gtk.Align.CENTER);
	headerBar.pack_start(searchButton);

	const menuButton = Gtk.MenuButton.new();
	headerBar.pack_end(menuButton);
	menuButton.set_icon_name("open-menu-symbolic");
	const menu = Gio.Menu.new();
	menuButton.set_popover(Gtk.PopoverMenu.new_from_model(menu));
	{
		const settingsAction = Gio.SimpleAction.new("settings", null);
		settingsAction.connect("activate", () => SettingsWindow(app).present());
		app.add_action(settingsAction);
		menu.append("Settings", `app.${settingsAction.get_name()}`);
	}

	const contentBox = Gtk.Box.new(Gtk.Orientation.VERTICAL, SPACING);
	toolbarView.set_content(contentBox);

	const searchRevealer = Gtk.Revealer.new();
	searchRevealer.set_transition_type(Gtk.RevealerTransitionType.SLIDE_DOWN);
	searchRevealer.set_reveal_child(false);
	contentBox.append(searchRevealer);

	const searchEntry = Gtk.SearchEntry.new();
	searchEntry.set_hexpand(true);
	searchEntry.set_placeholder_text("Search entries...");

	const searchBox = ContainerBox(Gtk.Orientation.HORIZONTAL, 0);
	searchBox.append(searchEntry);
	searchBox.set_margin_bottom(SPACING);
	searchRevealer.set_child(searchBox);

	searchEntry.grab_focus();
	searchEntry.connect("search-started", () => {
		searchRevealer.set_reveal_child(true);
		searchEntry.grab_focus();
	});
	searchEntry.connect("search-changed", () => {
		searchRevealer.set_reveal_child(true);
		searchEntry.grab_focus();
	});
	searchEntry.connect("stop-search", () => {
		searchRevealer.set_reveal_child(false);
		searchEntry.set_text("");
	});
	searchButton.connect("clicked", () => {
		searchRevealer.set_reveal_child(!searchRevealer.get_reveal_child());
		searchEntry.grab_focus();
	});

	const viewStack = Adw.ViewStack.new();
	viewStack.set_vexpand(true);
	contentBox.append(viewStack);

	const switcherTitle = Adw.ViewSwitcherTitle.new();
	switcherTitle.set_stack(viewStack);
	headerBar.set_title_widget(switcherTitle);

	const switcherBar = Adw.ViewSwitcherBar.new();
	switcherBar.set_stack(viewStack);
	switcherBar.set_reveal(true);
	toolbarView.add_bottom_bar(switcherBar);

	if (breakpoint === win.get_current_breakpoint()) {
		switcherTitle.hide();
		switcherBar.show();
	} else {
		switcherTitle.show();
		switcherBar.hide();
	}
	breakpoint.connect("apply", () => {
		switcherTitle.hide();
		switcherBar.show();
	});
	breakpoint.connect("unapply", () => {
		switcherTitle.show();
		switcherBar.hide();
	});

	viewStack.add_titled_with_icon(
		LaunchersPage({ navigation }, getLaunchers(path.join(HOME, ".local", "share", "applications"))).host,
		"user-apps",
		"User",
		"avatar-default",
	);

	viewStack.add_titled_with_icon(
		LaunchersPage({ navigation }, getLaunchers(path.join("/usr", "share", "applications"))).host,
		"system-apps",
		"System",
		"applications-system",
	);

	win.present();
});

app.run();
