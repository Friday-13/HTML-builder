const fs = require('fs');
const path = require('path');

// - Creates a folder named project-dist.
// - Replaces template tags in the template.html file with filenames
//   from the components folder (e.g., {{section}}) with the contents
//   of the components of the same name and saves the result in project-dist/index.html.
// - Compiles styles from the styles folder into a single file and
//   places it in project-dist/style.css.
// - Copies the assets folder into project-dist/assets.
const projectDirPath = path.join(__dirname, 'project-dist');
const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const stylesPath = path.join(__dirname, 'styles');
const indexPath = path.join(projectDirPath, 'index.html');
const stylePath = path.join(projectDirPath, 'style.css');
const sourceAssetsPath = path.join(__dirname, 'assets');
const destAssetsPath = path.join(projectDirPath, 'assets');

function mkdirCallback(err) {
  if (err) {
    if (err.code !== 'EEXIST') {
      console.error(err.message);
      throw err;
    } else {
      console.log('Already exist');
    }
  }
}

/* create project dir */
fs.mkdir(projectDirPath, mkdirCallback);

/* create index.html with replaced template tags */
const readTemplate = fs.createReadStream(templatePath, 'utf-8');
let templateContent = '';
let templateTagList = [];
let tagCounter = 0;

const regexTemplateTag = (tagName = '[^}]*') => {
  return new RegExp(`[ ]*{{2}${tagName}}{2}`, 'gm');
};

function removeTemplateTagBrackets(tag) {
  return tag.trim().slice(2, -2);
}

readTemplate.on('data', (chunk) => {
  templateContent += chunk;
});

function replaceTagToContent(tagName, tagNumber) {
  const componentPath = path.join(componentsPath, `${tagName}.html`);
  const readComponent = fs.createReadStream(componentPath, 'utf-8');
  let componentContent = '';

  function writeResultToFile(filePath = indexPath) {
    const writeIndex = fs.createWriteStream(filePath, 'utf-8');
    writeIndex.write(templateContent);
  }

  readComponent.on('data', (chunk) => {
    componentContent += chunk;
  });
  readComponent.on('end', () => {
    templateContent = templateContent.replace(
      regexTemplateTag(tagName),
      componentContent
    );
    tagCounter += 1;
    if (tagCounter === tagNumber) {
      //check, that all tags were replaced
      writeResultToFile();
    }
  });
}

function replaceAllTags() {
  templateTagList = templateContent
    .match(regexTemplateTag())
    .map(removeTemplateTagBrackets);
  templateTagList.forEach((tagName, _, array) =>
    replaceTagToContent(tagName, array.length)
  );
}

readTemplate.on('end', replaceAllTags);

// compile styles

const writeStyleStream = fs.createWriteStream(stylePath, 'utf-8');

function addToStyle(file) {
  const readSourceStream = fs.createReadStream(
    path.join(file.path, file.name),
    'utf-8'
  );
  readSourceStream.on('data', (chunk) => writeStyleStream.write(chunk));
}

function isCss(file) {
  return file.isFile() && path.extname(file.name);
}

function copyAllCss(err, files) {
  if (err) throw err;
  files.forEach((file) => {
    if (isCss(file)) {
      addToStyle(file);
    }
  });
}
fs.readdir(stylesPath, { withFileTypes: true }, copyAllCss);

// copy assets

function copyDir(err, files, destPath) {
  if (err) {
    console.error(err.message);
  }
  console.log(destPath);
  fs.mkdir(destPath, (err) => {
    mkdirCallback(err);
    files.forEach((file) => {
      if (file.isFile()) {
        fs.copyFile(
          path.join(file.path, file.name),
          path.join(destPath, file.name),
          (err) => {
            if (err) console.error(err.message);
          }
        );
      } else {
        fs.readdir(
          path.join(file.path, file.name),
          { withFileTypes: true },
          (suberr, subfiles) =>
            copyDir(suberr, subfiles, path.join(destPath, file.name))
        );
      }
    });
  });
}

fs.readdir(sourceAssetsPath, { withFileTypes: true }, (err, files) =>
  copyDir(err, files, destAssetsPath)
);
