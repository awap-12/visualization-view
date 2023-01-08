import React, {useCallback, useEffect, useLayoutEffect, useRef, useState} from "react";
import { GlHandle, Renderer as ShaderRenderer } from "../utils/webgl";
import useResizer from "../resizer";

function parseRenderData(shaders, vertexShader, fragmentShader, glHandle, context) {
    const imageShaderIndex = Object.keys(shaders).length - 1;
    const rendererList = [], bufferList = {};

    let index = 0;

    function initProgram(id) {
        try {
            return glHandle.initProgram(id, vertexShader, fragmentShader);
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
                textureInitializer(glHandle.gl, context);
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
        rendererList.push(new ShaderRenderer(glHandle, context, program, uniforms));
    }

    return [rendererList, bufferList];
}

function Renderer({
    shaders,
    vertexShader = `
        attribute vec2 V;
        void main() {
            gl_Position = vec4(V, 0, 1);
        }
    `,
    fragmentShader = `
        precision highp float;
        void main() {
            gl_FragColor = vec4(1, 0, 0, 1);
        }
    `,
    onLoad,
    style: moreStyle = {}
} = {}) {
    const [renderers, setRenderers] = useState(null);
    const [glHandle, setGlHandle] = useState(null);
    const [buffers, setBuffers] = useState(null);
    const [size, setSize] = useState(null);
    const animateRef = useRef(null);
    const canvasRef = useRef();
    const dimensions = useResizer(canvasRef);

    const texture = useCallback((loc, tex) => {
        glHandle.bindTexture(loc, tex);
    }, [glHandle]);

    const initHalfFloatRGBATexture = useCallback((width, height) => {
        glHandle.texImage2DHalfFloatRGBA(width ?? size.height, height ?? size.height);
    }, [glHandle, size]);

    const animate = useCallback(() => {
        if (!!renderers)
            for (const renderer of renderers)
                renderer.render();

        console.log("rendering...", renderers);

        animateRef.current = requestAnimationFrame(animate);
    }, [renderers]);

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
        const { width, height } = dimensions || canvasRef.current.getBoundingClientRect();
        setSize({ width, height });

        const currentGlHandle = new GlHandle(canvasRef.current, {
            antialias: false,
            depth: false,
            alpha: false
        });

        const [renderer, buffer] = parseRenderData(shaders, vertexShader, fragmentShader, currentGlHandle, {
            gl: currentGlHandle.gl,
            width: width,
            height: height,
            texture,
            initHalfFloatRGBATexture,
        });

        setGlHandle(currentGlHandle);
        setRenderers(renderer);
        setBuffers(buffer);
    }, [shaders, vertexShader, fragmentShader, dimensions, texture, initHalfFloatRGBATexture]);

    return (
        <canvas ref={canvasRef}
                style={{ ...moreStyle }}
                width={size?.width ?? 0}
                height={size?.height ?? 0}
                onLoad={() => console.log("22222")} />
    );
}

export default Renderer;
