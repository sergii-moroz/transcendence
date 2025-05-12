export const formatString = (str: string, groupSize: number = 4, separator: string = "-"): string => {
	if (str.length === 0) {
		return "";
	}
	// if (groupSize <= 0) {
	// 	throw new RangeError("Group size must be greater than 0");
	// }
	const regex = new RegExp(`.{1,${groupSize}}`, "g");
	const groups = str.match(regex);
	return groups ? groups.join(separator) : str;
	// return str.match(new RegExp(`.{1,${groupSize}}`, "g")).join(separator);
	};
