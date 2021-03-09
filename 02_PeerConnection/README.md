# Peer Connection
Dans ce second tutoriel nous allons voir comment établir la connexion entre deux pairs, afin de faire communiquer des navigateurs en P2P en temps-réel et ainsi pouvoir envoyer des flux vidéos et audios.

Pour cela WebRTC met à notre dispostion l'objet *RTCPeerConnection* que nous allons apprendre à manipuler.

## 1. Créer une instance RTCPeerConnection
Une instance RTCPeerConnection a besoin des serveurs STUN et TURN en paramètre. Nous verrons ce que sont ces serveurs ICE plus tard pour le moment on définit un objet null.

```js
var servers = null;
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

1. Pour ce faire la première étape pour les pairs est de disposer d'un même *canal de signalisation*. Dans ce tutoriel nous
utiliserons des méthodes fictives qui simuleront la communication des pairs à travers le
canal de signalisation.

2. Une fois le canal de signalisation établi il faut que nos pairs puisse s'entendre sur le format des
données qui seront envoyées. Pour cela le pair appelant créer une **offre** contenant la description
de la session au format SDP (Session Description Protocol).

3. Le pair appelé reçoit la description et renvoie une **réponse** au pair appelant.

4. Suite à cela les paramètres dit "d'encodages" des données sont définis il
reste alors aux pairs de s'entendre sur les paramètres de la communication. WebRTC utilise pour cela
le protocol ICE (Interactive Connectivity Establishment).
> Ce protocole laisse les deux pairs chercher et établir une connexion avec l'autre même
> s'ils utilisent tous les deux de la translation d'adresses (NAT).
> Plus d'information ici [MDN Web Docs](https://developer.mozilla.org/fr/docs/Glossary/ICE).

## 2. L'évenement onicecandidate

## 3. L'ajout et la récupération des flux

## 4. La création de l'offre

## 5. La création de la réponse  
