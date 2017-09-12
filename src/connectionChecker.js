const isOnline = require('is-online')
const {ipcMain} = require('electron')
var currentState = true

function checkConnection () {
	isOnline().then((online) => {
		if (currentState !== online) {
			ipcMain.send('changeOnlineState', online)
		}
	})
}

function startCheck () {
	checkConnection()
	// call every 10 minutes
	setInterval(checkConnection, 600000)
}

module.exports = {
	startCheck: startCheck,
	checkConnection: checkConnection,
	currentState: currentState
}
