const React = require('react')
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
var monthLenghts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

class DayTile extends React.Component {
	render () {
		var weekday = this.props.date.getDay()
		var isWeekend = weekday === 0 || weekday === 6
		var isMonthRight = this.props.date.getMonth() === this.props.intendedMonth
		var style = {
			backgroundColor: isWeekend ? '#EEEEEE' : '',
			color: isMonthRight ? '#000' : '#888'
		}
		return (
			<td style={style} className='daytile'>{this.props.date.getDate()}</td>
		)
	}
}

class CalendarRoot extends React.Component {
	render () {
		var month = this.props.date.getMonth()
		var year = this.props.date.getFullYear()
		var firstDayInMonth = new Date(year, month)
		if (isLeap(year)) {
			monthLenghts[1] = 29
		} else {
			monthLenghts[1] = 28
		}
		var weeksToRender = getWeeksToRender(firstDayInMonth)
		var weekRows = []
		for (let i = 0; i < weeksToRender; i++) {
			let element = <WeekRow intendedMonth={month} date={new Date(year, month, i * 7 + 1 - firstDayInMonth.getDay())}/>
			weekRows.push(element)
		}
		var dayNames = []
		for (let i = 0; i < 7; i++) {
			let element = <th>{days[i]}</th>
			dayNames.push(element)
		}
		return (
			<table className='calendarTable'>
				<thead><tr>{dayNames}</tr></thead>
				<tbody>{weekRows}</tbody>
			</table>
		)
	}
}

class WeekRow extends React.Component {
	render () {
		var date = this.props.date
		var year = date.getFullYear()
		var month = date.getMonth()
		var day = date.getDate()
		var elements = []
		for (var i = 0; i < 7; i++) {
			var dateDay = new Date(year, month, day + i)
			elements.push(<DayTile intendedMonth={this.props.intendedMonth} date={dateDay}/>)
		}
		return (
			<tr className='weekrow' >{elements}</tr>
		)
	}
}

function getFirstWeekInYear (year) {
	var firstDayInYear = new Date(year, 0)
	if (firstDayInYear.getDay() > 4) {
		// start of the year isn't a week 1
		let offsetToStart = 10 - firstDayInYear.getDay()
		return new Date(year, 0, firstDayInYear.getDate + offsetToStart)
	} else if (firstDayInYear.getDay < 4) {
		// start of the year is a week 1
		let offsetToStart = -2 - firstDayInYear.getDay()
		return new Date(year, 0, firstDayInYear.getDate + offsetToStart)
	} else {
		// year starts on thursday
		return firstDayInYear
	}
}

function isLeap (year) {
	return ((year % 4 === 0) && !(year % 100 === 0)) || (year % 400 === 0)
}

function getWeeksToRender (date) {
	switch (monthLenghts[date.getMonth()]) {
	case 28:
		if (date.getDay === 0) { return 4 }
		return 5
	case 29:
		return 5
	case 30:
		if (date.getDay() === 6) { return 6 }
		return 5
	case 31:
		if (date.getDay() > 4) { return 6 }
		return 5
	default:
		throw new Error('Invalid number of days in month')
	}
}

function getWeekNumber (date) {
	var year = date.getFullYear()
	var month = date.getMonth()
	var firstDayInMonth = new Date(year, month)
	var firstWeekinMonthStart = new Date(year, month, 1 - firstDayInMonth.getDay())
	var firstWeekStart = getFirstWeekInYear(year)
	var weekNumber = Math.floor((firstDayInMonth - firstWeekStart) / 604800000)
	return weekNumber
}

module.exports = {
	CalendarRoot: CalendarRoot
}
