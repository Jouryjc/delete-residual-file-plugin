const path = require('path');
const DeleteResidualFilePlugin = require('../src/delete-residual-file-plugin');

module.exports = {
    entry: path.resolve(__dirname, './src/index.js'),

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },

    mode: 'production',

    plugins: [
        new DeleteResidualFilePlugin({
            root: path.resolve(__dirname, './src'),
            backupList: path.resolve(__dirname, './residual-file.json'),
            clean: true,
            backupDir: path.resolve(__dirname, './backup'),
            exclude: ['directoryC']
        })
    ]
};