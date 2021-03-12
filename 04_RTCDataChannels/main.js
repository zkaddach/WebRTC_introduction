// On récupère les elements de la DOM
messageInputBox = document.getElementById('message');
receiveBox = document.getElementById('receivebox');
sendBtn = document.getElementById('send');
connectBtn = document.getElementById("connect");


// L'objet RTCPeerConnection a besoin des ICE servers
var servers = null;


// On crée l' objet RTCPeerConnection local.
var localPc = new RTCPeerConnection(servers);


/**
 * La propriété 'onicecandidate' permet de gérer l'évenement icecandidate qui a lieu
 * lorsque l'agent local ICE a besoin de delivrer un message a l'autre instance a travers
 * le signaling server.
 * PLus de détails ici : 'https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate'
 */
localPc.onicecandidate = function (e) {
  onIceCandidate(localPc, e);
}


// On crée l' objet RTCPeerConnection distant.
var remotePc = new RTCPeerConnection(servers);


/**
 * La propriété 'ondatachannel' permet de gérer l'événement 'datachanne' qui a lieu
 * lorsque un RTCDataChannel est ajouté par le pair distant avec la méthode
 * createDataChannel().
 */
remotePc.ondatachannel = receiveChannelCallback;


 remotePc.onicecandidate = function (e) {
   onIceCandidate(remotePc, e);
 }


/** On crée un data channel pour le pair local.
 * Puis on définit les méthodes permettant de gérer les evenements
 * 'onopen' et 'onclose'. Ces evenements ont lieu lorsque le canal pour
 * transmettre les donnnees est etabli/ferme.
 */
sendChannel = localPc.createDataChannel('sendChannel');
sendChannel.onopen = handleSendChannelStatusChange;
sendChannel.onclose = handleSendChannelStatusChange;


/**
 * Methode pour afficher les erreurs des promesses.
 */
function handleError(err){
    console.log(err);
}


/**
 * Methode pour gerer l'evenement 'onicecandidate', elle ajoute le
 * ICE candidat a l'objet RTCPeerConnection.
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


// ----------- METHODS MANAGING DATA CHANNEL


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
 * Methode qui gere l'ajout d'un canal de transmission par le pair distant.
 * ici : On recupere le canal, le message, et on définit les méthodes de gestion
 * d'ouverture et fermeture du canal.
 */
function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
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
    var message = messageInputBox.value;
    sendChannel.send(message);

    messageInputBox.value = "";
    messageInputBox.focus();
}


/**
 * Methode permettant d'ajouter le message recu depuis le canal de transmission.
 */
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


/**
 * Méthode permettant d'effectuer la connexion entre nos deux objets RTCPeerConnection
 */
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


/**
 * Méthode permettant d'envoyer le message lorsque l'utilisateur click...
 */
sendBtn.onclick = function () {
  sendMessage();
}
