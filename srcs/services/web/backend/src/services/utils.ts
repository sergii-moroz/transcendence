const COLORS: Record<string, string> = {
	INFO: '\x1b[32m',    // green
	ERROR: '\x1b[31m',   // red
	WARN: '\x1b[33m',    // yellow
	DEBUG: '\x1b[36m',   // cyan
	RESET: '\x1b[0m'     // reset
};

console.custom = function (prefix: string, ...args: any[]) {
	const now = new Date();
	const timestamp = now.toISOString().split('T')[1].replace('Z', '');
	const formattedTime = timestamp.slice(0, 12); // e.g., "16:32:27.536"

	const color = COLORS[prefix.toUpperCase()] || '';
	const reset = COLORS.RESET;

	console.log(`[${formattedTime}] ${color}${prefix}${reset}:`, ...args);
};
