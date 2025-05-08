import Adw from "@girs/Adw";
import Gtk from "@girs/Gtk";

export function SettingsWindow(app: Adw.Application) {
	const win = Adw.PreferencesWindow.new();
	win.set_application(app);

	const page = Adw.PreferencesPage.new();
	win.add(page);

	{
		const appearanceGroup = Adw.PreferencesGroup.new();
		appearanceGroup.set_title("Appearance");
		page.add(appearanceGroup);

		{
			const darkModeRow = Adw.ActionRow.new();
			darkModeRow.set_title("Dark Mode");
			darkModeRow.set_subtitle("Enable dark theme across the app");

			const darkSwitch = Gtk.Switch.new();
			darkSwitch.set_active(false);
			darkSwitch.halign = Gtk.Align.CENTER;
			darkSwitch.valign = Gtk.Align.CENTER;

			darkModeRow.add_suffix(darkSwitch);
			darkModeRow.activatable_widget = darkSwitch;

			appearanceGroup.add(darkModeRow);
		}
	}

	{
		const generalGroup = Adw.PreferencesGroup.new();
		generalGroup.set_title("General");
		page.add(generalGroup);

		{
			const notificationsRow = Adw.ActionRow.new();
			notificationsRow.set_title("Enable Notifications");

			const notificationsSwitch = Gtk.Switch.new();
			notificationsSwitch.halign = Gtk.Align.CENTER;
			notificationsSwitch.valign = Gtk.Align.CENTER;

			notificationsRow.add_suffix(notificationsSwitch);
			notificationsRow.activatable_widget = notificationsSwitch;

			generalGroup.add(notificationsRow);
		}
	}

	return win;
}
