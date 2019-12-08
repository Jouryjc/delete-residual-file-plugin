import babel from 'rollup-plugin-babel';

export default {
    input: 'src/delete-residual-file-plugin.js',

    output: {
        file: 'dist/delete-residual-file-plugin.js',
        format: 'es',
        name: 'DeleteResidualFilePlugin'
    },

    plugins: [
        babel({
            exclude: 'node_modules/**' // 只编译我们的源代码
        })
    ]
};