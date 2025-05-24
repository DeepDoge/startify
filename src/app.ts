import Adw from "@girs/Adw";
import Gio from "@girs/Gio";
import Gtk from "@girs/Gtk";
import { AllPage } from "./pages/AllPage.ts";
import { Page } from "./components/Page.ts";
import { SettingsWindow } from "./windows/SettingsWindow.ts";

Adw.init();

const app = Adw.Application.new(
	"com.example.MyApp",
	Gio.ApplicationFlags.DEFAULT_FLAGS,
);

export type AppNavigation = {
	push(params: { title: string; content: Gtk.Widget }): void;
};

export type AppContext = { navigation: AppNavigation };

app.connect("activate", () => {
	const win = Adw.ApplicationWindow.new(app);
	win.set_default_size(800, 600);

	const breakpoint = Adw.Breakpoint.new(Adw.breakpoint_condition_parse("max-width: 500px"));
	win.add_breakpoint(breakpoint);

	const navigationView = Adw.NavigationView.new();
	win.set_content(navigationView);
	const navigation: AppNavigation = {
		push({ content, title }) {
			const toolbarView = Adw.ToolbarView.new();
			const headerBar = Adw.HeaderBar.new();
			headerBar.set_show_back_button(true);
			toolbarView.add_top_bar(headerBar);
			toolbarView.set_content(content);
			navigationView.push(Adw.NavigationPage.new(toolbarView, title));
		},
	};

	const toolbarView = Adw.ToolbarView.new();
	const toolbarViewNavigationPage = Adw.NavigationPage.new(toolbarView, "Home");
	navigationView.push(toolbarViewNavigationPage);

	const viewStack = Adw.ViewStack.new();
	viewStack.set_vexpand(true);
	toolbarView.set_content(viewStack);

	const headerBar = new Adw.HeaderBar();
	headerBar.set_centering_policy(Adw.CenteringPolicy.LOOSE);
	toolbarView.add_top_bar(headerBar);

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

	const menuButton = Gtk.MenuButton.new();
	headerBar.pack_end(menuButton);
	menuButton.set_icon_name("open-menu-symbolic");

	const menu = Gio.Menu.new();
	menuButton.set_popover(Gtk.PopoverMenu.new_from_model(menu));

	const settingsAction = Gio.SimpleAction.new("settings", null);
	settingsAction.connect("activate", () => SettingsWindow(app).present());
	app.add_action(settingsAction);
	menu.append("Settings", `app.${settingsAction.get_name()}`);

	const allPage = AllPage({ navigation });
	viewStack.add_titled_with_icon(
		allPage.host,
		"all",
		"All",
		"open-menu-symbolic",
	);

	const appImagesPage = Page();
	viewStack.add_titled_with_icon(
		appImagesPage.host,
		"app-images",
		"App Images",
		"open-menu-symbolic",
	);
	const appImagesLabel = Gtk.Label.new("App Images Page");
	appImagesPage.content.append(appImagesLabel);

	win.present();
});

app.run([]);
