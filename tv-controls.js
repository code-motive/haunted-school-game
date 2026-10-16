if (window.tizen && window.tizen.tvinputdevice) {
  try {
    tizen.tvinputdevice.registerKey("MediaPlay");
    tizen.tvinputdevice.registerKey("MediaPause");
  } catch (e) {
    console.log("Not running in Tizen TV container.");
  }
}

const remoteState = {
  forward: false,
  backward: false,
  turnLeft: false,
  turnRight: false,
  actionPressed: false
};

window.addEventListener("keydown", (e) => {
  switch (e.keyCode) {
    case 38: // D-Pad Up
      remoteState.forward = true;
      break;
    case 40: // D-Pad Down
      remoteState.backward = true;
      break;
    case 37: // D-Pad Left
      remoteState.turnLeft = true;
      break;
    case 39: // D-Pad Right
      remoteState.turnRight = true;
      break;
    case 13: // Enter / Center Button
      remoteState.actionPressed = true;
      if (typeof handleTVInteraction === "function") {
        handleTVInteraction();
      }
      break;
    case 10009: // Return / Back Button
      if (window.tizen) {
        tizen.application.getCurrentApplication().exit();
      } else {
        console.log("Exit requested via Remote Return button.");
      }
      break;
  }
});

window.addEventListener("keyup", (e) => {
  switch (e.keyCode) {
    case 38: remoteState.forward = false; break;
    case 40: remoteState.backward = false; break;
    case 37: remoteState.turnLeft = false; break;
    case 39: remoteState.turnRight = false; break;
    case 13: remoteState.actionPressed = false; break;
  }
});

