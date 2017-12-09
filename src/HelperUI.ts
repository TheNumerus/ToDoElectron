const labelMap = new Map([
	['green', {color: '#61bd4f', pos: 0}],
	['yellow', {color: '#f2d600', pos: 1}],
	['orange', {color: '#ffab4a', pos: 2}],
	['red', {color: '#eb5a46', pos: 3}],
	['purple', {color: '#c377e0', pos: 4}],
	['blue', {color: '#0079bf', pos: 5}],
	['sky', {color: '#00c2e0', pos: 6}],
	['lime', {color: '#51e898', pos: 7}],
	['pink', {color: '#ff80ce', pos: 8}],
	['black', {color: '#4d4d4d', pos: 9}],
	[null, {color: '#808080', pos: 10}]
])

export function returnColor (color: string) {
	const value = labelMap.get(color)
	if (value !== undefined) {
		return value.color
	} else {
		throw new Error('Invalid color')
	}
}

export function returnLabelIndex (color: string) {
	const value = labelMap.get(color)
	if (value !== undefined) {
		return value.pos
	} else {
		throw new Error('Invalid color')
	}
}

export function returnDueState (time: number): DueStates {
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
