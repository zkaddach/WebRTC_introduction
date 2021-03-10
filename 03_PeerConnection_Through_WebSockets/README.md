# Peer Connection with WebSockets
Dans ce second tutoriel nous allons voir comment établir la connexion entre deux pairs, afin de faire communiquer des navigateurs en P2P en temps-réel et ainsi pouvoir envoyer des flux vidéos et audios.

Pour cela WebRTC met à notre dispostion l'objet *RTCPeerConnection* que nous allons apprendre à manipuler.


<details>
<summary><h2> Prérequis : installation de nodeJS </h2></summary>
Installation des librairies nodeJS avec *npm* suivantes :
- express
```sh
npm install -S express
```

- socket.io
```sh
npm install -S socket.io
```
</details>

## 1. Créer une instance RTCPeerConnection
Une instance RTCPeerConnection a besoin des serveurs STUN et TURN en paramètre. Nous verrons ce que sont ces serveurs ICE plus tard pour le moment on définit un objet null.

```js
var servers = null;
var rtcPeerObject = RTCPeerConnection(servers);
 ```

Une fois notre objet RTCPeerConnection crée nous pouvons y attacher les flux que nous avons récupérer grace à
getUserMedia().

```js
rtcPeerObject.addStream(stream)
```


## 2. L'évenement onicecandidate

## 3. L'ajout et la récupération des flux

## 4. La création de l'offre

## 5. La création de la réponse  
