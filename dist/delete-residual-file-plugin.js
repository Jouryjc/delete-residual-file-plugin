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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLXJlc2lkdWFsLWZpbGUtcGx1Z2luLmpzIiwic291cmNlcyI6WyIuLi9zcmMvZGVsZXRlLXJlc2lkdWFsLWZpbGUtcGx1Z2luLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcclxuY29uc3QgZ2xvYiA9IHJlcXVpcmUoJ2dsb2InKTtcclxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcclxuY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEZWxldGVSZXNpZHVhbEZpbGVQbHVnaW4ge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgYXBwbHkoY29tcGlsZXIpIHtcclxuICAgICAgICBjb21waWxlci5ob29rcy5hZnRlckVtaXQudGFwKFwiRGVsZXRlUmVzaWR1YWxGaWxlUGx1Z2luXCIsIChjb21waWxhdGlvbikgPT4ge1xyXG4gICAgICAgICAgICB0aGlzLmZpbmRVbnVzZWRGaWxlcyhjb21waWxhdGlvbiwgdGhpcy5vcHRpb25zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOiOt+WPluS+nei1lueahOaWh+S7tlxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IC0gY29tcGlsYXRpb27lr7nosaFcclxuICAgICAqL1xyXG4gICAgZ2V0RGVwZW5kRmlsZXMoY29tcGlsYXRpb24pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlZEZpbGVzID0gWy4uLmNvbXBpbGF0aW9uLmZpbGVEZXBlbmRlbmNpZXNdLnJlZHVjZShcclxuICAgICAgICAgICAgICAgIChhY2MsIHVzZWRGaWxlcGF0aCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDlsIZub2RlX21vZHVsZXPkuIvnmoTkvp3otZbov4fmu6TmjolcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZWRGaWxlcGF0aC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2godXNlZEZpbGVwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgW11cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHJlc29sdmUoZGVwZW5kZWRGaWxlcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmn6Xmib7jgIHlpIfku73jgIHliKDpmaTmiYDmnInmnKrkvb/nlKjnmoTmlofku7ZcclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBjb21waWxhdGlvblxyXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGNvbmZpZyAtIOmFjee9ruS/oeaBr1xyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy5yb290IC0g5p+l5om+55qE5qC555uu5b2VXHJcbiAgICAgKiBAcGFyYW0ge2Jvb2xlYW59IGNvbmZpZy5jbGVhbiAtIOaYr+WQpua4hemZpOaJgOacieeahOaWh+S7tlxyXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGNvbmZpZy5iYWNrdXBMaXN0IC0g5YaZ5YWl5aSH5Lu95YiX6KGo55qE6Lev5b6EXHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gY29uZmlnLmJhY2t1cERpciAtIOWGmeWFpeWkh+S7veaWh+S7tueahOi3r+W+hFxyXG4gICAgICogQHBhcmFtIHtBcnJheX0gY29uZmlnLmV4Y2x1ZGUgLSDopoHmjpLpmaTliKDpmaTnmoTnm7jlr7nnm67lvZXmiJbmlofku7ZcclxuICAgICAqL1xyXG4gICAgYXN5bmMgZmluZFVudXNlZEZpbGVzKGNvbXBpbGF0aW9uLCBjb25maWcgPSB7fSkge1xyXG4gICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgcm9vdCA9ICcuL3NyYycsXHJcbiAgICAgICAgICAgIGNsZWFuID0gZmFsc2UsXHJcbiAgICAgICAgICAgIGJhY2t1cExpc3QgPSAnLi9yZXNpZHVhbC1maWxlcy5qc29uJyxcclxuICAgICAgICAgICAgZXhjbHVkZSA9IFtdLFxyXG4gICAgICAgICAgICBiYWNrdXBEaXIgPSAnJ1xyXG4gICAgICAgIH0gPSBjb25maWc7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgICAgICAvLyDojrflj5bmiYDmnInkvp3otZbmlofku7ZcclxuICAgICAgICAgICAgY29uc3QgYWxsQ2h1bmtzID0gYXdhaXQgdGhpcy5nZXREZXBlbmRGaWxlcyhjb21waWxhdGlvbik7XHJcblxyXG4gICAgICAgICAgICAvLyDojrflj5bmjIflrppyb2905Lit5omA5pyJ5paH5Lu2XHJcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSByb290ICsgJy8qKi8qJztcclxuICAgICAgICAgICAgY29uc3QgYWxsRmlsZXMgPSBhd2FpdCB0aGlzLmdldEFsbEZpbGVzKHBhdHRlcm4pO1xyXG5cclxuICAgICAgICAgICAgbGV0IHVuVXNlZCA9IGFsbEZpbGVzLmZpbHRlcihpdGVtID0+ICFhbGxDaHVua3MuaW5jbHVkZXMoaXRlbSkpO1xyXG5cclxuICAgICAgICAgICAgLy8g5aSE55CG5o6S6Zmk55qE55uu5b2V77yM5bCG5YyF5ZCr6Lev5b6E55qE5paH5Lu25LuO5pWw57uE5Lit5riF6ZmkXHJcbiAgICAgICAgICAgIGlmIChleGNsdWRlLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgZXhjbHVkZS5mb3JFYWNoKGV4Y2x1ZGVOYW1lID0+IHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g5Yik5pat5piv5ZCm5Zyo5o6S6Zmk55uu5b2V5Lit55qE5pa55rOVXHJcbiAgICAgICAgICAgICAgICAgICAgLy8g6I635Y+W5o6S6Zmk6Lev5b6E55qE57ud5a+56Lev5b6EIHJvb3QgKyBleGNsdWRlTmFtZe+8jOWMheWQq+e7neWvuei3r+W+hOWwseaOkumZpFxyXG4gICAgICAgICAgICAgICAgICAgIGxldCBleGNsdWRlUGF0aCA9IHBhdGguam9pbihyb290LCBleGNsdWRlTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgdW5Vc2VkID0gdW5Vc2VkLmZpbHRlcihmaWxlTmFtZSA9PiAhZmlsZU5hbWUuaW5jbHVkZXMoZXhjbHVkZVBhdGgpKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDlsIbliKDpmaTnmoTmlofku7bliJfooajlhpnlhaXmjIflrprmlofku7ZcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBiYWNrdXBMaXN0ID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhiYWNrdXBMaXN0LCBKU09OLnN0cmluZ2lmeSh1blVzZWQsIG51bGwsIDQpLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgZW5jb2Rpbmc6ICd1dGYtOCdcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDlpIfku73lip/og71cclxuICAgICAgICAgICAgaWYgKGJhY2t1cERpcikge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGJhY2t1cERpcikpIHtcclxuICAgICAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMoYmFja3VwRGlyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICB1blVzZWQuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCByZWxhdGl2ZVBvcyA9IHBhdGgucmVsYXRpdmUocm9vdCwgZmlsZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVzdCA9IHBhdGguam9pbihiYWNrdXBEaXIsIHJlbGF0aXZlUG9zKTtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYXJzZURlc3REaXIgPSAocGF0aC5wYXJzZShkZXN0KSB8fCB7fSkuZGlyO1xyXG5cclxuICAgICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXJzZURlc3REaXIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGZzLmNyZWF0ZVJlYWRTdHJlYW0oZmlsZSkucGlwZShmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0KSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIGZzLm1rZGlyKHBhcnNlRGVzdERpciwge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZWN1cnNpdmU6IHRydWVcclxuICAgICAgICAgICAgICAgICAgICB9LCAoZXJyb3IpID0+IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QpKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAvLyDmuIXpmaTmlofku7ZcclxuICAgICAgICAgICAgaWYgKGNsZWFuKSB7XHJcbiAgICAgICAgICAgICAgICB1blVzZWQuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgICAgICAgICBzcGF3bigncm0nLCBbZmlsZV0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB1blVzZWQ7XHJcblxyXG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bpobnnm67nm67lvZXmiYDmnInnmoTmlofku7ZcclxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSAtIOWMuemFjeato+WImVxyXG4gICAgICovXHJcbiAgICBnZXRBbGxGaWxlcyhwYXR0ZXJuKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgZ2xvYihwYXR0ZXJuLCB7XHJcbiAgICAgICAgICAgICAgICBub2RpcjogdHJ1ZVxyXG4gICAgICAgICAgICB9LCAoZXJyLCBmaWxlcykgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xyXG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihlcnIpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgIC8vIOi9rOaIkOe7neWvuei3r+W+hOaWh+S7tlxyXG4gICAgICAgICAgICAgICAgY29uc3Qgb3V0ID0gZmlsZXMubWFwKGl0ZW0gPT4gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGl0ZW0pKTtcclxuICAgICAgICAgICAgICAgIHJlc29sdmUob3V0KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsImdsb2IiLCJwYXRoIiwic3Bhd24iLCJtb2R1bGUiLCJleHBvcnRzIiwib3B0aW9ucyIsImNvbXBpbGVyIiwiaG9va3MiLCJhZnRlckVtaXQiLCJ0YXAiLCJjb21waWxhdGlvbiIsImZpbmRVbnVzZWRGaWxlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZGVwZW5kZWRGaWxlcyIsImZpbGVEZXBlbmRlbmNpZXMiLCJyZWR1Y2UiLCJhY2MiLCJ1c2VkRmlsZXBhdGgiLCJpbmNsdWRlcyIsInB1c2giLCJjb25maWciLCJyb290IiwiY2xlYW4iLCJiYWNrdXBMaXN0IiwiZXhjbHVkZSIsImJhY2t1cERpciIsImdldERlcGVuZEZpbGVzIiwiYWxsQ2h1bmtzIiwicGF0dGVybiIsImdldEFsbEZpbGVzIiwiYWxsRmlsZXMiLCJ1blVzZWQiLCJmaWx0ZXIiLCJpdGVtIiwibGVuZ3RoIiwiZm9yRWFjaCIsImV4Y2x1ZGVOYW1lIiwiZXhjbHVkZVBhdGgiLCJqb2luIiwiZmlsZU5hbWUiLCJ3cml0ZUZpbGVTeW5jIiwiSlNPTiIsInN0cmluZ2lmeSIsImVuY29kaW5nIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsImZpbGUiLCJyZWxhdGl2ZVBvcyIsInJlbGF0aXZlIiwiZGVzdCIsInBhcnNlRGVzdERpciIsInBhcnNlIiwiZGlyIiwiY3JlYXRlUmVhZFN0cmVhbSIsInBpcGUiLCJjcmVhdGVXcml0ZVN0cmVhbSIsIm1rZGlyIiwicmVjdXJzaXZlIiwiZXJyb3IiLCJFcnJvciIsIm5vZGlyIiwiZXJyIiwiZmlsZXMiLCJvdXQiLCJtYXAiLCJwcm9jZXNzIiwiY3dkIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFNQSxFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLElBQU1DLElBQUksR0FBR0QsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O0FBQ0EsSUFBTUUsSUFBSSxHQUFHRixPQUFPLENBQUMsTUFBRCxDQUFwQjs7ZUFDa0JBLE9BQU8sQ0FBQyxlQUFEO0lBQWpCRyxpQkFBQUE7O0FBRVJDLE1BQU0sQ0FBQ0Ms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
