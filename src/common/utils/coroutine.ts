import GLib from "@girs/GLib";

type Next = (next: () => void) => void;
type Timeout = (ms: number) => Next;
const timeout: Timeout = (ms) => {
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
