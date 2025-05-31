# ✅ Startify – Development TODO

A structured plan for building **Startify**, an opinionated launcher/autostart/AppImage management tool.

---

## 🎨 Style & UI Design

- [x] Details page styled like **GearLever**
- [x] Lists and main pages styled like **Ignition**
- [ ] Visually separate "Advanced" or "Not Recommended" actions (e.g. darker tone, warning icon)

---

## 🚀 Launcher Type Support

- [x] AppImage
- [ ] Distrobox (Terminal-based)
- [ ] Distrobox (Exported apps)
- [ ] Startup (Autostart entries)
- [ ] Unknown/Custom launchers

---

## 🔍 Launcher Details Page (Generic / Unknown Types)

- [x] Basic UI with logo, name, description, and launch button
- [ ] Create/edit/delete `.desktop` entries
- [ ] Support for both known types and arbitrary entries
- [ ] Use shared `.desktop` editor as "Advanced" mode
- [ ] Normal launcher page: only launch and action buttons
- [ ] Raw `.desktop` editing must be explicitly entered via a clearly marked advanced toggle

---

## 📦 AppImage Support

- [x] AppImage detail page is separate from launcher details
- [ ] Detect if AppImage is **outside** defined AppImages folder
  - Show a **"Fix"** banner and move the file
- [ ] Detect AppImages **in folder** with **no launcher**
  - Show these at top of home in a separate color-coded section
  - Clicking one opens the "Install" flow
- [ ] Detect if AppImage’s `.desktop` file has no uninstall/remove action
  - Suggest fix with a banner and "Fix" button
- [x] Detect portable directories
  - Create if missing
  - Allow clearing via hidden "More Options"
- [ ] Uninstall process:
  - Ask for confirmation
  - Include "Keep portable directory" checkbox if applicable
- [ ] Handle launch from file manager (double-clicked):
  - Show "Install" page, not launcher detail
- [ ] Add UI for setting **environment variables** at exec start
- [ ] Before interacting with portable dir:
  - Check if app is running; block and show message if so

---

## 🔁 Startup Integration

- [ ] Enable/disable startup by creating **symlink** to `~/.config/autostart`
- [ ] Add **Startup tab** to show startup-only apps
  - Reuse advanced `.desktop` edit page
- [ ] Disable editing of symlinked `.desktop` files
  - Option to "Convert to real copy" and edit instead
- [ ] Auto-detect existing `.desktop` files in autostart
  - Match by `Exec` path and link them to main launchers
  - Handle copies and duplicates
- [ ] For matched entries with **identical `Exec`**, suggest converting to symlink
- [ ] If app has multiple startup entries (different args/env):
  - Show as editable list on details page
- [ ] Validate `Exec` on edit: show error and prevent saving if invalid

---

## 📦 Distrobox Support (Planned)

- [ ] Detect Distrobox containers
- [ ] Manage Distrobox-exported `.desktop` entries
- [ ] Provide Distrobox-specific actions (launch terminal, edit environment, etc.)

---

## ⚙️ Other Functionality

- [ ] Custom right-click actions (e.g., Uninstall)
  - Open Startify if available
  - Fallback gracefully if not
- [ ] Auto-fix outdated `.desktop` actions silently over time
  - Detect mismatches and update in background
