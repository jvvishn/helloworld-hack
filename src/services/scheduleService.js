// src/services/scheduleService.js
import apiService from './apiService';

class ScheduleService {
  constructor() {
    // No Google Calendar initialization needed
  }

  // Save manual schedule
  async saveManualSchedule(manualSchedule) {
    console.log('Saving manual schedule:', manualSchedule);
    
    // ALWAYS save locally first - this should never fail
    try {
      localStorage.setItem('userSchedule', JSON.stringify(manualSchedule));
      localStorage.setItem('scheduleSource', 'manual');
      console.log('Schedule saved locally successfully');
    } catch (localError) {
      console.error('Failed to save locally:', localError);
      throw new Error(`Failed to save schedule locally: ${localError.message}`);
    }
    
    // Try to save to backend, but don't let it fail the whole operation
    let backendSaved = false;
    try {
      await this.saveScheduleToBackend(manualSchedule, 'manual');
      backendSaved = true;
      console.log('Successfully saved to backend as well');
    } catch (backendError) {
      console.warn('Backend save failed (continuing with local save only):', backendError.message);
      // Don't throw - local save already succeeded
    }
    
    return {
      schedule: manualSchedule,
      source: 'manual',
      backendSaved
    };
  }

  // Save schedule to backend
  async saveScheduleToBackend(schedule, source) {
    try {
      const userId = this.getCurrentUserId();
      const transformedSchedule = this.transformScheduleForAlgorithm(schedule, userId);
      
      const scheduleData = {
        userId: userId,
        schedule: transformedSchedule,
        rawSchedule: schedule,
        source: source,
        preferences: this.getUserPreferences()
      };

      console.log('Attempting to save to backend:', scheduleData);
      return await apiService.saveSchedule(scheduleData);
    } catch (error) {
      console.warn('Backend save failed, continuing with local save:', error.message);
      // Don't throw the error - let the calling function handle it
      return null;
    }
  }

  // Get current user schedule (check backend first, then local)
  async getUserSchedule(forceRefresh = false) {
    if (forceRefresh) {
      try {
        const backendSchedule = await apiService.getSchedule();
        if (backendSchedule) {
          // Update local storage with backend data
          localStorage.setItem('userSchedule', JSON.stringify(backendSchedule.rawSchedule));
          localStorage.setItem('scheduleSource', backendSchedule.source);
          return {
            schedule: backendSchedule.rawSchedule,
            source: backendSchedule.source
          };
        }
      } catch (error) {
        console.warn('Failed to fetch schedule from backend, using local:', error);
      }
    }

    // Fallback to local storage
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
  async findCommonAvailableTime(userIds, duration = 60) {
    try {
      // Use the algorithm service through API
      return await apiService.getOptimalTimes(userIds, duration);
    } catch (error) {
      console.error('Failed to find common times:', error);
      // Fallback to local calculation
      return this.findCommonAvailableTimeLocal(userIds, duration);
    }
  }

  // Local fallback for finding common times
  findCommonAvailableTimeLocal(userSchedules, duration = 60) {
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

  // Transform schedule for algorithm
  transformScheduleForAlgorithm(schedule, userId) {
    const scheduleEntries = [];
    
    if (!schedule.classes) return scheduleEntries;
    
    schedule.classes.forEach(classItem => {
      // Convert day of week and time to full datetime
      const dayMap = {
        'monday': 1, 'tuesday': 2, 'wednesday': 3, 
        'thursday': 4, 'friday': 5, 'saturday': 6, 'sunday': 0
      };
      
      // Get next occurrence of this day
      const today = new Date();
      const targetDay = dayMap[classItem.dayOfWeek.toLowerCase()];
      const daysUntilTarget = (targetDay + 7 - today.getDay()) % 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      
      // Create full datetime strings
      const startDateTime = new Date(targetDate);
      const [startHour, startMinute] = classItem.startTime.split(':');
      startDateTime.setHours(parseInt(startHour), parseInt(startMinute), 0, 0);
      
      const endDateTime = new Date(targetDate);
      const [endHour, endMinute] = classItem.endTime.split(':');
      endDateTime.setHours(parseInt(endHour), parseInt(endMinute), 0, 0);
      
      scheduleEntries.push({
        user_id: userId,
        start: startDateTime.toISOString(),
        end: endDateTime.toISOString(),
        title: classItem.title,
        location: classItem.location || '',
        event_type: 'class'
      });
    });
    
    return scheduleEntries;
  }

  // Helper methods
  getCurrentUserId() {
    return localStorage.getItem('userId') || 
           JSON.parse(localStorage.getItem('user') || '{}').id ||
           'temp-user-' + Date.now();
  }

  getUserPreferences() {
    return JSON.parse(localStorage.getItem('userPreferences') || '{}');
  }

  getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  }

  // Sync with backend
  async syncWithBackend() {
    try {
      const backendData = await this.getUserSchedule(true);
      return backendData;
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      throw error;
    }
  }

  // Import from file (.ics calendar files)
  async importFromFile(file) {
    try {
      if (file.name.endsWith('.ics')) {
        return await this.parseICSFile(file);
      } else {
        throw new Error('Unsupported file format. Please use .ics files.');
      }
    } catch (error) {
      console.error('Failed to import from file:', error);
      throw error;
    }
  }

  // Improved ICS parser
  async parseICSFile(file) {
    const text = await file.text();
    const lines = text.split(/\r?\n/); // Handle different line endings
    const events = [];
    let currentEvent = null;

    console.log('Parsing ICS file with', lines.length, 'lines');

    lines.forEach((line, index) => {
      line = line.trim();
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.summary && currentEvent.dtstart && currentEvent.dtend) {
          events.push(currentEvent);
        }
        currentEvent = null;
      } else if (currentEvent && line.includes(':')) {
        // Handle different ICS formats
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8);
        } else if (line.startsWith('DTSTART') && line.includes(':')) {
          // Handle DTSTART:20240115T090000Z or DTSTART;VALUE=DATE:20240115
          const colonIndex = line.indexOf(':');
          currentEvent.dtstart = line.substring(colonIndex + 1);
        } else if (line.startsWith('DTEND') && line.includes(':')) {
          const colonIndex = line.indexOf(':');
          currentEvent.dtend = line.substring(colonIndex + 1);
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12);
        }
      }
    });

    console.log('Found', events.length, 'events in ICS file');

    // Convert to our schedule format
    const schedule = {
      classes: [],
      busyTimes: []
    };

    events.forEach((event, index) => {
      try {
        let startDate, endDate;

        // Parse different date formats
        if (event.dtstart.includes('T')) {
          // Format: 20240115T090000Z or 20240115T090000
          startDate = this.parseICSDateTime(event.dtstart);
          endDate = this.parseICSDateTime(event.dtend);
        } else {
          // All-day event format: 20240115
          const year = event.dtstart.substring(0, 4);
          const month = event.dtstart.substring(4, 6);
          const day = event.dtstart.substring(6, 8);
          startDate = new Date(year, month - 1, day, 9, 0); // Default to 9 AM
          endDate = new Date(year, month - 1, day, 10, 0); // Default 1 hour duration
        }
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('Invalid date for event:', event.summary);
          return;
        }

        const dayOfWeek = startDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        // More comprehensive class detection
        const isClass = event.summary && (
          event.summary.toLowerCase().includes('class') ||
          event.summary.toLowerCase().includes('lecture') ||
          event.summary.toLowerCase().includes('lab') ||
          event.summary.toLowerCase().includes('seminar') ||
          event.summary.toLowerCase().includes('tutorial') ||
          /^[A-Z]{2,4}\s?\d{3}/.test(event.summary) || // Course code pattern
          /\b(CS|MATH|PHYS|ENG|BIO|CHEM|HIST|ECON)\s?\d/.test(event.summary) // Common course prefixes
        );

        if (isClass || events.length <= 20) { // If few events, include all as potential classes
          schedule.classes.push({
            id: Date.now() + index, // Add unique ID
            title: event.summary,
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: endDate.toTimeString().slice(0, 5),
            dayOfWeek,
            location: event.location || '',
            description: event.description || ''
          });
        }

        schedule.busyTimes.push({
          title: event.summary,
          start: startDate,
          end: endDate,
          dayOfWeek
        });
      } catch (error) {
        console.warn('Error parsing event:', event.summary, error);
      }
    });

    console.log('Converted to', schedule.classes.length, 'classes');
    return schedule;
  }

  // Helper function to parse ICS datetime format
  parseICSDateTime(dateTimeStr) {
    // Remove timezone info for simplicity
    const cleanStr = dateTimeStr.replace(/Z$/, '').replace(/\+.*$/, '');
    
    if (cleanStr.length >= 15) {
      // Format: 20240115T090000
      const year = cleanStr.substring(0, 4);
      const month = cleanStr.substring(4, 6);
      const day = cleanStr.substring(6, 8);
      const hour = cleanStr.substring(9, 11);
      const minute = cleanStr.substring(11, 13);
      
      return new Date(year, month - 1, day, hour, minute);
    } else if (cleanStr.length === 8) {
      // All-day format: 20240115
      const year = cleanStr.substring(0, 4);
      const month = cleanStr.substring(4, 6);
      const day = cleanStr.substring(6, 8);
      
      return new Date(year, month - 1, day, 9, 0); // Default to 9 AM
    } else {
      throw new Error('Unknown date format: ' + dateTimeStr);
    }
  }
}

export default new ScheduleService();