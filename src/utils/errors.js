'use strict';
class ApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
const fail = (status, code, message) => { throw new ApiError(status, code, message); };
const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
module.exports = { ApiError, fail, asyncHandler };
