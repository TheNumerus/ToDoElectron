const {BrowserWindow, ipcMain} = require('electron')
const URL = require('url').URL
const OAuth = require('oauth').OAuth
const TrelloApiNet = require('./trelloApiNet')
const TrelloApiIO = require('./trelloApiIO')
const GlobalProperties = require('./globalProperties')
const windowManager = require('./windowManager')
const cacheModule = require('./cache')

// constants and variables for connection to trello api
const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
const oauth = new OAuth(requestURL, accessURL, GlobalProperties.trelloAppKey, GlobalProperties.trelloSecretKey, '1.0A', 'todoapp://trelloauth', 'HMAC-SHA1')
var verificationToken = ''
// store authentification window variable here, so we can close it from another function
var authorizeWindow

/**
 * Handler for ipc calls from renderer process
 */
function handleIpcCalls () {
	ipcMain.on('trelloAuthorize', () => {
		authorize()
	})

	ipcMain.on('trelloGetAllUserInfo', (event) => {
		TrelloApiNet.getAllUserInfo((json) => {
			event.sender.send('trelloGetAllUserInfo-reply', json)
		})
	})

	ipcMain.on('trelloGetBoards', (event) => {
		var boards = cacheModule.calls.trello.getBoards()
		// handle empty cache and old cache
		if (cacheModule.calls.helper.checkInvalidity(boards)) {
			TrelloApiNet.getBoards((json) => {
				// format data for internal use
				boards.values = []
				json.forEach((element) => {
					boards.values.push({id: element.id, name: element.name})
				})
				boards.date = Date.now()
				cacheModule.calls.trello.setBoards(boards)
				cacheModule.saveCache()
				event.sender.send('trelloGetBoards-reply', json)
			})
		} else {
			event.sender.send('trelloGetBoards-reply', boards.values)
		}
	})

	ipcMain.on('trelloGetBoardData', (event, boardId, forceUpdate) => {
		var boardData = cacheModule.calls.trello.getBoardData(boardId)
		if (forceUpdate === true) {
			getBoardData(boardId, boardData, event)
			return
		}
		if (cacheModule.calls.helper.checkInvalidity(boardData)) {
			getBoardData(boardId, boardData, event)
		} else {
			getBackground(boardData.prefs, event)
			event.sender.send('trelloGetBoardData-reply', boardData)
		}
	})

	ipcMain.on('trelloOpenBoard', (event, arg) => {
		windowManager.openURL(new URL('file://' + __dirname + '/board.html?id=' + arg).toString())
	})

	ipcMain.on('trelloAddCard', (event, idList, name) => {
		cacheModule.calls.trello.addCard(idList, name)
		// TODO add offline card adding
		TrelloApiNet.addCard({name: 'testCard', idList: idList})
	})

	ipcMain.on('trelloGetCardData', (event, idCard) => {
		// TODO add update function
		var cardData = cacheModule.calls.trello.getCard(idCard)
		if (cardData.idChecklists.length === 0) {
			event.sender.send('trelloGetCardData-reply', cardData)
		}
		cardData['checklistData'] = []
		for (var i = 0; i < cardData.idChecklists.length; i++) {
			TrelloApiNet.getChecklist(cardData.idChecklists[i], (json) => {
				cardData.checklistData.push(json)
				if (cardData.checklistData.length === cardData.idChecklists.length) {
					event.sender.send('trelloGetCardData-reply', cardData)
				}
			})
		}
	})

	ipcMain.on('trelloOpenCard', (event, arg) => {
		windowManager.openURL(new URL('file://' + __dirname + '/trelloDetails.html?id=' + arg).toString())
	})

	ipcMain.on('trelloGetChecklist', (event, arg) => {
		TrelloApiNet.getChecklist(arg, (json) => {
			event.sender.send('trelloGetChecklist-reply', json)
		})
	})

	function getBoardData (boardId, boardData, event) {
		TrelloApiNet.getBoardData(boardId, (json) => {
			boardData.values = json.lists
			boardData.prefs = json.prefs
			// sort cards
			for (var i = 0; i < boardData.values.length; i++) {
				boardData.values[i].cards = []
				json.cards.forEach((card) => {
					if (card.idList === boardData.values[i].id) {
						boardData.values[i].cards.push(card)
					}
				})
			}
			getBackground(boardData.prefs, event)
			boardData.date = Date.now()
			cacheModule.calls.trello.setBoardData(boardId, boardData)
			cacheModule.saveCache()
			event.sender.send('trelloGetBoardData-reply', boardData, boardId)
		})
	}

	function getBackground (prefs, event) {
		// download background if necessary
		if (prefs.backgroundImage !== null) {
			TrelloApiNet.getBackground(prefs.backgroundImage, (path) => {
				event.sender.send('trelloSetBackground', path)
			})
		} else if (prefs.backgroundColor !== null) {
			event.sender.send('trelloSetBackground', prefs.backgroundColor)
		}
	}
}

/**
 * Function for authorizing Trello API
 */
function authorize () {
	oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
		if (error) throw error
		verificationToken = tokenSecret
		authorizeWindow = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: false, webSecurity: false, allowRunningInsecureContent: true } })
		authorizeWindow.loadURL(`${authorizeURL}?oauth_token=${token}&name=${GlobalProperties.appName}&expires=never&scope=read,write,account`)
	})
}
/**
 * Callback function for authorizing Trello API
 * @param {} url - custom adress to parse data from
 */
function authorizeCallback (url) {
	// close authentification window, because we don't need it at this point
	authorizeWindow.close()
	// parse oauth values
	var query = new URL(url)
	const oauthToken = query.searchParams.get('oauth_token')
	const oauthVerifier = query.searchParams.get('oauth_verifier')
	oauth.getOAuthAccessToken(oauthToken, verificationToken, oauthVerifier, (error, accessToken, accessTokenSecret, results) => {
		if (error) throw error
		// regenerate trello api access with new access tokens
		cacheModule.calls.trello.setToken(accessToken)
		cacheModule.calls.trello.setUsed(true)
		TrelloApiNet.initialize()
		cacheModule.saveCache()
	})
}

function initialize () {
	return new Promise((resolve, reject) => {
		handleIpcCalls()
		TrelloApiNet.initialize()
		TrelloApiIO.initialize()
		resolve()
	})
}
module.exports = {
	authorize: authorize,
	authorizeCallback: authorizeCallback,
	initialize: initialize
}
