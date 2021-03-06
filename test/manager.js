var _ = require('underscore');
var async = require('async');
var express = require('express');
var mkdirp = require('mkdirp');
var path = require('path');
var puppeteer = require('puppeteer');
var Primus = require('primus');
var serveStatic = require('serve-static');

var manager = module.exports = {

	browser: null,
	page: null,

	prepareStaticWebServer: function(done) {

		var app = express();
		app.use(serveStatic('www'));
		app.server = app.listen(3000, done);
		return app;
	},

	prepareBrowser: function(options, done) {

		if (_.isFunction(options)) {
			done = options;
			options = null;
		}

		options = _.defaults({}, options || {}, {
			headless: true,
			slowMo: 0,
			timeout: 10000
		});

		/*
			See:
			https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md#running-puppeteer-on-travis-ci
		*/
		if (process.env.TRAVIS_CI) {
			options.args = ['--no-sandbox'];
		}

		puppeteer.launch(options).then(function(browser) {
			manager.browser = browser;
			done(null, browser);
		}).catch(done);
	},

	navigate: function(uri, done) {

		if (!manager.page) {
			return done(new Error('Must load a page before navigating.'));
		}

		var host = process.env.HTTP_SERVER_HOST || 'localhost';
		var port = parseInt(process.env.HTTP_SERVER_PORT || 3000);
		var baseUrl = 'http://' + host + ':' + port;
		var pageUrl = baseUrl + uri;
		manager.page.goto(pageUrl).then(function() {
			done();
		}).catch(done);
	},

	preparePage: function(done) {

		if (!manager.browser) {
			return done(new Error('Must prepare browser before opening a page.'));
		}

		manager.browser.newPage().then(function(newPage) {
			manager.page = newPage;
			done(null, newPage);
		}).catch(done);
	},

	evaluateInPageContext: function(fn, done) {

		manager.page.evaluate(fn).then(function() {
			var args = Array.prototype.slice.call(arguments);
			done.apply(undefined, [null].concat(args));
		}).catch(done);
	},

	onAppLoaded: function(done) {

		done = _.once(done);
		manager.navigate('/', function(error) {
			if (error) return done(error);
			manager.page.waitFor('html.loaded').then(function() {
				done();
			}).catch(done);
		});
	},

	getPageLocationHash: function() {

		if (!manager.page) {
			throw new Error('No page is loaded.');
		}

		var pageUrl = manager.page.url();
		var parts = pageUrl.indexOf('#') !== -1 ? pageUrl.split('#') : [];
		return parts[1] || '';
	},

	socketServer: function(serverConfig) {

		serverConfig = _.defaults(serverConfig || {}, {
			port: 3600,
			pathname: '/primus',
			transformer: 'websockets',
			pingInterval: 5000,
		});

		var tmpApp = express();
		tmpApp.server = tmpApp.listen(serverConfig.port, 'localhost');
		var primus = new Primus(tmpApp.server, serverConfig);

		return {
			tmpApp: tmpApp,
			primus: primus,
			close: function() {
				if (primus) {
					primus.destroy();
					primus = null;
				}
				if (tmpApp) {
					tmpApp.server.close();
					tmpApp = null;
				}
			}
		};
	},

	screenshot: function(name, done) {
		var extension = '.png';
		var dir = path.join(__dirname, '..', 'build', 'screenshots');
		var fileName = name + extension;
		var filePath = path.join(dir, fileName);
		async.series([
			function(next) {
				mkdirp(dir, next);
			},
			function(next) {
				manager.page.screenshot({
					path: filePath,
				}).then(function() {
					next();
				}).catch(next);
			},
		], done);
	},

	// Execute a function in the context of the current browser page.
	evaluateFn: function(options, cb) {

		manager.page.evaluate(function(evaluateOptions) {
			return new Promise(function(resolve, reject) {
				try {
					(function() {
						if (typeof evaluateOptions !== 'object') {
							throw new Error('Invalid argument ("evaluateOptions"): Object expected');
						}
						if (typeof evaluateOptions.args === 'undefined') {
							throw new Error('Missing required option ("args")');
						}
						if (typeof evaluateOptions.fn === 'undefined') {
							throw new Error('Missing required option ("fn")');
						}
						if (typeof evaluateOptions.isAsync === 'undefined') {
							throw new Error('Missing required option ("isAsync")');
						}
						if (typeof evaluateOptions.fn !== 'string') {
							throw new Error('Invalid option ("fn"): String expected');
						}
						if (!(evaluateOptions.args instanceof Array)) {
							throw new Error('Missing required option ("args"): Array expected');
						}
						evaluateOptions.isAsync = evaluateOptions.isAsync === true;
						// Find the test function in the context of the page.
						var fn = (function() {
							var parts = evaluateOptions.fn.split('.');
							var parent = window;
							while (parts.length > 1) {
								parent = parent[parts.shift()];
							}
							var fn = parent[parts[0]];
							if (typeof fn === 'undefined') {
								throw new Error('Function does not exist: "' + evaluateOptions.fn + '"');
							}
							// Bind the function to the parent context.
							return function() {
								return fn.apply(parent, arguments);
							};
						})();
						if (evaluateOptions.isAsync) {
							// Asynchronous execution.
							var done = function() {
								var args = Array.prototype.slice.call(arguments);
								resolve(args);
							};
							var args = evaluateOptions.args.concat(done);
							fn.apply(undefined, args);
						} else {
							// Synchronous execution.
							var thrownError;
							try {
								var result = fn.apply(undefined, evaluateOptions.args);
							} catch (error) {
								return resolve([error]);
							}
							return resolve([null, result]);
						}
					})();
				} catch (error) {
					return reject(error);
				}
			});
		}, options)
			.then(function(args) {
				cb.apply(undefined, args);
			})
			.catch(cb);
	},

};
