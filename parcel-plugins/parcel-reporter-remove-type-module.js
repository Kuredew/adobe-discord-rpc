
const { Reporter } = require("@parcel/plugin");
const fs = require("fs");
const path = require("path");


module.exports = new Reporter({
  async report({ event, options }) {
    if (event.type !== "buildSuccess") return;

    const distDir = options.distDir || "./dist";
    const htmlFiles = findHtmlFiles(distDir);

    for (const file of htmlFiles) {
      let content = fs.readFileSync(file, "utf8");
      // delete all type=module
      const newContent = content.replace('type=module', "");
      if (newContent !== content) {
        fs.writeFileSync(file, newContent, "utf8");
        console.log(`🧹 Removed type="module" from: ${path.relative(process.cwd(), file)}`);
      }
    }
  },
});

function findHtmlFiles(dir) {
  let results = [];
  for (const file of fs.readdirSync(dir)) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results = results.concat(findHtmlFiles(filePath));
    } else if (filePath.endsWith(".html")) {
      results.push(filePath);
    }
  }
  return results;
}
