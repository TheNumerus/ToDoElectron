const {BrowserWindow, ipcMain} = require('electron')
const URL = require('url')
const OAuth = require('oauth').OAuth
const TrelloAPI = require('./trelloApi')
const trelloAppKey = '01ad9ee9ec7a92b20ddd261ff55820f4'
const trelloSecretKey = '7b455f5b12ca3b432bb34c381e00b594b53adca7fc5789449a1569f59ab2449c'
const appName = 'ToDoElectron'

// constants for connection to trello api
const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
const oauth = new OAuth(requestURL, accessURL, trelloAppKey, trelloSecretKey, '1.0A', 'todoapp://trelloauth', 'HMAC-SHA1')

// aquired after startup
var token = ''
var tokenSecret = ''
var accessToken = ''
// store authentification window variable here, so we can close it from another function
var authorizeWindow

/**
 * Handler for ipc calls from renderer process
 */
function handleApiCalls () {
	ipcMain.on('trelloGetUser', (event, args) => {
		TrelloAPI.getUser(function (value) {
			event.sender.send('trelloGetUserData', value)
		})
	})
	ipcMain.on('trelloAuthorize', (event, arg) => {
		authorize()
	})
}

/**
 * Function for authorizing Trello API
 */
function authorize () {
	oauth.getOAuthRequestToken(function (error, tokenNew, tokenSecretNew, results) {
		if (error !== null) {
			console.log(`${error}`)
		}
		tokenSecret = tokenSecretNew
		token = tokenNew
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
	oauth.getOAuthAccessToken(oauthToken, tokenSecret, oauthVerifier, function (error, accessTokenNew, accessTokenSecretNew, results) {
		if (error !== null) {
			console.log(`${error}`)
		}
		accessToken = accessTokenNew
		// regenerate trello api access with new access tokens
		console.log('Trello api authorized')
		TrelloAPI.intialize(trelloAppKey, accessToken)
	})
}

module.exports = {
	trelloAppKey: trelloAppKey,
	handleApiCalls: handleApiCalls,
	authorize: authorize,
	authorizeCallback: authorizeCallback
}
