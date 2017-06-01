// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const ipcRenderer = require('electron').ipcRenderer
var tlacitko = document.querySelector("#ayyy")
tlacitko.addEventListener('click',function () {
	var text = document.querySelector("#text")
	text.textContent = "whaaaaa"
	uhm(5);
	ipcRenderer.send("trelloAuthorize");
})
document.querySelector('#vypis').addEventListener('click', function () {
	ipcRenderer.send('trelloGet')
})
function uhm(kolik){
	var seznam = document.querySelector("#seznam")
	seznam.innerHTML = "";
	for(var i = 0;i<kolik;i++){
		seznam.innerHTML+= ("<p>ayyy</p>")
	}
}
var webik = document.querySelector("#webik")
webik.setAttribute("src",'https://trello.com/1/authorize?expiration=never&callback_method=postMessage&response_type=token&key='+'01ad9ee9ec7a92b20ddd261ff55820f4'+'&name=ToDoElectron')
webik.addEventListener('message',(event) =>{
	console.log(event)
})