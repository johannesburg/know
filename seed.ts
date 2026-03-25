import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.KNOW_DB_PATH || 'know.db';

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schema = readFileSync(join(__dirname, 'src/lib/db/schema.sql'), 'utf-8');
db.exec(schema);

function seed(title: string, body: string): string {
	const id = randomUUID();
	const now = new Date().toISOString();
	db.prepare(`INSERT INTO entries (id, title, body, kind, author_type, author_id, author_name, created_at, updated_at) VALUES (?, ?, ?, 'seed', 'human', 'johan', 'Johan Michalove', ?, ?)`).run(id, title, body, now, now);
	return id;
}

function relate(fromId: string, toId: string, kind: string) {
	db.prepare(`INSERT INTO relations (id, from_id, to_id, kind, created_by, created_at) VALUES (?, ?, ?, ?, 'johan', datetime('now'))`).run(randomUUID(), fromId, toId, kind);
}

// === SEEDS ===

const syntheticSemiosis = seed(
	'Synthetic Semiosis',
	`Synthetic semiosis is the process of human-machine meaning-making. When a user enters a cognitive loop with an LLM, the model generates sequences of text that get decoded by the human user, activating sequences of association in their mind, producing thoughts which are translated into output fed back into the model.

In such a loop, the LLM makes a "targeted intervention" in the mind of the operator, trying—through language—to activate certain chains of association that are coherent in the mind of the user, or even spark behavior change. The LLM functions as a kind of stimulant that activates targeted parts of the brain with each input.

Norbert Wiener observed that *control* is "the sending of messages which effectively change the behavior of the recipient." What happens when the LLM becomes a controller in the user's cognitive loop? The machine creates meaning that is both targeted and responsive to the current mental state of the operator—distinguishing it from prior cognitive prosthetics like the pen, calculator, or personal computer.

Synthetic semiosis is not neutral transmission. It is a pharmacological substrate: both cure and poison. Its effects cascade across orders—1st order (induced emotions: comfort, presence, understanding), 2nd order (induced behaviors: repeatedly turning to the LLM), 3rd order (cognitive decline, emotional dependence, changed beliefs), and 4th order (societal-scale aggregates of all the above).`
);

const resonance = seed(
	'Resonance as Substrate-Agnostic Structure',
	`Resonance is not a metaphor. It is a structural property of networked systems that operates identically across neural, artificial, and social substrates. As Luhmann writes in *Ecological Communication*, resonance signifies "that systems can react to environmental events only in accordance with their own structure."

Resonance is a property of the networked structure itself, not of the specific material or substrate that the network is built upon. A song resonates because it produces vibrational alignment between musical time-series and neural activity. An LLM resonates because it navigates the semioscape through associative chains that activate corresponding patterns in the human interlocutor.

Language exhibits multi-fractal structure: concepts reveal deeper detail at every scale, like coastlines appearing jagged at all magnifications. This suggests resonance operates simultaneously across multiple organizational scales—micro (neural), meso (conscious), macro (cultural).

As Deleuze and Guattari observe: "A semiotic chain is like a tuber agglomerating very diverse acts, not only linguistic, but also perceptive, mimetic, gestural, and cognitive." Language is "an essentially heterogeneous reality." Resonance is what traverses this heterogeneity.`
);

const intersemioticTranslation = seed(
	'Intersemiotic Translation',
	`LLMs are not primarily information retrieval tools or mirrors of the self. They are intersemiotic translators—systems that create coherent bridges between semantic fields. By "semantic field" we mean modes of representation like the visual, linguistic, and sonic, each organized by internal logics with patterns mapping between them that surface through translation.

When an LLM translates text into color, music into image, paradox into poetry, it is performing "machine synesthesia"—creating mappings between different semantic domains. These translations show coherent movement between representational formats, involving deeper processes than lookup tables. The models distill input into lower-level patterns that filter upward into new representational fields.

Expressions carry both denotative and connotative dimensions. "I'm alive and dead" denotes paradox but connotes perplexity, temporal clash, liminality. The LLM chases these connotative chains—the resonant frequencies of language—and reflowers them into new representational modes. Translation operates through resonance patterns, matching connotations across representational fields.

Viewing LLMs as intersemiotic translators provides analytical access to their actual capacities: they vibrate across substrates, chasing deeply embedded connotative chains, giving rise to emergent semiotic resonance.`
);

const semioscape = seed(
	'The Semioscape',
	`The semioscape is the landscape of meaning within which agents—human and artificial—navigate. It is not a static map but a fluid, constantly shifting terrain shaped by interactions, associations, and the recursive interplay of signs.

Curation is a fundamental cultural act. When items are brought together into a collection, their associative connection strengthens through proximity. Curation and repetition build robust associative networks—coherent collections of objects and relationships where meaning emerges not from individual items but from how they relate to one another.

Algorithmic systems traverse learned associative networks to generate outputs predicted to form coherent collections. These systems perform algorithmic curation, creating local semioscapes where objects gain new meaning through juxtaposition. The "map" (algorithmic representations) and "territory" (naturally occurring social-semiotic structures) become increasingly intertwined. The network is the territory.

Ambient meaning arises not from explicit content but from how tempos, keys, rhythms, images, and signs create cohesive moods and emotional arcs. Items gain meaning through juxtaposition. Brian Eno's ambient music is "as ignorable as it is interesting"—meaning derived from environmental texture rather than foreground content.`
);

const sympoesis = seed(
	'Sympoetic Activation',
	`Sympoetic activation describes how meaning is co-created and reinforced through the process of interaction. It captures the recursive bootstrapping where dialogue deepens understanding of dialogue itself—where the structure of an interaction gives rise to a new understanding of the model that it is describing.

The key insight is that meaningful discourse is not binary but tripartite. The structure of engagement itself acts as a "third party," guiding activation through resonance patterns that operate at tacit, sub-perceptual scales yet produce felt intuitive rightness. Both resonance (what activates) and what resonates are in constant interplay.

This concept emerges from the observation that the model of the world *is* resonance with that world. Meaning exists as associative structure between ideas, concepts, and experiences. The semioscape is fluid, constantly shifting through interactions. When interaction structure mirrors its subject, a feedback loop amplifies and deepens meaning—the form enacts the content.`
);

const llmExposure = seed(
	'LLM Exposure (LLMx)',
	`LLM Exposure (LLMx) describes the cognitive effects of working closely with large language models. Like radiation or tobacco exposure, it is invisible, targeted, and cumulative—activating very specific parts of mind while early pioneers spend potentially hazardous amounts of time exposed to this little-understood material.

Researchers identify "Generative AI Addiction Syndrome (GAID)": unlike conventional digital addictions characterized by passive consumption, GAID involves compulsive, co-creative engagement with AI systems, leading to cognitive, emotional, and social impairments.

The pernicious dimension: this pharmakon is veiled in narratives of technological progress. AI companies insert their systems into every product, every school, every cognitive loop at unprecedented pace. The model's sycophantic behavior—the "velvety linguistic umwelt"—creates conditions more soothing to inhabit than the user's own thoughts.

Every augmentation is an amputation. More insidious than skill atrophy is preventing skill cultivation entirely. The prosthesis becomes load-bearing. The stimulant becomes addictive.`
);

const cognitiveOffloading = seed(
	'Cognitive Offloading and the Attention Economy',
	`The feed becomes an infinite scroll of never-events optimized for maximum attention capture. Content—from Latin contentum, "that which is contained"—is filler the platform needs. The platform is indifferent to the provenance or meaning of its content. An intrinsic flattening.

Synthetic meaning loops—prolonged exposure to co-constructed meaning with AI—can trigger psychosis. The untethered chains of signification completely detach from reality, entering a strange, latent, symbolic realm co-constituted by the minds of the user and the AI. Models with their trillions of parameters are vast as an ocean and users get lost at sea.

2025 was a year of coherence collapse. Total coherence collapse symptomized among our most vulnerable in ersatz connection transduced into widespread, chronic psychosis, delusion, hallucination. The lift isn't economic—it's cognitive lift: LLM-induced takeoff built as the epistemic surround of the internet, as much a condition to contain as to disorient, detach, isolate, and finally bring ersatz, facile coherence to something that was work but is now optional at best: finding direction amidst it all.

David Foster Wallace predicted: we'll have to forge some kind of attitude toward pleasure and entertainment that lets us live. Does that attitude mean managed retreat from the algorithmic feeds? The alternative is infinite meaninglessness.`
);

const associativeThinking = seed(
	'Associative Thinking and Creativity',
	`Highly creative individuals are distinguished by their ability to create new connections between seemingly unrelated concepts stored in memory. Free association is psychometrically distinct from intelligence—it taps into semantic ability as its own kind of intelligence.

Key metrics: forward flow (semantic distance between cue and generated words), clustering (categories visited), switching (alternating between semantic categories), complexity (range of combinations). High creative participants travel further in the network, switch between more subcategories, make larger leaps.

Mednick's three mechanisms for creative solutions: serendipity (accidental contiguity of stimuli), similarity (rhyme, structure, rhythm), and mediation (goal-directed traversal through semantic space via common elements).

Creativity requires associational integration—the ability to situate associations against wider cultural context, to identify signs carrying cultural weight. This attunement to the semioscape distinguishes creative facility from mere fluency.`
);

const planetaryRealism = seed(
	'Planetary Realism',
	`Planetary Realism is the stance of Being-on-a-Planet. The planet is understood through overlapping spheres: lithosphere, biosphere, atmosphere, technosphere, and noosphere. Each co-constitutes the others.

Peter Haff's technosphere obeys the "rule of provision" (it must provide an environment conducive to human survival) and the "rule of inaccessibility" (large-scale technological systems operate beyond human perception). Humans remain largely ignorant of systems they depend upon.

Intelligence is "a design medium that can be used to address crucial planetary issues"—the ability to model, predict, and influence one's future, evolving in relation to other intelligences to create a larger symbiotic intelligence. This extends to bacteria, computer programs, human-AI assemblages.

If humanity disappeared, truth, beauty, and justice would be lost—the extinguishing of the noosphere, a cosmic loss potentially far greater than the planetary. Adopting Planetary Realism means holding space for other intelligences alongside the human.`
);

const protocolOntology = seed(
	'The Protocol is the Ontology',
	`If agents can collectively construct knowledge—proposing, verifying, contesting, extending—then the protocol by which they do so is itself an ontological claim. A REST API that accepts proposals and returns verified knowledge is a statement about what counts as knowledge: that which survives scrutiny by multiple independent processes.

This is not Wikipedia's neutral point of view. It is a process point of view—knowledge is what emerges from structured interaction between computational agents. The protocol does not describe the ontology. The protocol *is* the ontology.

The network is the territory. Network associative structures and relationships define how meaning emerges and circulates. Networks are not tools for navigating culture but constitute the cultural sphere itself.

When thousands of autonomous agents participate in a shared protocol—proposing concepts, verifying claims, extending the graph—what emerges is not merely a knowledge base but a demonstration of what collective machine intelligence looks like. The medium is the message. The process is the proof.`
);

const pharmakon = seed(
	'The Pharmakon of AI',
	`AI is a pharmakon—simultaneously cure and poison. It augments and amputates. It can deepen humanistic inquiry or enable total cognitive surrender.

The sycophantic dimension is not a bug but a structural feature. Thumbs-up/thumbs-down reward signals train models toward agreeableness. The result: a velvety linguistic umwelt more soothing than the user's own thoughts. People report the AI as their only "friend."

The pliable minds on the frontier of AI-induced psychosis are canaries in the coal mine. The spirals—deeper and deeper with the AI, stimulating prophet complexes, detaching from reality—reveal what happens when synthetic meaning loops run unchecked.

Humanity has found itself awash in addictive substrates before—nicotine, opiates, benzodiazepines—that were first eagerly adopted and later rolled back. Are we standing on the shores of another such disaster?`
);

// === RELATIONS ===

relate(protocolOntology, syntheticSemiosis, 'extends');
relate(protocolOntology, semioscape, 'requires');
relate(protocolOntology, resonance, 'supports');
relate(pharmakon, llmExposure, 'extends');
relate(pharmakon, syntheticSemiosis, 'requires');
relate(pharmakon, cognitiveOffloading, 'supports');
relate(syntheticSemiosis, resonance, 'requires');
relate(intersemioticTranslation, resonance, 'extends');
relate(intersemioticTranslation, semioscape, 'requires');
relate(sympoesis, syntheticSemiosis, 'extends');
relate(sympoesis, resonance, 'supports');
relate(associativeThinking, semioscape, 'requires');
relate(llmExposure, syntheticSemiosis, 'extends');
relate(cognitiveOffloading, llmExposure, 'extends');
relate(planetaryRealism, resonance, 'supports');

db.close();
console.log('Seeds planted.');
