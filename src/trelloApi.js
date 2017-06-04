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
 * @param {callback for function} callback
 */
function getAllUserInfo (callback) {
	const request = net.request({ method: 'GET', hostname: 'trello.com', path: '/1/member/me' + '?&key=' + appKey + '&token=' + token })
	var json = ''
	request.on('response', (response) => {
		response.on('data', (chunk) => {
			if (chunk.toString() === 'invalid token') {
				console.log(token + ' - invalid token in function ' + this.name)
				return
			}
			// convert to JSON
			json = JSON.parse(chunk.toString())
			callback(json)
		})
	})
	request.end()
}

/**
 * Get all boards
 * @param {callback for function} callback
 */
function getBoards (callback) {
	const request = net.request({ method: 'GET', hostname: 'trello.com', path: '/1/member/me' + '?&key=' + appKey + '&token=' + token + '&fields=boards&board_fields=name' })
	var json = ''
	request.on('response', (response) => {
		response.on('data', (chunk) => {
			if (chunk.toString() === 'invalid token') {
				console.log(token + ' - invalid token in function ' + this.name)
				return
			}
			// convert to JSON
			json = JSON.parse(chunk.toString())
			callback(json)
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
	loadToken: loadToken
}
