document.getElementById("share-screen").onclick=function () {
    var mediaOptions = {
        video: true,
        audio: false
    }
    try {
        // Récupérer le screen
        let media = navigator.mediaDevices.getDisplayMedia(mediaOptions)
          .then( (stream) => {
          	var video = document.getElementById('media-stream');
          	video.srcObject = stream;

          })
          .catch( (err) => {
            console.log(err)
        })
    }
    catch (err) {
        console.log(err)
    }
}


document.getElementById("start-camera").onclick=function () {
  var mediaOptions = {
      video: true,
      audio: true
  }

  try {
    let media = navigator.mediaDevices.getUserMedia(mediaOptions)
      .then( (stream) => {
        var video = document.getElementById('media-stream');
        video.srcObject = stream;
      })
      .catch( (err) => {
        console.log(err);
      })
  }
  catch (err) {
    console.log(err);
  }
}
