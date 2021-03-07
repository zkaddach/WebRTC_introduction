# Media Stream API

Dans ce premier tutoriel nous allons voir comment récupérer les appareils disponibles à partir du navigateur de l'utilisateur, notamment :
- Le flux vidéo issu de la caméra et/ou de l'écran de votre appareil.
- Le flux audio issu du microphone.

Note: Les flux audio et vidéos sont syncronisés par l'API.


Pour cela WebRTC mets à notre disposition un object appelé *MediaStream* dont nous allons
voir deux méthodes.

## MediaDevices.getUserMedia()
Permet de récupérer le flux vidéo de la caméra et/ou le flux audio du microphone.
Voici le code :
```js
function callbackOnSucess(stream){
    // Movai Code qui récupère le stream
}

function callbackOnError(err){
    // Movai Code pour gérer l'erreur
}

// Options du streaming
var options = {
    video: true,
    audio: true
}

navigator.mediaDevices.getUserMedia(options, callbackOnSucess, callbackOnError)
```

## MediaDevices.getDisplayMedia()
Permet de récupérer le flux vidéo de l'écran et/ou le flux audio du microphone.
Fonctionne de facon identique à la méthode *getUserMedia*.
Voici le code :
```js
function callbackOnSucess(stream){
    // Movai Code qui récupère le stream
}

function callbackOnError(err){
    // Movai Code pour gérer l'erreur
}

// Options du streaming
var options = {
    video: true,
    audio: true
}

navigator.mediaDevices.getDisplayMedia(options, callbackOnSucess, callbackOnError)
```
