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
