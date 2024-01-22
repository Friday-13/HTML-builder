const fs = require('fs');
const path = require('path');

// - Creates a folder named project-dist.
// - Replaces template tags in the template.html file with filenames
//   from the components folder (e.g., {{section}}) with the contents
//   of the components of the same name and saves the result in project-dist/index.html.
// - Compiles styles from the styles folder into a single file and
//   places it in project-dist/style.css.
// - Copies the assets folder into project-dist/assets.
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

const projectDirPath = path.join(__dirname, 'project-dist');
const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const indexPath = path.join(projectDirPath, 'index.html');

/* create project dir */
fs.mkdir(projectDirPath, mkdirCallback);

/* create index.html with replaced template tags */
const readTemplate = fs.createReadStream(templatePath, 'utf-8');
let templateContent = '';
const regexTemplateTag = (tagName = '[^}]*') => {
  return new RegExp(`{{2}${tagName}}{2}`, 'gm');
};
let templateTagList = [];

function removeTemplateTagBrackets(tag) {
  return tag.slice(2, -2);
}

readTemplate.on('data', (chunk) => {
  templateContent += chunk;
});

let tagCounter = 0;
function replaceTagToContent(tagName, tagNumber) {
  const componentPath = path.join(componentsPath, `${tagName}.html`);
  const readComponent = fs.createReadStream(componentPath, 'utf-8');
  let componentContent = '';

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
      const writeIndex = fs.createWriteStream(indexPath, 'utf-8');
      writeIndex.write(templateContent);
    }
  });
}

readTemplate.on('end', () => {
  templateTagList = templateContent
    .match(regexTemplateTag())
    .map(removeTemplateTagBrackets);
  templateTagList.forEach((tagName, _, array) =>
    replaceTagToContent(tagName, array.length)
  );
});
