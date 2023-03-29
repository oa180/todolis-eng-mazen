exports.createResponse = (data, res, statusCode, jwt) => {
  return res.status(statusCode).json({
    status: 'success',
    data,
    jwt,
  });
};
