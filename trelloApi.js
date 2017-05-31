const net = require('electron').net
module.exports = class TrelloAPI {

	constructor(appKey) {
		this.appKey = appKey
		this.token = "a93b127abc1e443137c6c3faf64a8c34"
	}
	authorize(){
		const request = net.request({method:'GET',hostname:'trello.com',path:'/1/authorize?key='+this.appKey+'&name=ToDoElectron'})
		
		request.on('response', (response) => {
			//console.log(`STATUS: ${response.statusCode}`)
			//console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
			response.on('data', (chunk) => {
				var string = chunk.toString()
				console.log(string)
				//console.log(`BODY: ${chunk}`)
			})
			/*response.on('end', () => {
				console.log('No more data in response.')
			})*/
		})
		request.end()
	}
	getUser() {
		const request = net.request({method:'GET',hostname:'trello.com',path:'/1/members/petrvolf2?&key='+this.appKey})
		request.on('response', (response) => {
			//console.log(`STATUS: ${response.statusCode}`)
			//console.log(`HEADERS: ${JSON.stringify(response.headers)}`)
			response.on('data', (chunk) => {
				var string = JSON.parse(chunk.toString())
				console.log(string)
				//console.log(`BODY: ${chunk}`)
			})
			/*response.on('end', () => {
				console.log('No more data in response.')
			})*/
		})
		request.end()
	}
}