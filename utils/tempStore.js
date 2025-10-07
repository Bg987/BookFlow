// Simple in-memory storage for pre-signups (auto-clears after timeout)
const tempSignups = new Map();

function saveTempSignup(id, data) {
  tempSignups.set(id, data);
  setTimeout(() => tempSignups.delete(id), 15 * 60 * 1000); // auto-delete after 15 minutes
}

function getTempSignup(id) {
  return tempSignups.get(id);
}

function deleteTempSignup(id) {
  tempSignups.delete(id);
}

module.exports = { saveTempSignup, getTempSignup, deleteTempSignup };
