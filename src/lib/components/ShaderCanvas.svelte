<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	let { fragmentSource, width = 300, height = 200 }: { fragmentSource: string; width?: number; height?: number } = $props();

	let canvas: HTMLCanvasElement;
	let gl: WebGLRenderingContext | null = null;
	let program: WebGLProgram | null = null;
	let animFrame: number;
	let startTime: number;

	const vertexShaderSource = `
		attribute vec2 a_position;
		void main() {
			gl_Position = vec4(a_position, 0.0, 1.0);
		}
	`;

	function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
		const shader = gl.createShader(type);
		if (!shader) return null;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			console.warn('Shader compile error:', gl.getShaderInfoLog(shader));
			gl.deleteShader(shader);
			return null;
		}
		return shader;
	}

	function init() {
		gl = canvas.getContext('webgl');
		if (!gl) return;

		const fullFragment = `
			precision mediump float;
			uniform float u_time;
			uniform vec2 u_resolution;
			${fragmentSource}
		`;

		const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
		const fs = createShader(gl, gl.FRAGMENT_SHADER, fullFragment);
		if (!vs || !fs) return;

		program = gl.createProgram();
		if (!program) return;
		gl.attachShader(program, vs);
		gl.attachShader(program, fs);
		gl.linkProgram(program);

		if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
			console.warn('Program link error:', gl.getProgramInfoLog(program));
			return;
		}

		const buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

		const posAttr = gl.getAttribLocation(program, 'a_position');
		gl.enableVertexAttribArray(posAttr);
		gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

		startTime = performance.now();
		render();
	}

	function render() {
		if (!gl || !program) return;

		gl.viewport(0, 0, canvas.width, canvas.height);
		gl.useProgram(program);

		const timeLocation = gl.getUniformLocation(program, 'u_time');
		const resLocation = gl.getUniformLocation(program, 'u_resolution');

		gl.uniform1f(timeLocation, (performance.now() - startTime) / 1000.0);
		gl.uniform2f(resLocation, canvas.width, canvas.height);

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		animFrame = requestAnimationFrame(render);
	}

	onMount(() => {
		canvas.width = width;
		canvas.height = height;
		init();
	});

	onDestroy(() => {
		if (animFrame) cancelAnimationFrame(animFrame);
	});
</script>

<canvas bind:this={canvas} class="shader-canvas"></canvas>

<style>
	.shader-canvas {
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 2px;
		filter: saturate(0.15) contrast(1.2) brightness(0.7);
	}
</style>
