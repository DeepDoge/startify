import Gtk from "@girs/Gtk";

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
