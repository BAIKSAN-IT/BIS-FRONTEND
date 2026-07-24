/* E.I.S - Knitting 색상 */
export const KnttingColorByContent = (flag: string) => {
	switch (flag) {
		case "D":
			return "#FF00FF"; // fuchsia
    case "4D":
      return "#FF00FF"; // fuchsia
    case "4DJQD":
      return "#FF00FF"; // fuchsia
		case "J":
			return "#FFA500";
		case "J.Q":
			return "#C0C0C0"; //Silver
		case "R":
			return "#008000";
		case "S":
			return "#0000FF";
    case "4S":
      return "#0000FF";
    case "4SE":
      return "#0000FF";
    case "Z":
      return "#2E7D32";
    case "4Z":
      return "#2E7D32";
    case "4ZJQD":
      return "#2E7D32";
		case "S.J.Q":
			return "#000080";
		case "S.T":
			return "#800080";
		default:
			return "#000000";
	}
};
