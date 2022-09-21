const fs = require('fs')
const path = require('path')

class Directory {
    constructor(root, relative, fromStruct) {
        this.root = root
        this.relative = relative

        this.subdirs = []
        this.files = []

        if(this.exists) {
            this.populate()
        }
    }

    // Some hidden dirs have no permission access
    get exists() {
        if(this.dir != undefined) return true
        try {
            this.dir= fs.readdirSync(path.join(this.root, this.relative), {
                withFileTypes: true
            })
            return true
        } catch {
            return false
        }
    }

    populate() {
        this.dir.forEach(dirent => {
            if(dirent.isDirectory()) {
                // if(dirent.name == 'node_modules') return;
                const newDir = new Directory(this.root, path.join(this.relative, dirent.name), false)
                if(newDir.exists) {
                    this.subdirs.push(newDir)
                }
            }
            if(dirent.isFile()) {
                this.files.push(dirent.name)
            }
        })
    }

    toJSON() {
        return {
            root: this.root,
            relative: this.relative,
            subdirs: this.subdirs.map(subdir => {
                return subdir.toJSON()
            }),
            files: this.files,
            finishedFiles: this.finishedFiles,
            complete: this.complete
        }
    }

    setFinishedFiles(fileIndex) {
        this.finished.push(fileIndex)
    }

    setComplete() {
        this.complete = true
    }
}

// Tests
// let dir = new Directory(path.join(__dirname, '..'), '.', false)
// fs.writeFileSync('./r.txt', JSON.stringify(dir.toJSON(), null, 2))

// let dirDirect = new Directory(path.join(__dirname))
// let dir = Directory.fromStruct(dirDirect.toJSON())
// fs.writeFileSync('./file.txt', JSON.stringify(dir.toJSON(), null, 2))


module.exports = Directory