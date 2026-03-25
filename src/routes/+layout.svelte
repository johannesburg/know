<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>know</title>
	<meta name="description" content="A collaborative ontology for artificial intelligence" />
</svelte:head>

{@render children()}
