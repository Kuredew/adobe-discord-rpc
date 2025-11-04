import { Parcel } from '@parcel/core';
import typeModuleRemover from './utils/type-module-remover.js';
import copyDependency from './utils/copy-dependency.js';

const distDir = './dist'

const bundler = new Parcel({
  entries: [
    "./extension/index.html",
    "./panel/index.html"
  ],
  defaultConfig: "@parcel/config-default",
  mode: "production",
  defaultTargetOptions: {
    distDir: distDir,
    sourceMaps: false,
    publicUrl: "../"
  }
});

(async () => {
  try {
    console.log('Building...')

    const { buildTime } = await bundler.run();
    console.log(`Build completed in ${buildTime}ms!`);

    console.log('Running post build scripts...')
    typeModuleRemover(distDir)
    copyDependency(distDir)

    console.log('Completed.')
  } catch (err) {
    console.error("Build failed:", err);
    process.exit(1);
  }
})();
