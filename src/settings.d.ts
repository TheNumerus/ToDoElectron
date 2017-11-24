interface Settings {
    windowSize: {
        x:number,
        y:number,
        maximized: boolean
    },
    theme: 'light'|'dark'|'default',
    board: {
        useProgressBars: boolean,
        animateGIFs: boolean
    }
}
