export function getErrorMessage(err: any): string {
  if (!err) return 'An unknown error occurred.';

  // 1. Check for friendlyMessage added by ErrorInterceptor
  if (err.friendlyMessage) {
    return err.friendlyMessage;
  }

  // 2. Check for backend-specific message fields
  const errorBody = err.error || err;

  if (errorBody?.details && Array.isArray(errorBody.details)) {
    return errorBody.details.join('\n');
  }

  if (errorBody?.message) {
    return errorBody.message;
  }

  if (errorBody?.errorMessage) {
    return errorBody.errorMessage;
  }

  // 4. Default to standard Error message or a fallback
  return err.message || 'An unexpected error occurred. Please try again.';
}
