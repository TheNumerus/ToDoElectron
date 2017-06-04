const {BrowserWindow, ipcMain} = require('electron')
const URL = require('url').URL
const OAuth = require('oauth').OAuth
const TrelloAPI = require('./trelloApi')
const trelloAppKey = '01ad9ee9ec7a92b20ddd261ff55820f4'
const trelloSecretKey = '7b455f5b12ca3b432bb34c381e00b594b53adca7fc5789449a1569f59ab2449c'
const appName = 'ToDoElectron'

// constants and variables for connection to trello api
const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
const oauth = new OAuth(requestURL, accessURL, trelloAppKey, trelloSecretKey, '1.0A', 'todoapp://trelloauth', 'HMAC-SHA1')
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
		TrelloAPI.getAllUserInfo((json) => {
			event.sender.send('trelloGetAllUserInfo-reply', json)
		})
	})

	ipcMain.on('trelloGetBoards', (event) => {
		TrelloAPI.getBoards((json) => {
			event.sender.send('trelloGetBoards-reply', json)
		})
	})

	ipcMain.on('trelloGetBoardData', (event, boardId) => {
		TrelloAPI.getBoardData(boardId, (json) => {
			event.sender.send('trelloGetBoardData-reply', json)
		})
	})

	ipcMain.on('trelloGetBatchListData', (event, lists) => {
		var listsSubset = []
		for (var i = 0; i < lists.length; i += 10) {
			listsSubset.push(lists.slice(i, i + 10 > lists.length ? lists.length : i + 10))
		}
		TrelloAPI.getBatchListData(listsSubset, (json) => {
			event.sender.send('trelloGetBatchListData-reply', json)
		})
	})

	ipcMain.on('trelloOpenBoard', (event, arg) => {
		require('./windowManager').openURL(new URL('file://' + __dirname + '/board.html?id=' + arg).toString())
	})
}

/**
 * Function for authorizing Trello API
 */
function authorize () {
	oauth.getOAuthRequestToken(function (error, token, tokenSecret, results) {
		if (error !== null) {
			console.log(`${error}`)
		}
		verificationToken = tokenSecret
		authorizeWindow = new BrowserWindow({ width: 800, height: 600 })
		authorizeWindow.loadURL(`${authorizeURL}?oauth_token=${token}&name=${appName}&expires=never`)
	})
}
/**
 * Callback function for authorizing Trello API
 * @param {custom adress to parse data from} url
 */
function authorizeCallback (url) {
	// close authentification window, because we don't need it at this point
	authorizeWindow.close()
	// parse oauth values
	var query = URL.parse(url, true).query
	const oauthToken = query.oauth_token
	const oauthVerifier = query.oauth_verifier
	oauth.getOAuthAccessToken(oauthToken, verificationToken, oauthVerifier, (error, accessToken, accessTokenSecret, results) => {
		if (error !== null) {
			console.log(`${error}`)
		}
		// regenerate trello api access with new access tokens
		console.log('Trello api authorized')
		TrelloAPI.intialize(trelloAppKey, accessToken)
	})
}

/**
 * Loads token from storage
 */
function loadToken () {
	TrelloAPI.intialize(trelloAppKey, '')
	TrelloAPI.loadToken()
}

module.exports = {
	trelloAppKey: trelloAppKey,
	handleIpcCalls: handleIpcCalls,
	authorize: authorize,
	authorizeCallback: authorizeCallback,
	loadToken: loadToken

}
