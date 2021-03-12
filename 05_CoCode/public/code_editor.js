// Creation de l'instance CodeMirror pour l'utilisateur local
var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('localCode'), {
    lineNumbers: true,
    matchBrackets: true,
    theme: "ambiance"
});

// Creation de l'instance CodeMirror pour l'utilisateur distant
var remoteCodeMirror = CodeMirror.fromTextArea(document.getElementById('remoteCode'), {
    lineNumbers: true,
    matchBrackets: true,
    theme: "ambiance",
    // On ne permet à l'utilisateur de modifie le code de l'utilisateur distant
    readOnly: true
});

/**
 * Fonction permettant de lire un fichier avec FileReader
 */
function readSingleFile(event) {
  // On récupère le chemin du fichier
  var file = event.target.files[0];
  // Si le chemin est vide quitte la fonction
  if (!file) {
    console.log("Fichier non trouve");
    return;
  }
  // Creation de l'instance FileReader
  var reader = new FileReader();
  // Lorsque l'objet FileReader a finit la lecture du fichier il cree l'evenement 'onload'
  reader.onload = function (ev) {
    // On recupere le contenu et on l'affiche
    var contents = ev.target.result;
    displayContent(contents);
  };
  // Lancement de la lecture du fichier
  reader.readAsText(file);
}

/**
 * Fonction permettant d'ecrir le fichier ouvert dans l'editeur CodeMirror
 */
function displayContent(content) {
  myCodeMirror.setValue(content);
}

/**
 * Event handler qui charge le fichier selection par l'utilisateur
*/
document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
