import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as HelperUI from '../../HelperUI'
import {TrelloInterfacesProps} from '../../trelloInterfacesProps'
import Label from './label'

const LabelContainer: React.SFC<TrelloInterfacesProps.ILabelContainerProps> = (props) => {
	// sort labels by color
	props.labels.sort((a, b) => {
		// discard uncolored labels
		if (a.color === null || b.color === null) { return 0 }
		return HelperUI.returnLabelIndex(a.color) - HelperUI.returnLabelIndex(b.color)
	})
	// create labels
	const labels = props.labels.map((label) => {
		return <Label labelData={label} settings={props.settings} key={label.id}/>
	})
	return (
		<div className='labelContainer'>
			{labels}
		</div>
	)
}

export default LabelContainer
