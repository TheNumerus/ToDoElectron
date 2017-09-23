const ReactDOM = require('react-dom')
const React = require('react')
const CardDetail = require('./trelloDetailsComponents')
const ipcRenderer = require('electron').ipcRenderer
const URL = require('url').URL
const cardId = new URL(window.location.href).searchParams.get('id')

ipcRenderer.send('trelloGetCardData', cardId, false)
ipcRenderer.on('trelloGetCardData-reply', (event, cardData) => {
	ReactDOM.render(<CardDetail cardData={cardData}/>, document.querySelector('#container'))
})

function goBack () {
	ipcRenderer.send('goBack')
}

function update () {
	document.querySelector('#updateIcon').classList.add('fa-spin')
	ipcRenderer.send('trelloGetCardData', cardId, true)
}
