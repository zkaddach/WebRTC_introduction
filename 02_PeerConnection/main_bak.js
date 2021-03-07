function shareStream(stream) {
    var video = document.getElementById('media-stream');
    video.srcObject = stream;
}

function handleError(err){
    console.log(err);
}

var mediaOptions = {
    video: true,
    audio: true
}

var localPc;
var remotePc;
var localStream;

/**
 * This adds this new remote candidate to the RTCPeerConnection's
 * remote description, which describes the state of the remote end of the connection.
 */
function onIceCandidate(pc, event){
    let peerPc = (pc === localPc) ? remotePc : localPc;
    peerPc.addIceCandidate(event.candidate)
        .then(function () {
            let pcName = (pc === localPc) ? 'local peer connection' : 'remote peer connection';
            console.log(pcName + ' addIceCandidate success');
        })
        .catch(handleError)
}



// Starting Own Camera stream
navigator.mediaDevices.getUserMedia(mediaOptions)
    .then( (stream) => {
        var video = document.getElementById('localVideo');
        video.srcObject = stream;
        localStream = stream;
    })
    .catch(handleError)

document.getElementById("call").onclick = function () {
  var servers = null;
  localPc = new RTCPeerConnection(servers);
  /**
   * The onicecandidate property is an EventHandler to be called when the
   * icecandidate event occurs on an RTCPeerConnection instance.
   * This happens when the local ICE agent need to deliver message to the
   * other peer through signaling server.
   * More on : 'https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate'
   */
  localPc.onicecandidate = function (e) {
    onIceCandidate(localPc, e);
  }


  remotePc = new RTCPeerConnection(servers);
  remotePc.onicecandidate = function (e) {
    onIceCandidate(remotePc, e);
  }

  /**
   * The RTCPeerConnection.onaddstream event handler is a property containing
   * the code to execute when the addstream event, of type MediaStreamEvent,
   * is received by this RTCPeerConnection. Such an event is sent when a
   * MediaStream is added to this connection by the remote peer.
   * The event is sent immediately after the call RTCPeerConnection.setRemoteDescription
   * and doesn't wait for the result of the SDP negotiation.
   */
  remotePc.onaddstream = function (e){
    console.log("Adding remote video");
    remoteVideo = document.getElementById('remoteVideo');
    remoteVideo.srcObject = e.stream;
  }


  localPc.addStream(localStream);

  // Starting connection with remote user
  var offerOptions = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
  };

  localPc.createOffer(offerOptions)
    .then((desc) => {
      localPc.setLocalDescription(desc);
      remotePc.setRemoteDescription(desc);

      remotePc.createAnswer()
        .then((desc) => {
          remotePc.setLocalDescription(desc);
          localPc.setRemoteDescription(desc);
        })
    })
    .catch(handleError)


}
