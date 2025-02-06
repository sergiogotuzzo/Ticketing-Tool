const fs = require("fs");

function getFiles(path) {
  return fs.readdirSync(path).map((filePath) => require(`${path}/${filePath}`));
}

module.exports = {
  getFiles,
};
