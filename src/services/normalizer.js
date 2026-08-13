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
  if (raw.message && typeof raw.message === 'object' && raw.message.data !== undefined) {
    return raw.message.data;
  }
  if (raw.data && typeof raw.data === 'object' && raw.data.data !== undefined) {
    return raw.data.data;
  }
  if (raw.message !== undefined && raw.message !== null) {
    return raw.message;
  }
  if (raw.data !== undefined && raw.data !== null) {
    return raw.data;
  }
  return raw;
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

