const sizes = ["bytes", "KB", "MB", "GB", "TB", "PB"] as const;
export function formatBytes(bytes: number, decimals = 2) {
	if (bytes === 0) return `0 ${sizes[0]}` as const;
	const dm = decimals < 0 ? 0 : decimals;
	const i = Math.floor(Math.log(bytes) / Math.log(1000));
	return `${Number((bytes / Math.pow(1024, i)).toFixed(dm))} ${sizes[i]!}` as const;
}
