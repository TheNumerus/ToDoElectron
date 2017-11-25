import {ipcRenderer} from 'electron'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import {CalendarRoot} from './calendarComponents'
let month = 0
let year = 2017

function init () {
	const today = new Date()
	month = today.getMonth()
	year = today.getFullYear()
	render()
}

function render () {
	document.querySelector('#date').innerHTML = `${month + 1} - ${year}`
	const calendarRoot = <CalendarRoot date={new Date(year, month)}/>
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

export = {}
