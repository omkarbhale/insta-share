const { io } = require('socket.io-client')
const ss = require('socket.io-stream')

const path = require('path')
const fs = require('fs')

class DataReveiver {
    constructor(socket, receivedir, progress, onprogressupdate, onfinish) {
        this.socket = socket
        this.receivedir = receivedir
        this.onfinish = onfinish

        this.progress = progress || {}
        this.receivedbytes = 0
        this.onprogressupdate = onprogressupdate || (() => {})

        this.socket.on('connect', () => {

            ss(this.socket).on('file', (stream, data) => {
                const filename = path.join(this.receivedir, data.relative, data.name)
                const dirname = path.dirname(filename)
                if (!fs.existsSync(dirname)){
                    fs.mkdirSync(dirname, { recursive: true });
                }
                const writeStream = fs.createWriteStream(filename)
                stream.pipe(writeStream)
                writeStream.on('finish', () => {
                    this.updateProgress(data)
                })
            })
            
            this.socket.on('complete', () => {
                this.socket.disconnect()
                this.onfinish()
            })
            
            this.socket.emit('ready-to-receive', this.progress)
        })

    }

    updateProgress(data) {
        console.log(`finished ${data.name}`)
        this.receivedbytes += data.size
        this.progress[path.join(data.relative,data.name)] = true
        this.onprogressupdate(this.receivedbytes, path.join(data.relative, data.name))
    }

    stop() {
        this.socket.disconnect()
        return this.progress
    }
}

function getDataReceiver(ip, port, outdir, progress, onprogressupdate, onfinish) {
    const socket = io(`http://${ip}:${port}`);
    const dr = new DataReveiver(socket, outdir, progress, onprogressupdate, onfinish)
    return dr
}

// getDataReceiver('localhost', './test', undefined)

module.exports = {
    getDataReceiver
}