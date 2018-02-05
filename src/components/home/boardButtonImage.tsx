import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { changePage } from '../../actions'
import * as HelperUI from '../../HelperUI'
import { TrelloTypes } from '../../trelloInterfaces'
import BoardStar from './boardStar'

class BoardButtonImage extends React.Component<IBoardButtonImageProps, IBoardButtonImageState> {
	public url
	constructor (props) {
		super(props)
		this.openBoard = this.openBoard.bind(this)
		this.url = HelperUI.getBgrImagePathFromURL(props.boardData.prefs.backgroundImageScaled[1].url, {preview: true})
		this.state = {imgLoaded: false}
	}

	public openBoard (event: React.MouseEvent<HTMLDivElement>) {
		this.props.dispatch(changePage('TRELLO_BOARD', this.props.boardData.id))
	}

	public imageLoaded () {
		this.setState({imgLoaded: true})
	}

	public componentWillReceiveProps (nextprops) {
		this.url = HelperUI.getBgrImagePathFromURL(nextprops.boardData.prefs.backgroundImageScaled[1].url, {preview: true})
	}

	public render () {
		// handle background
		const style = {backgroundColor: HelperUI.mixColors(this.props.boardData.prefs.backgroundBottomColor,
				this.props.boardData.prefs.backgroundTopColor)}
		const imageClasses = ['boardBtnCoverImage']
		if (this.props.imgDownloaded && this.state.imgLoaded) {
			imageClasses.push('anim')
		}
		const url = this.props.imgDownloaded ? this.url : ''
		return (
			<div className='boardBtn' onClick={this.openBoard}>
				<div className='boardBtnCover' style={style}>
					<img className={imageClasses.join(' ')} src={url} onLoad={() => this.imageLoaded()}/>
					<BoardStar boardData={this.props.boardData}/>
				</div>
				<div className='boardBtnCaption'><span>{this.props.boardData.name}</span></div>
			</div>
		)
	}
}

export default connect()(BoardButtonImage)

interface IBoardButtonImageProps {
	boardData: TrelloTypes.BoardData,
	dispatch: any
	imgDownloaded: boolean
}

interface IBoardButtonImageState {
	imgLoaded: boolean
}
