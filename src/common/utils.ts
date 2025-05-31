import Gtk from "@girs/Gtk";
import * as path from "@std/path";

export function bind<T extends Gtk.Widget>(widget: T, startStop: (widget: T) => () => void) {
	let stop: (() => void) | undefined | void;
	widget.connect("realize", () => {
		stop?.();
		stop = startStop(widget);
	});
	widget.connect("unrealize", () => {
		stop?.();
	});
}

export function removeChildren(box: Gtk.Box) {
	while (true) {
		const child = box.get_first_child();
		if (!child) break;
		box.remove(child);
	}
}

/**
 * Core button purpose styles.
 */
type ActionStyle = "suggested-action" | "destructive-action" | "flat" | "raised";

/**
 * Modifier styles for shape and display.
 */
type ShapeStyle = "circular" | "pill" | "opaque" | "osd";

/**
 * Special automatic class.
 */
type AutoClass = "image-text-button";

/**
 * Shape combinations (only unique pairs).
 */
type ShapeCombo =
	| "circular pill"
	| "circular opaque"
	| "circular osd"
	| "pill opaque"
	| "pill osd"
	| "opaque osd";

/**
 * Action + 1 shape
 */
type ActionPlusShape = `${ActionStyle} ${ShapeStyle}`;

/**
 * Action + 2 unique shapes (no duplicates)
 */
type ActionPlusShapeCombo = `${ActionStyle} ${ShapeCombo}`;

/**
 * Valid combinations.
 */
export type ButtonClass =
	| ActionStyle
	| ShapeStyle
	| AutoClass
	| ActionPlusShape
	| ActionPlusShapeCombo
	| ShapeCombo;

type Split<T extends string, S extends string> = T extends `${infer TBefore}${S}${infer TAfter}`
	? [TBefore, ...Split<TAfter, S>]
	: [T];

/**
 * Utility function that accepts only valid class combinations.
 */
export function buttonClass<T extends ButtonClass>(style: T): Split<T, " "> {
	return style.split(" ") as never;
}

export function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

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
