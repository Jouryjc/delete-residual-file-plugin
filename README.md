# delete-residual-file-plugin
该webpack插件用于删除项目中多余文件

## 说明
在一些老旧的项目中，经常会因为需求变动的问题，删除已经做好的功能。而我们最常用的手段就是将入口注释。久而久之，项目越来越庞大，而这些残余的模块文件却无法快速地删除。`delete-residual-file-plugin` 插件为此而生。

## 安装
`npm install delete-residual-file-plugin -D`

## 使用方法
```js
const DeleteResidualFilePlugin = require('delete-residual-file-plugin');

module.exports = {
    plugins: [
        new DeleteResidualFilePlugin()
    ]
}
```

## 配置和默认值（可选）
```js
new DeleteResidualFilePlugin({

    /**
     * 需要清除文件的根目录，一般是src目录，也可以指定具体的模块目录
     * 默认值: './src'
     */
    root: path.join(__dirname, '/src'),

    /**
     * 是否清除所有残余文件
     * 默认值：false
     */
    clean: true,

    /**
     * 存储所有删除文件列表
     * 默认值：'./residual-files.json'
     */
    backupList: path.resolve(__dirname, '/residual-files.json'),

    /**
     * 排除子目录，排除一些子目录（在root的基础上配置）
     * 默认值：[]
     */
    exclude,

    /**
     * 备份目录，可以将所有删除的目录和文件存档。只有开启了clean功能才会备份
     * 默认值：''，
     */
    backupDir
});
```

## 举一个webpack使用的例子
```js
const path = require('path');
const DeleteResidualFilePlugin = require('delete-residual-file-plugin');

module.exports = {
    entry: path.join(__dirname, 'src/index.js'),

    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'dist')
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
            },
        ]
    },

    plugins: [
        new DeleteResidualFilePlugin({
            root: path.join(__dirname, '/src'),
            clean: true,
            backupList: path.resolve(__dirname, '/residual-files.json'),
            exclude,
            backupDir
        })
    ]
};
```

## 关键词
[webpack](https://webpack.js.org/)
[plugins](https://webpack.js.org/concepts/plugins/)