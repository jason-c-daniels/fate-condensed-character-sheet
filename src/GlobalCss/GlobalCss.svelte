<!--
    Put imports of global CSS in here:

    TL;DR: remember to only use one of 'reset.css', 'normalize.css', 'sanitize.css'. Delete the unused ones.
    Put global custom css properties in global-properties.css. Use a CSS file under src for new
    @font-face declarations and store the related woff files in a subfolder in public.
    Import nothing else to global unless advised to do so by a Svelte expert.

    TL;BYRIA: (Too long; but you're reading it anyway)
    By default normalize.css and global-properties.css are imported.
    Other valid items to consider are font-face declarations.
    normalize.css is a type of reset.css. Tweak it as appropriate to your project.
    If you're looking for an opinionated set of cross browser consistent settings,
    use sanitize.css instead of normalize.

    global-properties.css defines global custom properties used through the entire app.
    If you are tempted to make global style overrides, make those changes in normalize.css.
    That's it's purpose in life.  DO NOT make those changes in global-properties.css.
    This is to keep the roles and responsibilities of these files clear.

    Other global CSS files you may end up creating include:
    1. Branding specific color definitions. (Use global-properties.css)
    2. Normalization of UI element presenatation for better UI compliance in a cross-browser environment. (use
       normalize.css, sanitize.css or reset.css, customize as needed. Remove the unused ones.)
    3. @font-face declarations for web fonts to give your entire site a uniform look. (add a fonts folder
       under src for the css files and import them. add the actual woff files under a subfolder in public.)
    4. Importing styles from a node component or 3rd party library that needs them to be global.
       In other words: you tried locally but it just wouldn't work and you've found advice from a Svelte expert
       that says to do it this way. (This should be a rare event with Svelte 3, if I understand what I'm seeing
       it do with classes.)

    While there are possibly other reasons, I'm unaware of, I am lumping them under #4 for the time being.
-->

<style global>
    @import "fonts.css";
    @import "global-properties.css";
    @import "normalize.css";
    @import "print-settings.css";
</style>