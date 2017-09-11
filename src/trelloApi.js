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

	ipcMain.on('trelloGetBoardData', (event, boardId) => {
		var boardData = cacheModule.calls.trello.getBoardData(boardId)
		if (cacheModule.calls.helper.checkInvalidity(boardData)) {
			TrelloApiNet.getBoardData(boardId, (json) => {
				boardData.values = json.lists
				// sort cards
				for (var i = 0; i < boardData.values.length; i++) {
					boardData.values[i].cards = []
					json.cards.forEach((card) => {
						if (card.idList === boardData.values[i].id) {
							boardData.values[i].cards.push(card)
						}
					})
				}
				boardData.date = Date.now()
				cacheModule.calls.trello.setBoardData(boardId, boardData)
				cacheModule.saveCache()
				event.sender.send('trelloGetBoardData-reply', boardData, boardId)
			})
		} else {
			event.sender.send('trelloGetBoardData-reply', boardData)
		}
	})

	ipcMain.on('trelloOpenBoard', (event, arg) => {
		windowManager.openURL(new URL('file://' + __dirname + '/board.html?id=' + arg).toString())
	})

	ipcMain.on('trelloGetBackground', (event, arg) => {
		TrelloApiNet.getBackground(arg, (value) => {
			event.sender.send('trelloGetBackground-reply', value)
		})
	})
}

/**
 * Function for authorizing Trello API
 */
function authorize () {
	oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
		if (error) throw error
		verificationToken = tokenSecret
		authorizeWindow = new BrowserWindow({ width: 800, height: 600, webPreferences: { nodeIntegration: false, webSecurity: false, allowRunningInsecureContent: true } })
		authorizeWindow.loadURL(`${authorizeURL}?oauth_token=${token}&name=${GlobalProperties.appName}&expires=never`)
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
