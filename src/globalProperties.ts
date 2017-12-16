import {app} from 'electron'
import * as os from 'os'

export default class Properties {
	/**
	 * creates string with path to folder, depending on OS
	 * @todo add other OSs
	 */
	public static getPath () {
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

	public static getAppVersion () {
		return app.getVersion()
	}

	public static getAppName () {
		return app.getName()
	}
}
