const {protocol} = require('electron')
const trelloApi = require('./trelloApi')

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
			trelloApi.authorizeCallback(request.url)
			break
		}
		}
	}, (error) => {
		if (error) console.error('Failed to register protocol,' + error)
	})
}

module.exports = {
	registerToDoProtocol: registerToDoProtocol
}
