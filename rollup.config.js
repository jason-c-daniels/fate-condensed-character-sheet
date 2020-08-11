// rollup.config.js
import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import livereload from 'rollup-plugin-livereload'
import {terser} from 'rollup-plugin-terser'
import builtins from 'rollup-plugin-node-builtins'
import postcss from 'rollup-plugin-postcss'
import sveltePreprocess from "svelte-preprocess";
import svelteSVG from "rollup-plugin-svelte-svg";

const production = !process.env.ROLLUP_WATCH;
function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	input: 'src/main.js',
	output: {
		sourcemap: true,
		format: 'iife',
		name: 'app',
		file: 'public/build/bundle.js',
	},
	plugins: [
		svelte({
			preprocess: sveltePreprocess({postcss: true}),
			dev: !production,
			css: css => {
				css.write('public/build/bundle.css');
			}
		}),
		svelteSVG(),
		postcss({
			extract: true,
			sourceMap: true,
		}),
		builtins(),
		resolve({
			browser: true,
			dedupe: importee =>
				importee === 'svelte' || importee.startsWith('svelte/'),
		}),
		commonjs(),
		!production && serve(),
		!production && livereload('public'),
		production && terser(),
	],
	watch: {
		clearScreen: false,
	},
}