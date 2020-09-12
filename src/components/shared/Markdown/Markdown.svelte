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
</script>

{#if markdown}
<section class="two-column-content page" {...props}>
    {@html marked(markdown)}
</section>
{/if}
