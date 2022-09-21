const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('send', {
	ipcRenderer,
	onsendfinish: (callback) => ipcRenderer.on('send-finish', (event) => {
		callback()
	})
})

contextBridge.exposeInMainWorld('receive', {
	// ipcRenderer: {...ipcRenderer, on: ipcRenderer.on}
	ipcRenderer,
	onupdateprogress: (callback) => ipcRenderer.on('update-progress', (event, bytecount, receivedfile) => {
		callback(bytecount, receivedfile)
	}),
	onreceivefinish: (callback) => ipcRenderer.on('receive-finish', (event) => {
		callback()
	}),
	onstopprogress: (callback) => ipcRenderer.on('stop-progress', (event, progressjson) => {
		callback(progressjson)
	})
})