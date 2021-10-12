// 原始配置文件
const webpack = require('webpack');
const path = require("path");

const config = {
    entry: {
        uploader: "./src/index.js",
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js", // 初始加载
        chunkFilename: "chunks/[name].[contenthash].js", // 按需加载
    },
    plugins: []
};

if (!process.env.CI) {
    config.plugins.push(new webpack.ProgressPlugin());
}

module.exports = config;
