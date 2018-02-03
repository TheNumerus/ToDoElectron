import {Event, ipcRenderer} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import * as HelperUI from '../../HelperUI'
import { TrelloTypes } from '../../TrelloInterfaces'

export default class BoardBackground extends React.Component<IBoardBackgroundProps, IBoardBackgroundState> {
	constructor(props) {
		super(props)
		this.state = {bgrDownloaded: false, bgrLoaded: false, bgrSet: false, bgrUrl: '', placeholderUrl: ''}
		this.handleIpc()
	}

	public handleIpc () {
		ipcRenderer.on('trelloSetBackground', (event: Event) => {
			if (this.state.bgrSet) {
				return
			} else if (this.props.boardData.prefs.backgroundColor === undefined) {
				this.setState({bgrUrl: HelperUI.getBgrImagePathFromURL(this.props.boardData.prefs.backgroundImage, {preview: false}), bgrDownloaded: true})
			}
		})
	}

	public componentWillReceiveProps (nextprops) {
		if (this.props.boardData.prefs !== undefined && this.props.boardData.prefs.backgroundColor === undefined) {
			this.setState({placeholderUrl: HelperUI.getBgrImagePathFromURL(this.props.boardData.prefs.backgroundImageScaled[1].url, {preview: true})})
		}
	}

	public componentWillUnmount () {
		ipcRenderer.removeAllListeners('trelloSetBackground')
	}

	public backgroundLoaded () {
		this.setState({bgrLoaded: true})
	}

	public render () {
		// handle non existing data
		if (this.props.boardData.prefs === undefined) {
			return null
		}
		let solid = null
		const images = [<img className='backgroundImagePlaceholder' src={this.state.placeholderUrl} key='placeholder'/>]
		if (this.props.boardData.prefs.backgroundColor !== undefined) {
			// handle solid color
			const solidStyle = {
				backgroundColor: this.props.boardData.prefs.backgroundColor
			}
			solid = <div className='backgroundSolid' style={solidStyle}></div>
		} else {
			// handle image background
			if (this.state.bgrDownloaded && !this.state.bgrLoaded) {
				const image = <img className='backgroundImage' src={this.state.bgrUrl} onLoad={() => this.backgroundLoaded()} key='image'/>
				images.push(image)
			} else {
				const image = <img className='backgroundImage loaded' src={this.state.bgrUrl} key='image'/>
				images.push(image)
			}
		}
		return (
			<div>
				{solid}
				{images}
			</div>
		)
	}
}

interface IBoardBackgroundProps {
	boardData: TrelloTypes.BoardData
}

interface IBoardBackgroundState {
	bgrDownloaded: boolean,
	bgrLoaded: boolean,
	bgrSet: boolean,
	bgrUrl: string,
	placeholderUrl: string
}
