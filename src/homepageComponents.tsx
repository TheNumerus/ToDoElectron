import {ipcRenderer, remote} from 'electron'
import * as path from 'path'
import * as React from 'React'
import * as ReactDOM from 'react-dom'
import {HelperUI} from './HelperUI'
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
		this.getUserInfo = this.getUserInfo.bind(this)
		this.getBoards = this.getBoards.bind(this)
		this.state = {data: '', updating: false}
	}

	public authorize () {
		ipcRenderer.send('trelloAuthorize')
	}
	public componentDidMount () {
		ipcRenderer.on('trelloGetAllUserInfo-reply', (event, value) => {
			this.setState({data: JSON.stringify(value)})
		})
		ipcRenderer.on('trelloGetBoards-reply', (event, boards) => {
			const boardComponents = boards.values.map((board) => {
				return <BoardButton boardData={board} key={board.id} changePage={this.props.changePage}/>
			})
			boardComponents.push(<AddBoardButton/>)
			this.setState({data: boardComponents, updating: false})
		})
	}
	public getUserInfo () {
		ipcRenderer.send('trelloGetAllUserInfo')
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
		const showAuthBtns = this.props.authorized
		const authorizedEelements = showAuthBtns ? [<button className='button' onClick={this.getUserInfo}>Get all user info</button>,
			<button className='button' onClick={this.getBoards}>Get boards</button>]
			: null
		const authorizeButton = showAuthBtns ? null
			: <button className='button' onClick={this.authorize}>Authorize Trello</button>
		const authorized = showAuthBtns ? <span style={{fontSize: '50%'}}>- authorized</span>
			: null
		return (
			<div className='homeModule'>
				<div className='moduleTitle'>
					<i className='fa fa-trello'></i> Trello {authorized}
				</div>
				{authorizeButton}
				{authorizedEelements}
				<div className='dataContainer'>{this.state.data}</div>
			</div>
		)
	}
}

class BoardButton extends React.Component<TrelloInterfacesProps.IBoardButtonProps, any> {
	public starElement
	constructor (props) {
		super(props)
		this.openBoard = this.openBoard.bind(this)
		this.handleStar = this.handleStar.bind(this)
		this.state = {starred: false}
	}

	public openBoard (event: React.MouseEvent<HTMLDivElement>) {
		if (event.target !== this.starElement) {
			this.props.changePage('trelloBoard', this.props.boardData.id)
		}
	}

	public componentWillReceiveProps (nextProps: TrelloInterfacesProps.IBoardProps) {
		this.setState({starred: nextProps.boardData.starred})
	}

	public handleStar () {
		// not working
		ipcRenderer.send('trelloUpdateBoard', this.props.boardData.id, [['starred', !this.state.starred]])
		this.setState({starred: !this.state.starred})
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
		// handle star
		const starClasses = ['fa', 'star']
		if (this.state.starred) {
			starClasses.push('fa-star', 'star-full')
		} else {
			starClasses.push('fa-star-o', 'star-empty')
			if (this.props.boardData.prefs.backgroundBrightness === 'dark') {
				starClasses.push('star-empty-dark')
			}
		}
		return (
			<div className='boardBtn' onClick={this.openBoard}>
				<div className='boardBtnCover' style={style}>
					<i className={starClasses.join(' ')} onClick={this.handleStar} ref={(element) => {this.starElement = element}}/>
				</div>
				<div className='boardBtnCaption'><span>{this.props.boardData.name}</span></div>
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
		const style = {
			color: 'white',
			margin: '10px auto'
		}
		return (
			<div className='boardBtn' onClick={this.createBoard}>
				<div className='boardBtnCover' style={{backgroundColor: '#888'}}><i className='fa fa-plus fa-4x' style={style}></i></div>
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
					<i className='fa fa-google'></i> Google Calendar - coming soon
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
					<i className='fa fa-sticky-note '></i> Offline notes - coming soon
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
					<i className='fa fa-info-circle'></i> Helper
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
					<i className='fa fa-wrench fa-3x'></i>
				</button>
			</div>
		)
	}
}
