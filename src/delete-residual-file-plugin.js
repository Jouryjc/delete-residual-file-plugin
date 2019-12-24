const fs = require('fs');
const glob = require('glob');
const path = require('path');
const { spawn } = require('child_process');

module.exports = class DeleteResidualFilePlugin {
    constructor(options) {
        this.options = Object.assign({

            // 扫描的根目录
            root: './src',

            // 是否清除所有的文件
            clean: false,

            // 写入备份列表的文件路径
            backupList: './residual-files.json',

            // 要排除删除的相对目录或文件
            exclude: [],

            // 写入备份文件的路径
            backupDir: ''
        }, options);
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tap("DeleteResidualFilePlugin", async (compilation) => {
            await this.findUnusedFiles(compilation);

            // 将删除的文件列表写入指定文件
            if (this.options.backupList) {
                this.inputBackupList();
            }

            // 备份功能
            if (this.options.backupDir) {
                this.outputBackupDir();
            }

            // 清除文件
            if (this.options.clean) {
                this.removeFile();
            }
        });
    }

    /**
     * 获取依赖的文件
     * @param {Compilation} - compilation对象
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
     * 查找所有未使用的文件
     * @param {Compilation} compilation 
     */
    async findUnusedFiles(compilation) {
        const { root, exclude } = this.options;

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
            this.unUsedFile = unUsed;

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

    /**
     * 写入备份文件列表
     */
    inputBackupList () {
        fs.writeFileSync(
            this.options.backupList,
            JSON.stringify(this.unUsedFile, null, 4),
            {
                encoding: 'utf-8'
            }
        );
    }

    /**
     * 备份文件
     */
    outputBackupDir () {
        const { root, backupDir } = this.options;

        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir);
        }

        this.unUsedFile.forEach(file => {
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

    /**
     * 移除文件
     */
    removeFile () {
        this.unUsedFile.forEach(file => {
            spawn('rm', [file]);

            // TODO 如果文件夹为空了，删除对应的文件夹
        });
    }
};