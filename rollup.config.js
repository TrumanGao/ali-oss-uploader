import pkg from './package.json';

export default {
    input: "./src/index.js",
    output: [
        {
            format: "cjs",
            file: "dist/ali-oss-uploader.cjs.js"
        },
        {
            format: "es",
            file: "dist/ali-oss-uploader.es.js"
        }
    ],
};
