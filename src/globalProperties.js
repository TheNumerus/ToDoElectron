import {app} from 'electron'
import os from 'os'

export default class Properties {
	/**
	 * creates string with path to folder, depending on OS
	 * @todo add other OSs
	 */
	static getPath () {
		switch (process.platform) {
		case 'win32':
			return 'C:\\Users\\' + os.userInfo().username + '\\AppData\\Roaming\\ToDoElectron\\'
		case 'darwin':
			// TODO
			break
		case 'linux':
			return '/home/' + os.userInfo().username + '/.todoelectron/'
		}
	}

	static getAppVersion () {
		return app.getVersion()
	}

	static getAppName () {
		return app.getName()
	}

	static getTrelloAppKey () {
		return '01ad9ee9ec7a92b20ddd261ff55820f4'
	}

	static getTrelloSecretKey () {
		return '7b455f5b12ca3b432bb34c381e00b594b53adca7fc5789449a1569f59ab2449c'
	}
}
