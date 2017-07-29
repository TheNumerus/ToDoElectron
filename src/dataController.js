const dataControllerIO = require('./dataControllerIO')
// const cacheModule = require('./cache')
const trelloApi = require('./trelloApi')

function initialize () {
	dataControllerIO.initialize().then(() => {
		trelloApi.initialize()
	})
}

module.exports = {
	initialize: initialize
}
