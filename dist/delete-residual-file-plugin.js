function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  }
}

function _iterableToArray(iter) {
  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance");
}

var fs = require('fs');

var glob = require('glob');

var path = require('path');

var _require = require('child_process'),
    spawn = _require.spawn;

module.exports =
/*#__PURE__*/
function () {
  function DeleteResidualFilePlugin(options) {
    _classCallCheck(this, DeleteResidualFilePlugin);

    this.options = options;
  }

  _createClass(DeleteResidualFilePlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.afterEmit.tap("DeleteResidualFilePlugin", function (compilation) {
        _this.findUnusedFiles(compilation, _this.options);
      });
    }
    /**
     * 获取依赖的文件
     * @param {Object} - compilation对象
     */

  }, {
    key: "getDependFiles",
    value: function getDependFiles(compilation) {
      return new Promise(function (resolve, reject) {
        var dependedFiles = _toConsumableArray(compilation.fileDependencies).reduce(function (acc, usedFilepath) {
          // 将node_modules下的依赖过滤掉
          if (!usedFilepath.includes('node_modules')) {
            acc.push(usedFilepath);
          }

          return acc;
        }, []);

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

  }, {
    key: "findUnusedFiles",
    value: function findUnusedFiles(compilation) {
      var config,
          _config$root,
          root,
          _config$clean,
          clean,
          _config$backupList,
          backupList,
          _config$exclude,
          exclude,
          _config$backupDir,
          backupDir,
          allChunks,
          pattern,
          allFiles,
          unUsed,
          _args = arguments;

      return regeneratorRuntime.async(function findUnusedFiles$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              config = _args.length > 1 && _args[1] !== undefined ? _args[1] : {};
              _config$root = config.root, root = _config$root === void 0 ? './src' : _config$root, _config$clean = config.clean, clean = _config$clean === void 0 ? false : _config$clean, _config$backupList = config.backupList, backupList = _config$backupList === void 0 ? './residual-files.json' : _config$backupList, _config$exclude = config.exclude, exclude = _config$exclude === void 0 ? [] : _config$exclude, _config$backupDir = config.backupDir, backupDir = _config$backupDir === void 0 ? '' : _config$backupDir;
              _context.prev = 2;
              _context.next = 5;
              return regeneratorRuntime.awrap(this.getDependFiles(compilation));

            case 5:
              allChunks = _context.sent;
              // 获取指定root中所有文件
              pattern = root + '/**/*';
              _context.next = 9;
              return regeneratorRuntime.awrap(this.getAllFiles(pattern));

            case 9:
              allFiles = _context.sent;
              unUsed = allFiles.filter(function (item) {
                return !allChunks.includes(item);
              }); // 处理排除的目录，将包含路径的文件从数组中清除

              if (exclude.length) {
                exclude.forEach(function (excludeName) {
                  // 判断是否在排除目录中的方法
                  // 获取排除路径的绝对路径 root + excludeName，包含绝对路径就排除
                  var excludePath = path.join(root, excludeName);
                  unUsed = unUsed.filter(function (fileName) {
                    return !fileName.includes(excludePath);
                  });
                });
              } // 将删除的文件列表写入指定文件


              if (typeof backupList === 'string') {
                fs.writeFileSync(backupList, JSON.stringify(unUsed, null, 4), {
                  encoding: 'utf-8'
                });
              } // 备份功能


              if (backupDir) {
                if (!fs.existsSync(backupDir)) {
                  fs.mkdirSync(backupDir);
                }

                unUsed.forEach(function (file) {
                  var relativePos = path.relative(root, file);
                  var dest = path.join(backupDir, relativePos);
                  var parseDestDir = (path.parse(dest) || {}).dir;

                  if (fs.existsSync(parseDestDir)) {
                    fs.createReadStream(file).pipe(fs.createWriteStream(dest));
                    return;
                  }

                  fs.mkdir(parseDestDir, {
                    recursive: true
                  }, function (error) {
                    if (error) {
                      throw error;
                    }

                    fs.createReadStream(file).pipe(fs.createWriteStream(dest));
                  });
                });
              } // 清除文件


              if (clean) {
                unUsed.forEach(function (file) {
                  spawn('rm', [file]);
                });
              }

              return _context.abrupt("return", unUsed);

            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](2);
              throw new Error(_context.t0);

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, null, this, [[2, 18]]);
    }
    /**
     * 获取项目目录所有的文件
     * @param {string} - 匹配正则
     */

  }, {
    key: "getAllFiles",
    value: function getAllFiles(pattern) {
      return new Promise(function (resolve, reject) {
        glob(pattern, {
          nodir: true
        }, function (err, files) {
          if (err) {
            throw new Error(err);
          } // 转成绝对路径文件


          var out = files.map(function (item) {
            return path.resolve(process.cwd(), item);
          });
          resolve(out);
        });
      });
    }
  }]);

  return DeleteResidualFilePlugin;
}();
