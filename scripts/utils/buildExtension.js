import fs from "fs";
import Logger from "./logger.js";
import esbuild from "esbuild";

const logger = new Logger("buildExtension");
const log = (msg) => logger.log(msg);

const createContext = async (outputExtensionFolder) => {
  return await esbuild.context({
    entryPoints: ["./src/index.js", "./src/view/index.js"],
    target: ["es2015"],
    bundle: true,
    outdir: outputExtensionFolder,
    platform: "node",
    inject: ["./src/polyfills.js"],

    plugins: [
      {
        name: "log-rebuild",
        setup(build) {
          let startTime;
          build.onStart(() => {
            startTime = Date.now();
            log("Rebuilding...");
          });
          build.onEnd((result) => {
            if (result.errors.length > 0) {
              logger.error(`Build failed: ${result.errors.length} error`);
            } else {
              log(`Build complete in ${Date.now() - startTime}ms`);
            }
          });
        },
      },
    ],
  });
};

const copyDeps = (outputExtensionFolder) => {
  log(`Copying dependencies to ${outputExtensionFolder}`);

  log(`Copying assets...`);
  fs.cpSync("./src/view/assets", `${outputExtensionFolder}/view/assets`, {
    recursive: true,
  });

  log(`Copying panel index.html...`);
  fs.cpSync(
    "./src/view/index.html",
    `${outputExtensionFolder}/view/index.html`,
  );
  log(`Copying extension index.html...`);
  fs.cpSync("./src/index.html", `${outputExtensionFolder}/index.html`);

  log(`Copying .debug...`);
  fs.cpSync("./.debug", `${outputExtensionFolder}/.debug`);
  log(`Copying CSXS...`);
  fs.cpSync("./CSXS", `${outputExtensionFolder}/CSXS`, { recursive: true });
  log(`Copying jsx host...`);
  fs.cpSync("./jsx", `${outputExtensionFolder}/jsx`, { recursive: true });

  log(`Copying config.json...`);
  fs.cpSync("./config.json", `${outputExtensionFolder}/config.json`);

  log("Successfully copied dependencies.");
};

export const build = async (outputExtensionFolder, opts) => {
  try {
    fs.rmSync(`${outputExtensionFolder}`, { recursive: true, force: true });

    copyDeps(outputExtensionFolder);
    const buildContext = await createContext(outputExtensionFolder);

    if (opts?.watch) {
      await buildContext.watch();
    } else {
      await buildContext.rebuild();
    }
  } catch (e) {
    // eslint-disable-next-line preserve-caught-error
    throw new Error(logger.parse(e.message));
  }
};
