// postcss.config.js
const production = !process.env.ROLLUP_WATCH;
const purgecss = require('@fullhuman/postcss-purgecss');


module.exports = {
    plugins: [
        require('postcss-import')(),
        require('autoprefixer'),
        production &&
        purgecss({
            content: ['./src/**/*.svelte', './src/**/*.html', './public/**/*.html'],
            css: ['./src/**/*.css'],
            whitelistPatterns: [/svelte-/],
            defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        }),
        production &&
        require('cssnano')({
            preset: 'default',
        }),
    ],
};