export default {
    input: "./src/index.js",
    output: [
        {
            format: "cjs",
            file: "lib/bundle.cjs.js"
        },
        {
            format: "es",
            file: "lib/bundle.esm.js"
        }
    ],
};
