const {net} = require('electron')
const trelloIO = require('./trelloApiInputOutput')
var appKey = ''
var token = ''

/**
 * Initializes variables required for connection to Trello API
 * @param {applicaion key for connection} appKeyNew
 * @param {token for acces} tokenNew
 */
function intialize (appKeyNew, tokenNew) {
	appKey = appKeyNew
	token = tokenNew
	saveToken()
}

/**
 * Get all user info
 * @param {function} callback
 */
function getAllUserInfo (callback) {
	trelloApiRequest('/1/member/me?&key=' + appKey + '&token=' + token, callback)
}

/**
 * Get all boards
 * @param {function} callback
 */
function getBoards (callback) {
	trelloApiRequest('/1/member/me/boards?&key=' + appKey + '&token=' + token + '&fields=name,id&filter=open', callback)
}

/**
 * Get board data
 * @param {function} callback
 */
function getBoardData (idBoard, callback) {
	trelloApiRequest('/1/boards/' + idBoard + '/?&key=' + appKey + '&token=' + token + '&fields=id,name&lists=open&list_fields=id,name', callback)
}

/**
 * Get list data in batches
 * @param {Array} batches - list ids to call in batches of 10
 * @param {function} callback - callback
 * @todo remove buffeNumber from {@link trelloApiRequest} by calling event when all batches are finished
 */
function getBatchListData (batches, callback) {
	for (var i = 0; i < batches.length; ++i) {
		var batchString = '/1/batch/?urls='
		batches[i].forEach((idList) => {
			batchString += '/lists/' + idList + '/cards,'
		}, this)
		// delete last comma
		batchString = batchString.slice(0, -1)
		batchString += '&key=' + appKey + '&token=' + token
		trelloApiRequest(batchString, callback, i)
	}
}
/**
 * Sends request to TrelloAPI
 * @param {string} path - path to send request to
 * @param {function} callback - callback
 * @param {integer} batchNumber - used for batches, default is 1
 */
function trelloApiRequest (path, callback, batchNumber = 1) {
	const request = net.request({ method: 'GET', hostname: 'trello.com', path: path })
	var json = ''
	request.on('response', (response) => {
		var completeResponse = ''
		response.on('data', (chunk) => {
			if (chunk.toString() === 'invalid token') {
				console.log(token + ' - invalid token ')
				return
			}
			completeResponse += chunk.toString()
		})
		// long responses usually take more than one buffer, so we wait for all data to arrive
		response.on('end', () => {
			// convert to JSON
			json = JSON.parse(completeResponse)
			callback(json, batchNumber)
		})
	})
	request.end()
}


function saveToken () {
	trelloIO.writeToken(token)
}

function loadToken () {
	trelloIO.openToken((value) => { token = value })
}

module.exports = {
	intialize: intialize,
	getAllUserInfo: getAllUserInfo,
	getBoards: getBoards,
	loadToken: loadToken,
	getBoardData: getBoardData,
	getBatchListData: getBatchListData
}
