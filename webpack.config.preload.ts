// webpack.preload.config.js
const path = require('path');

module.exports = {
    target: 'electron-preload',
    entry: './src/preload.js',
    output: {
        path: path.resolve(__dirname, '.webpack/render/main_window'), // Pfad angepasst
        filename: 'preload.js',
    },
    externals: {
        electron: 'commonjs electron',
    },
    module: {
        rules: [
            // Stelle sicher, dass alle benötigten Regeln hier aufgeführt sind
        ],
    },
};
