import * as trelloApi from './trelloApi'
import {protocol} from 'electron'

/**
 * Registers todoapp:// protocol used for callbacks
 */
export function registerToDoProtocol () {
	protocol.registerStringProtocol('todoapp', (request, callback) => {
		// remove todoapp:// part and check for function call
		const url = request.url.substr(10)
		var match = url.match(/\S+\?/)
		if (match === null) {
			console.log('match in ' + url + ' not found')
			return
		}
		switch (match[0]) {
		case 'trelloauth?':
			trelloApi.authorizeCallback(request.url)
			break
		}
	}, (error) => {
		if (error) { throw error }
	})
}
