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
function uhm(kolik){
	var seznam = document.querySelector("#seznam")
	seznam.innerHTML = "";
	for(var i = 0;i<kolik;i++){
		seznam.innerHTML+= ("<p>ayyy</p>")
	}

}