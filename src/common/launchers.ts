import * as path from "jsr:@std/path@1.0.9";
import { HOME, PATH } from "./constants.ts";
import { DesktopFile, parseDesktopFile } from "./desktop.ts";

export type Launcher = {
	file: Deno.FileInfo;
	raw: DesktopFile;
	data: {
		name: string;
		exec: string;
		execPath: string;
		icon: string | null;
		typeInfo: Launcher.TypeInfo;
	};
};
export declare namespace Launcher {
	export type TypeInfo =
		| {
			type: "unknown";
		}
		| {
			type: "appimage";
			portable: boolean;
		}
		| {
			type: "distrobox";
		};
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

			const icon = desktopEntry["Icon"] ?? null;

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

			let typeInfo: Launcher.TypeInfo;
			if (execPath.toLowerCase().endsWith(".appimage")) {
				const portable = Deno.statSync(`${execPath}.home`).isDirectory;
				typeInfo = {
					type: "appimage",
					portable,
				};
			} else if (execPath === "distrobox" || execPath === "distrobox-enter") {
				typeInfo = {
					type: "distrobox",
				};
			} else {
				typeInfo = {
					type: "unknown",
				};
			}

			return {
				file: fileStats,
				raw: desktop,
				data: {
					name,
					exec,
					execPath,
					icon,
					typeInfo,
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
