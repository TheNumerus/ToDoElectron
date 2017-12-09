import * as FontAwesomeIcon from '@fortawesome/react-fontawesome'
import {ipcRenderer, remote} from 'electron'
import * as path from 'path'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {TrelloInterfacesProps} from './trelloInterfacesProps'
const globalProperties = remote.require('./globalProperties').default

class AppInfoBar extends React.Component<any, any> {
	public render () {
		return (
			<div className='bottomInfo'>
				Version {globalProperties.getAppVersion()} | Node.js {process.versions.node} | Chromium {process.versions.chrome} | Electron {process.versions.electron}
			</div>
		)
	}
}

class TrelloModule extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.authorize = this.authorize.bind(this)
		this.getBoards = this.getBoards.bind(this)
		this.state = {boards: [], updating: false}
	}

	public authorize () {
		ipcRenderer.send('trelloAuthorize')
	}
	public componentDidMount () {
		ipcRenderer.on('trelloGetBoards-reply', (event, boards) => {
			this.setState({boards, updating: false})
		})
	}

	public componentWillReceiveProps (nextprops) {
		if (nextprops.authorized && !this.state.updating) {
			ipcRenderer.send('trelloGetBoards')
			this.setState({updating: true})
		}
	}

	public getBoards () {
		if (!this.state.updating) {
			ipcRenderer.send('trelloGetBoards')
			this.setState({updating: true})
		}
	}

	public render () {
		let button
		let boards
		let authorizedText
		if (this.props.authorized && this.state.boards.values !== undefined) {
			button = <button className='button' onClick={this.getBoards}>Get boards</button>
			boards = this.state.boards.values.map((board) => {
				return <BoardButton boardData={board} key={board.id} changePage={this.props.changePage}/>
			})
			boards.push(<AddBoardButton key='add'/>)
			authorizedText = <span style={{fontSize: '50%'}}>- authorized</span>
		} else if (this.props.authorized && this.state.boards.length === 0) {
			boards = [<AddBoardButton key='add'/>]
		} else {
			button = <button className='button' onClick={this.authorize}>Authorize Trello</button>
			boards = null
			authorizedText = null
		}
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<FontAwesomeIcon icon={['fab', 'trello']}/> Trello {authorizedText}
				</div>
				{button}
				<div className='dataContainer'>{boards}</div>
			</div>
		)
	}
}

class BoardButton extends React.Component<TrelloInterfacesProps.IBoardButtonProps, any> {
	constructor (props) {
		super(props)
		this.openBoard = this.openBoard.bind(this)
		this.state = {starred: false}
	}

	public openBoard (event: React.MouseEvent<HTMLDivElement>) {
		this.props.changePage('trelloBoard', this.props.boardData.id)
	}

	public render () {
		// handle background
		let style
		if (this.props.boardData.prefs.backgroundImage === null) {
			style = {backgroundColor: this.props.boardData.prefs.backgroundColor}
		} else {
			const bgrImgUrl = this.props.boardData.prefs.backgroundImageScaled[0].url
			const bgrImg = bgrImgUrl.match(/.*\/(.*[.].*)/)[1]
			const pathToImage = path.join(globalProperties.getPath(), 'background', 'thumbs', bgrImg).replace(/\\/g, '/')
			style = {backgroundImage: `url(${pathToImage})`}
		}
		return (
			<div className='boardBtn' onClick={this.openBoard}>
				<div className='boardBtnCover' style={style}>
					<BoardStar boardData={this.props.boardData}/>
				</div>
				<div className='boardBtnCaption'><span>{this.props.boardData.name}</span></div>
			</div>
		)
	}
}

class BoardStar extends React.Component<any, any> {
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
				style={{marginLeft: 'auto'}}>
				{star}
			</div>
		)
	}
}

class AddBoardButton extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.createBoard = this.createBoard.bind(this)
	}

	public createBoard () {
		alert('Does nothing yet')
	}

	public render () {
		return (
			<div className='boardBtn' onClick={this.createBoard}>
				<div className='boardBtnCover' style={{backgroundColor: '#888'}}><FontAwesomeIcon icon='plus' size='4x' className='addBoardPlus'/></div>
				<div className='boardBtnCaption'><span>Create board</span></div>
			</div>
		)
	}
}

class GoogleModule extends React.Component<any, any> {
	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
				<FontAwesomeIcon icon={['fab', 'google']}/> Google Calendar - coming soon
				</div>
			</div>
		)
	}
}

class OfflineModule extends React.Component<any, any> {
	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
				<FontAwesomeIcon icon='sticky-note'/> Offline notes - coming soon
				</div>
			</div>
		)
	}
}

class HelperModule extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.clearCache = this.clearCache.bind(this)
		this.clearImageCache = this.clearImageCache.bind(this)
	}

	public clearCache () {
		ipcRenderer.send('clearCache')
	}

	public clearImageCache () {
		ipcRenderer.send('clearImageCache')
	}

	public render () {
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
				<FontAwesomeIcon icon='info-circle'/> Helper
				</div>
				<button className='button' onClick={this.clearCache}>Clear cache</button>
				<button className='button' onClick={this.clearImageCache}>Clear image cache</button>
			</div>
		)
	}
}

export default class Homepage extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.clearCache = this.clearCache.bind(this)
		this.state = {trelloAuthorized: false}
		ipcRenderer.send('readyToShow')
	}

	public componentDidMount () {
		ipcRenderer.send('trelloIsAuthorized')
		ipcRenderer.on('trelloIsAuthorized-reply', (event, data) => {
			if (data) {
				ipcRenderer.send('trelloGetBoards')
			}
			this.setState({trelloAuthorized: data})
		})
	}

	public clearCache () {
		ipcRenderer.send('clearCache')
	}

	public render () {
		return (
			<div>
				<Header changePage={this.props.changePage}/>
				<TrelloModule authorized={this.state.trelloAuthorized} changePage={this.props.changePage}/>
				<GoogleModule/>
				<OfflineModule/>
				<HelperModule/>
				<AppInfoBar/>
			</div>
		)
	}
}

class Header extends React.Component<any, any> {
	constructor (props) {
		super(props)
		this.goToSettings = this.goToSettings.bind(this)
	}

	public goToSettings () {
		this.props.changePage('settings')
	}

	public render () {
		return (
			<div className='titleHeader'>
				<h1>ToDoElectron</h1>
				<button className='buttonHeader' onClick={this.goToSettings} style={{marginLeft: 'auto'}}>
					<FontAwesomeIcon icon='wrench' size='3x'/>
				</button>
			</div>
		)
	}
}
