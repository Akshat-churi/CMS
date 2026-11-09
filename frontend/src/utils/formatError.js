/**
 * Safely extracts a readable string from any error format
 * (Axios errors, Supabase errors, Vercel Lambda errors, strings, or objects)
 * Guaranteed to NEVER return an object, preventing React error #31.
 */
export const formatErrorMessage = (err, fallback = 'An unexpected error occurred. Please try again.') => {
  if (!err) return '';

  // If already a clean string
  if (typeof err === 'string') return err;

  // Extract from Axios response
  const responseData = err.response?.data;
  if (responseData) {
    if (typeof responseData === 'string') return responseData;

    const backendErr = responseData.error ?? responseData.message;
    if (typeof backendErr === 'string') return backendErr;
    if (backendErr && typeof backendErr === 'object') {
      return backendErr.message || backendErr.error || backendErr.code || JSON.stringify(backendErr);
    }
  }

  // Extract from Error instance or error-like object
  if (err.message && typeof err.message === 'string') {
    return err.message;
  }

  if (err.error && typeof err.error === 'string') {
    return err.error;
  }

  if (err.code && typeof err.code === 'string') {
    return `Error: ${err.code}`;
  }

  try {
    return JSON.stringify(err);
  } catch (e) {
    return fallback;
  }
};

export default formatErrorMessage;

