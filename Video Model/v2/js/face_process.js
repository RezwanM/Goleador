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
detector.detectEmotions.sadness = true;
detector.detectExpressions.browFurrow = true;
detector.detectEmotions.engagement = true;
detector.detectEmotions.smile = true;
detector.assets = JSSDK.Assets["wasm"];
detector.start();

// add onStop functionality to 'leave button'
var footer = document.querySelector('#wc-footer');
var container = document.createElement('div');
container.innerHTML = "<button class='footer__leave-btn ax-outline' type='button' onclick='onStop()'><span class='footer__leave-btn-text'>Get Analysis</span></button>";
footer.appendChild(container);

// emotions and expressions being tracked
var sadness_ = [];
var confusion_ = [];
var engagement_ = [];
var smile_ = [];
var framenum = [];
var ind = 0;

//function executes when the Stop button is pushed.
function onStop() {
  if (detector && detector.isRunning) {
    detector.removeEventListener();
    detector.stop();
    console.log('STOPPED');
    document.querySelector('#zmmtg-root').className = "hidden";

    var sadnessChart = {
      x: framenum,
      y: sadness_,
      name: 'Sadness',
      type: 'lines'
    };

    var confusionChart = {
      x: framenum,
      y: confusion_,
      name: 'Confusion',
      type: 'lines'
    };

    var engagementChart = {
      x: framenum,
      y: engagement_,
      name: 'Engagement',
      type: 'lines'
    };

    var smileChart = {
      x: framenum,
      y: smile_,
      name: 'Smile',
      type: 'lines'
    };

    var data4 = [sadnessChart, confusionChart, engagementChart, smileChart];

    var layout = {
      title: 'Patient\'s state through out the session',
      xaxis: {
        title: 'Frame number'
      },
      yaxis: {
        title: 'Emotion detected',
        showline: false
      }
    };

    Plotly.newPlot('analytics', data4, layout);

    //re-setting all arrays
    sadness_ = [];
    confusion_ = [];
    engagement_ = [];
    smile_ = [];
  //  framenum = [];
  }
};

//Cache the timestamp of the first frame processed
var startTimestamp = (new Date()).getTime() / 1000;

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

  })();
});

detector.addEventListener("onInitializeFailure", function() {
  console.log("FAILED INITIALIZING");
});


detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  console.log("FINISHED PROCESSING");
  console.log(faces);
  if (faces.length > 0) {
    if(document.querySelector('#face_video_canvas') != null) {
      drawFeaturePoints(image, faces[0].featurePoints);
      console.log("DRAWS FEATURE POINTS");
    }
    ind += 1;
    framenum.push(ind);
    sadness_.push(faces[0].emotions['sadness'].toFixed(2));
    confusion_.push(faces[0].expressions['browFurrow'].toFixed(2));
    engagement_.push(faces[0].emotions['engagement'].toFixed(2));
    smile_.push(faces[0].expressions['smile'].toFixed(2));
  } else {
    ind += 1;
    framenum.push(ind);
    sadness_.push(0);
    confusion_.push(0);
    engagement_.push(0);
    smile_.push(0);
  }
});

detector.addEventListener("onImageResultsFailure", function(faces, image, timestamp) {
  console.log("FAILED PROCESSING");
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
