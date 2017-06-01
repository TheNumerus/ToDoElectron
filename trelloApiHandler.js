var ipc = require('electron').ipcMain
const TrelloAPI = require('./trelloApi');
const trelloAPIKey = "01ad9ee9ec7a92b20ddd261ff55820f4"
//aquired after startup
var token = ""
var user = "petrvolf2"
module.exports.trelloAPIKey = trelloAPIKey
let trello = new TrelloAPI(trelloAPIKey,token)
module.exports.handleApiCalls = function handleApiCalls(){
	ipc.on('trelloGet',(event,args) =>{
		trello.getUser(user, token)
	})
}
module.exports.setToken = function setToken(tokenNew){	
	token = tokenNew.trim()
	//token = (tokenNew.replace(/\\/g,"")).trim()
	console.log("tokenNew="+tokenNew+"token="+token)
	trello = new TrelloAPI(trelloAPIKey,token)
}
module.exports.authorize = function authorize(validationCode){
	trello.authorize(validationCode.trim())
}