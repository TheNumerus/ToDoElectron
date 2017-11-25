export class HelperUI {
	public static returnColor (color: string) {
		switch (color) {
		case 'red':
			return '#eb5a46'
		case 'yellow':
			return '#f2d600'
		case 'purple':
			return '#c377e0'
		case 'green':
			return '#61bd4f'
		case 'blue':
			return '#0079bf'
		case 'sky':
			return '#00c2e0'
		case 'orange':
			return '#ffab4a'
		case 'pink':
			return '#ff80ce'
		case 'lime':
			return '#51e898'
		case 'black':
			return '#4d4d4d'
		default:
			return 'rgba(128,128,128,0)'
		}
	}

	public static returnDueState (time: number): DueStates {
		const today = new Date()
		if (wasDueToday(time)) {
			return DueStates.overdueNear
		} else if (time < today.getTime()) {
			return DueStates.overdue
		} else if (isTommorowOrNear(time)) {
			return DueStates.near
		} else {
			return DueStates.later
		}
	}
}

export enum DueStates {
	overdue,
	overdueNear,
	near,
	later,
	completed
}
// #region non exported functions
/**
 * checks if due date is tommorow or before that
 */
function isTommorowOrNear (time: number): boolean {
	const twoDaysLater = new Date(Date.now() + 172800000)
	const endOfTommorow = new Date(twoDaysLater.getFullYear(), twoDaysLater.getMonth(), twoDaysLater.getDate())
	return endOfTommorow.getTime() > time
}
/**
 * checks if due date was today
 */
function wasDueToday (time: number): boolean {
	const today = new Date()
	const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
	return todayMidnight.getTime() < time && time < Date.now()
}
// #endregion
