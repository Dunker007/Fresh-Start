// calendar.js - Calendar view rendering
import { getState, updateState, subscribe } from './state.js';
import { listEvents } from './google/calendar.js';
import { isAuthenticated } from './google/auth.js';

let googleEventsCache = [];
let lastFetchedMonth = null;

export function initCalendar() {
  renderCalendar();

  const prevBtn = document.getElementById('prevMonth');
  const nextBtn = document.getElementById('nextMonth');

  if (prevBtn) prevBtn.addEventListener('click', () => navigateMonth(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateMonth(1));

  subscribe((state, event, data) => {
    if (event === 'stateUpdated' || event === 'stateChanged') {
      renderCalendar();
    }
  });

  // Listen for Google Auth success to fetch events
  window.addEventListener('google-auth-success', () => {
    fetchGoogleEvents();
  });

  // Initial fetch if already authenticated
  if (isAuthenticated()) {
    fetchGoogleEvents();
  }
}

async function fetchGoogleEvents() {
  const state = getState();
  if (!state || !isAuthenticated()) return;

  const { month, year } = state.calendar;
  const cacheKey = `${year}-${month}`;

  // Avoid re-fetching same month too often (simple cache)
  if (lastFetchedMonth === cacheKey && googleEventsCache.length > 0) return;

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

  try {
    const response = await listEvents({
      timeMin: startOfMonth.toISOString(),
      timeMax: endOfMonth.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    if (response.items) {
      googleEventsCache = response.items;
      lastFetchedMonth = cacheKey;
      renderCalendar(); // Re-render with new events
      console.log(`Fetched ${googleEventsCache.length} Google Calendar events`);
    }
  } catch (error) {
    console.error('Failed to fetch Google Calendar events:', error);
  }
}

export function renderCalendar() {
  const state = getState();
  if (!state) return;

  const container = document.getElementById('calendarGrid');
  const monthLabel = document.getElementById('calendarMonthYear');

  if (!container) return;

  const { month, year } = state.calendar;
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

    // Local Tasks
    const dayTasks = state.tasks.filter(t => t.due === dateStr);
    const hasTasks = dayTasks.length > 0;

    // Google Events
    const dayEvents = googleEventsCache.filter(e => {
      const start = e.start.dateTime || e.start.date; // Handle all-day events
      return start.startsWith(dateStr);
    });
    const hasGoogleEvents = dayEvents.length > 0;

    html += `
      <div class="calendar-day ${isToday ? 'today' : ''} ${hasTasks || hasGoogleEvents ? 'has-event' : ''}"
           data-date="${dateStr}" onclick="window.selectCalendarDate('${dateStr}')">
        <span class="day-number">${day}</span>
        <div class="day-indicators">
          ${hasTasks ? `<div class="indicator task-indicator" title="${dayTasks.length} tasks"></div>` : ''}
          ${hasGoogleEvents ? `<div class="indicator google-indicator" title="${dayEvents.length} Google events"></div>` : ''}
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

export function navigateMonth(delta) {
  updateState(s => {
    s.calendar.month += delta;
    if (s.calendar.month > 11) {
      s.calendar.month = 0;
      s.calendar.year++;
    } else if (s.calendar.month < 0) {
      s.calendar.month = 11;
      s.calendar.year--;
    }
  });
  // Fetch events for the new month
  fetchGoogleEvents();
}

export function selectCalendarDate(dateStr) {
  console.log('Selected date:', dateStr);

  // Find events for this date
  const state = getState();
  const tasks = state.tasks.filter(t => t.due === dateStr);
  const googleEvents = googleEventsCache.filter(e => {
    const start = e.start.dateTime || e.start.date;
    return start.startsWith(dateStr);
  });

  // Show a simple toast or modal with details (Quick implementation)
  let message = `<strong>${dateStr}</strong><br>`;

  if (tasks.length > 0) {
    message += `<br><strong>Tasks:</strong><br>${tasks.map(t => `- ${t.title}`).join('<br>')}`;
  }

  if (googleEvents.length > 0) {
    message += `<br><br><strong>Google Events:</strong><br>${googleEvents.map(e => `- ${e.summary}`).join('<br>')}`;
  }

  if (tasks.length === 0 && googleEvents.length === 0) {
    message += "<br>No events or tasks.";
  }

  // Use the existing toast for now, but a modal would be better later
  // Importing showToast dynamically to avoid circular dependencies if any
  import('./ui.js').then(({ showToast }) => {
    showToast(message, 'info');
  });
}

window.selectCalendarDate = selectCalendarDate;

export default { initCalendar, renderCalendar, navigateMonth, selectCalendarDate };
