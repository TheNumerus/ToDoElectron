const isOnline = require('is-online')
const {ipcMain} = require('electron')
var currentState = true

function checkConnection () {
	return new Promise((resolve, reject) => {
		isOnline().then((online) => {
			resolve(online)
		})
	})
}

function startCheck () {
	checkConnection()
	// call every minute
	setInterval(checkConnection, 60000)
}

module.exports = {
	startCheck: startCheck,
	checkConnection: checkConnection,
	currentState: currentState
}
