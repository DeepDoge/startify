import * as path from "jsr:@std/path@1.0.9";
import { DesktopFile, parseDesktopFile } from "./desktop.ts";

const HOME = Deno.env.get("HOME")!;

export type AppLauncher = {
	desktop: DesktopFile;
	file: Deno.FileInfo;
	parsed: {
		name: string;
		exec: string;
		icon: string | null;
	};
};

export function getAppLaunchers(): AppLauncher[] {
	const dirPath = path.join(HOME, ".local", "share", "applications");
	const dirEntries = Array.from(Deno.readDirSync(dirPath));

	const appEntries = dirEntries.map((entry): AppLauncher | null => {
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

			return {
				desktop,
				file: fileStats,
				parsed: {
					name,
					exec,
					icon,
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
	);
}
