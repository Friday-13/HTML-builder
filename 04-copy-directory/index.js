const fs = require('fs');
const path = require('path');

function copyDir() {
  const sourceDir = path.join(__dirname, 'files');
  const destDir = path.join(__dirname, 'files-copy');

  function mkdirCallback(err) {
    if (err) {
      if (err.code !== 'EEXIST') {
        console.err(err.message);
        throw err;
      }
    }
  }

  function copyFile(file) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFile(sourcePath, destPath, (err) => {
      if (err) {
        console.err(err.message);
        throw err;
      }
    });
  }

  function readdirCallback(err, files) {
    if (err) {
      console.err(err.message);
      throw err;
    }
    files.forEach((file) => {
      copyFile(file);
    });
  }

  fs.mkdir(destDir, mkdirCallback);
  fs.readdir(sourceDir, readdirCallback);
}

copyDir();
