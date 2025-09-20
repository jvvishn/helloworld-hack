// Schedule management and Google Calendar integration
class ScheduleService {
  constructor() {
    this.googleCalendarLoaded = false;
  }

  // Initialize Google Calendar API
  async initGoogleCalendar() {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: process.env.REACT_APP_GOOGLE_API_KEY,
              clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: 'https://www.googleapis.com/auth/calendar.readonly'
            });
            this.googleCalendarLoaded = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      } else {
        reject(new Error('Google API not loaded'));
      }
    });
  }

  // Connect to Google Calendar
  async connectGoogleCalendar() {
    try {
      if (!this.googleCalendarLoaded) {
        await this.initGoogleCalendar();
      }

      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = await authInstance.signIn();
      
      const events = await this.fetchCalendarEvents();
      const schedule = this.parseEventsToSchedule(events);
      
      localStorage.setItem('userSchedule', JSON.stringify(schedule));
      localStorage.setItem('scheduleSource', 'google');
      
      return { success: true, schedule };
    } catch (error) {
      console.error('Google Calendar connection failed:', error);
      throw new Error('Failed to connect to Google Calendar');
    }
  }

  // Fetch events from Google Calendar
  async fetchCalendarEvents() {
    const now = new Date();
    const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const response = await window.gapi.client.calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: oneMonthLater.toISOString(),
      showDeleted: false,
      singleEvents: true,
      orderBy: 'startTime'
    });

    return response.result.items || [];
  }

  // Parse calendar events into our schedule format
  parseEventsToSchedule(events) {
    const schedule = {
      weeklySchedule: {},
      classes: [],
      busyTimes: []
    };

    events.forEach(event => {
      if (!event.start || !event.start.dateTime) return;

      const startTime = new Date(event.start.dateTime);
      const endTime = new Date(event.end.dateTime);
      const dayOfWeek = startTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      // Check if it's a recurring class (simple heuristic)
      const isClass = event.summary && (
        event.summary.toLowerCase().includes('class') ||
        event.summary.toLowerCase().includes('lecture') ||
        event.summary.toLowerCase().includes('lab') ||
        /^[A-Z]{2,4}\s?\d{3}/.test(event.summary) // Course code pattern
      );

      if (isClass) {
        schedule.classes.push({
          title: event.summary,
          startTime: startTime.toTimeString().slice(0, 5),
          endTime: endTime.toTimeString().slice(0, 5),
          dayOfWeek,
          location: event.location || '',
          description: event.description || ''
        });
      }

      schedule.busyTimes.push({
        title: event.summary,
        start: startTime,
        end: endTime,
        dayOfWeek
      });
    });

    return schedule;
  }

  // Save manual schedule
  saveManualSchedule(scheduleData) {
    localStorage.setItem('userSchedule', JSON.stringify(scheduleData));
    localStorage.setItem('scheduleSource', 'manual');
    return { success: true, schedule: scheduleData };
  }

  // Get current user schedule
  getUserSchedule() {
    const schedule = localStorage.getItem('userSchedule');
    const source = localStorage.getItem('scheduleSource');
    
    return {
      schedule: schedule ? JSON.parse(schedule) : null,
      source: source || 'none'
    };
  }

  // Check if time slot is available
  isTimeSlotAvailable(dayOfWeek, startTime, endTime) {
    const { schedule } = this.getUserSchedule();
    if (!schedule || !schedule.busyTimes) return true;

    const proposedStart = this.timeToMinutes(startTime);
    const proposedEnd = this.timeToMinutes(endTime);

    return !schedule.busyTimes.some(busyTime => {
      if (busyTime.dayOfWeek !== dayOfWeek) return false;
      
      const busyStart = this.timeToMinutes(
        new Date(busyTime.start).toTimeString().slice(0, 5)
      );
      const busyEnd = this.timeToMinutes(
        new Date(busyTime.end).toTimeString().slice(0, 5)
      );

      // Check for overlap
      return proposedStart < busyEnd && proposedEnd > busyStart;
    });
  }

  // Helper: Convert time string to minutes
  timeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Find common available times for multiple users
  findCommonAvailableTime(userSchedules, duration = 60) {
    const commonTimes = [];
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    days.forEach(day => {
      for (let hour = 8; hour <= 20; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`;
        const endTime = `${(hour + Math.floor(duration / 60)).toString().padStart(2, '0')}:${duration % 60 || '00'}`;
        
        const isAvailableForAll = userSchedules.every(schedule => 
          this.isTimeSlotAvailable(day, startTime, endTime)
        );
        
        if (isAvailableForAll) {
          commonTimes.push({
            day,
            startTime,
            endTime,
            dayFormatted: day.charAt(0).toUpperCase() + day.slice(1)
          });
        }
      }
    });

    return commonTimes;
  }
}

export default new ScheduleService();