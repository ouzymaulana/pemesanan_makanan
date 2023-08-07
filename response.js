const response = (statusCode, data, message, res) => {
  res.status(statusCode).json({
    payload: data,
    message: message,
    statusCode: statusCode,
    metadata: {
      prev: "",
      next: "",
      max: "",
    },
  });
};

module.exports = response;
