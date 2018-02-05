import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {TrelloInterfacesProps} from '../../trelloInterfacesProps'

const CheckListBadge: React.SFC<TrelloInterfacesProps.IBadgesProps> = (props) => {
	if (props.badges.checkItems === 0) {
		return null
	}
	return (
		<div className={props.badges.checkItemsChecked === props.badges.checkItems ? 'checkFull' : ''}>
			<FontAwesomeIcon icon={['far', 'check-square']}/>
			{` ${props.badges.checkItemsChecked}/${props.badges.checkItems}`}
		</div>
	)
}

export default CheckListBadge
