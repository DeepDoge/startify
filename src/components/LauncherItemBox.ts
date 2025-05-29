import { Launcher } from "../common/launchers.ts";
import { TitlesAndIconBox } from "./TitlesAndIconBox.ts";

export function LauncherItemBox(launcher: Launcher) {
	return TitlesAndIconBox({
		title: launcher.data.name,
		subtitle: launcher.data.exec,
		icon: launcher.data.icon,
	});
}
