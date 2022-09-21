const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { once } = require('events')

const { setDirectory } = require("./data-transferer/DataSender");
const { getDataReceiver } = require("./data-transferer/DataReceiver");

const sendToRenderer = async (didFinishLoad, win, event, ...data) => {
	if(!didFinishLoad) {
		await once(win.webContents, "did-finish-load")
	}
	win.webContents.send(event, ...data)
}

const createWindow = () => {
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			nodeIntegration: true,
			// contextIsolation: false
		},
	});

	let didFinishLoad = false
	win.webContents.on("did-finish-load", () => {
		console.log('loaded')
		didFinishLoad = true;
	});
	
	win.loadFile("./public/index.html");

	ipcMain.handle("setSendDir", (event, dir, port) => {
		console.log('setting send directory')
		if (!dir) return false;
		try {
			setDirectory(dir, port, () => {
				sendToRenderer(didFinishLoad, win, 'send-finish')
			});
			return true;
		} catch (e) {
			return false;
		}
	});

	ipcMain.handle("getdr", (event, ip, port, outdir, progress) => {
		let dr = getDataReceiver(
			ip,
			port,
			outdir,
			progress,
			(bytecount, receivedfile) => {
				console.log(`Bytecount: ${bytecount}`);
				// win.webContents.send("update-progress", bytecount);
				sendToRenderer(didFinishLoad, win, 'update-progress', bytecount, receivedfile)
			},
			() => {
				// win.webContents.send("receive-finish");
				sendToRenderer(didFinishLoad, win, 'receive-finish')
			}
		);

		ipcMain.handle("receive-stop", (event) => {
			const progress = dr.stop();
			// win.webContents.send("stop-progress", JSON.stringify(progress));
			sendToRenderer(didFinishLoad, win, 'stop-progress', JSON.stringify(progress))
		});
	});

	// win.webContents.send('lalala')
};

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
