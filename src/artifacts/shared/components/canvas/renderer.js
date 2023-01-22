import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { GlHandle } from "../utils/webgl";
import useResizer from "../resizer";

import styles from "shared/styles/canvas/renderer.module.css";

const defaultVertexShader = `
    attribute vec2 V;

    void main() {
        gl_Position = vec4(V, 0, 1);
    }
`;

const defaultVertexShader300 = `#version 300 es
    in vec2 V;

    void main(){
        gl_Position = vec4(V, 0, 1);
    }
`;

const defaultFragmentShader = `
    precision highp float;

    void main() {
        gl_FragColor = vec4(1, 0, 1, 1);
    }
`;

const defaultFragmentShader300 = `#version 300 es
    precision highp float;

    out vec4 fragColor;

    void main() {
        fragColor = vec4(1, 0, 1, 1);
    }
`;

class ShaderRenderer {
    constructor(glHandle, context, program, uniforms) {
        this.program = program;
        this.gl = glHandle.gl;
        this.fillUniforms = () => {
            for (const uniform of uniforms)
                uniform.setter(this.gl, uniform.location, context);
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


function parseRenderData(shaders, vertexShaders, fragmentShaders, glHandle, context) {
    const imageShaderIndex = Object.keys(shaders).length - 1;
    const rendererList = [], bufferList = {};

    let index = 0;

    function initProgram(id) {
        try {
            return glHandle.initProgram(id,
                vertexShaders[id] ?? vertexShaders,
                fragmentShaders[id] ?? fragmentShaders
            );
        } catch (err) { console.log(err.message) }
    }

    for (const shader in shaders) {
        if (index++ < imageShaderIndex) {
            const textureInitializer = shaders[shader].texture || ((gl, ctx) => {
                ctx.initHalfFloatRGBATexture();
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            });
            bufferList[shader] = glHandle.createDoubleBuffer(() => {
                textureInitializer(glHandle.gl, { ...context, buffers: bufferList });
            });
        }
        const program = glHandle.wrapProgram(shader, initProgram(shader), "V", bufferList[shader]);
        const uniformSetters = shaders[shader].uniforms || {};
        let extraUniforms = Object.keys(uniformSetters);
        for (const spec of program.uniformSpecs) {
            if(!uniformSetters[spec.name])
                console.error(`No configuration for uniform "${spec.name}" defined in shader ${shader}"`);
            extraUniforms = extraUniforms.filter(name => name !== spec.name);
        }
        if (extraUniforms.length !== 0)
            console.warn(`Extra uniforms configured for shader "${shader}", which are not present in the shader code - might have been removed by GLSL compiler if not used: ${extraUniforms.join(", ")}`);
        const uniforms = program.uniformSpecs.map(spec => ({ location: spec.location, setter: uniformSetters[spec.name] }));
        rendererList.push(new ShaderRenderer(glHandle, { ...context, buffers: bufferList }, program, uniforms));
    }

    return [rendererList, bufferList];
}

const Renderer = forwardRef(function Renderer({
    shaders = {},
    version = 300,
    vertexShaders = version > 100 ? defaultVertexShader300 : defaultVertexShader,
    fragmentShaders = version > 100 ? defaultFragmentShader300 : defaultFragmentShader,
    onLoad,
    onBeforeFrame,
    onAfterFrame,
    style: moreStyle = {}
} = {}, ref) {
    const [renderers, setRenderers] = useState(null);
    const [glHandle, setGlHandle] = useState(null);
    const [size, setSize] = useState(null);
    const animateRef = useRef(null);
    const canvasRef = useRef();
    const dimensions = useResizer(canvasRef);

    const animate = useCallback(() => {
        if (!!onBeforeFrame && !!glHandle)
            onBeforeFrame();

        if (!!renderers)
            for (const renderer of renderers)
                renderer.render();

        if (!!onAfterFrame && !!glHandle)
            onAfterFrame();
        animateRef.current = requestAnimationFrame(animate);
    }, [onBeforeFrame, onAfterFrame, glHandle, renderers]);

    useEffect(() => {
        animateRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animateRef.current);
    }, [animate]);

    useEffect(() => {
        const { width, height } = dimensions || canvasRef.current.getBoundingClientRect();
        setSize({ width, height });
    }, [dimensions]);

    useEffect(() => {
        if (!!glHandle && !! renderers) {
            glHandle.updateViewportSize();
            for (const renderer of renderers)
                renderer.program.init(size.width, size.height);
        }
    }, [glHandle, renderers, size]);

    useEffect(() => {
        let currentWidth = size?.width, currentHeight = size?.height, currentGlHandle = glHandle;

        if (!currentWidth || !currentHeight) {
            const { width, height } = dimensions || canvasRef.current.getBoundingClientRect();
            setSize({ width, height });
        }

        if (!currentGlHandle) {
            currentGlHandle = new GlHandle(canvasRef.current, {
                antialias: false,
                depth: false,
                alpha: false
            });
            setGlHandle(currentGlHandle);
        }

        if (!!currentWidth && !!currentHeight && !!currentGlHandle) {
            const [renderers, buffers] = parseRenderData(shaders, vertexShaders, fragmentShaders, currentGlHandle, {
                gl: currentGlHandle.gl,
                width: currentWidth,
                height: currentHeight,
                texture: (loc, tex) => {
                    currentGlHandle.bindTexture(loc, tex);
                },
                initHalfFloatRGBATexture: (width = currentWidth, height = currentHeight) => {
                    currentGlHandle.texImage2DHalfFloatRGBA(width, height);
                },
            });

            setRenderers(renderers);

            if (!!onLoad)
                onLoad({
                    gl: currentGlHandle.gl,
                    width: currentWidth,
                    height: currentHeight,
                    buffers: buffers,
                });
        }
    }, [shaders, vertexShaders, fragmentShaders, onLoad, dimensions, glHandle, size]);

    return (
        <div ref={ref} style={{ ...moreStyle }}>
          <canvas ref={canvasRef}
                  className={styles.canvas}
                  width={size?.width ?? 0}
                  height={size?.height ?? 0} />
        </div>
    );
});

export default Renderer;
