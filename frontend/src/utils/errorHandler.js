/**
 * Centralized error handling utility
 */

export const handleServiceError = (error, fallbackMessage = 'An error occurred') => {
  // Extract error message from various sources
  const errorMessage = 
    error.response?.data?.error ||  // Backend error
    error.message ||                 // JavaScript error
    fallbackMessage;                 // Fallback

  // Log error for debugging (development only)
  if (import.meta.env.DEV) {
    console.error('Service Error:', {
      message: errorMessage,
      response: error.response,
      stack: error.stack
    });
  }

  return errorMessage;
};

// Export for use in components
export default handleServiceError;
