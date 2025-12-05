/**
 * Date formatting and manipulation utilities
 */

export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatTime = (time) => {
  if (!time) return '';
  return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  return new Date(datetime).toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const toISODate = (date) => {
  if (!date) return '';
  return new Date(date).toISOString().split('T')[0];
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

export const isPast = (date) => {
  return new Date(date) < new Date();
};

export default {
  formatDate,
  formatTime,
  formatDateTime,
  toISODate,
  isToday,
  isPast
};
