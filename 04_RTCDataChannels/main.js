

// On récupère les elements de la DOM
messageInputBox = document.getElementById('message');
receiveBox = document.getElementById('receivebox');
sendBtn = document.getElementById('send');
connectBtn = document.getElementById("connect");

function handleError(err){
    console.log(err);
}


// L'objet RTCPeerConnection a besoin des ICE servers (nous expliquerons ca) par la suite.
var servers = null;

// On crée les objets RTCPeerConnection qui vont communiquer entre eux.
var localPc = new RTCPeerConnection(servers);
var remotePc = new RTCPeerConnection(servers);


/** On crée un data channel pour pair local, chaque pair à sa propre
  * DataChannel.
  */
sendChannel = localPc.createDataChannel('sendChannel');
sendChannel.onopen = handleSendChannelStatusChange;
sendChannel.onclose = handleSendChannelStatusChange;

function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;

      if (state === "open") {
        messageInputBox.disabled = false;
        messageInputBox.focus();
        console.log("Channel opened");

      } else {
        messageInputBox.disabled = true;
        console.log("Channel closed");
      }
    }
}


remotePc.ondatachannel = receiveChannelCallback;
/**
 * Cette méthode permet d'ajouter le nouveau candidat ICE a notre instance
 * RTCPeerConnection avec la description qui décrit l'état de l'instance distante.
 */
function onIceCandidate(pc, event){
    let peerPc = (pc === localPc) ? remotePc : localPc;
    // On ajoute le candidat à l'objet RTCPeerConnection distant.
    peerPc.addIceCandidate(event.candidate)
        // On affiche que tout s'est bien passe
        .then(function () {
            let pcName = (pc === localPc) ? 'local peer connection' : 'remote peer connection';
            console.log(pcName + ' addIceCandidate success');
        })
        .catch(handleError)
}

/**
 * La propriété onicecandidate permet de gérer l'évenement icecandidate qui a lieu
 * lorsque l'agent local ICE a besoin de delivrer un message a l'autre instance a travers
 * le signaling server.
 * PLus de détails ici : 'https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate'
 */
localPc.onicecandidate = function (e) {
  onIceCandidate(localPc, e);
}

remotePc.onicecandidate = function (e) {
  onIceCandidate(remotePc, e);
}

// ----------- METHODS MANAGING DATA CHANNEL

function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }

function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  receiveChannel.readyState);
    }
}

function sendMessage() {
    var message = messageInputBox.value;
    sendChannel.send(message);

    messageInputBox.value = "";
    messageInputBox.focus();
}

function handleReceiveMessage(event) {
  var el = document.createElement("p");
  var txtNode = document.createTextNode(event.data);

  el.appendChild(txtNode);
  receiveBox.appendChild(el);
}

// ----------- METHODS MANAGING OFFER & ANSWER

/**
 * Méthode permettant d'envoyer l'offre au pair distant.
 */
function sendOfferToRemotePc(offer) {
  receivedOfferFromLocalPc(offer);
}

/**
 * Méthode permettant de recevoir l'offre du pair distant.
 */
function receivedOfferFromLocalPc(offer) {
  remotePc.setRemoteDescription(offer);
  /**
   * Suite à cela le pair distant doit creer une réponse et renvoyer également
   * la description.
   */
  remotePc.createAnswer()
      .then((desc) => {
          remotePc.setLocalDescription(desc);
          sendAnswerToLocalPc(desc);

      })
}

/**
 * Méthode permettant d'envoyer la réponse au pair distant.
 */
function sendAnswerToLocalPc(answer) {
    receivedAnswerFromRemotePc(answer);
}

/**
 * Méthode permettant de recevoir la réponse du pair distant.
 */
function receivedAnswerFromRemotePc(answer) {
    localPc.setRemoteDescription(answer);
}

// Losqu'on souhaite effectuer la connexion entre nos deux objets RTCPeerConnection
connectBtn.onclick = function () {

    /**
     * La creation de l'offre necessite de definir au moins la "Description"
     * de la connexion (encodage, compression, algorithmes de cryptage, etc)
     */
    localPc.createOffer()
        .then((desc) => {
            console.log(desc);
            localPc.setLocalDescription(desc);
            sendOfferToRemotePc(desc);

            })
        .catch(handleError)

    sendBtn.disabled = false;
}

sendBtn.onclick = function () {
  sendMessage();
}
