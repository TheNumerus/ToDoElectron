const {net} = require('electron')
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
}

/**
 * Get user info
 * @param {callback for function} callback
 */
function getUser (callback) {
	const request = net.request({ method: 'GET', hostname: 'trello.com', path: '/1/member/me' + '?&key=' + appKey + '&token=' + token })
	var json = ''
	request.on('response', (response) => {
		response.on('data', (chunk) => {
			if (chunk.toString() === 'invalid token') {
				console.log(token + ' invalid token in function getUser')
				return
			}
			// convert to JSON
			json = JSON.parse(chunk.toString())
			callback(json)
		})
	})
	request.end()
}
module.exports = {
	intialize: intialize,
	getUser: getUser
}
