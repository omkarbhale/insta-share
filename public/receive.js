const senderip = document.getElementById('senderip')
const portinput = document.getElementById('portinput')
const outdir = document.getElementById('outdir')
const progressjson = document.getElementById('progressjson')
const result = document.getElementById('result')
const bytecountelement = document.getElementById('bytecount')
const receivedfileelement = document.getElementById('receivedfile')

document.getElementById('submit').addEventListener('click', async (e) => {
    e.preventDefault()
    let progressjsonvalue;
    try {
        progressjsonvalue = JSON.parse(progressjson.value)
    } catch(e) {
        progressjsonvalue = undefined
    }
    receive.ipcRenderer.invoke(
        'getdr',
        senderip.value,
        portinput.value,
        outdir.value,
        progressjsonvalue
    )
    result.innerText = `Transfer has started`
    document.getElementById('stop').disabled = false

    receive.onupdateprogress((bytecount, receivedfile) => {
        bytecountelement.innerText = parseFloat(bytecount) / 1073741824
        receivedfileelement.innerText = receivedfile
    })

    receive.onreceivefinish(() => {
        document.getElementById('stop').disabled = true
        document.getElementById('submit').disabled = true
        result.innerText = 'Transfer complete'
        result.style.color = 'green'
    })

    // receive.ipcRenderer.on('stop-progress', (event, progress) => {
    //     downloadObjectAsJson(progress, 'progress.json')
    // })
    receive.onstopprogress((progressjson) => {
        downloadObjectAsJson(progressjson, 'progress')
    })
})

document.getElementById('stop').addEventListener('click', () => {
    receive.ipcRenderer.invoke('receive-stop')
})

function downloadObjectAsJson(jsonstring, exportName){
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonstring);
    var downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}