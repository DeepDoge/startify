export type DesktopFile = Record<string, Record<string, string>>;

export function parseDesktopFile(content: string): DesktopFile {
	const result: Record<string, Record<string, string>> = {};
	let currentSection = "";

	for (const line of content.split(/\r?\n/)) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith("#")) continue;

		// Handle section headers
		const sectionMatch = trimmed.match(/^\[(.+)]$/);
		if (sectionMatch?.[1]) {
			currentSection = sectionMatch[1];
			result[currentSection] = {};
			continue;
		}

		// Handle key=value pairs
		const [key, ...rest] = trimmed.split("=");
		if (currentSection && key && rest.length) {
			result[currentSection]![key.trim()] = rest.join("=").trim();
		}
	}

	return result;
}
