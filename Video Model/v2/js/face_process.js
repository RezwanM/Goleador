var JSSDK = JSSDK || {};
JSSDK.Assets = {
  "wasm": {
      "affdex-native-bindings.wasm": "https://download.affectiva.com/js/wasm/affdex-native-bindings.wasm",
      "affdex-native-bindings.js": "https://download.affectiva.com/js/wasm/affdex-native-bindings.js",
      "affdex-native-bindings.data": "https://download.affectiva.com/js/wasm/affdex-native-bindings.data",
      "affdex-worker.js": "https://download.affectiva.com/js/wasm/affdex-worker.js"
  }
};

var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
var detector = new affdex.FrameDetector(faceMode);
detector.detectAllEmotions();
detector.assets = JSSDK.Assets["wasm"];
detector.start();

//Cache the timestamp of the first frame processed
var startTimestamp = (new Date()).getTime() / 1000;

detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  console.log("FINISHED PROCESSING");
  console.log(faces);
  if (faces.length > 0) {
    // log('#results', "Appearance: " + JSON.stringify(faces[0].appearance));
    // log('#results', "Emotions: " + JSON.stringify(faces[0].emotions, function(key, val) {
    //   return val.toFixed ? Number(val.toFixed(0)) : val;
    // }));
    // log('#results', "Expressions: " + JSON.stringify(faces[0].expressions, function(key, val) {
    //   return val.toFixed ? Number(val.toFixed(0)) : val;
    // }));
    // log('#results', "Emoji: " + faces[0].emojis.dominantEmoji);
    if(document.querySelector('#face_video_canvas') != null)
      drawFeaturePoints(image, faces[0].featurePoints);
      console.log("DRAWS FEATURE POINTS");
  }


});

detector.addEventListener("onImageResultsFailure", function(faces, image, timestamp) {
  console.log("FAILED PROCESSING");
});

detector.addEventListener("onInitializeSuccess", function() {
  console.log("INITIALIZE SUCCESS");
  var canvasVideo = document.querySelector("#sv-active-speaker-view .active-main #sv-active-video");
  canvasVideo.className = "hidden";

  var canvas = document.createElement('canvas');
  canvas.id = "face_video_canvas";
  canvas.width = canvasVideo.width * 3;
  canvas.height = canvasVideo.height * 3;
  canvas.display = "block";
  var parent = document.querySelector("#sv-active-speaker-view .active-main");
  parent.appendChild(canvas);
  var context = canvas.getContext('2d');

  async function draw(im, time) {
    detector.process(im, time);
  };

  (async function repeat() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(canvasVideo, 0, 0, canvas.width, canvas.height);
    // console.log("COPYING IMAGE ONTO CANVAS SUCCESSFUL!")
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    //Get current time in seconds
    var now = (new Date()).getTime() / 1000;
    //Get delta time between the first frame and the current frame.
    var deltaTime = now - startTimestamp;
    //Process the frame
    await draw(imageData, deltaTime).then(setTimeout(repeat, 500));
    // detector.process(imageData, deltaTime);
    // console.log("GOT TO PROCESSING");

  })();
});

detector.addEventListener("onInitializeFailure", function() {
  console.log("FAILED INITIALIZING");
});


//Draw the detected facial feature points on the image
function drawFeaturePoints(img, featurePoints) {
  var contxt = document.querySelector('#face_video_canvas').getContext('2d');

  var hRatio = contxt.canvas.width / img.width;
  var vRatio = contxt.canvas.height / img.height;
  var ratio = Math.min(hRatio, vRatio);

  contxt.strokeStyle = "#FFFFFF";
  for (var id in featurePoints) {
    contxt.beginPath();
    contxt.arc(featurePoints[id].x,
      featurePoints[id].y, 2, 0, 2 * Math.PI);
    contxt.stroke();
  }
}
