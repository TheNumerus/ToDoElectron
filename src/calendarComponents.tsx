import * as React from 'React'
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthLenghts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

class DayTile extends React.Component<any, any> {
	public render () {
		const weekday = this.props.date.getDay()
		const isWeekend = weekday === 0 || weekday === 6
		const isMonthRight = this.props.date.getMonth() === this.props.intendedMonth
		const style = {
			backgroundColor: isWeekend ? '#EEEEEE' : '',
			color: isMonthRight ? '#000' : '#888'
		}
		return (
			<td style={style} className='daytile'>{this.props.date.getDate()}</td>
		)
	}
}

export class CalendarRoot extends React.Component<any, any> {
	public render () {
		const month = this.props.date.getMonth()
		const year = this.props.date.getFullYear()
		const firstDayInMonth = new Date(year, month)
		if (isLeap(year)) {
			monthLenghts[1] = 29
		} else {
			monthLenghts[1] = 28
		}
		const weeksToRender = getWeeksToRender(firstDayInMonth)
		const weekRows = []
		for (let i = 0; i < weeksToRender; i++) {
			const element = <WeekRow intendedMonth={month} date={new Date(year, month, i * 7 + 1 - firstDayInMonth.getDay())}/>
			weekRows.push(element)
		}
		// we add one empty element for week number column
		const dayNames = [<th></th>]
		for (let i = 0; i < 7; i++) {
			const element = <th>{days[i]}</th>
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

class WeekRow extends React.Component<any, any> {
	public render () {
		const date = this.props.date
		const elements = [<td className='weekNumber'>{getWeekNumber(date)}</td>]
		for (let i = 0; i < 7; i++) {
			const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + i)
			elements.push(<DayTile intendedMonth={this.props.intendedMonth} date={dateDay}/>)
		}
		return (
			<tr className='weekrow' >{elements}</tr>
		)
	}
}

function getFirstWeekInYear (year) {
	const firstDayInYear = new Date(year, 0)
	if (firstDayInYear.getDay() > 4) {
		// start of the year isn't a week 1
		const offsetToStart = 7 - firstDayInYear.getDay()
		return new Date(year, 0, firstDayInYear.getDate() + offsetToStart)
	} else if (firstDayInYear.getDay() < 4) {
		// start of the year is a week 1
		const offsetToStart = -2 - firstDayInYear.getDay()
		return new Date(year, 0, firstDayInYear.getDate() + offsetToStart)
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
	const year = date.getFullYear()
	const firstWeekStart = getFirstWeekInYear(year)
	const weekNumber = Math.ceil((date - firstWeekStart.valueOf()) / 604800000)
	return weekNumber
}
