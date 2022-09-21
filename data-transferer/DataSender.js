const ss = require('socket.io-stream')
const path = require('path')
const fs = require('fs')
const Directory = require('./Directory')

// setDirectory('C:\\Users\\omkar\\OneDrive\\Desktop\\small-stuff\\insta-share\\fs-utils')
let ds;

function setDirectory(directory, port, onfinish) {
    const httpServer  = require('http').createServer()
    const {Server} = require('socket.io')
    const io = new Server(httpServer)
    httpServer.listen(port)
    io.on('connection', socket => {
        console.log('creating new datasender')
        ds = new DataSender(new Directory(directory, '.'), socket, onfinish)

        socket.on('disconnect', () => {
            httpServer.close()
        })
    })
    return ds;
}

class DataSender {
    constructor(directory, socket, onfinish) {
        this.directory = directory
        this.socket = socket
        this.onfinish = onfinish
        
        this.socket.on('ready-to-receive', async (progress) => {
            this.progress = progress
            // this.finsihedTransfer = finsihedTransfer
            // console.log(this.directory.toJSON())
            await this.sendData(this.directory.toJSON())
            this.socket.disconnect()
            this.onfinish()
        })

    }

    async sendData(dirStr) {
        await this.sendDir(dirStr)
        this.socket.emit('complete')
    }

    async sendDir(dir) {
        if(dir.complete) return
        for(let file in dir.files) {
            await this.sendFile(dir.root, dir.relative, dir.files[file])
        }
        for(let subdir of dir.subdirs) {
            await this.sendDir(subdir)
        }
    }

    async sendFile(root, relative, name) {
        if(this.progress[path.join(relative, name)]) {
            return
        }
        const sendingStream = ss.createStream()
        ss(this.socket).emit('file', sendingStream, {
            relative, name, size: fs.fstatSync(fs.openSync(path.join(root, relative, name))).size
        })
        fs.createReadStream(path.join(root, relative, name)).pipe(sendingStream)
        return new Promise((res, rej) => {
            sendingStream.on('finish', () => {
                console.log(`finished ${name}`)
                res()
            })
        })
    }
}

// events fired by sender:
// 1. 

module.exports = {
    DataSender,
    setDirectory
}