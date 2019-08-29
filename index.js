// AA1 newly added 
// const webcamElement = document.getElementById('webcam');

// AA2:  Added the new classifier
const classifier = knnClassifier.create();

let net;

// AA1 original
// async function app() {
//   console.log('Loading mobilenet..');

//   // Load the model.
//   net = await mobilenet.load();
//   console.log('Sucessfully loaded model');

//   // Make a prediction through the model on our image.
//   const imgEl = document.getElementById('img');
//   const result = await net.classify(imgEl);
//   console.log(result);
// }

// AA1: Added replacement function
// AA2  Replaced with 3rd function for use ith new KNN classifier
// async function app() {
//   console.log('Loading mobilenet..');

//   // Load the model.
//   net = await mobilenet.load();
//   console.log('Sucessfully loaded model');
  
//   await setupWebcam();
//   while (true) {
//     const result = await net.classify(webcamElement);

//     document.getElementById('console').innerText = `
//       prediction: ${result[0].className}\n
//       probability: ${result[0].probability}
//     `;

//     // Give some breathing room by waiting for the next animation frame to
//     // fire.
//     await tf.nextFrame();
//   }
// }

// AA2: New function
async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  document.getElementById('class-d').addEventListener('click', () => addExample(3));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['A', 'B', 'C', 'D'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

// // AA1:  Newly added 
async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();

