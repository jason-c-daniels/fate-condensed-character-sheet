<style>
    @import "SRD.css";
</style>

<script>
    import marked from 'marked';
    import Markdown from '../shared/Markdown';
    export let srdMarkdown;
    export let tocMarkdown;
    if (!srdMarkdown) {
        fetch("./md/Fate-Condensed-SRD-CC-BY.md").then((response) => response.text().then((data) => srdMarkdown = data));
    }
    if (!tocMarkdown) {
        fetch("./md/SRD-TOC.md").then((response) => response.text().then((data) => tocMarkdown = data));
    }

    if (window.location.hash) {
        setTimeout(() => {
            document.getElementById(window.location.hash.replace("#","")).scrollIntoView();
        }, 250);
    }
</script>


    <div class="toc">
        <h2>Table of Contents</h2>
        {#if tocMarkdown}
            {@html marked(tocMarkdown)}
        {/if}
    </div>
    <div >
        {#if srdMarkdown}
            <Markdown markdown={srdMarkdown} columns="1" props={{style:"line-height:1.2rem;"}}/>
        {/if}
    </div>

