const fs = require('fs');
const path = require('path');

function copyDir() {
  const sourceDir = path.join(__dirname, 'files');
  const destDir = path.join(__dirname, 'files-copy');

  function mkdirCallback(err) {
    if (err) {
      if (err.code !== 'EEXIST') {
        console.error(err.message);
        throw err;
      }
    }
  }

  function copyFile(file) {
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, file);
    fs.copyFile(sourcePath, destPath, (err) => {
      if (err) {
        console.error(err.message);
        throw err;
      }
    });
  }

  function readdirCallback(err, files) {
    if (err) {
      console.error(err.message);
      throw err;
    }
    files.forEach((file) => {
      copyFile(file);
    });
  }

  function copyToNewDir() {
    fs.mkdir(destDir, mkdirCallback);
    fs.readdir(sourceDir, readdirCallback);
  }
  fs.stat(destDir, (err, stats) => {
    if (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
    if (stats) {
      if (stats.isDirectory()) {
        fs.rm(destDir, { recursive: true }, (err) => {
          if (err) console.log(err.message);
          copyToNewDir();
        });
      }
    } else {
      fs.mkdir(destDir, mkdirCallback);
      fs.readdir(sourceDir, readdirCallback);
    }
  });
}

copyDir();
