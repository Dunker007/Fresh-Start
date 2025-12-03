// calendar.js - Calendar view rendering
import { updateState } from './state.js';
import * as google from './google/index.js';

let appState = null;

export function setAppState(state) {
  appState = state;
}

export function initCalendar(state) {
  appState = state;
  renderCalendar();

  const prevBtn = document.getElementById('calendarPrev');
  const nextBtn = document.getElementById('calendarNext');

  if (prevBtn) prevBtn.addEventListener('click', () => navigateMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateMonth(1));
}



export async function renderCalendar() {
  if (!appState) return;

  const container = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calendarMonth');

  if (!container) return;

  const { month, year } = appState.calendar;
  const today = new Date();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  if (monthLabel) {
    monthLabel.textContent = `${monthNames[month]} ${year}`;
  }

  // Fetch Google Events
  let googleEvents = [];
  if (google.auth.isAuthenticated()) {
    try {
      const timeMin = firstDay.toISOString();
      const timeMax = lastDay.toISOString();
      const response = await google.calendar.listEvents({ timeMin, timeMax, maxResults: 100 });
      if (response.items) googleEvents = response.items;
    } catch (e) {
      console.error('Google Calendar fetch error:', e);
    }
  }

  // Day headers
  let html = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    .map(d => `<div class="calendar-header">${d}</div>`).join('');

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) {
    html += '<div class="calendar-day empty"></div>';
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

    const hasTasks = appState.tasks.some(t => t.due === dateStr);
    const dayEvents = googleEvents.filter(e => {
      const start = e.start.dateTime || e.start.date;
      return start.startsWith(dateStr);
    });
    const hasGoogleEvents = dayEvents.length > 0;

    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks ? 'has-tasks' : ''}" 
           data-date="${dateStr}" onclick="window.selectCalendarDate('${dateStr}')"
           title="${dayEvents.length} Google Events">
        ${day}
        <div class="dots-container" style="display: flex; gap: 2px; justify-content: center; margin-top: 2px;">
            ${hasTasks ? '<div class="task-dot"></div>' : ''}
            ${hasGoogleEvents ? '<div class="task-dot" style="background: var(--accent-success);"></div>' : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function navigateMonth(delta) {
  if (!appState) return;

  updateState(appState, s => {
    s.calendar.month += delta;
    if (s.calendar.month > 11) {
      s.calendar.month = 0;
      s.calendar.year++;
    } else if (s.calendar.month < 0) {
      s.calendar.month = 11;
      s.calendar.year--;
    }
  });
  renderCalendar();
}

export function selectCalendarDate(dateStr) {
  // Could open a modal to add task for this date
  console.log('Selected date:', dateStr);
}

window.selectCalendarDate = selectCalendarDate;

export default { initCalendar, renderCalendar, navigateMonth, selectCalendarDate, setAppState };
