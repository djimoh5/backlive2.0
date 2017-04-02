var path = require('path');
var ManifestPlugin = require('webpack-manifest-plugin');

module.exports = {
    entry: {
        //vendor: "./app/vendor.js",
        app: './app/main.ts',
    },
    output: {
        path: path.join(__dirname, "build"),
        filename: "[name].[chunkhash].js" //do not use in production https://webpack.js.org/guides/caching/
    },
    plugins: [
        new ManifestPlugin()
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/
            },
            {
                test: /\.less$/,
                loader: 'less-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
};