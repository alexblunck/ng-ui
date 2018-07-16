const path = require('path')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")

module.exports = function (env, argv) {
    let devtool, sassLoaders = [], plugins = []

    // Development
    if (argv.mode === 'development') {
        devtool = 'sourcemap'
    }
    // Production
    else if (argv.mode === 'production') {
        sassLoaders = [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'postcss-loder',
            'sass-loader'
        ]

        plugins.push(
            new MiniCssExtractPlugin({
                filename: 'blunck-ng-ui.css'
            })
        )
    }

    return {
        output: {
            path: path.resolve(__dirname, 'lib'),
            filename: `blunck-ng-ui.js`,
            library: 'blunckNgUi',
            libraryTarget: 'umd'
        },
        devtool: devtool,
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: 'babel-loader'
                },
                {
                    test: /\.scss$/,
                    exclude: /node_modules/,
                    use: sassLoaders
                }
            ]
        },
        plugins,
        externals: [
            'angular',
            'lodash'
        ]
    }
}
