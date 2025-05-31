import * as path from "@std/path";
import { HOME, PATH } from "./constants.ts";
import { DesktopFile, parseDesktopFile } from "./desktop.ts";
import { computed, Sync, sync } from "./signals.ts";
import { coroutine, timeout } from "./utils/coroutine.ts";
import { getDirectorySize } from "./utils/size.ts";
import { tryCatch } from "./utils/try.ts";

export type Launcher = {
	desktop: {
		name: string;
		description: string | null;
		exec: string;
		execPath: string;
		icon: string | null;
		file: Deno.FileInfo;
		raw: DesktopFile;
	};
	info: Launcher.Info;
};
export declare namespace Launcher {
	export type Info =
		| {
			type: "unknown";
		}
		| {
			type: "appimage";
			appimage: {
				exist: Sync<boolean>;
				size: Sync<number>;
			};
			portable: {
				exist: Sync<boolean>;
				size: Sync<number>;
				create(): void;
				clear(): void;
				delete(): void;
			};
		}
		| {
			type: "distrobox";
		};
}

const launcherTypeNameMap: { [K in Launcher.Info["type"]]: string } = {
	appimage: "AppImage",
	distrobox: "Distrobox",
	unknown: "Application",
};
export function formatLauncherTypeName(type: Launcher.Info["type"]) {
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
		const file = Deno.statSync(filePath);
		const fileBuffer = Deno.readFileSync(filePath);
		const fileContent = new TextDecoder("utf-8").decode(fileBuffer);
		try {
			const raw = parseDesktopFile(fileContent);
			const desktopEntry = raw["Desktop Entry"];
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

			let info: Launcher.Info;
			if (execPath.toLowerCase().endsWith(".appimage")) {
				const appimage = (): (Launcher.Info & { type: "appimage" })["appimage"] => {
					const stat = sync<Deno.FileInfo | null>((set) =>
						coroutine(function* () {
							while (true) {
								set(tryCatch(() => Deno.statSync(execPath)) ?? null);
								yield timeout(250);
							}
						})
					);
					const exist = computed(() => (stat.get()?.isFile ?? false));
					const size = computed(() => stat.get()?.size ?? 0);

					return {
						exist,
						size,
					};
				};

				const portable = (): (Launcher.Info & { type: "appimage" })["portable"] => {
					const homePath = `${execPath}.home`;
					const stat = sync<Deno.FileInfo | null>((set) =>
						coroutine(function* () {
							while (true) {
								set(tryCatch(() => Deno.statSync(homePath)) ?? null);
								yield timeout(250);
							}
						})
					);
					const exist = computed(() => stat.get()?.isDirectory ?? false);
					const size = computed(() => stat.get() ? getDirectorySize(homePath) : 0);

					return {
						exist,
						size,
						create() {
							Deno.mkdirSync(homePath, { recursive: true });
						},
						clear() {
							for (const entry of Deno.readDirSync(homePath)) {
								const entryPath = path.join(homePath, entry.name);
								Deno.removeSync(entryPath, { recursive: true });
							}
						},
						delete() {
							Deno.removeSync(homePath, { recursive: true });
						},
					};
				};

				info = {
					type: "appimage",
					appimage: appimage(),
					portable: portable(),
				};
			} else if (execPath === "distrobox" || execPath === "distrobox-enter") {
				info = {
					type: "distrobox",
				};
			} else {
				info = {
					type: "unknown",
				};
			}

			return {
				desktop: {
					name,
					description,
					exec,
					execPath,
					icon,
					file,
					raw,
				},
				info,
			};
		} catch (throwed) {
			console.error(throwed);
			return null;
		}
	});

	return appEntries.filter((entry) => entry !== null).sort((a, b) =>
		(b.desktop.file.mtime?.getTime() ?? b.desktop.file.ctime?.getTime() ?? -1) -
		(a.desktop.file.mtime?.getTime() ?? a.desktop.file.ctime?.getTime() ?? -1)
	).sort((a, b) => a.desktop.name.localeCompare(b.desktop.name));
}
