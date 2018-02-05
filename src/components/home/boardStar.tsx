import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {ipcRenderer} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {TrelloInterfacesProps} from '../../trelloInterfacesProps'

export default class BoardStar extends React.Component<TrelloInterfacesProps.IBoardProps, IBoardStarState> {
	constructor (props) {
		super(props)
		this.handleStar = this.handleStar.bind(this)
		this.state = {starred: false, mouseOver: false}
	}

	public handleStar (event) {
		// not working
		ipcRenderer.send('trelloUpdateBoard', this.props.boardData.id, [['starred', !this.state.starred]])
		this.setState({starred: !this.state.starred})
		// stop the click event, so we don't accidentaly open board
		event.stopPropagation()
	}

	public componentWillReceiveProps (nextProps: TrelloInterfacesProps.IBoardProps) {
		this.setState({starred: nextProps.boardData.starred})
	}

	public render () {
		// handle star
		const starClasses = ['star']
		if (this.props.boardData.prefs.backgroundBrightness === 'dark') {
			starClasses.push('star-dark')
		}
		let starStateClass = 'far'
		if (this.state.starred) {
			starStateClass = 'fas'
			starClasses.push('star-full')
		}
		const star = <FontAwesomeIcon icon={[starStateClass, 'star']} className={starClasses.join(' ')}/>
		return (
			<div onClick={this.handleStar}
				onMouseEnter={() => {this.setState({mouseOver: true})}}
				onMouseLeave={() => {this.setState({mouseOver: false})}}
				className='starContainer'>
				{star}
			</div>
		)
	}
}

interface IBoardStarState {
	mouseOver: boolean,
	starred: boolean
}
