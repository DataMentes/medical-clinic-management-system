import { WEEKDAYS, WEEKDAY_REVERSE_MAP } from '../constants/schedules';

/**
 * Format time to HH:MM format
 * Handles various time formats from PostgreSQL TIME fields
 */
const formatTime = (timeValue) => {
  if (!timeValue) return '';
  
  // If it's already a string
  if (typeof timeValue === 'string') {
    // Handle ISO datetime format: "1970-01-01T11:00:00"
    if (timeValue.includes('T')) {
      const timePart = timeValue.split('T')[1];
      if (timePart) {
        const [hours, minutes] = timePart.split(':');
        return `${hours}:${minutes}`;
      }
    }
    
    // Handle HH:MM:SS or HH:MM format
    if (timeValue.includes(':')) {
      const parts = timeValue.split(':');
      return `${parts[0].padStart(2, '0')}:${parts[1]}`;
    }
    
    return timeValue;
  }
  
  // If it's a Date object (PostgreSQL TIME can return as Date)
  if (timeValue instanceof Date) {
    const hours = timeValue.getHours().toString().padStart(2, '0');
    const minutes = timeValue.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // If it's an object with time property
  if (typeof timeValue === 'object' && timeValue.hours !== undefined) {
    const hours = timeValue.hours.toString().padStart(2, '0');
    const minutes = timeValue.minutes.toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // Last resort: try to extract time pattern
  const timeStr = String(timeValue);
  const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    return `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
  }
  
  return '';
};

/**
 * Transform schedule data from API response to frontend format
 * @param {Object} schedule - Schedule object from API
 * @returns {Object} Transformed schedule for frontend use
 */
export const transformScheduleFromAPI = (schedule) => {
  // Extract doctor name from nested structure
  const doctorName = schedule.doctor?.person?.fullName || 'Unknown Doctor';
  
  // Extract room name
  const roomName = schedule.room?.roomName || 'Unknown Room';
  
  // Convert weekDay enum to full day name
  const day = WEEKDAYS[schedule.weekDay] || schedule.weekDay;
  
  return {
    id: schedule.id,
    doctorId: schedule.doctorId,
    doctorName,
    roomId: schedule.roomId,
    roomName,
    day,                                      // Full name for display
    startTime: formatTime(schedule.startTime),
    endTime: formatTime(schedule.endTime),
    maxCapacity: schedule.maxCapacity
  };
};

/**
 * Transform form data from frontend to API format
 * @param {Object} formData - Form data from ManageSchedules
 * @returns {Object} Transformed data for API request
 */
export const transformScheduleToAPI = (formData) => {
  // Convert full day name to weekDay enum
  const weekDay = WEEKDAY_REVERSE_MAP[formData.day] || formData.day;
  
  // Ensure time has seconds (API expects "HH:MM:SS")
  const formatTimeWithSeconds = (timeStr) => {
    if (!timeStr) return '';
    // If already has seconds, return as is
    if (timeStr.includes(':') && timeStr.split(':').length === 3) {
      return timeStr;
    }
    // If only HH:MM, append :00
    if (timeStr.includes(':') && timeStr.split(':').length === 2) {
      return `${timeStr}:00`;
    }
    return timeStr;
  };
  
  return {
    doctorId: parseInt(formData.doctorId),
    roomId: parseInt(formData.roomId),
    weekDay,
    startTime: formatTimeWithSeconds(formData.startTime),
    endTime: formatTimeWithSeconds(formData.endTime),
    maxCapacity: parseInt(formData.maxCapacity)
  };
};

/**
 * Transform array of schedules from API
 * @param {Array} schedules - Array of schedule objects from API
 * @returns {Array} Transformed schedules
 */
export const transformSchedulesFromAPI = (schedules) => {
  return schedules.map(transformScheduleFromAPI);
};
