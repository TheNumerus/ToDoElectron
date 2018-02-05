import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { changePage } from '../../actions'
import { TrelloTypes } from '../../trelloInterfaces'
import BoardStar from './boardStar'

class BoardButton extends React.Component<IBoardButtonProps, {}> {
	public openBoard (event: React.MouseEvent<HTMLDivElement>) {
		this.props.dispatch(changePage('TRELLO_BOARD', this.props.boardData.id))
	}

	public render () {
		// handle background
		const style = {backgroundColor: this.props.boardData.prefs.backgroundColor}
		return (
			<div className='boardBtn' onClick={(event) => this.openBoard(event)}>
				<div className='boardBtnCover' style={style}>
					<BoardStar boardData={this.props.boardData}/>
				</div>
				<div className='boardBtnCaption'><span>{this.props.boardData.name}</span></div>
			</div>
		)
	}
}

export default connect()(BoardButton)

interface IBoardButtonProps {
	boardData: TrelloTypes.BoardData,
	dispatch: any
}
