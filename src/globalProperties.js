const Properties = {
	appVersion: '0.0.2',
	appName: 'ToDoElectron',
	trelloAppKey: '01ad9ee9ec7a92b20ddd261ff55820f4',
	trelloSecretKey: '7b455f5b12ca3b432bb34c381e00b594b53adca7fc5789449a1569f59ab2449c',
	path: undefined
}
const methods = {
	path: {
		get: () => {
			return Properties.path
		},
		set: (path) => {
			if (typeof (path) === 'string') {
				Properties.path = path
			}
		}
	},
	getAppVersion: () => {
		return Properties.appVersion
	},
	getAppName: () => {
		return Properties.appName
	},
	getTrelloAppKey: () => {
		return Properties.trelloAppKey
	},
	getTrelloSecretKey: () => {
		return Properties.trelloSecretKey
	}
}
module.exports = methods
