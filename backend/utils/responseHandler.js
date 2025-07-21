const sendResponse = (res, status, data, message) => {
  res.status(status).json({ success: true, data, message });
};

module.exports = { sendResponse };