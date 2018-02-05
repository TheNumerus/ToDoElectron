import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as HelperUI from '../../HelperUI'
import {TrelloInterfacesProps} from '../../trelloInterfacesProps'

const Label: React.SFC<TrelloInterfacesProps.ILabelProps> = (props) => {
	if (props.labelData.color === null) {
		return null
	}
	const style = { backgroundColor: HelperUI.returnColor(props.labelData.color) }
	let name = ''
	if (props.settings.labelNames) {
		name = props.labelData.name
	}
	return (
		<div className='cardLabel' style={style}>{name}</div>
	)
}

export default Label
