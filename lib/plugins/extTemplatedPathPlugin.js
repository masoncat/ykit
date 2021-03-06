'use strict';

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Manager = require('../modules/GlobalManager');

module.exports = {
    apply: function apply(compiler) {
        var entryExtNames = Manager.getYkitConf('entryExtNames');

        compiler.plugin('compilation', function (compilation) {
            compilation.mainTemplate.plugin('asset-path', function (assetPath, data) {
                // handle ExtractTextPlugin options
                if ((typeof assetPath === 'undefined' ? 'undefined' : (0, _typeof3.default)(assetPath)) === 'object' && assetPath.filename) {
                    assetPath = assetPath.filename;
                }

                var extName = '.js';
                if (data.chunk && data.chunk.origins && data.chunk.origins[0]) {
                    var _module = data.chunk.origins[0].module,
                        rawRequest = _module.rawRequest ? _module.rawRequest : _module.dependencies[_module.dependencies.length - 1].userRequest;

                    extName = sysPath.extname(rawRequest) || '.js';

                    if (entryExtNames.css.indexOf(sysPath.extname(sysPath.basename(rawRequest, '.js'))) > -1) {
                        extName = '.cache';
                    }

                    // 应用后缀转换规则
                    (0, _keys2.default)(entryExtNames).map(function (targetExtName) {
                        if (entryExtNames[targetExtName].indexOf(extName) > -1) {
                            extName = '.' + targetExtName;
                        }
                    });

                    // 替换[name]为文件名，如index.js：[name][ext] => index[ext]
                    _module.forEachChunk(function (chunk) {
                        if (chunk.name && _module.blocks.length === 0) {
                            assetPath = assetPath.replace(/\[name\]/g, chunk.name.replace(/\.\w+$/g, ''));
                        }
                    });
                }

                return assetPath.replace(/\[ext\]/g, extName);
            });
        });
    }
};