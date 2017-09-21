const { FuseBox, CopyPlugin } = require("fuse-box");
const {env} = require("process");

const fuse = FuseBox.init({
    target : "browser@es5",
    homeDir: "src",
    output: "ext/dist/$name.js",
    tsConfig: "tsconfig.json",
});


const instructor = fuse.bundle("background")
    .sourceMaps(true)
    .instructions(`>background.ts`);

if (env.WATCH) {
    instructor.watch("src/**");
}

fuse.run();