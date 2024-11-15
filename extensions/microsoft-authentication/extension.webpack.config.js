/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

//@ts-check

'use strict';

const withDefaults = require('../shared.webpack.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const { NormalModuleReplacementPlugin } = require('webpack');

const isWindows = process.platform === 'win32';

module.exports = withDefaults({
	context: __dirname,
	entry: {
		extension: './src/extension.ts'
	},
	externals: {
		// The @azure/msal-node-runtime package requires this native node module (.node).
		// It is currently only included on Windows, but the package handles unsupported platforms
		// gracefully.
		'./msal-node-runtime': 'commonjs ./msal-node-runtime'
	},
	plugins: [
		...withDefaults.nodePlugins(__dirname),
		new CopyWebpackPlugin({
			patterns: [
				{
					// The native files we need to ship with the extension
					from: '**/dist/msal*.(node|dll)',
					to: '[name][ext]',
					// These will only be present on Windows for now
					noErrorOnMissing: !isWindows
				}
			]
		}),
		// We don't use the feature that uses Dpapi, so we can just replace it with a mock.
		// This is a bit of a hack, but it's the easiest way to do it. Really, msal should
		// handle when this native node module is not available.
		new NormalModuleReplacementPlugin(
			/\.\.\/Dpapi\.mjs/,
			path.resolve(__dirname, 'packageMocks', 'dpapi', 'dpapi.js')
		)
	]
});
