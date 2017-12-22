module.exports = function(grunt) {

	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
	var webpack = require("webpack");
	var webpackConfig = require("./webpack.config.js");

	grunt.config.init({
		clean: {
			build: ['static'],
			release: ['dist']
		},
		copy: {
			build: {
				files: [
					/*{
						expand: true,
						cwd: 'dev',
						src: ['vconsole.min.js'], 
						dest: 'static/'
					},*/
					{
						expand: true,
						cwd: 'src/assets/libs',
						src: ['*'], 
						dest: 'static/'
					},
				],
			},
			release: {
				files: [
					{
						expand: true, 
						cwd: 'static/images/',
						src: ['**'], 
						dest: 'dist/static/images/'
					},
					{
						expand: true, 
						cwd: 'static/',
						src: ['*.js'], 
						dest: 'dist/static/'
					},
					{
						expand: true, 
						cwd: 'static/',
						src: ['index.html'], 
						dest: 'dist/'
					}
				],
			},
			dev: {
				files: [
					{
						expand: true, 
						cwd: 'static/',
						src: ['index.html'], 
						dest: ''
					}
				],
			}
		},
		webpack: {
			options: webpackConfig,
			build: {
				plugins: webpackConfig.plugins.concat([
					new webpack.DefinePlugin({
						"process.env": {
							"NODE_ENV": JSON.stringify("production")
						}
					}),
					new webpack.optimize.DedupePlugin(),
					new webpack.optimize.UglifyJsPlugin({
						compress: {
							warnings: false
						}
					}),
					new webpack.optimize.OccurenceOrderPlugin(),
					new webpack.optimize.CommonsChunkPlugin('common.[hash].js')
				])
			},
			"build-dev": {
				devtool: "sourcemap",
				debug: true
			}
		},
		"webpack-dev-server": {
			options: {
				webpack: webpackConfig,
				publicPath: "/" + webpackConfig.output.publicPath
			},
			start: {
				keepAlive: true,
				webpack: {
					devtool: "eval",
					debug: true
				}
			}
		},
		watch: {
			app: {
				files: ["src/**/*"],
				tasks: ["webpack:build-dev", "copy:dev"],
				options: {
					spawn: false,
				}
			}
		},
        connect: {
            server: {
                options: {
                    port: 9001,
                    base: { path: '.', options: { maxAge: 0 } }
                }
            }
		}
    });

	// The development server (the recommended option for development)
	grunt.registerTask("default", ["webpack-dev-server:start"]);

	// Build and watch cycle (another option for development)
	// Advantage: No server required, can run app from filesystem
	// Disadvantage: Requests are not blocked until bundle is available,
	//               can serve an old app on too fast refresh
	grunt.registerTask("dev", ["clean", "copy:build", "webpack:build-dev", "copy:dev", "connect", "watch:app"]);

	// Production build
	grunt.registerTask("build", ["clean", "copy:build", "webpack:build", "copy:release"]);
};