import React, { useRef } from "react";
import { Route } from "react-router";
import { Link } from "react-router-dom";
import { MdBurstMode, MdRadioButtonChecked, MdSpaceDashboard, MdNotificationsActive } from "react-icons/md";
import { Button, Container, Col, Row, Renderer, useAlertFallback } from ".";

import styles from "./styles/debug.module.css";

import * as uniform from "./fixtures/uniform";
import * as multipass from "./fixtures/multipass";
import * as fitColor from "./fixtures/button"

const DEBUG_ROOT = "/artifact/debug";

function Alert() {
    const { success, warning } = useAlertFallback();

    return (
        <>
          <div className={styles.container}>
            <Container>
              <Row>
                <Col md={6}>
                  <Button onClick={() => success("Nice! it is a success message")}>
                    Toast Success
                  </Button>
                </Col>
                <Col md={6}>
                  <Button onClick={() => warning("Op... it is a warning message")}>
                    Toast Warning
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
          <br />
          <div className={styles.container}>
            <Container>
              <Row>
                <Col md={6}>
                  <Button onClick={() => success("Nice! it is a success message", { category: "modal" })}>
                    Modal Success
                  </Button>
                </Col>
                <Col md={6}>
                  <Button onClick={() => warning("Op... it is a warning message", { category: "modal" })}>
                    Modal Warning
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
          <br />
          <div className={styles.container}>
            <Container>
              <Row>
                <Col>
                  <Button onClick={() => {
                    success("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mollis enim eros, sit amet ultrices sapien fermentum ut. Praesent rutrum accumsan augue feugiat scelerisque. Curabitur imperdiet blandit nisl id mollis. Suspendisse nec convallis sem, eget dictum orci. Suspendisse rutrum metus nisi, eu ultrices odio pretium a. Aenean sit amet est ut tortor viverra suscipit. Nullam ex diam, rutrum id semper ac, ullamcorper at diam. Donec vel arcu nisi. Mauris faucibus magna ac nulla ornare gravida. Nulla facilisi. Morbi at nulla et mi tincidunt ultricies. Suspendisse consequat sit amet arcu ac egestas. In posuere tellus sit amet imperdiet bibendum. Maecenas vestibulum dapibus hendrerit. In hac habitasse platea dictumst. Nulla sed mi rutrum, feugiat nulla non, lacinia diam.\n" +
                        "\n" +
                        "Etiam malesuada non dui et dapibus. Pellentesque volutpat velit a dapibus sollicitudin. Phasellus aliquet dui ac lectus fermentum vehicula. Quisque aliquet quis tortor eget feugiat. Fusce a nunc nisl. Curabitur bibendum nisl scelerisque urna luctus aliquet. Quisque dui lectus, feugiat nec turpis id, semper feugiat libero. Vestibulum non massa diam. Donec hendrerit a mauris sed venenatis.\n" +
                        "\n" +
                        "Ut congue placerat magna id pellentesque. Duis ornare ut elit quis consectetur. Donec quis convallis neque. Aliquam quis ante vel dolor dignissim consectetur. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Suspendisse at massa placerat, ultricies eros sed, tincidunt dui. Proin luctus suscipit nunc ultricies consectetur. Curabitur rhoncus eu risus pellentesque tincidunt. Aliquam neque elit, mollis tristique semper eget, mattis sollicitudin elit. Maecenas sed risus felis. Quisque id ante in ipsum dictum aliquam. Mauris ipsum dui, ultricies in blandit ac, gravida ac ex.\n" +
                        "\n" +
                        "Donec egestas, sem et dapibus placerat, justo diam rhoncus odio, ac tristique lacus nibh in odio. Vestibulum posuere, tellus at ultrices viverra, sapien odio sollicitudin mauris, eget elementum orci nunc sed magna. Etiam luctus ex nec ligula pulvinar egestas. Sed pharetra porta eros vel efficitur. Nulla tristique cursus ligula, quis consectetur velit. Ut commodo, massa et malesuada porta, sem est hendrerit est, ac tincidunt odio nisl in tellus. Donec nulla diam, ullamcorper id dictum hendrerit, ultrices nec nulla.\n" +
                        "\n" +
                        "Curabitur malesuada ipsum ex, quis tempor est feugiat finibus. Praesent mollis lorem nec augue luctus, et porta nibh tincidunt. Praesent convallis, purus sed tincidunt ullamcorper, nunc velit pretium ex, quis finibus risus nibh non sapien. Aliquam suscipit ante ut sagittis iaculis. Nunc lacinia quis sem vitae laoreet. Vestibulum scelerisque lacus eget massa cursus, a hendrerit lectus auctor. Pellentesque dictum ante posuere metus aliquam hendrerit. Ut efficitur condimentum turpis eget tincidunt.", { category: "modal" })
                    }}>
                    Long Text
                  </Button>
                </Col>
              </Row>
            </Container>
          </div>
        </>
    );
}

function Multipass() {
    const pointer = useRef({ x: 0, y: 0 });
    const frame = useRef(0);
    const canvasRef = useRef();

    function handleMove(event) {
        if (event.target === canvasRef.current)
            [pointer.current.x, pointer.current.y] = [event.clientX, event.clientY];
    }

    return (
        <div onPointerMove={handleMove}>
          <Renderer
              ref={canvasRef}
              shaders={{
                  buffer: {
                      uniforms: {
                          iResolution: (gl, loc, ctx) => gl.uniform2f(loc, ctx.width, ctx.height),
                          iTime:       (gl, loc, ctx) => gl.uniform1f(loc, performance.now() / 1000),
                          iFrame:      (gl, loc, ctx) => gl.uniform1i(loc, frame.current),
                          iMouse:      (gl, loc, ctx) => gl.uniform2f(loc, pointer.current.x, pointer.current.y),
                          iChannel0:   (gl, loc, ctx) => ctx.texture(loc, ctx.buffers.buffer)
                      },
                      texture: (gl, ctx) => {
                          ctx.initHalfFloatRGBATexture();
                          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                      }
                  },
                  image: {
                      uniforms: {
                          iChannel0:   (gl, loc, ctx) => ctx.texture(loc, ctx.buffers.buffer)
                      }
                  }
              }}
              fragmentShaders={{
                  buffer: multipass.buffer,
                  image: multipass.image
              }}
              onAfterFrame={() => {
                  frame.current = frame.current + 1;
              }}
              style={{
                  width: "100%",
                  height: "65vh",
                  minHeight: "300px"
              }} />
        </div>
    );
}

export const alert = {
    link: (
        <Link className={styles.link} to={`${DEBUG_ROOT}/alert`}>
          <MdNotificationsActive className={styles.icon} />
          <span>Alert</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/alert" element={
          <>
            <div className={styles.header}>
              <h1>Alert</h1>
            </div>
            <div className={styles.body}>
              <Alert />
            </div>
          </>
        } />
    )
};

export const canvas = {
    link: (
        <Link className={styles.link} to={`${DEBUG_ROOT}/canvas`}>
          <MdBurstMode className={styles.icon} />
          <span>Canvas</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/canvas" element={
          <>
            <div className={styles.header}>
              <h1>Canvas</h1>
            </div>
            <div className={styles.body}>
              <div className={styles.container}>
                <Renderer
                    shaders={{
                        image: {
                            uniforms: {
                                iResolution: (gl, loc, ctx) => gl.uniform2f(loc, ctx.width, ctx.height),
                                iTime:       (gl, loc, ctx) => gl.uniform1f(loc, performance.now() / 1000)
                            }
                        }
                    }}
                    fragmentShaders={{
                        image: uniform.image
                    }}
                    style={{
                        width: "100%",
                        height: "65vh",
                        minHeight: "300px"
                    }} />
              </div>
              <br />
              <div className={styles.container}>
                <Multipass />
              </div>
            </div>
          </>
        } />
    )
}

export const button = {
    link: (
        <Link className={styles.link} to={`${DEBUG_ROOT}/button`}>
          <MdRadioButtonChecked className={styles.icon} />
          <span>Button</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path={"/button"} element={
          <>
            <div className={styles.header}>
              <h1>Button</h1>
            </div>
            <div className={styles.body}>
              <div className={styles.container}>
                <Renderer
                    shaders={{
                        image: {
                            uniforms: {
                                iResolution: (gl, loc, ctx) => gl.uniform2f(loc, ctx.width, ctx.height),
                                iHue:        (gl, loc, ctx) => gl.uniform1f(loc, 0)
                            }
                        }
                    }}
                    fragmentShaders={fitColor.image}
                    version={100}
                    style={{
                        width: "100%",
                        height: "65vh",
                        minHeight: "300px"
                    }}/>
              </div>
              <div className={styles.container}>
                <Button>Default</Button>
              </div>
              <br />
              <div className={styles.container}>
                <Button outline>Default</Button>
              </div>
            </div>
          </>
        } />
    )
};

export const layout = {
    link: (
        <Link className={styles.link} to={`${DEBUG_ROOT}/layout`}>
          <MdSpaceDashboard className={styles.icon} />
          <span>Layout</span>
        </Link>
    ),
    route: key => (
        <Route key={key} path="/layout" element={
          <>
            <div className={styles.header}>
              <h1>Layout</h1>
            </div>
            <div className={styles.body}>
              <div className={styles.container}>
                <Container fluid>
                  <Row>
                    <Col className={styles.column}>1 of 2</Col>
                    <Col className={styles.column}>2 of 2</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column}>1 of 3</Col>
                    <Col className={styles.column}>2 of 3</Col>
                    <Col className={styles.column}>3 of 3</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row>
                    {Array(12).fill(1).map((value, index) => (
                        <Col key={index} className={styles.column} style={{ fontSize: "small" }} md={value}>
                          {`md=${value}`}
                        </Col>
                    ))}
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} md={8}>md=8</Col>
                    <Col className={styles.column} md={4}>md=4</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} md={4}>md=4</Col>
                    <Col className={styles.column} md={4}>md=4</Col>
                    <Col className={styles.column} md={4}>md=4</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} md={6}>md=6</Col>
                    <Col className={styles.column} md={6}>md=6</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row>
                    <Col className={styles.column} xs={12} md={8}>xs=12 md=8</Col>
                    <Col className={styles.column} xs={6} md={4}>xs=6 md=4</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} xs={6} md={4}>xs=6 md=4</Col>
                    <Col className={styles.column} xs={6} md={4}>xs=6 md=4</Col>
                    <Col className={styles.column} xs={6} md={4}>xs=6 md=4</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} xs={6}>xs=6</Col>
                    <Col className={styles.column} xs={6}>xs=6</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row align="start" style={{ height: "75px" }}>
                    <Col className={styles.column}>1 of 3</Col>
                    <Col className={styles.column}>2 of 3</Col>
                    <Col className={styles.column}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row align="center" style={{ height: "75px" }}>
                    <Col className={styles.column}>1 of 3</Col>
                    <Col className={styles.column}>2 of 3</Col>
                    <Col className={styles.column}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row align="end" style={{ height: "75px" }}>
                    <Col className={styles.column}>1 of 3</Col>
                    <Col className={styles.column}>2 of 3</Col>
                    <Col className={styles.column}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row align="stretch" style={{ height: "75px" }}>
                    <Col className={styles.column}>1 of 3</Col>
                    <Col className={styles.column}>2 of 3</Col>
                    <Col className={styles.column}>3 of 3</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row justify="start">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row justify="center">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row justify="end">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row justify="between">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row justify="around">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row justify="initial">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row justify="inherit">
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row align="center" justify="center" direction="row" style={{ height: "300px" }}>
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row align="center" justify="center" direction="row-reverse" style={{ height: "300px" }}>
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row align="center" justify="center" direction="column" style={{ height: "300px" }}>
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                  <br />
                  <Row align="center" justify="center" direction="column-reverse" style={{ height: "300px" }}>
                    <Col className={styles.column} xs={3}>1 of 3</Col>
                    <Col className={styles.column} xs={3}>2 of 3</Col>
                    <Col className={styles.column} xs={3}>3 of 3</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row>
                    <Col className={styles.column} md={4}>md=4</Col>
                    <Col className={styles.column} md={4} offset={{ md: 4 }}>md=4 offset-md=4</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} md={3} offset={{ md: 3 }}>md=3 offset-md=3</Col>
                    <Col className={styles.column} md={3} offset={{ md: 3 }}>md=3 offset-md=3</Col>
                  </Row>
                  <br />
                  <Row>
                    <Col className={styles.column} md={6} offset={{ md: 3 }}>md=6 offset-md=3</Col>
                  </Row>
                </Container>
              </div>
              <br />
              <div className={styles.container}>
                <Container fluid>
                  <Row>
                    <Col className={styles.column} sm={3}>Level 1: sm=3</Col>
                    <Col className={styles.column} sm={9}>
                      <Row>
                        <Col className={styles.column} xs={8} sm={6}>Level 2: xs=8 sm=6</Col>
                        <Col className={styles.column} xs={4} sm={6}>Level 2: xs=4 sm=6</Col>
                      </Row>
                    </Col>
                  </Row>
                </Container>
              </div>
            </div>
          </>
        } />
    )
}
