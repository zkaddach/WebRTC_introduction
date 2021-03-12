// Chargement de la librairie socket.io
const socket = io();

var localStream;

function shareStream(stream) {
    var video = document.getElementById('localVideo');
    video.srcObject = stream;
    // Il faut ajouter le stream a l'object RTCPeerConnection
    rtcPeer.addTrack(stream.getTracks()[0], stream);
    rtcPeer.addTrack(stream.getTracks()[1], stream);
}

function handleError(err){
    console.log(err);
}

var mediaOptions = {
    video: true,
    audio: true
}

// L'objet RTCPeerConnection a besoin des ICE servers (nous expliquerons ca) par la suite.
var servers = {
  'iceServer': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun2.l.google.com:19302'}
  ]
}

// On crée les objets RTCPeerConnection qui vont communiquer entre eux.
var rtcPeer = new RTCPeerConnection(servers);

var userId;

/** On crée un data channel pour le pair local.
 * Puis on définit les méthodes permettant de gérer les evenements
 * 'onopen' et 'onclose'. Ces evenements ont lieu lorsque le canal pour
 * transmettre les donnnees est etabli/ferme.
 */
sendChannel = rtcPeer.createDataChannel('sendChannel');
sendChannel.onopen = handleSendChannelStatusChange;
sendChannel.onclose = handleSendChannelStatusChange;

/**
 * Methode permettant de gerer les evenements d'ouverture et fermeture du
 * canal de transmission des donnees.
 * On desactive le bouton connexion sur le canal est ouvert.
 */
function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;

      if (state === "open") {
        console.log("Channel opened");

      } else {
        messageInputBox.disabled = true;
        console.log("Channel closed");
      }
    }
}

/**
 * Cette méthode permet d'ajouter le nouveau candidat ICE a notre instance
 * RTCPeerConnection avec la description qui décrit l'état de l'instance distante.
 */
function onIceCandidate(pc, event){
    // On ajoute le candidat à l'objet RTCPeerConnection distant.
    candidate = event.candidate
    if (candidate) {
        console.log("Envoie du candidat : ", candidate)
        socket.emit("candidate", {candidate, to:userId})
    }

}

/**
 * La propriété onicecandidate permet de gérer l'évenement icecandidate qui a lieu
 * lorsque l'agent local ICE a besoin de delivrer un message a l'autre instance a travers
 * le signaling server.
 * PLus de détails ici : 'https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate'
 */
rtcPeer.onicecandidate = function (e) {
  onIceCandidate(rtcPeer, e);
}

/**
 * La propriete onaddstream permet de gerer l'evenenement addstream de type
 * MediaStreamEvent, qui est recu par l'objet RTCPeerConnection.
 * Un tel evenement a lieu lorque un MediaStream est ajouter a la connection par
 * le pair distant.
 * Cet evenement est envoye directement apres l'appel de RTCPeerConnection.setRemoteDescription
 * et n'attend pas le resultat de negotiation SDP.
 */
rtcPeer.ontrack = function (e){
  console.log("Adding remote video");
  remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.srcObject = e.streams[0];
}

/**
 * La propriété 'ondatachannel' permet de gérer l'événement 'datachanne' qui a lieu
 * lorsque un RTCDataChannel est ajouté par le pair distant avec la méthode
 * createDataChannel().
 */
rtcPeer.ondatachannel = function (event) {
  rChannel = event.channel;
  rChannel.onmessage = handleReceiveMessage;
  rChannel.onopen = handleReceiveChannelStatusChange;
  rChannel.onclose = handleReceiveChannelStatusChange;
}

/**
 * Methode permettant d'ajouter le message recu depuis le canal de transmission.
 */
function handleReceiveMessage(event) {
  remoteCodeMirror.setValue(event.data);
}

/**
* Methode permettant de gerer les evenements d'ouverture et fermeture du
* canal de transmission des donnees, lorsque celui ci est créer par le pair
* distant.
*/
function handleReceiveChannelStatusChange(event) {
  if (receiveChannel) {
    console.log("Receive channel's status has changed to " +
                receiveChannel.readyState);
  }
}


/**
 * Methode permettant d'envoyer un message a travers le canal de transmission.
 */
function sendMessage() {
    var message = myCodeMirror.getValue();
    sendChannel.send(message);

}



// On récupère les flux video et audio local
localStream = navigator.mediaDevices.getUserMedia(mediaOptions)
    .then(shareStream)
    .catch(handleError)

/**
 * Méthode permettant d'envoyer l'offre au pair distant.
 */
function sendOffer(offer, userId) {
  console.log("Sending Offer ...")
  socket.emit("offer", {offer, to: userId})
}

/**
 * Méthode permettant de recevoir l'offre du pair distant.
 */
function receivedOffer(offer, userId) {
  console.log("Received offer from : ", userId)
  rtcPeer.setRemoteDescription(offer);
  /**
   * Suite à cela le pair distant doit creer une réponse et renvoyer également
   * la description.
   */
  rtcPeer.createAnswer()
      .then((desc) => {
          rtcPeer.setLocalDescription(desc);
          console.log("Created Answer")
          sendAnswer(desc, userId);

      })
}

/**
 * Méthode permettant d'envoyer la réponse au pair distant.
 */
function sendAnswer(answer, userId) {
  socket.emit("answer", {answer, to: userId})
}

/**
 * Méthode permettant de recevoir la réponse du pair distant.
 */
function receivedAnswer(answer, fromUserId) {
    rtcPeer.setRemoteDescription(answer);
    console.log("Received answer from : ", fromUserId)
}


myCodeMirror.on('change', function () {
  sendMessage();
});


// Losqu'on souhaite effectuer la connexion entre nos deux objets RTCPeerConnection
document.getElementById("call").onclick = function () {

  userId = document.getElementById("remoteId").value
  console.log("The user ID is : " + userId)
  // On crée les options de l'offre a envoyer
    var offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    /**
     * La creation de l'offre necessite de definir au moins la "Description"
     * de la connexion (encodage, compression, algorithmes de cryptage, etc)
     */
    rtcPeer.createOffer(offerOptions)
        .then((desc) => {
            console.log("Creating offer : ", desc);
            rtcPeer.setLocalDescription(desc);
            sendOffer(desc, userId);

            })
        .catch(handleError)
}

socket.on("welcome", (data) => {
  console.log(data);
  document.getElementById('myId').innerHTML = data;
})

socket.on("offer", ({offer, from}) => {
  receivedOffer(offer, from)
})

socket.on("candidate", ({candidate, from}) => {
    rtcPeer.addIceCandidate(candidate)
    console.log("Added received candidate")
})
socket.on("answer",  ({answer, from}) => {
    receivedAnswer(answer, from)
})
