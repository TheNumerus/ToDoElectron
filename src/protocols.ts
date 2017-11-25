import {protocol} from 'electron'
import * as trelloApi from './trelloApi'

/**
 * Registers todoapp:// protocol used for callbacks
 */
export function registerToDoProtocol () {
	protocol.registerStringProtocol('todoapp', (request, callback) => {
		// remove todoapp:// part and check for function call
		const url = request.url.substr(10)
		const match = url.match(/\S+\?/)
		if (match === null) {
			throw new Error('Error while registering procotol')
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
