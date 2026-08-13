/**
 * RecruitTrain Data Contract Normalizer
 * Pure utility to convert backend snake_case objects/arrays into camelCase.
 * CRITICAL RULE: DOES NOT INVENT OR FABRICATE DATA. ONLY TRANSLATES FIELD NAMES.
 */

const toCamelCaseString = (str) => {
  return str.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '');
  });
};

export const extractPayload = (raw) => {
  if (raw === null || raw === undefined) return raw;

  let target = raw;
  if (raw.data !== undefined && typeof raw.data === 'object' && raw.data.message !== undefined) {
    target = raw.data.message;
  } else if (raw.message !== undefined) {
    target = raw.message;
  } else if (raw.data !== undefined) {
    target = raw.data;
  }

  if (target && typeof target === 'object') {
    if (target.success === false) {
      const msg = target.message || target.error?.message || 'Backend operation failed';
      const errObj = new Error(msg);
      errObj.code = target.error?.code || 'API_ERROR';
      errObj.details = target.error?.details || target.details;
      errObj.response = { status: 400, data: target };
      throw errObj;
    }

    if (target.data !== undefined && target.data !== null) {
      return target.data;
    }
  }

  return target;
};

export const normalizeData = (data) => {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalizeData(item));
  }

  if (typeof data === 'object' && !(data instanceof Date) && !(data instanceof RegExp)) {
    const normalized = {};
    for (const key of Object.keys(data)) {
      const camelKey = toCamelCaseString(key);
      normalized[camelKey] = normalizeData(data[key]);
    }
    return normalized;
  }

  return data;
};

