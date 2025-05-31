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

type BuildTuple<Length extends number, Acc extends unknown[] = []> = Acc["length"] extends Length ? Acc
	: BuildTuple<Length, [unknown, ...Acc]>;
type Add<A extends number, B extends number> = [...BuildTuple<A>, ...BuildTuple<B>]["length"] & number;
type Split<T extends string, S extends string> = T extends `${infer TBefore}${S}${infer TAfter}`
	? [TBefore, ...Split<TAfter, S>]
	: [T];

type ButtonStyles = [
	"suggested-action" | "destructive-action",
	"circular" | "pill",
	"opaque" | "osd",
	"flat",
];
type Combinations<
	T extends string[],
	Result extends string = "",
	Index extends number = 0,
> = Index extends T["length"] ? never
	:
		| `${Result}${Result extends "" ? "" : " "}${T[Index]}`
		| Combinations<T, Result, Add<Index, 1>>
		| Combinations<T, `${Result}${Result extends "" ? "" : " "}${T[Index]}`, Add<Index, 1>>;

export type ButtonClass = Combinations<ButtonStyles> | "image-text-button";

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
