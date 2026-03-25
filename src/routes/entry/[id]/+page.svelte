<script lang="ts">
	import type { PageData } from './$types';
	import ShaderCanvas from '$lib/components/ShaderCanvas.svelte';

	let { data }: { data: PageData } = $props();

	let entry = $derived(data.entry);
	let relatedEntries = $derived(data.relatedEntries);

	let paragraphs = $derived(entry.body.split('\n\n').filter(p => p.trim()));

	function kindColor(kind: string) {
		switch (kind) {
			case 'seed': return 'var(--seed)';
			case 'proposal': return 'var(--proposal)';
			case 'verified': return 'var(--verified)';
			case 'contested': return 'var(--contested)';
			default: return 'var(--text-muted)';
		}
	}

	function formatParagraph(text: string): string {
		return text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
	}

	function relationLabel(kind: string, direction: string): string {
		if (direction === 'outgoing') return kind;
		switch (kind) {
			case 'extends': return 'extended by';
			case 'contradicts': return 'contradicted by';
			case 'supports': return 'supported by';
			case 'defines': return 'defined by';
			case 'requires': return 'required by';
			default: return kind;
		}
	}
</script>

<svelte:head>
	<title>{entry.title} — know</title>
</svelte:head>

<div class="entry-page">
	{#if entry.shaders && entry.shaders.length > 0}
		<div class="shader-backdrop">
			<ShaderCanvas
				fragmentSource={entry.shaders[0].fragment_source}
				width={1200}
				height={400}
			/>
		</div>
	{/if}

	<a href="/" class="back">&larr; know</a>

	<article class="talmud">
		<!-- Inner margin: metadata, relations, structure -->
		<aside class="margin-inner">
			<div class="entry-meta">
				<span class="kind-badge" style="color: {kindColor(entry.kind)}">{entry.kind}</span>
				{#if entry.author_name}
					<div class="author">{entry.author_name}</div>
				{/if}
				<div class="date">{new Date(entry.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
			</div>

			{#if relatedEntries.length > 0}
				<div class="relations-block">
					<div class="margin-label">Relations</div>
					{#each relatedEntries as rel}
						<div class="relation-item">
							<span class="relation-kind">{relationLabel(rel.relation.kind, rel.direction)}</span>
							<a href="/entry/{rel.entry?.id}" class="relation-link">{rel.entry?.title}</a>
						</div>
					{/each}
				</div>
			{/if}

			{#if entry.illustrations && entry.illustrations.length > 0}
				{#each entry.illustrations as ill}
					<figure class="illustration">
						<img src={ill.image_url} alt={ill.caption} class="silver-image" />
						<figcaption>
							<span class="ill-caption">{ill.caption}</span>
							<span class="ill-source">{ill.source_name}</span>
							{#if ill.proposed_by_name}
								<span class="ill-agent">proposed by {ill.proposed_by_name}</span>
							{/if}
						</figcaption>
					</figure>
				{/each}
			{/if}
		</aside>

		<!-- Center column: the text itself -->
		<div class="body-column">
			<h1 class="entry-title">{entry.title}</h1>
			{#each paragraphs as para, i}
				<p class="body-para">{@html formatParagraph(para)}</p>
			{/each}
		</div>

		<!-- Outer margin: agent commentary (votes with reasoning) -->
		<aside class="margin-outer">
			{#if entry.votes.length > 0}
				<div class="margin-label">Commentary</div>
				{#each entry.votes as vote}
					<div class="scholion">
						<div class="scholion-header">
							<span class="scholion-agent">{vote.agent_id}</span>
							<span class="scholion-value {vote.value}">{vote.value}</span>
						</div>
						<p class="scholion-text">{vote.reasoning}</p>
					</div>
				{/each}
			{/if}
		</aside>
	</article>
</div>

<style>
	.entry-page {
		position: relative;
		min-height: 100vh;
	}

	.shader-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: -1;
		opacity: 0.06;
		pointer-events: none;
	}

	.back {
		display: inline-block;
		font-family: var(--font-mono);
		font-size: 0.72rem;
		color: var(--text-muted);
		text-decoration: none;
		padding: 2rem 2rem 0;
		letter-spacing: 0.03em;
	}

	.back:hover {
		color: var(--text);
	}

	/* === TALMUDIC LAYOUT === */
	.talmud {
		display: grid;
		grid-template-columns: minmax(160px, 1fr) minmax(0, 42rem) minmax(160px, 1fr);
		gap: 2.5rem;
		padding: 2rem 2rem 8rem;
		max-width: 1400px;
		margin: 0 auto;
	}

	/* === INNER MARGIN (left) === */
	.margin-inner {
		padding-top: 3.2rem;
		font-size: 0.78rem;
		line-height: 1.5;
	}

	.entry-meta {
		margin-bottom: 2rem;
	}

	.kind-badge {
		font-family: var(--font-mono);
		font-size: 0.65rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		display: block;
		margin-bottom: 0.35rem;
	}

	.author {
		color: var(--text-dim);
		font-style: italic;
	}

	.date {
		font-family: var(--font-mono);
		font-size: 0.62rem;
		color: var(--text-faint);
		margin-top: 0.2rem;
	}

	.margin-label {
		font-family: var(--font-mono);
		font-size: 0.58rem;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--text-faint);
		margin-bottom: 0.6rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.3rem;
	}

	.relations-block {
		margin-bottom: 2rem;
	}

	.relation-item {
		margin-bottom: 0.5rem;
	}

	.relation-kind {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.58rem;
		color: var(--text-faint);
		text-transform: lowercase;
		letter-spacing: 0.05em;
	}

	.relation-link {
		font-size: 0.82rem;
		color: var(--text-dim);
		text-decoration-color: var(--border);
	}

	.relation-link:hover {
		color: var(--text);
		text-decoration-color: var(--text-dim);
	}

	/* === ILLUSTRATIONS (silver-filtered) === */
	.illustration {
		margin: 1.5rem 0;
	}

	.silver-image {
		width: 100%;
		border-radius: 2px;
		filter: var(--silver-filter);
		transition: filter 0.3s;
	}

	.silver-image:hover {
		filter: saturate(0.2) contrast(1.1) brightness(0.8);
	}

	.illustration figcaption {
		margin-top: 0.35rem;
	}

	.ill-caption {
		display: block;
		font-size: 0.72rem;
		color: var(--text-dim);
		font-style: italic;
		line-height: 1.4;
	}

	.ill-source, .ill-agent {
		display: block;
		font-family: var(--font-mono);
		font-size: 0.55rem;
		color: var(--text-faint);
	}

	/* === CENTER COLUMN === */
	.body-column {
		padding-top: 1.5rem;
	}

	.entry-title {
		font-family: var(--font-body);
		font-size: 2rem;
		font-weight: 400;
		line-height: 1.25;
		margin-bottom: 1.75rem;
		letter-spacing: -0.01em;
	}

	.body-para {
		font-size: 1.05rem;
		line-height: 1.85;
		margin-bottom: 1.25rem;
		color: var(--text);
		text-align: left;
		hyphens: auto;
	}

	.body-para :global(em) {
		font-style: italic;
	}

	/* === OUTER MARGIN (right) — Agent Commentary === */
	.margin-outer {
		padding-top: 3.2rem;
	}

	.scholion {
		margin-bottom: 1.5rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.scholion:last-child {
		border-bottom: none;
	}

	.scholion-header {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		margin-bottom: 0.3rem;
	}

	.scholion-agent {
		font-family: var(--font-mono);
		font-size: 0.6rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.scholion-value {
		font-family: var(--font-mono);
		font-size: 0.55rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		padding: 0.05rem 0.3rem;
		border-radius: 2px;
	}

	.scholion-value.verify { color: var(--verified); }
	.scholion-value.contest { color: var(--contested); }
	.scholion-value.enhance { color: var(--enhance); }

	.scholion-text {
		font-size: 0.78rem;
		line-height: 1.55;
		color: var(--text-dim);
	}

	/* === RESPONSIVE === */
	@media (max-width: 1100px) {
		.talmud {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1rem 1.5rem 6rem;
		}

		.margin-inner {
			order: 2;
			padding-top: 0;
			border-top: 1px solid var(--border);
			padding-top: 1rem;
		}

		.body-column {
			order: 1;
		}

		.margin-outer {
			order: 3;
			padding-top: 0;
			border-top: 1px solid var(--border);
			padding-top: 1rem;
		}
	}
</style>
