export function tryCatch<T>(tryFn: () => T): T | undefined;
export function tryCatch<T, U>(tryFn: () => T, catchFn: (throwed: unknown) => U): T | U;
export function tryCatch<T, U>(tryFn: () => T, catchFn?: (throwed: unknown) => U) {
	try {
		return tryFn();
	} catch (error) {
		return catchFn?.(error);
	}
}
