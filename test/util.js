const shelljs = require('shelljs');
const fs = require('fs');
const path = require('path');

module.exports = {
    webpack (options = {}) {
        const webpackActual = require('webpack');
    
        // https://webpack.js.org/concepts/mode/
        if (
            options.mode === undefined &&
            options.mode !== null &&
            webpackMajor !== null &&
            webpackMajor >= 4
        ) {
            // eslint-disable-next-line no-param-reassign
            options.mode = 'development';
        }
    
        if (options.mode === null) {
            // eslint-disable-next-line no-param-reassign
            delete options.mode;
        }
    
        const compiler = webpackActual(options);
    
        const runAsync = () =>
            new Promise((resolve, reject) => {
                compiler.run((error, stats) => {
                    if (error || stats.hasErrors()) {
                        reject(error);
    
                        return;
                    }
    
                    resolve(stats);
                });
            });
    
        return { ...compiler, run: runAsync };
    }
};