// Register Tizen TV Remote hardware keys if running inside a Tizen container
if (window.tizen && window.tizen.tvinputdevice) {
  try {
    tizen.tvinputdevice.registerKey("MediaPlay");
    tizen.tvinputdevice.registerKey("MediaPause");
    tizen.tvinputdevice.registerKey("ChannelUp");
    tizen.tvinputdevice.registerKey("ChannelDown");
  } catch (e) {
    console.log("Tizen input device registration skipped or not supported in browser mode.");
  }
}

// Global remote state accessed by game-3d.js
const remoteState = {
  forward: false,
  backward: false,
  turnLeft: false,
  turnRight: false,
  actionPressed: false
};

// Ensure window has focus so TV browser captures remote keys immediately
window.addEventListener('load', () => {
  window.focus();
  document.body.focus();
});

window.addEventListener('click', () => {
  window.focus();
});

// Key Down Event Listener
window.addEventListener("keydown", (e) => {
  // Prevent default scrolling behavior for TV remote arrow keys
  if ([37, 38, 39, 40, 13].includes(e.keyCode)) {
    e.preventDefault();
  }

  switch (e.keyCode) {
    case 38: // D-Pad Up -> Move Forward
      remoteState.forward = true;
      break;
    case 40: // D-Pad Down -> Move Backward
      remoteState.backward = true;
      break;
    case 37: // D-Pad Left -> Turn Left
      remoteState.turnLeft = true;
      break;
    case 39: // D-Pad Right -> Turn Right
      remoteState.turnRight = true;
      break;
    case 13: // Enter / Center OK Button -> Interact with Definition Box
      remoteState.actionPressed = true;
      if (typeof handleTVInteraction === "function") {
        handleTVInteraction();
      }
      break;
    case 10009: // Return / Back Button on Samsung TV Remote
      if (window.tizen) {
        tizen.application.getCurrentApplication().exit();
      } else {
        console.log("Exit requested via Remote Return button.");
      }
      break;
  }
});

// Key Up Event Listener (Stops movement immediately when remote button is released)
window.addEventListener("keyup", (e) => {
  switch (e.keyCode) {
    case 38: 
      remoteState.forward = false; 
      break;
    case 40: 
      remoteState.backward = false; 
      break;
    case 37: 
      remoteState.turnLeft = false; 
      break;
    case 39: 
      remoteState.turnRight = false; 
      break;
    case 13: 
      remoteState.actionPressed = false; 
      break;
  }
});
