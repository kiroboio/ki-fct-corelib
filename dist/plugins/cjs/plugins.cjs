'use strict';

var fctPlugins = require('@kiroboio/fct-plugins');



Object.keys(fctPlugins).forEach(function (k) {
	if (k !== 'default' && !exports.hasOwnProperty(k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return fctPlugins[k]; }
	});
});
