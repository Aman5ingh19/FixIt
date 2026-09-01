/**
 * Parse pagination params from query string with sensible defaults.
 */
function parsePagination(query) {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

/**
 * Parse sort params from query string.
 * @param {string} sortBy - Field name to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @param {string[]} allowedFields - Whitelist of sortable fields
 * @param {string} defaultField - Default sort field
 */
function parseSort(query, allowedFields, defaultField = 'createdAt') {
  const sortBy = allowedFields.includes(query.sortBy) ? query.sortBy : defaultField;
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return { [sortBy]: sortOrder };
}

module.exports = { parsePagination, parseSort };
