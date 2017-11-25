import * as isOnline from 'is-online'
var currentState = true

export async function checkConnection () {
	currentState = await isOnline()
}

export function startCheck () {
	checkConnection()
	// call every minute
	setInterval(checkConnection, 60000)
}

export function getState() {
	return currentState
}