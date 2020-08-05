var JSSDK = JSSDK || {};
JSSDK.Assets = {
  "wasm": {
      "affdex-native-bindings.wasm": "https://download.affectiva.com/js/wasm/affdex-native-bindings.wasm",
      "affdex-native-bindings.js": "https://download.affectiva.com/js/wasm/affdex-native-bindings.js",
      "affdex-native-bindings.data": "https://download.affectiva.com/js/wasm/affdex-native-bindings.data",
      "affdex-worker.js": "https://download.affectiva.com/js/wasm/affdex-worker.js"
  }
};

var divRoot = document.querySelectorAll(".suspension-content")[1].querySelector('.suspension-content2');
var width = 480;
var height = 480;
var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
var detector = new affdex.CameraDetector(divRoot, width, height, faceMode);
detector.detectExpressions.smile = true;
detector.detectExpressions.attention = true;
detector.detectExpressions.mouthOpen = true;
detector.detectEmotions.valence = true;
onStart();

// add 'get analysis' button at footer
var footer = document.querySelector('#wc-footer');
var container = document.createElement('div');
container.innerHTML = "<button class='footer__leave-btn ax-outline' type='button' onclick='onStop()'><span class='footer__leave-btn-text'>Get Analysis</span></button>";
footer.appendChild(container);

// emotions and expressions being tracked
var smile_ = [];
var attention_ = [];
var talking_ = [];
var valence_ = [];
var framenum = [];
var ind = 0;

function onStart() {
  if (detector && !detector.isRunning) {
    detector.start(JSSDK.Assets.wasm);
  }
}

function onStop() {
  if (detector && detector.isRunning) {
    // stop detector
    detector.removeEventListener();
    detector.stop();
    console.log('STOPPED');
    document.querySelector('#zmmtg-root').className = "hidden";

    var smileChart = {
      x: framenum,
      y: smile_,
      name: 'Smile',
      type: 'lines'
    };

    var attentionChart = {
      x: framenum,
      y: attention_,
      name: 'Attention',
      type: 'lines'
    };

    var talkingChart = {
      x: framenum,
      y: talking_,
      name: 'Talking',
      type: 'lines'
    };

    var valenceChart = {
      x: framenum,
      y: valence_,
      name: 'Valence',
      type: 'lines'
    };

    var data4 = [smileChart, attentionChart, talkingChart, valenceChart];

    var layout = {
      title: 'Doctor\'s state through out the session',
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
    smile_ = [];
    attention_ = [];
    talking_ = [];
    valence_ = [];
  //  framenum = [];
  }
};

detector.addEventListener("onInitializeSuccess", function() {
  // var selfMonitorWindow = document.createElement('div');
  // selfMonitorWindow.classList.add("vsc-controller", "vsc-nosource", "vcs-show", "vsc-hidden");
  // continue from here
  document.querySelector("#face_video_canvas").style.display = "block";
  document.querySelector("#face_video").style.display = "none";
  console.log("DETECTOR INITIALIZED");

});

detector.addEventListener("onWebcamConnectSuccess", function() {
  console.log("Webcam access allowed");
});

detector.addEventListener("onWebcamConnectFailure", function() {
  console.log("Webcam access denied");
});

detector.addEventListener("onStopSuccess", function() {
  console.log("DETECTOR WAS STOPPED")
});

detector.addEventListener("onImageResultsSuccess", function(faces, image, timestamp) {
  console.log("FINISHED PROCESSING");
  if (faces.length > 0) {
    console.log(faces);
    if(document.querySelector('#face_video_canvas') != null){
      drawFeaturePoints(image, faces[0].featurePoints);
      console.log("DRAWS FEATURE POINTS");
    }
    ind += 1;
    framenum.push(ind);
    smile_.push(faces[0].expressions['smile'].toFixed(0));
    attention_.push(faces[0].expressions['attention'].toFixed(0));
    talking_.push(faces[0].expressions['mouthOpen'].toFixed(0));
    valence_.push(faces[0].emotions['valence'].toFixed(0));
  } else {
    ind += 1;
    framenum.push(ind);
    smile_.push(0);
    attention_.push(0);
    talking_.push(0);
    valence_.push(0);
  }
  setTimeout(detector.captureNextImage, 150);
});

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
