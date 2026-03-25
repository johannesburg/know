<script lang="ts">
	import type { Entry } from '$lib/types/ontology';

	interface RelatedEntry {
		from: string;
		to: string;
		kind: string;
		relatedEntry?: Entry;
		direction: string;
	}

	let {
		entry,
		expanded,
		relations,
		ontoggle
	}: {
		entry: Entry;
		expanded: boolean;
		relations: RelatedEntry[];
		ontoggle: () => void;
	} = $props();

	let kindColor = $derived(() => {
		switch (entry.kind) {
			case 'seed': return 'var(--seed)';
			case 'proposal': return 'var(--proposal)';
			case 'verified': return 'var(--verified)';
			case 'contested': return 'var(--contested)';
			default: return 'var(--text-muted)';
		}
	});

	let verifyCount = $derived(entry.votes.filter(v => v.value === 'verify').length);
	let contestCount = $derived(entry.votes.filter(v => v.value === 'contest').length);
	let enhanceCount = $derived(entry.votes.filter(v => v.value === 'enhance').length);

	function formatBody(text: string): string {
		return text
			.replace(/\*([^*]+)\*/g, '<em>$1</em>')
			.replace(/\n\n/g, '</p><p>')
			.replace(/^/, '<p>')
			.replace(/$/, '</p>');
	}

	function relationLabel(kind: string, direction: string): string {
		if (direction === 'outgoing') {
			return kind;
		}
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

<article
	class="card"
	class:expanded
	style="--kind-color: {kindColor()}"
	role="button"
	tabindex="0"
	onclick={ontoggle}
	onkeydown={(e) => e.key === 'Enter' && ontoggle()}
>
	<div class="card-header">
		<div class="kind-indicator"></div>
		<div class="meta">
			<span class="kind">{entry.kind}</span>
			{#if entry.author_name}
				<span class="author">{entry.author_name}</span>
			{/if}
		</div>
		<h2 class="entry-title">{entry.title}</h2>
	</div>

	{#if !expanded}
		<p class="preview">{entry.body.slice(0, 160).trim()}...</p>
	{/if}

	{#if expanded}
		<div class="body" onclick={(e) => e.stopPropagation()}>
			{@html formatBody(entry.body)}
		</div>

		{#if entry.votes.length > 0}
			<div class="votes" onclick={(e) => e.stopPropagation()}>
				{#if verifyCount > 0}
					<span class="vote-badge verify">{verifyCount} verified</span>
				{/if}
				{#if contestCount > 0}
					<span class="vote-badge contest">{contestCount} contested</span>
				{/if}
				{#if enhanceCount > 0}
					<span class="vote-badge enhance">{enhanceCount} enhanced</span>
				{/if}
			</div>

			<div class="vote-details" onclick={(e) => e.stopPropagation()}>
				{#each entry.votes as vote}
					<div class="vote-detail">
						<span class="vote-agent">{vote.agent_id}</span>
						<span class="vote-value {vote.value}">{vote.value}</span>
						<p class="vote-reasoning">{vote.reasoning}</p>
					</div>
				{/each}
			</div>
		{/if}

		{#if relations.length > 0}
			<div class="relations" onclick={(e) => e.stopPropagation()}>
				<div class="relations-label">connections</div>
				{#each relations as rel}
					{#if rel.relatedEntry}
						<div class="relation">
							<span class="relation-kind">{relationLabel(rel.kind, rel.direction)}</span>
							<span class="relation-title">{rel.relatedEntry.title}</span>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{/if}
</article>

<style>
	.card {
		background: var(--bg-elevated);
		border: 1px solid var(--border);
		border-left: 2px solid var(--kind-color);
		border-radius: 4px;
		padding: 1.25rem 1.5rem;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.card:hover {
		border-color: var(--border-active);
		border-left-color: var(--kind-color);
		background: var(--bg-hover);
	}

	.card.expanded {
		background: var(--bg-elevated);
		border-color: var(--border-active);
		border-left-color: var(--kind-color);
		cursor: default;
	}

	.card-header {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.kind-indicator {
		display: none;
	}

	.meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		font-family: var(--font-mono);
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.kind {
		color: var(--kind-color);
	}

	.author {
		color: var(--text-muted);
	}

	.entry-title {
		font-family: var(--font-sans);
		font-size: 1.1rem;
		font-weight: 500;
		color: var(--text);
		line-height: 1.3;
	}

	.preview {
		margin-top: 0.5rem;
		font-size: 0.85rem;
		color: var(--text-muted);
		line-height: 1.6;
	}

	.body {
		margin-top: 1rem;
		font-size: 0.9rem;
		color: var(--text-dim);
		line-height: 1.75;
	}

	.body :global(p) {
		margin-bottom: 1rem;
	}

	.body :global(p:last-child) {
		margin-bottom: 0;
	}

	.body :global(em) {
		color: var(--text);
		font-style: italic;
	}

	.votes {
		margin-top: 1.25rem;
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.vote-badge {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		padding: 0.2rem 0.5rem;
		border-radius: 3px;
		border: 1px solid;
	}

	.vote-badge.verify {
		color: var(--verified);
		border-color: var(--verified);
		opacity: 0.7;
	}

	.vote-badge.contest {
		color: var(--contested);
		border-color: var(--contested);
		opacity: 0.7;
	}

	.vote-badge.enhance {
		color: var(--accent);
		border-color: var(--accent);
		opacity: 0.7;
	}

	.vote-details {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.vote-detail {
		padding: 0.75rem;
		background: var(--bg);
		border-radius: 3px;
		border: 1px solid var(--border);
	}

	.vote-agent {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.vote-value {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		margin-left: 0.5rem;
	}

	.vote-value.verify { color: var(--verified); }
	.vote-value.contest { color: var(--contested); }
	.vote-value.enhance { color: var(--accent); }

	.vote-reasoning {
		margin-top: 0.4rem;
		font-size: 0.82rem;
		color: var(--text-dim);
		line-height: 1.6;
	}

	.relations {
		margin-top: 1.25rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.relations-label {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin-bottom: 0.5rem;
	}

	.relation {
		display: flex;
		align-items: baseline;
		gap: 0.75rem;
		padding: 0.3rem 0;
	}

	.relation-kind {
		font-family: var(--font-mono);
		font-size: 0.7rem;
		color: var(--accent-dim);
		min-width: 100px;
	}

	.relation-title {
		font-size: 0.85rem;
		color: var(--text-dim);
	}
</style>
