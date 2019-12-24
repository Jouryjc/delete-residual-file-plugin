const path = require('path');
const fs = require('fs');
const TempSandbox = require('temp-sandbox');
const DeleteResidualFilePlugin = require('../src/delete-residual-file-plugin.js');
const util = require('./util');

let sandbox = new TempSandbox({ randomDir: true });
beforeEach(async () => {
    await sandbox.clean();
    sandbox.cleanSync();
});
 
afterAll(async () => {
    await sandbox.destroySandbox();
    sandbox.destroySandboxSync();
});

describe('plugin functional', () => {
    const sandboxExample = sandbox.createFileSync(
        path.resolve(__dirname, '../example/src')
    );

    const config = {
        root: path.resolve(__dirname, '../example/src')
    };

    // 默认参数
    test('required and default parameters', () => {
        const plugin = new DeleteResidualFilePlugin();
        const params = plugin.options;

        expect(params.root).toBe('./src');
        expect(params.clean).toBeFalsy();
        expect(params.backupList).toBe('./residual-files.json');
        expect(params.exclude).toStrictEqual([]);
        expect(params.backupDir).toBe('');
    });

    // 备份文件列表
    test('backupList', async () => {
        const backupList = path.resolve(__dirname, '../example/residual-list.json');
        const plugin = new DeleteResidualFilePlugin(
            Object.assign(config, {
                backupList
            })
        );

        const compiler = util.webpack(Object.assign(webpackConfig, { 
            plugins: [
                plugin
            ]
        }));

        await compiler.run();
        
        expect(fs.existsSync(backupList)).toBeTruthy();
        expect(fs.readFileSync(backupList, 'utf-8')).toMatchSnapshot();
    });

    // 备份目录功能
    test('backupDir', async () => {});

    test('exclude', async () => {
        const exclude = ['directoryC'];
        const plugin = new DeleteResidualFilePlugin(
            Object.assign(config, {
                exclude
            })
        );

        const compiler = util.webpack(Object.assign(webpackConfig, { 
            plugins: [
                plugin
            ]
        }));

        await compiler.run();

        expect(fs.readFileSync(backupList, 'utf-8')).toMatchSnapshot();

    });

    test('clean', async () => {});
});