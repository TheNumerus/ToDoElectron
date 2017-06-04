const {protocol} = require('electron')

/**
 * Resisters todoapp:// protocol used for callbacks
 */
function registerToDoProtocol () {
	protocol.registerStringProtocol('todoapp', (request, callback) => {
		// remove todoapp:// part and check for function call
		const url = request.url.substr(10)
		const regex = /\S+\?/
		var match = regex.exec(url)
		if (match === null) {
			console.log('match in ' + url + ' not found')
			return
		}
		switch (match[0]) {
		case 'trelloauth?': {
			require('./trelloApiHandler').authorizeCallback(request.url)
			break
		}
		}
	}, (error) => {
		if (error) console.error('Failed to register protocol')
	})
}

module.exports = {
	registerToDoProtocol: registerToDoProtocol
}
