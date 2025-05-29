import { formatLauncherTypeName, Launcher } from "../common/launchers.ts";
import { TitlesAndIconBox } from "./TitlesAndIconBox.ts";

export function LauncherItemBox(launcher: Launcher) {
	return TitlesAndIconBox({
		title: launcher.data.name,
		subtitle: launcher.data.description ?? formatLauncherTypeName(launcher.data.type.name),
		icon: launcher.data.icon,
	});
}
