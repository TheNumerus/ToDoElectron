var ipc = require('electron').ipcMain
const OAuth = require('oauth').OAuth
const TrelloAPI = require('./trelloApi')
const trelloAPIKey = '01ad9ee9ec7a92b20ddd261ff55820f4'
const trelloSecretKey = '7b455f5b12ca3b432bb34c381e00b594b53adca7fc5789449a1569f59ab2449c'
const appName = 'ToDoElectron'
// aquired after startup
var token = ''
var secretToken = ''
var user = 'petrvolf2'
let trello = new TrelloAPI(trelloAPIKey, token)
function handleApiCalls () {
	ipc.on('trelloGet', (event, args) => {
		trello.getUser(user, token)
	})
	ipc.on('trelloAuthorize', (event, arg) => {
		authorize()
	})
}
function setToken (tokenNew) {
	if (tokenNew === undefined) return
	token = tokenNew.trim()
	// token = (tokenNew.replace(/\\/g,"")).trim()
	console.log('tokenNew=' + tokenNew + 'token=' + token)
	trello = new TrelloAPI(trelloAPIKey, token)
}

function authorize () {
	//if (validationCode === undefined) return
	// constants for connection to trello api
	const requestURL = 'https://trello.com/1/OAuthGetRequestToken'
	const accessURL = 'https://trello.com/1/OAuthGetAccessToken'
	const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken'
	const oauth = new OAuth(requestURL, accessURL, trelloAPIKey, trelloSecretKey, '1.0A', 'test for now', 'HMAC-SHA1')
	oauth.getOAuthRequestToken(function (error, tokenNew, tokenSecret, results) {
		console.log(`in getOAuthRequestToken - token: ${token}, tokenSecret: ${tokenSecret}, resultes ${JSON.stringify(results)}, error: ${JSON.stringify(error)}`)
		secretToken = tokenSecret
		token = tokenNew
		require('./main').createWindowFromUrl(`${authorizeURL}?oauth_token=${token}&name=${appName}`)
		// res.redirect(`${authorizeURL}?oauth_token=${token}&name=${appName}`)
	})
	// trello.authorize(validationCode.trim())
}
function authorizeCallback () {

}
module.exports = {
	trelloAPIKey: trelloAPIKey,
	handleApiCalls: handleApiCalls,
	setToken: setToken,
	authorize: authorize
}
