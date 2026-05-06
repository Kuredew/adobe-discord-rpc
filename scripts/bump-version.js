import fs from 'fs'
import { execSync } from 'child_process'

const nextTag = process.argv[2];
const newVer = nextTag.startsWith('v') ? nextTag.slice(1) : nextTag;

execSync(`pnpm version ${newVer} --no-git-tag-version`);

const manifestPath = 'CSXS/manifest.xml';
let content = fs.readFileSync(manifestPath, 'utf8');
content = content.replace(/ExtensionBundleVersion=\"[^\"]*\"/, `ExtensionBundleVersion="${newVer}"`);
fs.writeFileSync(manifestPath, content);

console.log(`Successfully bumped to ${newVer}`);
