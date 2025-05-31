import GLib from "@girs/GLib";

type Timeout = (ms: number) => (next: () => void) => number;
const timeout = (ms: number) => {
	return (next: () => void) => GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => (next(), GLib.SOURCE_REMOVE));
};

export function coroutine(fn: (timeout: Timeout) => Generator<ReturnType<Timeout>, void, unknown>) {
	let stop = false;

	const generator = fn(timeout);
	const next = () => {
		if (stop) return;
		generator.next().value?.(next);
	};
	next();

	return () => {
		stop = true;
	};
}
