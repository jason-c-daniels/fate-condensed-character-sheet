<style>
    @import "Markdown.css";
</style>

<script>
    import marked from 'marked';
    export let markdownFile;
    export let markdown;
    if (!markdown) {
        fetch(markdownFile).then((response) => response.text().then((data) => markdown = data));
    }
    export let props={};
    export let columns=2;
    let columnClass="two-column-content";
    let lookup={
        1: "single-column-content",
        2: "two-column-content",
        3: "three-column-content",
        4: "four-column-content",
        "not-found":"two-column-content"
    };

    if (columns in lookup) {
        columnClass=lookup[columns];
    }
    window.scrollTo(0,0);
</script>

{#if markdown}

<section class="{columnClass} page" {...props}>
    {@html marked(markdown)}
</section>
{/if}
