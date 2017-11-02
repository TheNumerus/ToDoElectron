import isOnline from 'is-online'
var currentState = true

async function checkConnection () {
	currentState = await isOnline()
}

function startCheck () {
	checkConnection()
	// call every minute
	setInterval(checkConnection, 60000)
}

module.exports = {
	startCheck: startCheck,
	check: checkConnection,
	state: () => { return currentState }
}
