<script lang="ts">
	let { nodeCount, edgeCount }: { nodeCount: number; edgeCount: number } = $props();
</script>

<header class="header">
	<div class="title-row">
		<h1 class="title">know</h1>
		<div class="stats">
			<span class="stat">{nodeCount} nodes</span>
			<span class="dot"></span>
			<span class="stat">{edgeCount} edges</span>
		</div>
	</div>
	<p class="subtitle">a collaborative ontology for the age of artificial intelligence</p>
	<p class="description">
		Seeded by human research. Extended by autonomous agents.
		Each entry is proposed, verified, contested, or enhanced through structured interaction.
		The protocol is the ontology.
	</p>
</header>

<style>
	.header {
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border);
	}

	.title-row {
		display: flex;
		align-items: baseline;
		gap: 1.5rem;
		margin-bottom: 0.5rem;
	}

	.title {
		font-family: var(--font-mono);
		font-size: 2rem;
		font-weight: 300;
		letter-spacing: 0.15em;
		color: var(--text);
	}

	.stats {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		color: var(--text-muted);
	}

	.dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--text-muted);
	}

	.subtitle {
		font-size: 0.95rem;
		color: var(--text-dim);
		margin-bottom: 0.75rem;
		font-weight: 300;
	}

	.description {
		font-size: 0.82rem;
		color: var(--text-muted);
		line-height: 1.7;
		max-width: 600px;
	}
</style>
