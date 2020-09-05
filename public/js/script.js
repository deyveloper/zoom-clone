window.USER_ID = null
const socket = io('/')

let myVideoStream
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')


var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: window.location.port
})

peer.on('open', (USER_ID) => {
    window.USER_ID = USER_ID
    socket.emit('join-room', { ROOM_ID, USER_ID })
})

peer.on('destroy', (data) => {
    console.log(data);
})

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
})
.then((stream) => {myVideoStream = stream
    addVideoStream(myVideo, myVideoStream)

    socket.on('user-connected', ({ ROOM_ID, USER_ID }) => {
        connectToNewUser(USER_ID)
    })

    socket.on('user-disconnect',  (data) => {
        console.log(data);
        $(`#${data.id}`).remove()
    })

    socket.on('createMessage', ({ MESSAGE, ROOM_ID, USER_ID }) => {
        $("#messages_list").append(`<hr><li class="message">${MESSAGE}</li>`)
        scrollToBottom()
    })

    peer.on('call', (call) => {
        call.answer(myVideoStream)
        const video = document.createElement('video')
        video.setAttribute('id', call.peer)
        call.on('stream', (userVideoStream) => {
            addVideoStream(video, userVideoStream)
        })
    })
})

const addVideoStream = (video, stream) => {
    video.classList.add('col-4')
    video.classList.add('mt-2')
    video.srcObject = stream
    video.muted = true
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
    videoGrid.append(video)
}

const connectToNewUser = (USER_ID) => {
    const call = peer.call(USER_ID, myVideoStream)
    const video = document.createElement('video')
    video.setAttribute('id', USER_ID)
    call.on('stream', (userVideoStream) => {
        addVideoStream(video, userVideoStream)
    })
}

let msg = $('#chat_message')

$('html').keydown((e) => {
    const MESSAGE = msg.val()
    if (e.which === 13 && MESSAGE.length !== 0) {
        socket.emit('message', { MESSAGE, ROOM_ID, USER_ID })
        $("#messages_list").append(`<hr><li class="message own">${MESSAGE}</li>`)
        scrollToBottom()
        msg.val('')
    }
})

const scrollToBottom = () => {
    var d = $('.main__chat_window')
    d.scrollTop(d.prop('scrollHeight'))
}

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled
    myVideoStream.getAudioTracks()[0].enabled = !enabled

    if (enabled) {
        setUnmuteButton()
    } else {
        setMuteButton()
    }
}

const setUnmuteButton = () => {
    const unmute = `
    <i class="unmute fas fa-microphone-slash" style="color: red;"></i>
    <span>Unmute</span>
`

    $('.main__mute_button')[0].innerHTML = unmute
}

const setMuteButton = () => {
    const unmute = `
    <i class="mute fas fa-microphone"></i>
    <span>Mute</span>
`

    $('.main__mute_button')[0].innerHTML = unmute
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled
    myVideoStream.getVideoTracks()[0].enabled = !enabled
    if (!enabled) {
        setPlayVideo()
    } else {
        setStopVideo()
    }
}

const setPlayVideo = () => {
    const play = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
`
    $('.main__video_button')[0].innerHTML = play
}

const setStopVideo = () => {
    const stop = `
    <i class="fas fa-video-slash" style="color: red;"></i>
    <span>Play Video</span>
`

    $('.main__video_button')[0].innerHTML = stop
}

const leaveMeeting = () => {
    window.location = '/'
}