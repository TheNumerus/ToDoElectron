import {app} from 'electron'
import * as os from 'os'

/**
 * creates string with path to folder, depending on OS
 * @todo add other OSs
 */
export const getPath = () => {
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

export const getAppVersion = () => {
	return app.getVersion()
}

export const getAppName = () => {
	return app.getName()
}
