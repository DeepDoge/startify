import * as path from "@std/path";
import { HOME, PATH } from "./constants.ts";
import { DesktopFile, parseDesktopFile } from "./desktop.ts";
import { ref, Sync } from "./signals.ts";
import { getDirectorySize } from "./utils.ts";

export type Launcher = {
	file: Deno.FileInfo;
	raw: DesktopFile;
	data: {
		name: string;
		description: string | null;
		exec: string;
		execPath: string;
		icon: string | null;
		type: Launcher.Type;
	};
};
export declare namespace Launcher {
	export type Type =
		| {
			name: "unknown";
		}
		| {
			name: "appimage";
			portable: {
				exist: Sync<boolean>;
				size: Sync<number>;
				create(): void;
				clear(): void;
				delete(): void;
			};
		}
		| {
			name: "distrobox";
		};
}

const launcherTypeNameMap: { [K in Launcher.Type["name"]]: string } = {
	appimage: "AppImage",
	distrobox: "Distrobox",
	unknown: "Application",
};
export function formatLauncherTypeName(type: Launcher.Type["name"]) {
	return launcherTypeNameMap[type];
}

export function getLaunchers(): Launcher[] {
	const dirPath = path.join(HOME, ".local", "share", "applications");
	if (!Deno.statSync(dirPath).isDirectory) return [];
	const dirEntries = Array.from(Deno.readDirSync(dirPath));

	const appEntries = dirEntries.map((entry): Launcher | null => {
		if (!entry.isFile) return null;
		if (!entry.name.endsWith(".desktop")) return null;
		const filePath = path.join(dirPath, entry.name);
		const fileStats = Deno.statSync(filePath);
		const file = Deno.readFileSync(filePath);
		const fileContent = new TextDecoder("utf-8").decode(file);
		try {
			const desktop = parseDesktopFile(fileContent);
			const desktopEntry = desktop["Desktop Entry"];
			if (!desktopEntry) return null;
			const fuck = /\s*%[fFuUick]/g; // %F, %U, %f, %u, %i, %c, %k
			const exec = desktopEntry["Exec"]?.replace(fuck, "").trim();
			if (!exec) return null;

			const name = desktopEntry["Name"];
			if (!name) return null;

			const description = desktopEntry["Comment"] || null;

			const icon = desktopEntry["Icon"] || null;

			let execPath = path.resolve(
				exec.match(/^"([^"]+)"|^(\S+)/)?.[1] ??
					exec.match(/^(\S+)/)?.[1] ??
					exec,
			);

			// Try to trim if execPath starts with a PATH entry
			for (const p of PATH) {
				if (execPath.startsWith(path.join(p, "/"))) {
					execPath = path.basename(execPath);
					break;
				}
			}

			let typeInfo: Launcher.Type;
			if (execPath.toLowerCase().endsWith(".appimage")) {
				const portableHomePath = `${execPath}.home`;
				const exist = ref(false);
				try {
					exist.set(Deno.statSync(portableHomePath).isDirectory);
				} catch {
					/*  */
				}
				const size = ref(exist.get() ? getDirectorySize(portableHomePath) : 0);
				typeInfo = {
					name: "appimage",
					portable: {
						exist,
						size,
						create() {
							Deno.mkdirSync(portableHomePath, { recursive: true });
							exist.set(true);
						},
						clear() {
							for (const entry of Deno.readDirSync(portableHomePath)) {
								const entryPath = path.join(portableHomePath, entry.name);
								Deno.removeSync(entryPath, { recursive: true });
							}
							size.set(0);
						},
						delete() {
							Deno.removeSync(portableHomePath, { recursive: true });
							exist.set(false);
							size.set(0);
						},
					},
				};
			} else if (execPath === "distrobox" || execPath === "distrobox-enter") {
				typeInfo = {
					name: "distrobox",
				};
			} else {
				typeInfo = {
					name: "unknown",
				};
			}

			return {
				file: fileStats,
				raw: desktop,
				data: {
					name,
					description,
					exec,
					execPath,
					icon,
					type: typeInfo,
				},
			};
		} catch (throwed) {
			console.error(throwed);
			return null;
		}
	});

	return appEntries.filter((entry) => entry !== null).sort((a, b) =>
		(b.file.mtime?.getTime() ?? b.file.ctime?.getTime() ?? -1) -
		(a.file.mtime?.getTime() ?? a.file.ctime?.getTime() ?? -1)
	).sort((a, b) => a.data.name.localeCompare(b.data.name));
}
