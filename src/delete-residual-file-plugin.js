const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { spawn } = require('child_process');

module.exports = class DeleteResidualFilePlugin {
    constructor(options) {
        this.options = options;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tap("DeleteResidualFilePlugin", (compilation) => {
            this.findUnusedFiles(compilation, this.options);
        });
    }

    /**
     * 获取依赖的文件
     * @param {Object} - compilation对象
     */
    getDependFiles(compilation) {
        return new Promise((resolve, reject) => {
            const dependedFiles = [...compilation.fileDependencies].reduce(
                (acc, usedFilepath) => {

                    // 将node_modules下的依赖过滤掉
                    if (!usedFilepath.includes('node_modules')) {
                        acc.push(usedFilepath);
                    }

                    return acc;
                },
                []
            );

            resolve(dependedFiles);
        });
    }

    /**
     * 查找、备份、删除所有未使用的文件
     * @param {Object} compilation
     * @param {Object} config - 配置信息
     * @param {string} config.root - 查找的根目录
     * @param {boolean} config.clean - 是否清除所有的文件
     * @param {string} config.backupList - 写入备份列表的路径
     * @param {string} config.backupDir - 写入备份文件的路径
     * @param {Array} config.exclude - 要排除删除的相对目录或文件
     */
    async findUnusedFiles(compilation, config = {}) {
        const {
            root = './src',
            clean = false,
            backupList = './residual-files.json',
            exclude = [],
            backupDir = ''
        } = config;

        try {

            // 获取所有依赖文件
            const allChunks = await this.getDependFiles(compilation);

            // 获取指定root中所有文件
            const pattern = root + '/**/*';
            const allFiles = await this.getAllFiles(pattern);

            let unUsed = allFiles.filter(item => !allChunks.includes(item));

            // 处理排除的目录，将包含路径的文件从数组中清除
            if (exclude.length) {
                exclude.forEach(excludeName => {

                    // 判断是否在排除目录中的方法
                    // 获取排除路径的绝对路径 root + excludeName，包含绝对路径就排除
                    let excludePath = path.join(root, excludeName);
                    unUsed = unUsed.filter(fileName => !fileName.includes(excludePath));
                });
            }

            // 将删除的文件列表写入指定文件
            if (typeof backupList === 'string') {
                fs.writeFileSync(backupList, JSON.stringify(unUsed, null, 4), {
                    encoding: 'utf-8'
                });
            }

            // 备份功能
            if (backupDir) {
                if (!fs.existsSync(backupDir)) {
                    fs.mkdirSync(backupDir);
                }

                unUsed.forEach(file => {
                    const relativePos = path.relative(root, file);
                    const dest = path.join(backupDir, relativePos);
                    const parseDestDir = (path.parse(dest) || {}).dir;

                    if (fs.existsSync(parseDestDir)) {
                        fs.createReadStream(file).pipe(fs.createWriteStream(dest));
                        return;
                    }

                    fs.mkdir(parseDestDir, {
                        recursive: true
                    }, (error) => {
                        if (error) {
                            throw error;
                        }

                        fs.createReadStream(file).pipe(fs.createWriteStream(dest));
                    });
                });
            }

            // 清除文件
            if (clean) {
                unUsed.forEach(file => {
                    spawn('rm', [file]);
                });
            }

            return unUsed;

        } catch (err) {
            throw new Error(err);
        }
    }

    /**
     * 获取项目目录所有的文件
     * @param {string} - 匹配正则
     */
    getAllFiles(pattern) {
        return new Promise((resolve, reject) => {
            glob(pattern, {
                nodir: true
            }, (err, files) => {
                if (err) {
                    throw new Error(err);
                }

                // 转成绝对路径文件
                const out = files.map(item => path.resolve(process.cwd(), item));
                resolve(out);
            });
        });
    }
};