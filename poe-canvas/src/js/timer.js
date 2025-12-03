// timer.js - Focus timer (Pomodoro)
import { getState, updateState } from './state.js';

let timerInterval = null;

export function initTimer() {
  renderTimer();

  const startBtn = document.getElementById('timerStartBtn');
  const resetBtn = document.getElementById('timerResetBtn');

  if (startBtn) startBtn.addEventListener('click', toggleTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);
}

export function renderTimer() {
  const state = getState();
  if (!state) return;

  const display = document.getElementById('timerDisplay');
  const startBtn = document.getElementById('timerStartBtn');

  if (display) {
    const minutes = Math.floor(state.timerState.time / 60);
    const seconds = state.timerState.time % 60;
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  if (startBtn) {
    const icon = startBtn.querySelector('i');
    if (icon) {
      icon.className = state.timerState.running ? 'fas fa-pause' : 'fas fa-play';
    }
  }
}

export function toggleTimer() {
  const state = getState();
  if (!state) return;

  if (state.timerState.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

export function startTimer() {
  const state = getState();
  if (!state || state.timerState.running) return;

  updateState(s => s.timerState.running = true);
  renderTimer();

  timerInterval = setInterval(() => {
    updateState(s => {
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
  clearInterval(timerInterval);
  updateState(s => s.timerState.running = false);
  renderTimer();
}

export function resetTimer() {
  clearInterval(timerInterval);
  updateState(s => {
    s.timerState.time = 1500; // 25 minutes
    s.timerState.running = false;
  });
  renderTimer();
}

function timerComplete() {
  window.showToast?.('Timer complete! Take a break.', 'success');
}

export default { initTimer, renderTimer, toggleTimer, startTimer, pauseTimer, resetTimer };
