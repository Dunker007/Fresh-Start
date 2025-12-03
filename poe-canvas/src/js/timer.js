// timer.js - Focus timer (Pomodoro)
import { updateState } from './state.js';

let appState = null;
let timerInterval = null;

export function setAppState(state) {
  appState = state;
}

export function initTimer(state) {
  appState = state;
  renderTimer();
  
  const startBtn = document.getElementById('timerStartBtn');
  const resetBtn = document.getElementById('timerResetBtn');
  
  if (startBtn) startBtn.addEventListener('click', toggleTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
}

export function renderTimer() {
  if (!appState) return;
  
  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('timerStartBtn');
  
  if (display) {
    const minutes = Math.floor(appState.timerState.time / 60);
    const seconds = appState.timerState.time % 60;
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  if (startBtn) {
    const icon = startBtn.querySelector('i');
    if (icon) {
      icon.className = appState.timerState.running ? 'fas fa-pause' : 'fas fa-play';
    }
  }
}

export function toggleTimer() {
  if (!appState) return;
  
  if (appState.timerState.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

export function startTimer() {
  if (!appState || appState.timerState.running) return;
  
  updateState(appState, s => s.timerState.running = true);
  renderTimer();
  
  timerInterval = setInterval(() => {
    updateState(appState, s => {
      s.timerState.time -= 1;
      if (s.timerState.time <= 0) {
        s.timerState.time = 0;
        s.timerState.running = false;
        clearInterval(timerInterval);
        timerComplete();
      }
    });
    renderTimer();
  }, 1000);
}

export function pauseTimer() {
  if (!appState) return;
  
  clearInterval(timerInterval);
  updateState(appState, s => s.timerState.running = false);
  renderTimer();
}

export function resetTimer() {
  if (!appState) return;
  
  clearInterval(timerInterval);
  updateState(appState, s => {
    s.timerState.time = 1500; // 25 minutes
    s.timerState.running = false;
  });
  renderTimer();
}

function timerComplete() {
  window.showToast?.('Timer complete! Take a break.', 'success');
  // Could add notification sound here
}

export default { initTimer, renderTimer, toggleTimer, startTimer, pauseTimer, resetTimer, setAppState };
