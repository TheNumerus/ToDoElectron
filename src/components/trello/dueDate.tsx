import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as HelperUI from '../../HelperUI'
import {TrelloInterfacesProps} from '../../trelloInterfacesProps'
import Label from './label'

const DueDate: React.SFC<TrelloInterfacesProps.ICardDataProps> = (props) => {
	const classes = ['dueLabel']
	const due = props.cardData.due
	// handle non set due date
	if (due === null) { return null }
	const date = new Date(due)
	const today = new Date()
	let dateString = ` ${date.getDate()}. ${date.getMonth() + 1}. ${today.getFullYear() === date.getFullYear() ? '' : date.getFullYear()}`
	const clock = ` - ${date.getHours()}:${date.getMinutes() > 9 ? date.getMinutes() : '0' + date.getMinutes()}`
	if (props.cardData.dueComplete) {
		classes.push('dueComplete')
	} else {
		switch (HelperUI.returnDueState(date.getTime())) {
		case HelperUI.DueStates.overdueNear:
			classes.push('dueOverdueNear')
			dateString += clock
			break
		case HelperUI.DueStates.overdue:
			classes.push('dueOverdue')
			break
		case HelperUI.DueStates.near:
			classes.push('dueNear')
			dateString += clock
			break
		case HelperUI.DueStates.later:
			break
		default:
			throw new Error(`Wrong date on card with id ${props.cardData.id}`)
		}
	}
	return (
		<div className={classes.join(' ')}><FontAwesomeIcon icon={['far', 'calendar']}/>{dateString}</div>
	)
}

export default DueDate
