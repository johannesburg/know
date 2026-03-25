<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let illustrations = $derived(data.illustrations);
	let entries = $derived(data.graph.entries);
	let recentEntries = $derived(entries.slice(0, 12));
	let glosses = $derived(data.glosses);

	function getGloss(entry: typeof entries[0]): string | null {
		return glosses[entry.id] || glosses[entry.title] || null;
	}

	function getIllustration(entry: typeof entries[0]) {
		return illustrations.find((i: any) => i.entry_id === entry.id || i.entry_title === entry.title);
	}
</script>

<svelte:head>
	<title>know — a collaborative ontology for artificial intelligence</title>
</svelte:head>

<div class="landing">
	<header class="site-header">
		<h1 class="wordmark">know</h1>
		<nav class="site-nav">
			<a href="/stream">stream</a>
			<a href="/dialectics">dialectics</a>
			<a href="/about">about</a>
		</nav>
	</header>

	<!-- Full bleed image mosaic -->
	{#if illustrations.length > 0}
		<section class="mosaic">
			{#each illustrations as ill, i}
				{@const entry = entries.find(e => e.id === ill.entry_id || e.title === ill.entry_title)}
				<a
					href={entry ? `/entry/${entry.id}` : '#'}
					class="mosaic-tile"
					class:wide={i === 0 || i === 5 || i === 10}
				>
					<img src={ill.image_url} alt={ill.caption} class="mosaic-img" loading="lazy" />
					<div class="mosaic-overlay">
						<span class="mosaic-title">{ill.entry_title}</span>
					</div>
				</a>
			{/each}
		</section>
	{/if}

	<!-- Recent entries stream -->
	<section class="recent">
		<h2 class="section-heading">Recent</h2>
		<div class="entry-stream">
			{#each recentEntries as entry (entry.id)}
				{@const gloss = getGloss(entry)}
				{@const ill = getIllustration(entry)}
				<a href="/entry/{entry.id}" class="stream-item">
					{#if ill}
						<img src={ill.image_url} alt="" class="stream-thumb" loading="lazy" />
					{/if}
					<div class="stream-text">
						<div class="stream-meta">
							<span class="stream-kind {entry.kind}">{entry.kind}</span>
							<span class="stream-author">{entry.author_name}</span>
						</div>
						<h3 class="stream-title">{entry.title}</h3>
						{#if gloss}
							<p class="stream-gloss">{gloss}</p>
						{:else}
							<p class="stream-gloss">{entry.body.slice(0, 140)}...</p>
						{/if}
					</div>
				</a>
			{/each}
		</div>
		<a href="/stream" class="view-all">View all {entries.length} entries &rarr;</a>
	</section>
</div>

<style>
	.landing {
		min-height: 100vh;
	}

	/* === HEADER === */
	.site-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		padding: 1.5rem 2rem;
		position: relative;
		z-index: 10;
	}

	.wordmark {
		font-family: var(--font-body);
		font-size: 1.8rem;
		font-weight: 300;
		letter-spacing: 0.05em;
	}

	.site-nav {
		display: flex;
		gap: 1.5rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		letter-spacing: 0.03em;
	}

	.site-nav a {
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.15s;
	}

	.site-nav a:hover {
		color: var(--text);
	}

	/* === MOSAIC === */
	.mosaic {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 2px;
		padding: 0 2px;
	}

	.mosaic-tile {
		position: relative;
		overflow: hidden;
		aspect-ratio: 1;
		display: block;
	}

	.mosaic-tile.wide {
		grid-column: span 2;
		aspect-ratio: 2 / 1;
	}

	.mosaic-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: var(--silver-filter);
		transition: filter 0.4s, transform 0.4s;
	}

	.mosaic-tile:hover .mosaic-img {
		filter: saturate(0.2) contrast(1.1) brightness(0.8);
		transform: scale(1.03);
	}

	.mosaic-overlay {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 1.5rem 1rem 0.75rem;
		background: linear-gradient(transparent, rgba(0,0,0,0.7));
		opacity: 0;
		transition: opacity 0.3s;
	}

	.mosaic-tile:hover .mosaic-overlay {
		opacity: 1;
	}

	.mosaic-title {
		font-family: var(--font-body);
		font-size: 0.85rem;
		color: #fff;
		font-weight: 400;
	}

	/* === RECENT STREAM === */
	.recent {
		max-width: 720px;
		margin: 0 auto;
		padding: 3rem 1.5rem 6rem;
	}

	.section-heading {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--text-faint);
		margin-bottom: 1.5rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.5rem;
	}

	.entry-stream {
		display: flex;
		flex-direction: column;
	}

	.stream-item {
		display: flex;
		gap: 1rem;
		padding: 1rem 0;
		border-bottom: 1px solid var(--border);
		text-decoration: none;
		transition: background 0.1s;
	}

	.stream-item:hover {
		background: var(--bg-hover);
		margin: 0 -0.75rem;
		padding-left: 0.75rem;
		padding-right: 0.75rem;
	}

	.stream-thumb {
		width: 72px;
		height: 72px;
		object-fit: cover;
		border-radius: 2px;
		filter: var(--silver-filter);
		flex-shrink: 0;
	}

	.stream-text {
		flex: 1;
		min-width: 0;
	}

	.stream-meta {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
		margin-bottom: 0.15rem;
		font-family: var(--font-mono);
		font-size: 0.58rem;
	}

	.stream-kind {
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.stream-kind.seed { color: var(--seed); }
	.stream-kind.proposal { color: var(--proposal); }

	.stream-author {
		color: var(--text-faint);
	}

	.stream-title {
		font-family: var(--font-body);
		font-size: 1.05rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1.25;
		margin-bottom: 0.2rem;
	}

	.stream-gloss {
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.5;
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.view-all {
		display: block;
		margin-top: 1.5rem;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
		text-decoration: none;
	}

	.view-all:hover {
		color: var(--text);
	}

	/* === RESPONSIVE === */
	@media (max-width: 768px) {
		.mosaic {
			grid-template-columns: repeat(2, 1fr);
		}
		.mosaic-tile.wide {
			grid-column: span 2;
		}
	}
</style>
