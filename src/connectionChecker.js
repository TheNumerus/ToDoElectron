const isOnline = require('is-online')

function checkConnection () {
	isOnline().then((online) => {
		console.log(online)
	})
}

function startCheck () {
	checkConnection()
	// call every 10 minutes
	setInterval(checkConnection, 600000)
}

module.exports = {
	startCheck: startCheck
}
