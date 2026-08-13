/**
 * RecruitTrain Error Normalizer
 * Transforms raw HTTP / Axios / Network errors into standardized user-safe error structures.
 */

export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  UNPROCESSABLE_ENTITY: 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN',
};

const extractBackendMessage = (data) => {
  if (!data) return null;
  if (typeof data === 'string') return data;

  if (data._server_messages) {
    try {
      const parsedArray = typeof data._server_messages === 'string'
        ? JSON.parse(data._server_messages)
        : data._server_messages;
      if (Array.isArray(parsedArray) && parsedArray.length > 0) {
        const firstMsg = typeof parsedArray[0] === 'string' ? JSON.parse(parsedArray[0]) : parsedArray[0];
        if (firstMsg?.message) return firstMsg.message;
      }
    } catch (e) {
      // Fallback if parsing fails
    }
  }

  if (data.message) {
    if (typeof data.message === 'string') return data.message;
    if (typeof data.message === 'object') {
      return data.message.message || data.message.error || data.message.detail || null;
    }
  }

  if (data.error) {
    if (typeof data.error === 'string') return data.error;
    if (typeof data.error === 'object') {
      return data.error.message || data.error.detail || null;
    }
  }

  if (data.detail && typeof data.detail === 'string') return data.detail;
  return null;
};

export const normalizeApiError = (error) => {
  if (!error) {
    return {
      status: 0,
      code: ERROR_CODES.UNKNOWN,
      message: 'An unexpected error occurred. Please try again.',
      details: null,
    };
  }

  // Network / Connection Error
  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return {
      status: 408,
      code: ERROR_CODES.TIMEOUT,
      message: 'Request timed out. Please check your network connection.',
      details: null,
    };
  }

  if (!error.response) {
    return {
      status: error.status || 0,
      code: error.code || ERROR_CODES.NETWORK_ERROR,
      message: error.message || 'Unable to connect to RecruitTrain servers. Please check your internet connection.',
      details: error.details || null,
    };
  }

  const { status, data } = error.response;
  const backendMessage = extractBackendMessage(data);

  switch (status) {
    case 400:
      return {
        status: 400,
        code: ERROR_CODES.BAD_REQUEST,
        message: backendMessage || 'Invalid request. Please verify the submitted data.',
        details: data?.errors || null,
      };
    case 401:
      return {
        status: 401,
        code: ERROR_CODES.UNAUTHORIZED,
        message: backendMessage || 'Session expired or invalid authentication credentials.',
        details: null,
      };
    case 403:
      return {
        status: 403,
        code: ERROR_CODES.FORBIDDEN,
        message: backendMessage || 'You do not have permission to perform this action.',
        details: null,
      };
    case 404:
      return {
        status: 404,
        code: ERROR_CODES.NOT_FOUND,
        message: backendMessage || 'The requested resource was not found.',
        details: null,
      };
    case 409:
      return {
        status: 409,
        code: ERROR_CODES.CONFLICT,
        message: backendMessage || 'This interview cannot be deleted because it is referenced by linked records.',
        details: data?.errors || data || null,
      };
    case 422:
      return {
        status: 422,
        code: ERROR_CODES.UNPROCESSABLE_ENTITY,
        message: backendMessage || 'Validation failed. Please review your input.',
        details: data?.errors || data?.fields || null,
      };
    case 429:
      return {
        status: 429,
        code: ERROR_CODES.TOO_MANY_REQUESTS,
        message: backendMessage || 'Rate limit exceeded. Please wait a moment before trying again.',
        details: null,
      };
    case 500:
      return {
        status: 500,
        code: ERROR_CODES.SERVER_ERROR,
        message: backendMessage || 'A backend server error occurred. Our engineers have been notified.',
        details: null,
      };
    case 503:
      return {
        status: 503,
        code: ERROR_CODES.SERVICE_UNAVAILABLE,
        message: 'RecruitTrain services are temporarily under maintenance. Please try again shortly.',
        details: null,
      };
    default:
      return {
        status,
        code: ERROR_CODES.UNKNOWN,
        message: backendMessage || 'An error occurred while processing your request.',
        details: null,
      };
  }
};

export const formatApiError = normalizeApiError;
export default normalizeApiError;
