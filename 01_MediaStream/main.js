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

document.getElementById("share-screen").onclick=function () {

    // Récupérer le flux de l'écran et du microphone
    navigator.mediaDevices.getDisplayMedia(mediaOptions)
        .then(shareStream)
        .catch(handleError)

}

document.getElementById("start-camera").onclick=function () {

    // Récupérer le flux de la caméra et du microphone
    navigator.mediaDevices.getUserMedia(mediaOptions)
      .then(shareStream)
      .catch(handleError)
}
