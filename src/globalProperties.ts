import {app} from 'electron'
import * as os from 'os'

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
		return '45e02d045ec187c603a9ad8841085845'
	}

	static getTrelloSecretKey () {
		return '492347774f15f7bcb2038172ad343eaa84213de13e8c0e29e23163d6f97f84bc'
	}
}
