const path = require('path')

module.exports = function (env, argv) {
    let devtool, plugins = []

    // Development
    if (argv.mode === 'development') {
        devtool = 'sourcemap'
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
                }
            ]
        },
        plugins,
        externals: [
            'angular',
            'perfect-scrollbar',
            'zenscroll'
        ]
    }
}
