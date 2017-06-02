const net = require('electron').net
module.exports = class TrelloAPI {
	constructor (appKey, token) {
		this.appKey = appKey
		this.token = token
	}
	authorize (validationCode) {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: '/1/auth?token=' + validationCode + '&name=ToDoElectron&expiration=never&response_type=token&scope=read,write,account' })

		request.on('response', (response) => {
			// console.log(`STATUS: ${response.statusCode}`)
			// console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
			response.on('data', (chunk) => {
				var string = chunk.toString()
				console.log(string)
				// console.log(`BODY: ${chunk}`)
			})
			/* response.on('end', () => {
				console.log('No more data in response.')
			}) */
		})
		request.end()
	}
	getUser (user, token) {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: '/1/member/me' + '?&key=' + this.appKey + '&token=' + this.token })
		request.on('response', (response) => {
			// console.log(`STATUS: ${response.statusCode}`)
			// console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
			response.on('data', (chunk) => {
				console.log(`BODY: ${chunk}`)
				if (chunk.toString() === 'invalid token') {
					console.log(this.token + ' invalid token for some reason')
				}
				// var string = JSON.parse(chunk.toString())
				// console.log(string)
				console.log(`BODY: ${chunk}`)
			})
			/* response.on('end', () => {
				console.log('No more data in response.')
			}) */
		})
		request.end()
	}
	getToken (token) {
		const request = net.request({ method: 'GET', hostname: 'trello.com', path: '/1/tokens/' + this.token + '?&key=' + this.appKey})
		request.on('response', (response) => {
			// console.log(`STATUS: ${response.statusCode}`)
			// console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
			response.on('data', (chunk) => {
				console.log(`BODY: ${chunk}`)
				if (chunk.toString() === 'invalid token') {
					console.log(this.token + ' invalid token for some reason')
				}
				// var string = JSON.parse(chunk.toString())
				// console.log(string)
				console.log(`BODY: ${chunk}`)
			})
			/* response.on('end', () => {
				console.log('No more data in response.')
			}) */
		})
		request.end()
	}
}
