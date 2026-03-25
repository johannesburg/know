<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let entries = $derived(data.graph.entries);
	let glosses = $derived(data.glosses);
	let ephemera = $derived(data.ephemera);
	let illustrations = $derived(data.illustrations);

	function getGloss(entry: typeof entries[0]): string | null {
		return glosses[entry.id] || glosses[entry.title] || null;
	}

	function getIllustration(entry: typeof entries[0]) {
		return illustrations.find(i => i.entry_id === entry.id || i.entry_title === entry.title);
	}

	function voteSummary(entry: typeof entries[0]) {
		const v = entry.votes;
		const vc = v.filter(x => x.value === 'verify').length;
		const cc = v.filter(x => x.value === 'contest').length;
		const ec = v.filter(x => x.value === 'enhance').length;
		const parts = [];
		if (vc) parts.push(`${vc}\u00d7verified`);
		if (cc) parts.push(`${cc}\u00d7contested`);
		if (ec) parts.push(`${ec}\u00d7enhanced`);
		return parts.join(' \u00b7 ');
	}

	// Interleave ephemera with entries for a feed feel
	type FeedItem = { type: 'entry'; data: typeof entries[0] } | { type: 'ephemeron'; data: typeof ephemera[0] };

	let feed = $derived(() => {
		const items: FeedItem[] = [];
		const eph = [...ephemera];

		// Seeds first, then interleave ephemera with proposals
		const seeds = entries.filter(e => e.kind === 'seed');
		const proposals = entries.filter(e => e.kind !== 'seed');

		// Lead with an ephemeron if available
		if (eph.length > 0) items.push({ type: 'ephemeron', data: eph.shift()! });

		// Seeds
		for (const s of seeds) {
			items.push({ type: 'entry', data: s });
		}

		// Interleave remaining ephemera with proposals
		for (let i = 0; i < proposals.length; i++) {
			if (i > 0 && i % 5 === 0 && eph.length > 0) {
				items.push({ type: 'ephemeron', data: eph.shift()! });
			}
			items.push({ type: 'entry', data: proposals[i] });
		}

		// Remaining ephemera at the end
		for (const e of eph) {
			items.push({ type: 'ephemeron', data: e });
		}

		return items;
	});
</script>

<svelte:head>
	<title>stream — know</title>
</svelte:head>

<div class="stream-page">
	<header class="stream-header">
		<nav class="nav">
			<a href="/" class="nav-link">index</a>
			<span class="nav-sep">/</span>
			<span class="nav-current">stream</span>
		</nav>
		<h1 class="stream-title">stream</h1>
		<p class="stream-subtitle">The editorial surface of the ontology. Browse without reading.</p>
	</header>

	<div class="feed">
		{#each feed() as item (item.type === 'entry' ? item.data.id : item.data.title)}
			{#if item.type === 'ephemeron'}
				{@const eph = item.data}
				<article class="ephemeron">
					<div class="eph-label">editorial</div>
					<h2 class="eph-title">{eph.title}</h2>
					<div class="eph-body">
						{#each eph.body.split('\n\n') as para}
							<p>{para}</p>
						{/each}
					</div>
				</article>
			{:else}
				{@const entry = item.data}
				{@const gloss = getGloss(entry)}
				{@const ill = getIllustration(entry)}
				<article class="stream-entry">
					{#if ill}
						<div class="entry-image">
							<img src={ill.image_url} alt={ill.caption} class="silver-img" />
							<span class="img-caption">{ill.caption}</span>
						</div>
					{/if}
					<div class="entry-content">
						<div class="entry-meta-line">
							<span class="entry-kind {entry.kind}">{entry.kind}</span>
							{#if entry.author_name}
								<span class="entry-author">{entry.author_name}</span>
							{/if}
							{#if entry.votes.length > 0}
								<span class="entry-votes">{voteSummary(entry)}</span>
							{/if}
						</div>
						<a href="/entry/{entry.id}" class="entry-title-link">
							<h2 class="entry-title">{entry.title}</h2>
						</a>
						{#if gloss}
							<p class="gloss">{gloss}</p>
						{:else}
							<p class="preview">{entry.body.slice(0, 180).trim()}...</p>
						{/if}
					</div>
				</article>
			{/if}
		{/each}
	</div>
</div>

<style>
	.stream-page {
		max-width: 680px;
		margin: 0 auto;
		padding: 3rem 1.5rem 8rem;
	}

	.nav {
		font-family: var(--font-mono);
		font-size: 0.68rem;
		color: var(--text-muted);
		margin-bottom: 1.5rem;
	}

	.nav-link {
		color: var(--text-muted);
	}

	.nav-sep {
		margin: 0 0.3rem;
	}

	.nav-current {
		color: var(--text-dim);
	}

	.stream-header {
		margin-bottom: 3rem;
	}

	.stream-title {
		font-family: var(--font-body);
		font-size: 2.4rem;
		font-weight: 300;
		letter-spacing: 0.03em;
		margin-bottom: 0.3rem;
	}

	.stream-subtitle {
		font-size: 0.95rem;
		font-style: italic;
		color: var(--text-muted);
	}

	.feed {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* === EPHEMERON === */
	.ephemeron {
		padding: 2rem 0;
		border-top: 1px solid var(--border);
		border-bottom: 1px solid var(--border);
		margin: 1.5rem 0;
	}

	.eph-label {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--text-faint);
		margin-bottom: 0.5rem;
	}

	.eph-title {
		font-family: var(--font-body);
		font-size: 1.4rem;
		font-weight: 400;
		font-style: italic;
		color: var(--text);
		margin-bottom: 0.75rem;
	}

	.eph-body {
		font-size: 0.95rem;
		color: var(--text-dim);
		line-height: 1.8;
	}

	.eph-body p {
		margin-bottom: 0.75rem;
	}

	/* === STREAM ENTRY === */
	.stream-entry {
		padding: 1.25rem 0;
		border-bottom: 1px solid var(--border);
		display: flex;
		gap: 1.25rem;
	}

	.entry-image {
		flex-shrink: 0;
		width: 120px;
	}

	.silver-img {
		width: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		border-radius: 2px;
		filter: var(--silver-filter);
		transition: filter 0.3s;
	}

	.silver-img:hover {
		filter: saturate(0.25) contrast(1.1) brightness(0.85);
	}

	.img-caption {
		display: block;
		font-size: 0.6rem;
		color: var(--text-faint);
		margin-top: 0.25rem;
		font-style: italic;
		line-height: 1.3;
	}

	.entry-content {
		flex: 1;
		min-width: 0;
	}

	.entry-meta-line {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		margin-bottom: 0.25rem;
		font-family: var(--font-mono);
		font-size: 0.6rem;
		flex-wrap: wrap;
	}

	.entry-kind {
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.entry-kind.seed { color: var(--seed); }
	.entry-kind.proposal { color: var(--proposal); }
	.entry-kind.verified { color: var(--verified); }
	.entry-kind.contested { color: var(--contested); }

	.entry-author {
		color: var(--text-faint);
	}

	.entry-votes {
		color: var(--text-muted);
	}

	.entry-title-link {
		text-decoration: none;
	}

	.entry-title-link:hover .entry-title {
		color: var(--accent);
	}

	.entry-title {
		font-family: var(--font-body);
		font-size: 1.15rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1.3;
		margin-bottom: 0.3rem;
		transition: color 0.15s;
	}

	.gloss {
		font-size: 0.9rem;
		color: var(--text-dim);
		font-style: italic;
		line-height: 1.6;
	}

	.preview {
		font-size: 0.85rem;
		color: var(--text-muted);
		line-height: 1.6;
	}
</style>
