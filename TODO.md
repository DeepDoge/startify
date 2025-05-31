## Style

- Details page will be like GearLever
- Lists and main pages are like Ignition's lists
- ...

## List and Parse Launcher Type

- [ ] AppImage
- [ ] Distrobox Terminal
- [ ] Distrobox Export
- [ ] Startup
- [ ] Other, Unknown

## Launcher Details Page For Unknown Type

- [ ] basic of ui with logo, name description and launche button and stuff.
- [ ] edit create or delete `.desktop` file entries and stuff.
- [ ] add support for known entries while stilling allowing arbitary ones.
- [ ] use general `.desktop` file edit page as advanced mode for other type like AppImages
- [ ] at the normal launchers page just have an option to launch the app or its actions. anything else that directly
      edits the launcher hidden in an advanced page to edit desktop files directly. and its gone by a button at the
      bottom, that clearly looks like and indicates its not recommeneded to change launchers raw like this.

## AppImages

- [ ] AppImage detail page is not launcher details page, but at the bottom have an advanced page button to edit it on
      launcher details page.
- [ ] check if appimage is inside defined AppImages directory, if not, have a recommaneded fixes banner at top with a
      "Fix" button to fix it and move it.
- [ ] check appimages inside AppImages directory, and if it doesnt have a launcher, show it in a different section on
      the home at top with different color, when clicked go to the install page and "install" it.
- [ ] check if appimage `.desktop` has an action for uninstall, remove. if not show a recommended fixes banner at top
      with a "Fix" button to fix it and add it.
- [ ] check if appimage has a portable direcotry, if it doesnt show a button that creatres it, if it exists, show a
      button to clear and remove it, but option for removing it should be hidden under a more options or something.
- [ ] uninstall action should ask for confirmation and have checkbox that says, "Keep portable mode directoriesi" or
      something similar, if there is one.
- [ ] when app image started by double clicking or via file selector show an install page which is not the launcher
      page. this page should extract app image and get .desktop file info and icons and stuff from there. for app
      images.
- [ ] have an env variables entiries input to edit envs at the beginning of the exec or something

## Startup

- [ ] each launcher has an option to set it a startup app, this wont copy paste the app to the autostart dir, but it
      will symlink to there.
- [ ] there is also a startup tab to show startup apps only, and their own details page, it might probably wrap/reuse
      advanced launcher edit page.
- [ ] while at statup tab, symlink startups cant be editted, you have to press a button to delete the symlink and create
      a copy in place of it.
- [ ] also auto detect already existing auto start `.desktop` files and try to match them with normal launchers. this
      also matches the copied ones. it might use exec path. matched startups can only be viewed from launcher page, not
      from startups page. launcher can have more than one startup. with different args or env, basically different exec.
- [ ] if matched ones have same exec, suggest a fix to convert it into a symlink
- [ ] on app's details page show startup execs if it has multiple different startups with different execs show them in a
      entry list, that lets you remove edit and add more. a launcher can have more than one statup.
- [ ] give error and dont save if statup exec doesnt include exec path while trying to edit it on app page.

## Distrobox

yeah later. manage distroboxes and export and stuff. actions etc

## Other

- [ ] custom actions that lets you uinstall the app and stuff by right clicking, shoudld normally open startify to do
      it. but if it fails, it should have a fallback.
- [ ] if actions doesnt match what they are suppose to be, then that means we updated them. so auto fix/update them
      silently, slowly.
