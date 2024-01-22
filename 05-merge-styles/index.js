const fs = require('fs');
const path = require('path');

const destFilePath = path.join(__dirname, 'project-dist', 'bundle.css');
const sourceDir = path.join(__dirname, 'styles');

const writeStream = fs.createWriteStream(destFilePath, 'utf-8');

function isCss(file) {
  if (file.isFile() && path.extname(file.name) === '.css') {
    return true;
  }
  return false;
}

function copyCssFile(file) {
  if (isCss(file)) {
    const filePath = path.join(file.path, file.name);
    const readStream = fs.createReadStream(filePath, 'utf-8');
    readStream.on('data', (chunk) => writeStream.write(chunk));
  }
}

function copyCssContent(err, files) {
  if (err) {
    console.error(err.message);
    throw err;
  }
  files.forEach(copyCssFile);
}

fs.readdir(sourceDir, { withFileTypes: true }, copyCssContent);
