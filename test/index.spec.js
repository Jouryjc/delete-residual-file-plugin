const path = require('path');
const fs = require('fs');
const DeleteResidualFilePlugin = require('../src/delete-residual-file-plugin.js');
const webpackConfig = require('../example/webpack.config.js');

function webpack(options = {}) {
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

describe('config', () => {
    test('functional', async () => {
        const backupList = path.resolve(__dirname, '../example/residual-list.json');
        const root = path.resolve(__dirname, '../example/src');

        const plugin = new DeleteResidualFilePlugin({
            root: root,
            clean: false,
            backupList: backupList,
            exclude: [],
            backupDir: ''
        });

        const compiler = webpack(Object.assign(webpackConfig, { 
            plugins: [
                plugin
            ]
        }));

        await compiler.run();
        
        // 在src下存在residual-list.json文件，并且正确记录多余文件
        // 没有清除多余文件
        expect(fs.existsSync(backupList)).toBeTruthy();
        expect(fs.readFileSync(backupList, 'utf-8')).toMatchSnapshot();
    });
});