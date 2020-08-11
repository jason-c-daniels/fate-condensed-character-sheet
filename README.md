# Svelte PostCSS Template

## About
This is an opinionated bare bones Svelte project template that uses PostCSS and related tools. 
The `index.html` and other portions have been pared down to bare bones.
This should eliminate much of the desire or need to tinker with the `public` folder.

As well this project template expresses a strong opinion on HOW to use global settings.
It provides a `GlobalCss` component that pulls in items such as global.css, and normalize.css.
It also expresses the opinion that any and all modifications to the document `head` section happen within `App.svelte`
by using the `<svelte:head />` element. It's even used to set the application title.

Also, the project was created with a preference towards using an `index.js` and named component 
folder to implement components. This allows you to separate your css into its own component specific
files. As well if there are subcomponents used only in the creation of the main export, they will 
ideally live in the same folder with the main component.

If you will be providing custom fonts place the css files with the`@font-face` declarations in `src` 
and put the `woff` files within `public`. (I will provide a sample app that does this at some point.)

This work is based heavily on the work done by the `sveltejs` team on github.

## Where to go from here
You'll need to modify `package.json` and `main.js` with the actual name of your application. 
(`main.js` passes it to the App component)  From there begin coding your application.

