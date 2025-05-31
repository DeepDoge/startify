import GLib from "@girs/GLib";

export type Next = (next: () => void) => void;
export type Timeout = (ms: number) => Next;
export const timeout: Timeout = (ms) => {
	return (next) =>
		GLib.timeout_add(GLib.PRIORITY_DEFAULT, ms, () => {
			next();
			return GLib.SOURCE_REMOVE;
		});
};

export function coroutine(
	fn: (timeout: Timeout) => Generator<Next, void, unknown>,
): () => void {
	const generator = fn(timeout);
	const next = () => generator.next().value?.(next);
	next();
	return () => generator.return?.();
}
