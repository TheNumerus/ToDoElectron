export default class HelperUI {
	static returnColor (color) {
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

	static returnDueState (time) {
		var today = new Date()
		if (wasDueToday(time)) {
			return this.dueStates.overdueNear
		} else if (time < today.getTime()) {
			return this.dueStates.overdue
		} else if (isTommorowOrNear(time)) {
			return this.dueStates.near
		} else {
			return this.dueStates.later
		}
	}

	static get dueStates () {
		return {
			overdue: 0,
			overdueNear: 1,
			near: 2,
			later: 3,
			completed: 4
		}
	}
}

// #region non exported functions
/** 
 * checks if due date is tommorow or before that
 * @param {number} time 
 * @returns {boolean}
 */
function isTommorowOrNear (time) {
	var twoDaysLater = new Date(Date.now() + 172800000)
	var endOfTommorow = new Date(twoDaysLater.getFullYear(), twoDaysLater.getMonth(), twoDaysLater.getDate())
	return endOfTommorow.getTime() > time
}
/**
 * checks if due date was today
 * @param {number} time 
 * @returns {boolean}
 */
function wasDueToday (time) {
	var today = new Date()
	var todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
	return todayMidnight.getTime() < time && time < Date.now()
}
// #endregion
