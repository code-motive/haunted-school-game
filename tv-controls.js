// 1. Register Tizen TV Input Device keys so the browser captures hardware remote events
if (window.tizen && window.tizen.tvinputdevice) {
  try {
    const smartRemoteKeys = [
      "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Select",
      "ColorF0Red", "ColorF1Green", "ColorF2Yellow", "ColorF3Blue",
      "MediaPlay", "MediaPause", "ChannelUp", "ChannelDown", "VolUp", "VolDown"
    ];
    smartRemoteKeys.forEach(key => {
      try { tizen.tvinputdevice.registerKey(key); } catch (err) {}
    });
  } catch (e) {
    console.log("Tizen input device registration skipped (running in standard browser).");
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

// 2. Force window and document body focus so TV browser captures key inputs immediately
window.addEventListener('load', () => {
  window.focus();
  document.body.focus();
  createOnScreenController(); // Adds clickable fallback for TV browser testing
});

window.addEventListener('click', () => {
  window.focus();
});

// 3. Universal Keydown Listener for Samsung Smart Remotes
window.addEventListener("keydown", (e) => {
  const code = e.keyCode || e.which;
  const key = e.key;

  // Prevent default page scrolling on TV browser
  if ([13, 37, 38, 39, 40, 10009, 415, 19].includes(code) || 
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(key)) {
    e.preventDefault();
  }

  // D-Pad Up (Move Forward)
  if (code === 38 || key === 'ArrowUp' || code === 29460 || key === 'Up') {
    remoteState.forward = true;
  }
  // D-Pad Down (Move Backward)
  if (code === 40 || key === 'ArrowDown' || code === 29461 || key === 'Down') {
    remoteState.backward = true;
  }
  // D-Pad Left (Turn Left)
  if (code === 37 || key === 'ArrowLeft' || code === 29459 || key === 'Left') {
    remoteState.turnLeft = true;
  }
  // D-Pad Right (Turn Right)
  if (code === 39 || key === 'ArrowRight' || code === 29462 || key === 'Right') {
    remoteState.turnRight = true;
  }

  // Center Select / OK Button / Play/Pause (Interact)
  if (code === 13 || key === 'Enter' || key === 'Select' || code === 415 || code === 1025) {
    remoteState.actionPressed = true;
    if (typeof handleTVInteraction === "function") {
      handleTVInteraction();
    }
  }

  // Back / Return Button (Samsung Tizen code 10009)
  if (code === 10009 || code === 8 || code === 27 || key === 'Escape' || key === 'GoBack') {
    if (window.tizen && window.tizen.application) {
      try { tizen.application.getCurrentApplication().exit(); } catch (err) { history.back(); }
    } else {
      history.back();
    }
  }
});

// Keyup Listener to halt movement instantly when D-Pad is released
window.addEventListener("keyup", (e) => {
  const code = e.keyCode || e.which;
  const key = e.key;

  if (code === 38 || key === 'ArrowUp' || code === 29460 || code === 'Up') remoteState.forward = false;
  if (code === 40 || key === 'ArrowDown' || code === 29461 || key === 'Down') remoteState.backward = false;
  if (code === 37 || key === 'ArrowLeft' || code === 29459 || key === 'Left') remoteState.turnLeft = false;
  if (code === 39 || key === 'ArrowRight' || code === 29462 || key === 'Right') remoteState.turnRight = false;
  if (code === 13 || key === 'Enter' || key === 'Select' || code === 415) remoteState.actionPressed = false;
});

// 4. On-Screen Virtual D-Pad Fallback (Visible on TV screen so you can navigate with remote pointer if browser blocks keys)
function createOnScreenController() {
  if (document.getElementById('tv-virtual-pad')) return;
  
  const padDiv = document.createElement('div');
  padDiv.id = 'tv-virtual-pad';
  padDiv.style.cssText = "position:absolute; bottom:20px; right:20px; z-index:9999; display:flex; flex-direction:column; align-items:center; background:rgba(0,0,0,0.6); padding:10px; border-radius:10px;";
  
  padDiv.innerHTML = `
    <button id="v-up" style="padding:10px 20px; font-size:16px; background:#333; color:#fff; border:1px solid #777; margin:2px;">▲ </button>
    <div style="display:flex;">
      <button id="v-left" style="padding:10px 20px; font-size:16px; background:#333; color:#fff; border:1px solid #777; margin:2px;">◀ L</button>
      <button id="v-ok" style="padding:10px 20px; font-size:16px; background:#ffcc00; color:#000; border:1px solid #777; margin:2px; font-weight:bold;">OK</button>
      <button id="v-right" style="padding:10px 20px; font-size:16px; background:#333; color:#fff; border:1px solid #777; margin:2px;">R ▶</button>
    </div>
    <button id="v-down" style="padding:10px 20px; font-size:16px; background:#333; color:#fff; border:1px solid #777; margin:2px;">▼ </button>
  `;
  document.body.appendChild(padDiv);

  // Bind virtual button touch/click events so TV browser pointer can control movement
  const bindBtn = (id, startAction, endAction) => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('mousedown', () => { remoteState[startAction] = true; });
    btn.addEventListener('mouseup', () => { remoteState[startAction] = false; });
    btn.addEventListener('touchstart', (e) => { e.preventDefault(); remoteState[startAction] = true; });
    btn.addEventListener('touchend', (e) => { e.preventDefault(); remoteState[startAction] = false; });
  };

  bindBtn('v-up', 'forward');
  bindBtn('v-down', 'backward');
  bindBtn('v-left', 'turnLeft');
  bindBtn('v-right', 'turnRight');
  
  const okBtn = document.getElementById('v-ok');
  if (okBtn) {
    okBtn.addEventListener('click', () => {
      if (typeof handleTVInteraction === "function") handleTVInteraction();
    });
  }
}
