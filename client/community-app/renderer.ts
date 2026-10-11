/**
 * Draws the city with WebGL2. Lines and lights are added together as light
 * in a floating-point buffer, then compressed into the visible range, so the
 * densest neighbourhoods glow without turning into flat white. Avatars are
 * drawn on top once people are big enough on screen to show a face.
 */

export interface Scene {
  count: number;
  /** World positions, two floats per member. */
  pos: Float32Array;
  /** Light radius in CSS pixels at the overview zoom. */
  size: Float32Array;
  /** Brightness 0–1. */
  glow: Float32Array;
  /** 0 = ivory, 1 = mint. */
  tint: Float32Array;
  /** Month index the member joined, and when they made a first connection. */
  joined: Float32Array;
  first: Float32Array;
  edges: number;
  edgeA: Uint32Array;
  edgeB: Uint32Array;
  edgeTie: Uint8Array;
  /** Brightness within its tie, 0–1. */
  edgeWeight: Float32Array;
  edgeFirst: Float32Array;
}

export interface View {
  /** World → device pixels: x' = a·x + c·y + e, y' = b·x + d·y + f. */
  matrix: [number, number, number, number, number, number];
  /** Device pixels per world unit. */
  scale: number;
  dpr: number;
  width: number;
  height: number;
}

export interface Frame {
  view: View;
  /** Fractional month index; lines and lights born later stay dark. */
  month: number;
  /** Seconds, for the twinkle. */
  time: number;
  /** 0–1, how far the focus on one person has faded in. */
  focus: number;
  /** How much the focused person's lines brighten (less for people with thousands). */
  focusBoost: number;
  /** 0–1, the hovered person's lines (lighter than a focus). */
  hover: number;
  /** How much a hovered person's lines brighten (2.4 if not given). */
  hoverBoost?: number;
  pulses: Pulse[];
  avatars: AvatarSprite[];
}

export interface Pulse {
  x: number;
  y: number;
  size: number;
  glow: number;
  mint: number;
}

export interface AvatarSprite {
  x: number;
  y: number;
  /** Radius in device pixels. */
  radius: number;
  cell: number;
  alpha: number;
  ring: number;
}

/** How bright and wide each kind of tie is (index = tie 1–3). */
const TIE_ALPHA = [0, 0.02, 0.065, 0.26];
const TIE_WIDTH = [0, 0.8, 1.1, 1.7];
export const CURVE = 0.14;

const EDGE_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_from;
layout(location = 1) in vec2 a_to;
layout(location = 2) in vec4 a_style; // tie, brightness (negative: a staff line), first month, highlight
uniform mat3 u_view;
uniform vec2 u_viewport;
uniform float u_month;
uniform float u_segments;
uniform float u_dpr;
uniform float u_zoomWidth;
uniform float u_focus;
uniform float u_focusBoost;
uniform float u_hover;
uniform float u_hoverBoost;
uniform vec4 u_tieAlpha;
uniform vec4 u_tieWidth;
out float v_side;
out float v_alpha;
out float v_mint;
out float v_soft;

void main() {
  float age = u_month - a_style.z;
  if (age < 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  int vid = gl_VertexID;
  float t = float(vid / 2) / u_segments;
  float side = (vid % 2 == 0) ? -1.0 : 1.0;
  // New lines draw themselves from one person to the other.
  t = min(t, clamp(age / 0.55, 0.0, 1.0));

  vec2 p0 = (u_view * vec3(a_from, 1.0)).xy;
  vec2 p2 = (u_view * vec3(a_to, 1.0)).xy;
  vec2 chord = p2 - p0;
  float len = length(chord);
  vec2 n = len > 0.001 ? vec2(-chord.y, chord.x) / len : vec2(0.0, 1.0);
  vec2 p1 = (p0 + p2) * 0.5 + n * len * ${CURVE.toFixed(3)};
  vec2 p = mix(mix(p0, p1, t), mix(p1, p2, t), t);
  vec2 tangent = mix(p1 - p0, p2 - p1, t);
  tangent = length(tangent) > 0.0001 ? normalize(tangent) : vec2(1.0, 0.0);
  vec2 normal = vec2(-tangent.y, tangent.x);

  int tie = int(a_style.x + 0.5);
  float highlight = a_style.w;
  float width = u_tieWidth[tie] * u_zoomWidth * u_dpr;
  float alpha = u_tieAlpha[tie] * abs(a_style.y);
  // Staff talk to nearly everyone; their lines only show around a person
  // being looked at, so the overview shows members talking to members.
  if (a_style.y < 0.0) alpha *= highlight > 0.5 ? 1.0 : 0.0;
  // Short lines pile their light into small areas (the busy old town in the
  // middle), so they are dimmer; they brighten as you zoom in and they lengthen.
  alpha *= clamp(len / (70.0 * u_dpr), 0.13, 1.0);
  // A brief flare as the line is born.
  alpha *= 1.0 + 1.4 * (1.0 - clamp(age / 1.2, 0.0, 1.0));
  // Focus: this person's lines brighten, everyone else's step back.
  float lit = highlight > 1.5 ? 1.0 : 0.0;   // focused person's line
  float hov = highlight > 0.5 && highlight < 1.5 ? 1.0 : 0.0; // hovered person's line
  alpha *= mix(1.0, mix(0.12, u_focusBoost, lit), u_focus);
  alpha *= mix(1.0, mix(0.45, u_hoverBoost, hov), u_hover * (1.0 - u_focus));
  width *= 1.0 + lit * u_focus * 0.6;
  // Very thin lines are drawn one pixel wide and dimmer, so they do not shimmer.
  float drawn = max(width, u_dpr * 1.25);
  alpha *= width / drawn;
  float half_ = drawn * 0.5 + u_dpr * 0.75;
  p += normal * side * half_;
  // Lines fade in just beyond the lights they join, so they seem to come out
  // of them rather than cross them.
  float along = t * len;
  float taper = smoothstep(0.0, 7.0 * u_dpr, along) * smoothstep(0.0, 7.0 * u_dpr, len - along);
  alpha *= mix(1.0, taper, 0.85);
  v_side = side * half_ / (drawn * 0.5);
  v_soft = 1.0 + (u_dpr * 0.75) / (drawn * 0.5);
  v_alpha = alpha;
  v_mint = tie == 3 ? 1.0 : 0.0;
  gl_Position = vec4(p.x / u_viewport.x * 2.0 - 1.0, 1.0 - p.y / u_viewport.y * 2.0, 0.0, 1.0);
}`;

const EDGE_FS = `#version 300 es
precision highp float;
in float v_side;
in float v_alpha;
in float v_mint;
in float v_soft;
out vec4 o;
void main() {
  float d = abs(v_side);
  float a = v_alpha * (1.0 - smoothstep(1.0, v_soft, d));
  vec3 ivory = vec3(1.0, 0.93, 0.80);
  vec3 mint = vec3(0.50, 0.95, 0.66);
  vec3 c = mix(ivory, mint, v_mint);
  o = vec4(c * a, a);
}`;

const NODE_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec2 a_pos;
layout(location = 2) in vec4 a_look;  // size, glow, tint, highlight
layout(location = 3) in vec2 a_time;  // joined month, first connection month
uniform mat3 u_view;
uniform vec2 u_viewport;
uniform float u_month;
uniform float u_time;
uniform float u_dpr;
uniform float u_zoomSize;
uniform float u_focus;
uniform float u_hover;
out vec2 v_uv;
out float v_glow;
out float v_tint;
out float v_core;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  float joinedAge = u_month - a_time.x;
  if (joinedAge < 0.0) {
    gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
    return;
  }
  float connected = u_month - a_time.y;
  float size = a_look.x;
  float glow = a_look.y;
  float highlight = a_look.w;
  if (connected < 0.0) {
    // Joined but not yet connected: a faint light on the edge of town.
    size = min(size, 1.1);
    glow = min(glow, 0.18);
  } else {
    glow *= 1.0 + 1.5 * (1.0 - clamp(connected / 1.0, 0.0, 1.0));
  }
  glow *= mix(1.0, 0.0, clamp(1.0 - joinedAge / 0.8, 0.0, 1.0));
  // A slow, uneven twinkle.
  float h = hash(a_pos * 917.0);
  glow *= 0.86 + 0.14 * sin(u_time * (0.4 + h) + h * 40.0);
  float lit = highlight > 1.5 ? 1.0 : 0.0;
  float near = highlight > 0.5 && highlight < 1.5 ? 1.0 : 0.0;
  glow *= mix(1.0, mix(0.16, 1.6 + lit * 1.4, max(lit, near)), u_focus);
  size *= 1.0 + lit * u_focus * 0.8;
  glow *= mix(1.0, mix(0.6, 1.8, max(lit, near)), u_hover * (1.0 - u_focus));

  float px = size * u_zoomSize * u_dpr;
  float quad = px * 3.5 + u_dpr * 2.0;
  vec2 center = (u_view * vec3(a_pos, 1.0)).xy;
  vec2 p = center + a_corner * quad;
  v_uv = a_corner * quad;
  v_core = max(px, u_dpr * 0.7);
  v_glow = glow;
  v_tint = max(a_look.z, lit * u_focus);
  gl_Position = vec4(p.x / u_viewport.x * 2.0 - 1.0, 1.0 - p.y / u_viewport.y * 2.0, 0.0, 1.0);
}`;

const NODE_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
in float v_glow;
in float v_tint;
in float v_core;
out vec4 o;
void main() {
  float r = length(v_uv);
  float core = 1.0 - smoothstep(v_core * 0.55, v_core, r);
  float halo = exp(-(r * r) / (v_core * v_core * 2.2));
  float a = v_glow * (core * 0.9 + halo * 0.24);
  vec3 ivory = vec3(1.0, 0.95, 0.86);
  vec3 mint = vec3(0.56, 0.98, 0.70);
  vec3 c = mix(ivory, mint, v_tint);
  o = vec4(c * a, a);
}`;

const QUAD_VS = `#version 300 es
precision highp float;
const vec2 corners[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
out vec2 v_uv;
void main() {
  vec2 c = corners[gl_VertexID];
  v_uv = c * 0.5 + 0.5;
  gl_Position = vec4(c, 0.0, 1.0);
}`;

const COMPOSITE_FS = `#version 300 es
precision highp float;
in vec2 v_uv;
uniform sampler2D u_light;
uniform vec2 u_viewport;
uniform float u_exposure;
uniform float u_transparent;
out vec4 o;
float noise(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}
void main() {
  vec3 light = texture(u_light, v_uv).rgb;
  // Night sky: deep forest, a little lighter towards the middle.
  vec2 q = (v_uv - vec2(0.5, 0.52)) * vec2(u_viewport.x / u_viewport.y, 1.0);
  float d = length(q);
  vec3 deep = vec3(0.020, 0.085, 0.048);
  vec3 forest = vec3(0.045, 0.165, 0.095);
  vec3 bg = mix(forest, deep, smoothstep(0.0, 0.95, d));
  vec3 mapped = vec3(1.0) - exp(-light * u_exposure);
  if (u_transparent > 0.5) {
    // Light only, premultiplied, so the page behind shows through.
    o = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
    return;
  }
  vec3 c = 1.0 - (1.0 - bg) * (1.0 - mapped);
  c += (noise(gl_FragCoord.xy) - 0.5) / 255.0 * 1.5;
  o = vec4(c, 1.0);
}`;

const AVATAR_VS = `#version 300 es
precision highp float;
layout(location = 0) in vec2 a_corner;
layout(location = 1) in vec4 a_sprite; // x, y, radius, alpha
layout(location = 2) in vec2 a_cell;   // atlas cell, ring
uniform vec2 u_viewport;
uniform float u_columns;
out vec2 v_face;
flat out vec2 v_cellOrigin;
out vec2 v_local;
out float v_alpha;
out float v_ring;
out float v_radius;
void main() {
  float r = a_sprite.z + 2.0;
  vec2 p = a_sprite.xy + a_corner * r;
  v_local = a_corner * r;
  v_radius = a_sprite.z;
  // Position within the face, 0–1 across the circle (beyond it at the corners).
  v_face = v_local / (2.0 * a_sprite.z) + 0.5;
  v_cellOrigin = vec2(mod(a_cell.x, u_columns), floor(a_cell.x / u_columns));
  v_alpha = a_sprite.w;
  v_ring = a_cell.y;
  gl_Position = vec4(p.x / u_viewport.x * 2.0 - 1.0, 1.0 - p.y / u_viewport.y * 2.0, 0.0, 1.0);
}`;

const AVATAR_FS = `#version 300 es
precision highp float;
uniform sampler2D u_atlas;
uniform vec2 u_grid;
in vec2 v_face;
flat in vec2 v_cellOrigin;
in vec2 v_local;
in float v_alpha;
in float v_ring;
in float v_radius;
out vec4 o;
void main() {
  float d = length(v_local);
  float inside = 1.0 - smoothstep(v_radius - 1.0, v_radius, d);
  // Stay inside the cell so neighbouring faces never bleed in.
  vec2 uv = (v_cellOrigin + clamp(v_face, 0.03, 0.97)) / u_grid;
  vec4 face = texture(u_atlas, uv);
  float ringBand = smoothstep(v_radius - 1.0, v_radius, d) * (1.0 - smoothstep(v_radius + 0.6, v_radius + 1.8, d));
  float ringAlpha = 0.5 + 0.5 * v_ring;
  vec3 ringColor = mix(vec3(0.97, 0.94, 0.89), vec3(0.56, 0.83, 0.64), v_ring);
  vec3 c = face.rgb * inside + ringColor * ringBand * ringAlpha;
  float a = max(inside, ringBand * ringAlpha) * v_alpha;
  o = vec4(c * v_alpha, a);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) ?? "shader failed");
  }
  return shader;
}

function program(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) ?? "program failed");
  }
  const uniforms = new Map<string, WebGLUniformLocation | null>();
  return {
    p,
    u(name: string) {
      if (!uniforms.has(name))
        uniforms.set(name, gl.getUniformLocation(p, name));
      return uniforms.get(name)!;
    },
  };
}

type Program = ReturnType<typeof program>;

export class Renderer {
  readonly gl: WebGL2RenderingContext;
  private edgeProgram: Program;
  private nodeProgram: Program;
  private compositeProgram: Program;
  private avatarProgram: Program;
  private edgeVao: WebGLVertexArrayObject;
  private nodeVao: WebGLVertexArrayObject;
  private pulseVao: WebGLVertexArrayObject;
  private avatarVao: WebGLVertexArrayObject;
  private edgeStyle: WebGLBuffer;
  private edgeStyleData: Float32Array;
  private nodeLook: WebGLBuffer;
  private nodeLookData: Float32Array;
  private pulseBuffer: WebGLBuffer;
  private avatarBuffer: WebGLBuffer;
  private avatarCellBuffer: WebGLBuffer;
  private atlas: WebGLTexture | null = null;
  private atlasGrid = { columns: 1, rows: 1 };
  private framebuffer: WebGLFramebuffer | null = null;
  private lightTexture: WebGLTexture | null = null;
  private target = { width: 0, height: 0 };
  private float: boolean;
  private scene: Scene;
  private segments: number;
  private transparent: boolean;
  private exposure: number;
  private emptyVao: WebGLVertexArrayObject;

  /**
   * `transparent` draws the light alone, so the element behind the canvas
   * (its CSS background) is the night sky — as on the homepage.
   */
  constructor(
    canvas: HTMLCanvasElement,
    scene: Scene,
    options: { segments: number; transparent?: boolean; exposure?: number }
  ) {
    const transparent = !!options.transparent;
    const gl = canvas.getContext("webgl2", {
      antialias: false,
      alpha: transparent,
      premultipliedAlpha: transparent,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WebGL2 unavailable");
    this.gl = gl;
    this.scene = scene;
    this.segments = options.segments;
    this.transparent = transparent;
    this.exposure = options.exposure ?? 1;
    this.float =
      !!gl.getExtension("EXT_color_buffer_float") ||
      !!gl.getExtension("EXT_color_buffer_half_float");
    gl.getExtension("OES_texture_float_linear");

    this.edgeProgram = program(gl, EDGE_VS, EDGE_FS);
    this.nodeProgram = program(gl, NODE_VS, NODE_FS);
    this.compositeProgram = program(gl, QUAD_VS, COMPOSITE_FS);
    this.avatarProgram = program(gl, AVATAR_VS, AVATAR_FS);
    this.emptyVao = gl.createVertexArray()!;

    // Lines: one instance per connection.
    this.edgeVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.edgeVao);
    const from = new Float32Array(scene.edges * 2);
    const to = new Float32Array(scene.edges * 2);
    this.edgeStyleData = new Float32Array(scene.edges * 4);
    for (let i = 0; i < scene.edges; i++) {
      const a = scene.edgeA[i];
      const b = scene.edgeB[i];
      from[i * 2] = scene.pos[a * 2];
      from[i * 2 + 1] = scene.pos[a * 2 + 1];
      to[i * 2] = scene.pos[b * 2];
      to[i * 2 + 1] = scene.pos[b * 2 + 1];
      this.edgeStyleData[i * 4] = scene.edgeTie[i];
      this.edgeStyleData[i * 4 + 1] = scene.edgeWeight[i];
      this.edgeStyleData[i * 4 + 2] = scene.edgeFirst[i];
      this.edgeStyleData[i * 4 + 3] = 0;
    }
    this.instanceBuffer(0, from, 2);
    this.instanceBuffer(1, to, 2);
    this.edgeStyle = this.instanceBuffer(
      2,
      this.edgeStyleData,
      4,
      gl.DYNAMIC_DRAW
    );

    // Lights: one instance per member, drawn as a small quad.
    this.nodeVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.nodeVao);
    const corners = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    this.vertexBuffer(0, corners, 2);
    this.instanceBuffer(1, scene.pos, 2);
    this.nodeLookData = new Float32Array(scene.count * 4);
    for (let i = 0; i < scene.count; i++) {
      this.nodeLookData[i * 4] = scene.size[i];
      this.nodeLookData[i * 4 + 1] = scene.glow[i];
      this.nodeLookData[i * 4 + 2] = scene.tint[i];
      this.nodeLookData[i * 4 + 3] = 0;
    }
    this.nodeLook = this.instanceBuffer(
      2,
      this.nodeLookData,
      4,
      gl.DYNAMIC_DRAW
    );
    const times = new Float32Array(scene.count * 2);
    for (let i = 0; i < scene.count; i++) {
      times[i * 2] = scene.joined[i];
      times[i * 2 + 1] = scene.first[i];
    }
    this.instanceBuffer(3, times, 2);

    // Pulses reuse the light shader with their own instances.
    this.pulseVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.pulseVao);
    this.vertexBuffer(0, corners, 2);
    this.pulseBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.pulseBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 10 * 256, gl.DYNAMIC_DRAW);
    const stride = 4 * 10;
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, stride, 8);
    gl.vertexAttribDivisor(2, 1);
    gl.enableVertexAttribArray(3);
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, stride, 24);
    gl.vertexAttribDivisor(3, 1);

    // Avatars.
    this.avatarVao = gl.createVertexArray()!;
    gl.bindVertexArray(this.avatarVao);
    this.vertexBuffer(0, corners, 2);
    this.avatarBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.avatarBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 4 * 512, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(1, 1);
    this.avatarCellBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.avatarCellBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, 4 * 2 * 512, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);
  }

  private vertexBuffer(location: number, data: Float32Array, size: number) {
    const gl = this.gl;
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  }

  private instanceBuffer(
    location: number,
    data: Float32Array,
    size: number,
    usage?: number
  ) {
    const gl = this.gl;
    const buffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, usage ?? gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    gl.vertexAttribDivisor(location, 1);
    return buffer;
  }

  /**
   * Marks lines and lights around one person: 2 for the focused person and
   * their lines, 1 for their neighbours (or a hovered person's lines).
   */
  setHighlight(
    nodeLevels: Map<number, number>,
    edgeLevels: Map<number, number>
  ) {
    const gl = this.gl;
    for (let i = 0; i < this.scene.count; i++)
      this.nodeLookData[i * 4 + 3] = nodeLevels.get(i) ?? 0;
    for (let i = 0; i < this.scene.edges; i++)
      this.edgeStyleData[i * 4 + 3] = edgeLevels.get(i) ?? 0;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeLook);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.nodeLookData);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeStyle);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.edgeStyleData);
  }

  setAtlas(image: TexImageSource, columns: number, rows: number) {
    const gl = this.gl;
    this.atlas = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.atlas);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR_MIPMAP_LINEAR
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.atlasGrid = { columns, rows };
  }

  private ensureTarget(width: number, height: number) {
    if (
      this.target.width === width &&
      this.target.height === height &&
      this.framebuffer
    )
      return;
    const gl = this.gl;
    if (this.lightTexture) gl.deleteTexture(this.lightTexture);
    if (this.framebuffer) gl.deleteFramebuffer(this.framebuffer);
    this.lightTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.lightTexture);
    if (this.float) {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA16F,
        width,
        height,
        0,
        gl.RGBA,
        gl.HALF_FLOAT,
        null
      );
    } else {
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA8,
        width,
        height,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null
      );
    }
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    this.framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.lightTexture,
      0
    );
    if (
      gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE &&
      this.float
    ) {
      // Some devices list the extension but cannot render to it.
      this.float = false;
      this.target = { width: 0, height: 0 };
      this.ensureTarget(width, height);
      return;
    }
    this.target = { width, height };
  }

  draw(frame: Frame) {
    const gl = this.gl;
    const { view } = frame;
    this.ensureTarget(view.width, view.height);
    const m = view.matrix;
    const mat = new Float32Array([m[0], m[1], 0, m[2], m[3], 0, m[4], m[5], 1]);
    // Lines thicken a little and lights grow as you come closer.
    const zoom = view.scale / (view.dpr * 300);
    const zoomWidth = Math.min(2.2, Math.max(0.75, Math.pow(zoom, 0.35)));
    const zoomSize = Math.min(4, Math.max(0.7, Math.pow(zoom, 0.5)));

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.viewport(0, 0, view.width, view.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE);
    const exposure = this.float ? 1 : 0.6;

    const edge = this.edgeProgram;
    gl.useProgram(edge.p);
    gl.uniformMatrix3fv(edge.u("u_view"), false, mat);
    gl.uniform2f(edge.u("u_viewport"), view.width, view.height);
    gl.uniform1f(edge.u("u_month"), frame.month);
    gl.uniform1f(edge.u("u_segments"), this.segments);
    gl.uniform1f(edge.u("u_dpr"), view.dpr);
    gl.uniform1f(edge.u("u_zoomWidth"), zoomWidth);
    gl.uniform1f(edge.u("u_focus"), frame.focus);
    gl.uniform1f(edge.u("u_focusBoost"), frame.focusBoost);
    gl.uniform1f(edge.u("u_hover"), frame.hover);
    gl.uniform1f(edge.u("u_hoverBoost"), frame.hoverBoost ?? 2.4);
    gl.uniform4f(
      edge.u("u_tieAlpha"),
      TIE_ALPHA[0],
      TIE_ALPHA[1] * exposure,
      TIE_ALPHA[2] * exposure,
      TIE_ALPHA[3] * exposure
    );
    gl.uniform4f(
      edge.u("u_tieWidth"),
      TIE_WIDTH[0],
      TIE_WIDTH[1],
      TIE_WIDTH[2],
      TIE_WIDTH[3]
    );
    gl.bindVertexArray(this.edgeVao);
    gl.drawArraysInstanced(
      gl.TRIANGLE_STRIP,
      0,
      (this.segments + 1) * 2,
      this.scene.edges
    );

    const node = this.nodeProgram;
    gl.useProgram(node.p);
    gl.uniformMatrix3fv(node.u("u_view"), false, mat);
    gl.uniform2f(node.u("u_viewport"), view.width, view.height);
    gl.uniform1f(node.u("u_month"), frame.month);
    gl.uniform1f(node.u("u_time"), frame.time);
    gl.uniform1f(node.u("u_dpr"), view.dpr);
    gl.uniform1f(node.u("u_zoomSize"), zoomSize);
    gl.uniform1f(node.u("u_focus"), frame.focus);
    gl.uniform1f(node.u("u_hover"), frame.hover);
    gl.bindVertexArray(this.nodeVao);
    gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.scene.count);

    if (frame.pulses.length) {
      const count = Math.min(256, frame.pulses.length);
      const data = new Float32Array(count * 10);
      for (let i = 0; i < count; i++) {
        const pulse = frame.pulses[i];
        data.set(
          [
            pulse.x,
            pulse.y,
            pulse.size,
            pulse.glow,
            pulse.mint,
            0,
            -1e6,
            -1e6,
            0,
            0,
          ],
          i * 10
        );
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, this.pulseBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
      gl.uniform1f(node.u("u_focus"), 0);
      gl.uniform1f(node.u("u_hover"), 0);
      gl.bindVertexArray(this.pulseVao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    }

    // Compose the light over the night sky.
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, view.width, view.height);
    gl.disable(gl.BLEND);
    const composite = this.compositeProgram;
    gl.useProgram(composite.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.lightTexture);
    gl.uniform1i(composite.u("u_light"), 0);
    gl.uniform2f(composite.u("u_viewport"), view.width, view.height);
    gl.uniform1f(composite.u("u_exposure"), this.exposure);
    gl.uniform1f(composite.u("u_transparent"), this.transparent ? 1 : 0);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    if (this.atlas && frame.avatars.length) {
      const count = Math.min(512, frame.avatars.length);
      const sprites = new Float32Array(count * 4);
      const cells = new Float32Array(count * 2);
      for (let i = 0; i < count; i++) {
        const a = frame.avatars[i];
        sprites.set([a.x, a.y, a.radius, a.alpha], i * 4);
        cells.set([a.cell, a.ring], i * 2);
      }
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      const avatar = this.avatarProgram;
      gl.useProgram(avatar.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.atlas);
      gl.uniform1i(avatar.u("u_atlas"), 0);
      gl.uniform2f(avatar.u("u_viewport"), view.width, view.height);
      gl.uniform1f(avatar.u("u_columns"), this.atlasGrid.columns);
      gl.uniform2f(
        avatar.u("u_grid"),
        this.atlasGrid.columns,
        this.atlasGrid.rows
      );
      gl.bindVertexArray(this.avatarVao);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.avatarBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, sprites);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.avatarCellBuffer);
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, cells);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, count);
    }
    gl.bindVertexArray(null);
  }
}
