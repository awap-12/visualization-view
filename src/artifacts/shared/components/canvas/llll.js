function shade(config) {
    const
        canvas = config.canvas, shaders = config.shaders,
        onInit = config.onInit, onResize = config.onResize,
        onBeforeFrame = config.onBeforeFrame, onAfterFrame = config.onAfterFrame;
    try {
        const contextAttrs = { antialias: false, depth: false, alpha: false };
        const glHandle = new GlHandle(canvas, contextAttrs);
        const initProgram = (id, vertexShaderSource, fragmentShaderSource) => {
            try {
                return glHandle.initProgram(id, vertexShaderSource, fragmentShaderSource);
            } catch (error) {
                console.error(error.message);
            }
        }
        const renderers = [];
        const context = {
            gl: glHandle.gl,
            canvas: canvas,
            width: 0,
            height: 0,
            cssPixelRatio: 0,
            cssWidth: 0,
            cssHeight: 0,
            isOverShader: (x, y) => {
                const rect = canvas.getBoundingClientRect();
                return (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
            },
            toShaderX: x => (x - canvas.getBoundingClientRect().left) * context.cssPixelRatio + 0.5,
            toShaderY: y => (canvas.height - (y - canvas.getBoundingClientRect().top) * context.cssPixelRatio) - 0.5,
            maybeResize: () => {
                if ((context.cssWidth !== canvas.clientWidth) || (context.cssHeight !== canvas.clientHeight)) {
                    context.resize();
                    return true;
                }
                return false;
            },
            resize: () => {
                const
                    pixelRatio = window.devicePixelRatio || 1,
                    cssWidth   = canvas.clientWidth,
                    cssHeight  = canvas.clientHeight,
                    width      = Math.floor(cssWidth  * pixelRatio),
                    height     = Math.floor(cssHeight * pixelRatio);
                canvas.width  = width;
                canvas.height = height;
                context.width         = width;
                context.height        = height;
                context.cssPixelRatio = pixelRatio;
                context.cssWidth      = cssWidth;
                context.cssHeight     = cssHeight;
                glHandle.updateViewportSize();
                for (const renderer of renderers) {
                    renderer.program.init(width, height);
                }
            },
            texture: (loc, tex) => glHandle.bindTexture(loc, tex),
            buffers: {},
            initHalfFloatRGBATexture: (width, height) => {
                glHandle.texImage2DHalfFloatRGBA(width, height);
            }
        }
        const imageShaderIndex = Object.keys(shaders).length - 1;
        const defaultTextureInitializer = (gl, ctx) => {
            ctx.initHalfFloatRGBATexture(ctx.width, ctx.height);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        };
        let index = 0;
        const getFragmentShaderSource = (id) => {
            const fragmentShaderId = id + "-fs";
            const element = document.getElementById(fragmentShaderId);
            if (element) {
                return element.text;
            }
            return "precision highp float;void main(){gl_FragColor=vec4(1, 0, 0, 1);}";
        }

        const getVertexShaderSource = (id) => {
            const vertexShaderId = id + "-vs";
            const element = document.getElementById(vertexShaderId);
            if (element) {
                return element.text;
            }
            return "attribute vec2 V;void main(){gl_Position=vec4(V,0,1);}";
        }
        for (const shader in shaders) {
            if (index++ < imageShaderIndex) {
                const textureInitializer = shaders[shader].texture || defaultTextureInitializer;
                context.buffers[shader] = glHandle.newDoubleBuffer(() => {
                    textureInitializer(glHandle.gl, context);
                });
            }
            const program = glHandle.wrapProgram(shader, initProgram(shader, getVertexShaderSource(shader), getFragmentShaderSource(shader)), "V", context.buffers[shader]);
            const uniformSetters = (shaders[shader].uniforms) ||  ({});
            var extraUniforms = Object.keys(uniformSetters);
            for (const spec of program.uniformSpecs) {
                if(!uniformSetters[spec.name]) {
                    console.error("No configuration for uniform \"" + spec.name + "\" defined in shader \"" + shader + "\"");
                }
                extraUniforms = extraUniforms.filter(name => name !== spec.name);
            }
            if (extraUniforms.length !== 0) {
                console.warn("Extra uniforms configured for shader \"" + shader + "\", which are not present in the shader code " + "- might have been removed by GLSL compiler if not used: " + extraUniforms.join(", "));
            }
            const uniforms = program.uniformSpecs.map(spec => ({ location: spec.location, setter: uniformSetters[spec.name] }));
            renderers.push(new Renderer(glHandle, context, program, uniforms));
        }
        const animate = () => {
            if (context.maybeResize() && onResize) {
                onResize(context.width, context.height, context);
            }
            if (onBeforeFrame) {
                onBeforeFrame(context);
            }
            for (const renderer of renderers) {
                renderer.render();
            }
            if (onAfterFrame) {
                onAfterFrame(context);
            }
            requestAnimationFrame(animate);
        }
        const start = () => {
            context.resize();
            if (onInit) {
                onInit(context);
            }
            if (onResize) {
                onResize(context.width, context.height, context);
            }
            requestAnimationFrame(animate);
        }
        if(document.readyState === "loading"){
            document.addEventListener("load", start);
        } else {
            start();
        }
        return context;
    } catch (error) {
        console.error(error.message);
    }
}
