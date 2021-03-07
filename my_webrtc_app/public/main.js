let divSelectRoom = document.getElementById("selectRoom");
let divConsultingRoom = document.getElementById("consultingRoom");
let btnGoRoom = document.getElementById("goRoom");
let inputRoomNumber = document.getElementById("roomNumber");
let localVideo = document.getElementById("localVideo");
let remoteVideo = document.getElementById("remoteVideo");

let roomNumber, localStream, remoteStream, rtcPeerConnection, isCaller;

const iceServer = {
  'iceServer': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'}
  ]
}

const streamConstraints = {
  audio:true,
  video: true
}

const socket = io();

btnGoRoom.onclick = () => {
  if (inputRoomNumber.value == '') {
    alert("Please type a correct room number ! ");
  }
  else {
    roomNumber = inputRoomNumber.value;
    console.log(inputRoomNumber.value);
    socket.emit('create or join', roomNumber);

    divSelectRoom.style = "display: none";
    divConsultingRoom.style = "display: block";
  }
}

socket.on('created', room => {
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then(stream => {
      localStream = stream;
      localVideo.srcObject = stream;
      isCaller = true;
    })
    .catch(err => {
      console.log("An error occured ", err);
    })
})

socket.on('joined', room => {
  navigator.mediaDevices.getUserMedia(streamConstraints)
    .then(stream => {
      localStream = stream;
      localVideo.srcObject = stream;
      socket.emit('ready', roomNumber);
    })
    .catch(err => {
      console.log("An error occured ", err);
    })
})

socket.on('ready', room => {
  if(isCaller){

    rtcPeerConnection = new RTCPeerConnection(iceServer);
    rtcPeerConnection.onicecandidate = onIceCandidate;
    rtcPeerConnection.ontrack = onAddStream;
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
    rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
    rtcPeerConnection.createOffer()
      .then(sessionDescription => {
        rtcPeerConnection.setLocalDescription(sessionDescription);
        console.log("send offer");
        socket.emit('offer', {
          type: 'offer',
          sdp: sessionDescription,
          room: roomNumber
        })
      })
      .catch(err => {
        console.log("An error occured on offer : ", err);

      })
  }
})


socket.on('offer', (event) => {
  if(!isCaller){
    console.log("RECEIVED IFFER");
    rtcPeerConnection = new RTCPeerConnection(iceServer);
    rtcPeerConnection.onicecandidate = onIceCandidate;
    rtcPeerConnection.ontrack = onAddStream;
    rtcPeerConnection.addTrack(localStream.getTracks()[0], localStream);
    rtcPeerConnection.addTrack(localStream.getTracks()[1], localStream);
    rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
    rtcPeerConnection.createAnswer()
      .then(sessionDescription => {
        rtcPeerConnection.setLocalDescription(sessionDescription);
        console.log("received offer send answer");
        socket.emit('answer', {
          type: 'answer',
          sdp: sessionDescription,
          room: roomNumber
        })
      })
      .catch(err => {
        console.log("An error occured on offer : ", err);

      })
  }
})

socket.on('answer', event => {
  console.log("received answer");
  rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(event));
})

socket.on('candidate', event => {
  console.log('new candidate')
  const candidate = new RTCIceCandidate({
    sdpMLineIndex: event.label,
    candidate: event.candidate
  })
  rtcPeerConnection.addIceCandidate(candidate);
})

function onAddStream(event) {
  console.log('WLA !');
  remoteVideo.srcObject = event.streams[0];
  remoteStream = event.streams[0];
}

function onIceCandidate(event) {
  if (event.candidate) {
    console.log('Sending Ice candidate', event.candidate);
    socket.emit('candidate', {
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate,
      room: roomNumber
    })
  }
}
