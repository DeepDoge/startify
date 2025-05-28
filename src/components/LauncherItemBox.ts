import { Launcher } from "../common/launchers.ts";
import { TitlesAndIconBox } from "./TitlesAndIconBox.ts";

export function LauncherItemBox(launcher: Launcher) {
	return TitlesAndIconBox({
		title: launcher.data.name,
		subtitle: JSON.stringify(launcher.data.typeInfo),
		icon: launcher.data.icon,
	});
}
