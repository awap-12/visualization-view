const QUAD_POSITIONS = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];

class WebGlStrategy {
    constructor(gl) { this.gl = gl; }

    getExtension(extension) {
        let ext = this.gl.getExtension(extension);
        if(!ext) console.log(`${extension} extension is not supported`);
        return ext;
    }
}

class WebGl1Strategy extends WebGlStrategy {
    constructor(gl) {
        super(gl);
        this.ext = this.getExtension("OES_texture_half_float");
        this.getExtension("OES_texture_half_float_linear");
    }

    texImage2DHalfFloatRGBA(width, height) {
        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, this.ext.HALF_FLOAT_OES, null);
    }
}

class WebGl2Strategy extends WebGlStrategy {
    constructor(gl) {
        super(gl);
        this.getExtension("EXT_color_buffer_float");
        this.getExtension("OES_texture_float_linear");
    }

    texImage2DHalfFloatRGBA(width, height) {
        const gl = this.gl;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, width, height, 0, gl.RGBA, gl.HALF_FLOAT, null);
    }
}

export class GlHandle {
    constructor(canvas, contextAttrs) {
        this.canvas = canvas;
        let gl = canvas.getContext("webgl2", contextAttrs);
        if (!!gl) {
            this.strategy = new WebGl2Strategy(gl);
        } else if (!!(gl = canvas.getContext("webgl", contextAttrs))) {
            this.strategy = new WebGl1Strategy(gl);
        } else throw new Error("Invalid webgl context");
        this.gl = gl;
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(QUAD_POSITIONS), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        this.quad = positionBuffer;
        this.buffers = {};
        this.textureCount = 0;
    }

    loadShader(id, type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            gl.deleteShader(shader);
            console.error("Cannot compile shader - " + id + ": " + String(gl.getShaderInfoLog(shader)));
        }
        return shader;
    }

    initProgram(id, vertexShaderSource, fragmentShaderSource) {
        const gl = this.gl;
        const vertexShader = this.loadShader(id, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.loadShader(id, gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        return program;
    }

    createDoubleBuffer(textureInitializer) {
        return new DoubleBuffer(this.gl, this.strategy, () => {
            textureInitializer(this.gl)
        });
    }

    wrapProgram(id, program, vertexAttribute, buffer) {
        const gl = this.gl;
        const uniformSpecs = [];
        const activeUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < activeUniforms; i++) {
            const uniform = gl.getActiveUniform(program, i);
            uniformSpecs.push({
                name: uniform.name,
                location: gl.getUniformLocation(program, uniform.name)
            });
        }
        return {
            vertexAttributeLocation: gl.getAttribLocation(program, vertexAttribute),
            uniformSpecs: uniformSpecs,
            init: buffer ? (width, height) => buffer.init(width, height) : () => {},
            draw: (uniforms, drawer) => {
                gl.useProgram(program);
                uniforms();
                if (buffer) {
                    buffer.swapTextures();
                    buffer.draw(drawer);
                } else drawer();
            }
        };
    }

    updateViewportSize() {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    texImage2DHalfFloatRGBA(width, height) {
        this.strategy.texImage2DHalfFloatRGBA(width, height);
    }

    bindTexture(location, texture) {
        const gl = this.gl;
        const tex = texture instanceof DoubleBuffer ? texture.out : texture;
        gl.activeTexture(gl.TEXTURE0 + this.textureCount);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniform1i(location, this.textureCount++);
    }

    unbindTextures() {
        const gl = this.gl;
        for (let i = 0; i < this.textureCount; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
        this.textureCount = 0;
    }

    drawQuad(vertexAttributeLocation) {
        const gl = this.gl;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
        gl.enableVertexAttribArray(vertexAttributeLocation);
        gl.vertexAttribPointer(vertexAttributeLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        gl.disableVertexAttribArray(vertexAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}

export class DoubleBuffer {
    constructor(gl, strategy, textureInitializer) {
        this.fbo = gl.createFramebuffer();
        this.gl = gl;
        this.strategy = strategy;
        this.textureInitializer = textureInitializer;
        this.in = null;
        this.out = null;
    }

    init(width, height) {
        this.deleteTextures();
        this.in = this.createTexture(width, height);
        this.out = this.createTexture(width, height);
    }

    createTexture(width, height) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        this.textureInitializer(gl);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    draw(drawer) {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.out, 0);
        drawer();
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    swapTextures() {
        [this.in, this.out] = [this.out, this.in];
    }

    deleteTextures() {
        if (this.in) this.gl.deleteTexture(this.in);
        if (this.out) this.gl.deleteTexture(this.out);
    }

    release() {
        const gl = this.gl;
        this.deleteTextures();
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.deleteFramebuffer(this.fbo)
    }
}

export class Renderer {
    constructor(glHandle, context, program, uniforms) {
        this.program = program;
        const gl = glHandle.gl;
        this.fillUniforms = () => {
            for (const uniform of uniforms) {
                uniform.setter(gl, uniform.location, context);
            }
        }
        this.draw = () => {
            glHandle.drawQuad(program.vertexAttributeLocation);
            glHandle.unbindTextures();
        }
    }

    render() {
        this.program.draw(this.fillUniforms, this.draw);
    }
}
