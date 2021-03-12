// Instance of the local CodeMirror object
var myCodeMirror = CodeMirror.fromTextArea(document.getElementById('localCode'), {
    lineNumbers: true,
    matchBrackets: true,
    theme: "ambiance"
});

// Instance of the remote CodeMirror object
var remoteCodeMirror = CodeMirror.fromTextArea(document.getElementById('remoteCode'), {
    lineNumbers: true,
    matchBrackets: true,
    theme: "ambiance",
    readOnly: true
});

function readSingleFile(event) {
  var file = event.target.files[0];
  if (!file) {return;}
  var reader = new FileReader();
  reader.onload = function (ev) {
    var contents = ev.target.result;
    displayContent(contents);
  };
  reader.readAsText(file);
}

function displayContent(content) {
  myCodeMirror.setValue(content);
}

document.getElementById('file-input')
  .addEventListener('change', readSingleFile, false);
