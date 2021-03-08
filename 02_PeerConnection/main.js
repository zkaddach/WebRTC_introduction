function shareStream(stream) {
    var video = document.getElementById('localVideo');
    video.srcObject = stream;
    // Il faut ajouter le stream a l'object RTCPeerConnection
    localPc.addStream(stream);
}

function handleError(err){
    console.log(err);
}

var mediaOptions = {
    video: true,
    audio: true
}

// L'objet RTCPeerConnection a besoin des ICE servers (nous expliquerons ca) par la suite.
var servers = null;

// On crée les objets RTCPeerConnection qui vont communiquer entre eux.
var localPc = new RTCPeerConnection(servers);
var remotePc = new RTCPeerConnection(servers);

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

/**
 * La propriete onaddstream permet de gerer l'evenenement addstream de type
 * MediaStreamEvent, qui est recu par l'objet RTCPeerConnection.
 * Un tel evenement a lieu lorque un MediaStream est ajouter a la connection par
 * le pair distant.
 * Cet evenement est envoye directement apres l'appel de RTCPeerConnection.setRemoteDescription
 * et n'attend pas le resultat de negotiation SDP.
 */
remotePc.onaddstream = function (e){
  console.log("Adding remote video");
  remoteVideo = document.getElementById('remoteVideo');
  remoteVideo.srcObject = e.stream;
}

// On récupère les flux video et audio local
navigator.mediaDevices.getUserMedia(mediaOptions)
    .then(shareStream)
    .catch(handleError)


// Losqu'on souhaite effectuer la connexion entre nos deux objets RTCPeerConnection
document.getElementById("call").onclick = function () {

  // On crée les options de l'offre a envoyer
    var offerOptions = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
    };
    /**
     * La creation de l'offre necessite de definir au moins la "Description"
     * de la connexion (encodage, compression, algorithmes de cryptage, etc)
     */
    localPc.createOffer(offerOptions)
        .then((desc) => {
            console.log(desc);
            localPc.setLocalDescription(desc);
            remotePc.setRemoteDescription(desc);

            /**
             * Suite à cela le pair distant doit creer une réponse et renvoyer également
             * la description.
            */
            remotePc.createAnswer()
                .then((desc) => {
                    remotePc.setLocalDescription(desc);
                    localPc.setRemoteDescription(desc);
                })
            })
        .catch(handleError)
}
