#!/usr/bin/env -S deno run -A

import Adw from "https://gir.deno.dev/Adw-1";
import Gtk from "https://gir.deno.dev/Gtk-4.0";
import Gio from "https://gir.deno.dev/Gio-2.0";

// just testing to see if i can do gtk adwita with Deno, yes i can.
// just gonna `deno compile ./app.ts` this and done after the app is done of course.

Adw.init();

const app = Adw.Application.new(
  "com.example.MyApp",
  Gio.ApplicationFlags.DEFAULT_FLAGS,
);

app.connect("activate", () => {
  // === Main App Window ===
  const win = Gtk.ApplicationWindow.new(app);

  // === Headerbar ===
  const headerBar = new Adw.HeaderBar();
  win.set_titlebar(headerBar);

  // === Create and Register "settings" Action ===
  const settingsAction = Gio.SimpleAction.new("settings", null);
  settingsAction.connect("activate", () => {
    openSettingsWindow();
  });
  app.add_action(settingsAction); // ← Makes "app.settings" valid

  // === Menu Model ===
  const menuModel = Gio.Menu.new();
  menuModel.append("Settings", `app.${settingsAction.get_name()}`); // ← No need for "()"

  // === Menu Button ===
  const menuButton = Gtk.MenuButton.new();
  menuButton.set_icon_name("open-menu-symbolic");
  menuButton.set_valign(Gtk.Align.CENTER);
  menuButton.set_popover(Gtk.PopoverMenu.new_from_model(menuModel));

  headerBar.pack_end(menuButton);

  // === Main Content ===
  const label = Gtk.Label.new("Main App Content Here");
  win.set_child(label);

  win.present();
});

// === Settings Window Definition ===
let settingsWindowCache: Adw.PreferencesWindow | null = null;
function openSettingsWindow() {
  if (!settingsWindowCache) {
    const win = Adw.PreferencesWindow.new();
    win.set_application(app);

    const page = Adw.PreferencesPage.new();

    const appearanceGroup = Adw.PreferencesGroup.new();
    appearanceGroup.set_title("Appearance");

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
    page.add(appearanceGroup);

    const generalGroup = Adw.PreferencesGroup.new();
    generalGroup.set_title("General");

    const notificationsRow = Adw.ActionRow.new();
    notificationsRow.set_title("Enable Notifications");

    const notificationsSwitch = Gtk.Switch.new();
    notificationsSwitch.halign = Gtk.Align.CENTER;
    notificationsSwitch.valign = Gtk.Align.CENTER;

    notificationsRow.add_suffix(notificationsSwitch);
    notificationsRow.activatable_widget = notificationsSwitch;

    generalGroup.add(notificationsRow);
    page.add(generalGroup);

    win.add(page);
    settingsWindowCache = win;
    settingsWindowCache.connect("destroy", () => {
      settingsWindowCache = null;
    });
  }

  settingsWindowCache.present();

  return settingsWindowCache;
}

app.run([]);
