const dirinput = document.getElementById('dirinput')
const portinput = document.getElementById('portinput')
const result = document.getElementById('result')

document.getElementById('submitbtn').addEventListener('click', async (e) => {
    e.preventDefault()
    await send.ipcRenderer.invoke('setSendDir', dirinput.value, portinput.value)
    e.target.disabled = true
    dirinput.disabled = true
    portinput.disabled = true
    result.innerText = `Listening on port ${portinput.value}
    Will share ${dirinput.value}`
})

// send.ipcRenderer.on('send-finish', () => {
//     result.innerText = `Sending ${dirinput.value} finished`
// })

send.onsendfinish(() => {
    result.innerText = `Sent: ${dirinput.value} finished`
    result.style.color = 'green'
})