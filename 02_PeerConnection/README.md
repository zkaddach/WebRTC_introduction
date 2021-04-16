# Peer Connection
Dans ce second tutoriel nous allons voir comment établir la connexion entre deux pairs, afin de faire communiquer des navigateurs en P2P en temps-réel et ainsi pouvoir envoyer des flux vidéos et audios.

Pour cela WebRTC met à notre dispostion l'objet *RTCPeerConnection* que nous allons apprendre à manipuler.

## 1. Créer une instance RTCPeerConnection
Une instance RTCPeerConnection a besoin des serveurs STUN et TURN en paramètre. Nous verrons ce que sont ces serveurs ICE plus tard pour le moment on définit un objet null.

```js
// L'objet RTCPeerConnection a besoin des STUN/TURN servers.
var servers = {
  'iceServer': [
    {'urls': 'stun:stun.services.mozilla.com'},
    {'urls': 'stun:stun.l.google.com:19302'},
    {'urls': 'stun:stun2.l.google.com:19302'}
  ]
}
var rtcPeerObject = RTCPeerConnection(servers);
 ```

Une fois notre objet RTCPeerConnection crée nous pouvons y attacher les flux que nous avons récupérer grace à
getUserMedia() avec la methode **addStream()**.

```js
function shareStream(stream) {
    var video = document.getElementById('media-stream');
    video.srcObject = stream;
    // Rien de plus simple !
    rtcPeerObject.addStream(stream)
}

// Récupérer le flux de l'écran et du microphone
navigator.mediaDevices.getDisplayMedia(mediaOptions)
    .then(shareStream)
    .catch(handleError)
}
```

## 2. Déroulement de la connexion RTCPeerConnection : la signalisation
Avant d'aller plus loin, voici un récapulatif de ce qui a lieu lors d'une connexion
WebRTC. On considère un pair appelant qui souhaite communiquer avec un pair appelé.

> La signalisation est le mécanisme par lequel les pairs envoient des messages de
> contrôle à chacun dans le but d'établir le protocole de communication, le canal, etc.

Note : On appelera remotePC et localPc pour représenter les instances respective du
pair appelé et du pair appelant.

### 2-A. Pour ce faire la première étape pour les pairs est de disposer d'un même *canal de signalisation*. Dans ce tutoriel nous utiliserons des méthodes fictives qui simuleront la communication des pairs à travers le canal de signalisation.
```js
/**
 * Méthode fictive permettant d'envoyer l'offre au pair distant.
 */
function sendOfferToRemotePc(offer) {
  receivedOfferFromLocalPc(offer);
}

/**
 * Méthode fictive permettant d'envoyer la réponse au pair distant.
 */
function sendAnswerToLocalPc(answer) {
    receivedAnswerFromRemotePc(answer);
}
```

### 2-B. Une fois le canal de signalisation établi il faut que nos pairs puisse s'entendre sur le format des données qui seront envoyées. Pour cela le pair appelant créer une **offre** contenant la description de la session au format SDP (Session Description Protocol).
> On crée l'offre avec la méthode *rtcPeerObject.createOffer(options)*.
> Celle-ci renvoie une promesse qui prend en argument la description de la session.
> Nous avons besoin de dire à notre pair d'utiliser cette description puis nous devons l'envoyer au pair
> distant.

```js
/**
 * La creation de l'offre necessite de definir au moins la "Description"
 * de la session (encodage, compression, etc)
 */
 var offerOptions = {
     offerToReceiveAudio: 1,
     offerToReceiveVideo: 1
 };
rtcPeerObject.createOffer(offerOptions)
    .then((desc) => {
        console.log("Description de la session lors de la création de l'offre : ", desc);
        rtcPeerObject.setLocalDescription(desc);
        sendOfferToRemotePc(desc);

        })
    .catch(handleError)
```

### 2-C. Le pair appelé reçoit la description et renvoie une **réponse** au pair appelant.
> Lorsque le pair appelé reçoit l'offre du pair appelant il doit utiliser la description reçus et renvoyer
> une réponse au pair distant.

```js
/**
 * Méthode permettant de recevoir l'offre du pair appelant.
 */
function receivedOffer(offer) {
  // Utilisation de la description reçue
  rtcPeerObject.setRemoteDescription(offer);
  /**
   * Suite à cela le pair appelé doit creer une réponse et renvoyer également
   * sa description.
   */
  rtcPeerObject.createAnswer()
      .then((desc) => {
          // Utilisation de sa propre description
          rtcPeerObject.setLocalDescription(desc);
          // Envoie de la réponse au pair appelant
          sendAnswerToLocalPc(desc);

      })
}
```

> Finalement le pair appelant reçoit la réponse et définit la description du pair appelé

```js
/**
 * Méthode permettant de recevoir la réponse du pair distant.
 */
function receivedAnswer(answer) {
    rtcPeerObject.setRemoteDescription(answer);
}
```

### 2-D. Suite à cela les paramètres dit "d'encodages" des données sont définis il reste alors aux pairs de s'entendre sur les paramètres de la communication. WebRTC utilise pour cela le protocol ICE (Interactive Connectivity Establishment).
> Ce protocole laisse les deux pairs chercher et établir une connexion avec l'autre même
> s'ils utilisent tous les deux de la translation d'adresses (NAT).
> Plus d'information ici [MDN Web Docs](https://developer.mozilla.org/fr/docs/Glossary/ICE).

Pour faire simple, les pairs vont s'échanger des **ICE candidat** qui représentent leurs paramètres de connexion.
Ainsi chaque pair doit récupèrer les paramètres de l'autre et les ajouter.
Cela se fait au travers de l'évènement *onicecandidate*.
> Cet événement a lieu lorsque l'agent local ICE a besoin de delivrer un message a l'autre instance a travers
du canal de signalisation.

```js
/**
 * On gère la propriete onicecandidate de façon à ajouter le candidat à notre instance
 */
rtcPeerObject.onicecandidate = function (event) {
  /**
   * Cette méthode permet d'ajouter le nouveau candidat ICE a notre instance
   * RTCPeerConnection avec la description qui décrit l'état de l'instance distante.
   * On ajoute en paramètre le pair qui envoie son candidat ICE.
   */
   rtcPeerObject.addIceCandidate(event.candidate)
}
```


## 3. L'ajout et la récupération des flux
Notre connexion maintenant configurer il nous reste plus que gérer l'ajout d'un nouveau flux vidéo/audio
de l'un des pairs et la connecter à notre objet HTML.

```js
rtcPeerObject.onaddstream = function (event){
  console.log("Adding remote video");
  htmlVideo = document.getElementById('videoStream');
  htmlVideo.srcObject = event.stream;
}
```
