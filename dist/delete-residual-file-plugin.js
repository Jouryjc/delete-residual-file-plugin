import _toConsumableArray from '@babel/runtime/helpers/toConsumableArray';
import _regeneratorRuntime from '@babel/runtime/regenerator';
import _classCallCheck from '@babel/runtime/helpers/classCallCheck';
import _createClass from '@babel/runtime/helpers/createClass';

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

  _createClass(DeleteResidualFilePlugin, [{
    key: "apply",
    value: function apply(compiler) {
      var _this = this;

      compiler.hooks.afterEmit.tap("DeleteResidualFilePlugin", function _callee(compilation) {
        return _regeneratorRuntime.async(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return _regeneratorRuntime.awrap(_this.findUnusedFiles(compilation));

              case 2:
                // 将删除的文件列表写入指定文件
                if (_this.options.backupList) {
                  _this.inputBackupList();
                } // 备份功能


                if (_this.options.backupDir) {
                  _this.outputBackupDir();
                } // 清除文件


                if (_this.options.clean) {
                  _this.removeFile();
                }

              case 5:
              case "end":
                return _context.stop();
            }
          }
        });
      });
    }
    /**
     * 获取依赖的文件
     * @param {Compilation} - compilation对象
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
     * 查找所有未使用的文件
     * @param {Compilation} compilation 
     */

  }, {
    key: "findUnusedFiles",
    value: function findUnusedFiles(compilation) {
      var _this$options, root, exclude, allChunks, pattern, allFiles, unUsed;

      return _regeneratorRuntime.async(function findUnusedFiles$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _this$options = this.options, root = _this$options.root, exclude = _this$options.exclude;
              _context2.prev = 1;
              _context2.next = 4;
              return _regeneratorRuntime.awrap(this.getDependFiles(compilation));

            case 4:
              allChunks = _context2.sent;
              // 获取指定root中所有文件
              pattern = root + '/**/*';
              _context2.next = 8;
              return _regeneratorRuntime.awrap(this.getAllFiles(pattern));

            case 8:
              allFiles = _context2.sent;
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
              }

              this.unUsedFile = unUsed;
              return _context2.abrupt("return", unUsed);

            case 15:
              _context2.prev = 15;
              _context2.t0 = _context2["catch"](1);
              throw new Error(_context2.t0);

            case 18:
            case "end":
              return _context2.stop();
          }
        }
      }, null, this, [[1, 15]]);
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
    /**
     * 写入备份文件列表
     */

  }, {
    key: "inputBackupList",
    value: function inputBackupList() {
      fs.writeFileSync(this.options.backupList, JSON.stringify(this.unUsedFile, null, 4), {
        encoding: 'utf-8'
      });
    }
    /**
     * 备份文件
     */

  }, {
    key: "outputBackupDir",
    value: function outputBackupDir() {
      var _this$options2 = this.options,
          root = _this$options2.root,
          backupDir = _this$options2.backupDir;

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir);
      }

      this.unUsedFile.forEach(function (file) {
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
    }
    /**
     * 移除文件
     */

  }, {
    key: "removeFile",
    value: function removeFile() {
      this.unUsedFile.forEach(function (file) {
        spawn('rm', [file]); // TODO 如果文件夹为空了，删除对应的文件夹
      });
    }
  }]);

  return DeleteResidualFilePlugin;
}();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVsZXRlLXJlc2lkdWFsLWZpbGUtcGx1Z2luLmpzIiwic291cmNlcyI6WyIuLi9zcmMvZGVsZXRlLXJlc2lkdWFsLWZpbGUtcGx1Z2luLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcclxuY29uc3QgZ2xvYiA9IHJlcXVpcmUoJ2dsb2InKTtcclxuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcclxuY29uc3QgeyBzcGF3biB9ID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBjbGFzcyBEZWxldGVSZXNpZHVhbEZpbGVQbHVnaW4ge1xyXG4gICAgY29uc3RydWN0b3Iob3B0aW9ucykge1xyXG4gICAgICAgIHRoaXMub3B0aW9ucyA9IE9iamVjdC5hc3NpZ24oe1xyXG5cclxuICAgICAgICAgICAgLy8g5omr5o+P55qE5qC555uu5b2VXHJcbiAgICAgICAgICAgIHJvb3Q6ICcuL3NyYycsXHJcblxyXG4gICAgICAgICAgICAvLyDmmK/lkKbmuIXpmaTmiYDmnInnmoTmlofku7ZcclxuICAgICAgICAgICAgY2xlYW46IGZhbHNlLFxyXG5cclxuICAgICAgICAgICAgLy8g5YaZ5YWl5aSH5Lu95YiX6KGo55qE5paH5Lu26Lev5b6EXHJcbiAgICAgICAgICAgIGJhY2t1cExpc3Q6ICcuL3Jlc2lkdWFsLWZpbGVzLmpzb24nLFxyXG5cclxuICAgICAgICAgICAgLy8g6KaB5o6S6Zmk5Yig6Zmk55qE55u45a+555uu5b2V5oiW5paH5Lu2XHJcbiAgICAgICAgICAgIGV4Y2x1ZGU6IFtdLFxyXG5cclxuICAgICAgICAgICAgLy8g5YaZ5YWl5aSH5Lu95paH5Lu255qE6Lev5b6EXHJcbiAgICAgICAgICAgIGJhY2t1cERpcjogJydcclxuICAgICAgICB9LCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBhcHBseShjb21waWxlcikge1xyXG4gICAgICAgIGNvbXBpbGVyLmhvb2tzLmFmdGVyRW1pdC50YXAoXCJEZWxldGVSZXNpZHVhbEZpbGVQbHVnaW5cIiwgYXN5bmMgKGNvbXBpbGF0aW9uKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuZmluZFVudXNlZEZpbGVzKGNvbXBpbGF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIC8vIOWwhuWIoOmZpOeahOaWh+S7tuWIl+ihqOWGmeWFpeaMh+WumuaWh+S7tlxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t1cExpc3QpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMuaW5wdXRCYWNrdXBMaXN0KCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIC8vIOWkh+S7veWKn+iDvVxyXG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmJhY2t1cERpcikge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5vdXRwdXRCYWNrdXBEaXIoKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8g5riF6Zmk5paH5Lu2XHJcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuY2xlYW4pIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlRmlsZSgpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDojrflj5bkvp3otZbnmoTmlofku7ZcclxuICAgICAqIEBwYXJhbSB7Q29tcGlsYXRpb259IC0gY29tcGlsYXRpb27lr7nosaFcclxuICAgICAqL1xyXG4gICAgZ2V0RGVwZW5kRmlsZXMoY29tcGlsYXRpb24pIHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBkZXBlbmRlZEZpbGVzID0gWy4uLmNvbXBpbGF0aW9uLmZpbGVEZXBlbmRlbmNpZXNdLnJlZHVjZShcclxuICAgICAgICAgICAgICAgIChhY2MsIHVzZWRGaWxlcGF0aCkgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDlsIZub2RlX21vZHVsZXPkuIvnmoTkvp3otZbov4fmu6TmjolcclxuICAgICAgICAgICAgICAgICAgICBpZiAoIXVzZWRGaWxlcGF0aC5pbmNsdWRlcygnbm9kZV9tb2R1bGVzJykpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2godXNlZEZpbGVwYXRoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgW11cclxuICAgICAgICAgICAgKTtcclxuXHJcbiAgICAgICAgICAgIHJlc29sdmUoZGVwZW5kZWRGaWxlcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiDmn6Xmib7miYDmnInmnKrkvb/nlKjnmoTmlofku7ZcclxuICAgICAqIEBwYXJhbSB7Q29tcGlsYXRpb259IGNvbXBpbGF0aW9uIFxyXG4gICAgICovXHJcbiAgICBhc3luYyBmaW5kVW51c2VkRmlsZXMoY29tcGlsYXRpb24pIHtcclxuICAgICAgICBjb25zdCB7IHJvb3QsIGV4Y2x1ZGUgfSA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluaJgOacieS+nei1luaWh+S7tlxyXG4gICAgICAgICAgICBjb25zdCBhbGxDaHVua3MgPSBhd2FpdCB0aGlzLmdldERlcGVuZEZpbGVzKGNvbXBpbGF0aW9uKTtcclxuXHJcbiAgICAgICAgICAgIC8vIOiOt+WPluaMh+WumnJvb3TkuK3miYDmnInmlofku7ZcclxuICAgICAgICAgICAgY29uc3QgcGF0dGVybiA9IHJvb3QgKyAnLyoqLyonO1xyXG4gICAgICAgICAgICBjb25zdCBhbGxGaWxlcyA9IGF3YWl0IHRoaXMuZ2V0QWxsRmlsZXMocGF0dGVybik7XHJcblxyXG4gICAgICAgICAgICBsZXQgdW5Vc2VkID0gYWxsRmlsZXMuZmlsdGVyKGl0ZW0gPT4gIWFsbENodW5rcy5pbmNsdWRlcyhpdGVtKSk7XHJcblxyXG4gICAgICAgICAgICAvLyDlpITnkIbmjpLpmaTnmoTnm67lvZXvvIzlsIbljIXlkKvot6/lvoTnmoTmlofku7bku47mlbDnu4TkuK3muIXpmaRcclxuICAgICAgICAgICAgaWYgKGV4Y2x1ZGUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBleGNsdWRlLmZvckVhY2goZXhjbHVkZU5hbWUgPT4ge1xyXG5cclxuICAgICAgICAgICAgICAgICAgICAvLyDliKTmlq3mmK/lkKblnKjmjpLpmaTnm67lvZXkuK3nmoTmlrnms5VcclxuICAgICAgICAgICAgICAgICAgICAvLyDojrflj5bmjpLpmaTot6/lvoTnmoTnu53lr7not6/lvoQgcm9vdCArIGV4Y2x1ZGVOYW1l77yM5YyF5ZCr57ud5a+56Lev5b6E5bCx5o6S6ZmkXHJcbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4Y2x1ZGVQYXRoID0gcGF0aC5qb2luKHJvb3QsIGV4Y2x1ZGVOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICB1blVzZWQgPSB1blVzZWQuZmlsdGVyKGZpbGVOYW1lID0+ICFmaWxlTmFtZS5pbmNsdWRlcyhleGNsdWRlUGF0aCkpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdGhpcy51blVzZWRGaWxlID0gdW5Vc2VkO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuIHVuVXNlZDtcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGVycik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog6I635Y+W6aG555uu55uu5b2V5omA5pyJ55qE5paH5Lu2XHJcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gLSDljLnphY3mraPliJlcclxuICAgICAqL1xyXG4gICAgZ2V0QWxsRmlsZXMocGF0dGVybikge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgICAgICAgIGdsb2IocGF0dGVybiwge1xyXG4gICAgICAgICAgICAgICAgbm9kaXI6IHRydWVcclxuICAgICAgICAgICAgfSwgKGVyciwgZmlsZXMpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAvLyDovazmiJDnu53lr7not6/lvoTmlofku7ZcclxuICAgICAgICAgICAgICAgIGNvbnN0IG91dCA9IGZpbGVzLm1hcChpdGVtID0+IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBpdGVtKSk7XHJcbiAgICAgICAgICAgICAgICByZXNvbHZlKG91dCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5YaZ5YWl5aSH5Lu95paH5Lu25YiX6KGoXHJcbiAgICAgKi9cclxuICAgIGlucHV0QmFja3VwTGlzdCAoKSB7XHJcbiAgICAgICAgZnMud3JpdGVGaWxlU3luYyhcclxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLmJhY2t1cExpc3QsXHJcbiAgICAgICAgICAgIEpTT04uc3RyaW5naWZ5KHRoaXMudW5Vc2VkRmlsZSwgbnVsbCwgNCksXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGVuY29kaW5nOiAndXRmLTgnXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICog5aSH5Lu95paH5Lu2XHJcbiAgICAgKi9cclxuICAgIG91dHB1dEJhY2t1cERpciAoKSB7XHJcbiAgICAgICAgY29uc3QgeyByb290LCBiYWNrdXBEaXIgfSA9IHRoaXMub3B0aW9ucztcclxuXHJcbiAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKGJhY2t1cERpcikpIHtcclxuICAgICAgICAgICAgZnMubWtkaXJTeW5jKGJhY2t1cERpcik7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB0aGlzLnVuVXNlZEZpbGUuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVQb3MgPSBwYXRoLnJlbGF0aXZlKHJvb3QsIGZpbGUpO1xyXG4gICAgICAgICAgICBjb25zdCBkZXN0ID0gcGF0aC5qb2luKGJhY2t1cERpciwgcmVsYXRpdmVQb3MpO1xyXG4gICAgICAgICAgICBjb25zdCBwYXJzZURlc3REaXIgPSAocGF0aC5wYXJzZShkZXN0KSB8fCB7fSkuZGlyO1xyXG5cclxuICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGFyc2VEZXN0RGlyKSkge1xyXG4gICAgICAgICAgICAgICAgZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKS5waXBlKGZzLmNyZWF0ZVdyaXRlU3RyZWFtKGRlc3QpKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnMubWtkaXIocGFyc2VEZXN0RGlyLCB7XHJcbiAgICAgICAgICAgICAgICByZWN1cnNpdmU6IHRydWVcclxuICAgICAgICAgICAgfSwgKGVycm9yKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBlcnJvcjtcclxuICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICBmcy5jcmVhdGVSZWFkU3RyZWFtKGZpbGUpLnBpcGUoZnMuY3JlYXRlV3JpdGVTdHJlYW0oZGVzdCkpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIOenu+mZpOaWh+S7tlxyXG4gICAgICovXHJcbiAgICByZW1vdmVGaWxlICgpIHtcclxuICAgICAgICB0aGlzLnVuVXNlZEZpbGUuZm9yRWFjaChmaWxlID0+IHtcclxuICAgICAgICAgICAgc3Bhd24oJ3JtJywgW2ZpbGVdKTtcclxuXHJcbiAgICAgICAgICAgIC8vIFRPRE8g5aaC5p6c5paH5Lu25aS55Li656m65LqG77yM5Yig6Zmk5a+55bqU55qE5paH5Lu25aS5XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn07Il0sIm5hbWVzIjpbImZzIiwicmVxdWlyZSIsImdsb2IiLCJwYXRoIiwic3Bhd24iLCJtb2R1bGUiLCJleHBvcnRzIiwib3B0aW9ucyIsIk9iamVjdCIsImFzc2lnbiIsInJvb3QiLCJjbGVhbiIsImJhY2t1cExpc3QiLCJleGNsdWRlIiwiYmFja3VwRGlyIiwiY29tcGlsZXIiLCJob29rcyIsImFmdGVyRW1pdCIsInRhcCIsImNvbXBpbGF0aW9uIiwiZmluZFVudXNlZEZpbGVzIiwiaW5wdXRCYWNrdXBMaXN0Iiwib3V0cHV0QmFja3VwRGlyIiwicmVtb3ZlRmlsZSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiZGVwZW5kZWRGaWxlcyIsImZpbGVEZXBlbmRlbmNpZXMiLCJyZWR1Y2UiLCJhY2MiLCJ1c2VkRmlsZXBhdGgiLCJpbmNsdWRlcyIsInB1c2giLCJnZXREZXBlbmRGaWxlcyIsImFsbENodW5rcyIsInBhdHRlcm4iLCJnZXRBbGxGaWxlcyIsImFsbEZpbGVzIiwidW5Vc2VkIiwiZmlsdGVyIiwiaXRlbSIsImxlbmd0aCIsImZvckVhY2giLCJleGNsdWRlTmFtZSIsImV4Y2x1ZGVQYXRoIiwiam9pbiIsImZpbGVOYW1lIiwidW5Vc2VkRmlsZSIsIkVycm9yIiwibm9kaXIiLCJlcnIiLCJmaWxlcyIsIm91dCIsIm1hcCIsInByb2Nlc3MiLCJjd2QiLCJ3cml0ZUZpbGVTeW5jIiwiSlNPTiIsInN0cmluZ2lmeSIsImVuY29kaW5nIiwiZXhpc3RzU3luYyIsIm1rZGlyU3luYyIsImZpbGUiLCJyZWxhdGl2ZVBvcyIsInJlbGF0aXZlIiwiZGVzdCIsInBhcnNlRGVzdERpciIsInBhcnNlIiwiZGlyIiwiY3JlYXRlUmVhZFN0cmVhbSIsInBpcGUiLCJjcmVhdGVXcml0ZVN0cmVhbSIsIm1rZGlyIiwicmVjdXJzaXZlIiwiZXJyb3IiXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsSUFBTUEsRUFBRSxHQUFHQyxPQUFPLENBQUMsSUFBRCxDQUFsQjs7QUFDQSxJQUFNQyxJQUFJLEdBQUdELE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLElBQU1FLElBQUksR0FBR0YsT0FBTyxDQUFDLE1BQUQsQ0FBcEI7O2VBQ2tCQSxPQUFPLENBQUMsZUFBRDtJQUFqQkcsaUJBQUFBOztBQUVSQyxNQUFNLENBQUNDLE9BQVA7O0FBQUE7b0NBQ2dCQyxPQUFaLEVBQXFCOzs7U0FDWkEsT0FBTCxHQUFlQyxNQUFNLENBQUNDLE1BQVAsQ0FBYzs7TUFHekJDLElBQUksRUFBRSxPQUhtQjs7TUFNekJDLEtBQUssRUFBRSxLQU5rQjs7TUFTekJDLFVBQVUsRUFBRSx1QkFUYTs7TUFZekJDLE9BQU8sRUFBRSxFQVpnQjs7TUFlekJDLFNBQVMsRUFBRTtLQWZBLEVBZ0JaUCxPQWhCWSxDQUFmOzs7OzswQkFtQkVRLFFBckJWLEVBcUJvQjs7O01BQ1pBLFFBQVEsQ0FBQ0MsS0FBVCxDQUFlQyxTQUFmLENBQXlCQyxHQUF6QixDQUE2QiwwQkFBN0IsRUFBeUQsaUJBQU9DLFdBQVA7Ozs7OztpREFDL0MsS0FBSSxDQUFDQyxlQUFMLENBQXFCRCxXQUFyQixDQUQrQzs7OztvQkFJakQsS0FBSSxDQUFDWixPQUFMLENBQWFLLFVBQWpCLEVBQTZCO2tCQUN6QixLQUFJLENBQUNTLGVBQUw7aUJBTGlEOzs7b0JBU2pELEtBQUksQ0FBQ2QsT0FBTCxDQUFhTyxTQUFqQixFQUE0QjtrQkFDeEIsS0FBSSxDQUFDUSxlQUFMO2lCQVZpRDs7O29CQWNqRCxLQUFJLENB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
