/**
 * Consistent API response helpers.
 */

function successResponse(res, data, messageOrStatus = 200, maybeMessage = 'Success') {
  let statusCode = 200;
  let message = 'Success';

  if (typeof messageOrStatus === 'string') {
    message = messageOrStatus;
    if (typeof maybeMessage === 'number') {
      statusCode = maybeMessage;
    }
  } else if (typeof messageOrStatus === 'number') {
    statusCode = messageOrStatus;
    if (typeof maybeMessage === 'string') {
      message = maybeMessage;
    }
  }

  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function createdResponse(res, data, message = 'Created successfully') {
  return successResponse(res, data, message, 201);
}

function paginatedResponse(res, { data, page, limit, totalItems }) {
  const totalPages = Math.ceil(totalItems / limit);
  return res.status(200).json({
    success: true,
    message: 'Success',
    data,
    pagination: {
      currentPage: page,
      pageSize: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}

function noContentResponse(res) {
  return res.status(204).send();
}

module.exports = {
  successResponse,
  createdResponse,
  paginatedResponse,
  noContentResponse,
};
