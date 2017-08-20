const ReactDOM = require('react-dom')
const React = require('react')
const CalendarRoot = require('./calendarComponents.js').CalendarRoot
const ipcRenderer = require('electron').ipcRenderer
var month = 0
var year = 2017

function init () {
	var today = new Date()
	month = today.getMonth()
	year = today.getFullYear()
	render()
}

function render () {
	document.querySelector('#date').innerHTML = `${month + 1} - ${year}`
	var calendarRoot = <CalendarRoot date={new Date(year, month)}/>
	ReactDOM.render(calendarRoot, document.querySelector('#calendarRoot'))
}

document.querySelector('#goBack').addEventListener('click', (event) => {
	ipcRenderer.send('goBack')
})

document.querySelector('#goLeft').addEventListener('click', (event) => {
	if (month === 0) {
		month = 11
		year--
	} else {
		month--
	}
	render()
})

document.querySelector('#goRight').addEventListener('click', (event) => {
	if (month === 11) {
		month = 0
		year++
	} else {
		month++
	}
	render()
})

window.onload = init
