// Register Samsung Tizen hardware keys safely across all firmware versions
if (window.tizen && window.tizen.tvinputdevice) {
  try {
    const keysToRegister = [
      "MediaPlay", "MediaPause", "ColorF0Red", "ColorF1Green", 
      "ColorF2Yellow", "ColorF3Blue", "ChannelUp", "ChannelDown"
    ];
    keysToRegister.forEach(key => {
      try { tizen.tvinputdevice.registerKey(key); } catch (err) {}
    });
  } catch (e) {
    console.log("Tizen input device registration not required in standard browser mode.");
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

// Ensure window & canvas capture focus immediately on TV browsers
window.addEventListener('load', () => {
  window.focus();
  document.body.focus();
  const canvas = document.querySelector('canvas');
  if (canvas) canvas.focus();
});

window.addEventListener('click', () => {
  window.focus();
});

// Comprehensive Universal Key Map for Samsung TV Remotes
window.addEventListener("keydown", (e) => {
  const code = e.keyCode || e.which;
  const key = e.key;

  // Prevent default page scrolling on TV browsers for navigation keys
  if ([13, 37, 38, 39, 40, 29460, 29461, 10009].includes(code) || 
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) {
    e.preventDefault();
  }

  // Map directional keys (Supports Arrow keys, Numeric D-Pads, and WebKit TV codes)
  if (code === 38 || key === 'ArrowUp' || code === 29460 || key === 'Up') {
    remoteState.forward = true;
  }
  if (code === 40 || key === 'ArrowDown' || code === 29461 || key === 'Down') {
    remoteState.backward = true;
  }
  if (code === 37 || key === 'ArrowLeft' || code === 29459 || key === 'Left') {
    remoteState.turnLeft = true;
  }
  if (code === 39 || key === 'ArrowRight' || code === 29462 || key === 'Right') {
    remoteState.turnRight = true;
  }

  // Select / OK / Enter / Play buttons (Triggers interaction)
  if (code === 13 || key === 'Enter' || key === 'Select' || code === 1025 || code === 415) {
    remoteState.actionPressed = true;
    if (typeof handleTVInteraction === "function") {
      handleTVInteraction();
    }
  }

  // Universal Back / Return button support (Samsung Tizen 10009, WebKit 8, ESC 27)
  if (code === 10009 || code === 8 || code === 27 || key === 'Escape' || key === 'GoBack') {
    if (window.tizen && window.tizen.application) {
      try {
        tizen.application.getCurrentApplication().exit();
      } catch (err) {
        history.back();
      }
    } else {
      history.back();
    }
  }
});

window.addEventListener("keyup", (e) => {
  const code = e.keyCode || e.which;
  const key = e.key;

  if (code === 38 || key === 'ArrowUp' || code === 29460 || key === 'Up') {
    remoteState.forward = false;
  }
  if (code === 40 || key === 'ArrowDown' || code === 29461 || key === 'Down') {
    remoteState.backward = false;
  }
  if (code === 37 || key === 'ArrowLeft' || code === 29459 || key === 'Left') {
    remoteState.turnLeft = false;
  }
  if (code === 39 || key === 'ArrowRight' || code === 29462 || key === 'Right') {
    remoteState.turnRight = false;
  }
  if (code === 13 || key === 'Enter' || key === 'Select' || code === 1025 || code === 415) {
    remoteState.actionPressed = false;
  }
});
