import * as path from "@std/path";

export function getDirectorySize(dirPath: string): number {
	let totalSize = 0;

	for (const entry of Deno.readDirSync(dirPath)) {
		const fullPath = path.join(dirPath, entry.name);
		const stat = Deno.statSync(fullPath);

		if (stat.isFile) {
			totalSize += stat.size;
		} else if (stat.isDirectory) {
			totalSize += getDirectorySize(fullPath); // recursive call
		}
	}

	return totalSize;
}
