'use strict';

let webpack = require('webpack');

let Config = require('./Config.js');

class Project {
    constructor(cwd) {
        this.cwd = cwd;
        this.config = new Config(cwd);
        this.extraCommands = [];
        this.middlewares = [];
    }
    readConfig(options) {
        options = options || {};
        this.configFile = globby.sync('ykit.*.js', {
            cwd: this.cwd
        })[0];
        if (!this.configFile) {
            if (!options.noCheck) {
                error('没有找到 ykit 配置文件！');
            }
            return this;
        }
        this.extendConfig = this.configFile.match(/ykit\.([\w\.]+)\.js/)[1].replace(/\./g, '-');
        if (this.extendConfig != 'config') {
            let modulePath = sysPath.join(this.cwd, 'node_modules', 'ykit-config-' + this.extendConfig),
                extended = false;
            if (fs.existsSync(modulePath)) {
                let module = require(modulePath);
                if (module.config) {
                    extended = true;
                    module.config(this.config, options, this.cwd);
                    this.extraCommands = this.extraCommands.concat(module.commands || []);
                    if (module.middlewares) {
                        this.middlewares = module.middlewares;
                    }
                }
            } else {
                try {
                    let module = require('ykit-config-' + this.extendConfig);
                    if (module.config) {
                        extended = true;
                        module.config(this.config, options, this.cwd);
                        this.extraCommands = this.extraCommands.concat(module.commands || []);
                        if (module.middlewares) {
                            this.middlewares = module.middlewares;
                        }
                    }
                } catch (e) {}
            }
            if (!extended) {
                error('没有找到 ykit-config-' + this.extendConfig + ' 配置模块！');
                return this;
            }
        }

        let configMethod = require(sysPath.join(this.cwd, this.configFile));

        if (!_.isFunction(configMethod.config)) {
            error(this.configFile + ' 没有 exports 正确的方法！');
            return this;
        }

        configMethod.config(this.config, options, this.cwd);
        this.extraCommands = this.extraCommands.concat(configMethod.commands || []);
        if (configMethod.middlewares) {
            this.middlewares = configMethod.middlewares;
        }

        if (this.config._config.output.path[0] != '/') {
            this.config.setOutput({
                path: sysPath.join(this.cwd, this.config._config.output.path)
            });
        }

        return this;
    }
    check() {
        return !!this.configFile;
    }
    pack(options, callback) {
        if (options.min) {
            this.config.addPlugins(new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            }));
        }
        webpack(this.config.getConfig(), callback);

        return this;
    }
    getCompiler() {
        return webpack(this.config.getConfig());
    }
}

module.exports = Project;
