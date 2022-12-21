import React, { useState } from "react";
import { Button, Col, Container, Form, Row, Stack } from "react-bootstrap";
import { useAlertFallback } from "./components/alert";
import InfoContextHolder from "./components/holder";
import ApiProvider from "./components/context";
import useFetch from "./components/fetch";

export * from "./components/alert";
export { InfoContextHolder, ApiProvider };

const TEST_URL = "https://unpkg.com/browse/react/";

function API() {
    const [address, setAddress] = useState(TEST_URL);
    const { success, warning } = useAlertFallback();
    const { setUrl } = useFetch(TEST_URL, { method: "GET", mode: "cors" });

    return (
        <div className="position-fixed" style={{ width: 350 }}>
          <Container>
            <Row style={{ marginTop: 10 }}>
              <Col sm>
                <Stack gap={2} direction="horizontal">
                  <Form.Control className="me-auto" value={address} onChange={event => setAddress(event.target.value)} />
                  <Button variant="outline-primary" onClick={() => setUrl(address)}>Fetch</Button>
                </Stack>
              </Col>
            </Row>
            <Row style={{ marginTop: 10 }} className="justify-content-between">
              <Col sm className="text-center">
                <Button variant="outline-success" onClick={() => success("Nice! it is a success message")}>
                    Toast Success
                </Button>
              </Col>
              <Col sm className="text-center">
                <Button variant="outline-warning" onClick={() => warning("Op... it is a warning message")}>
                    Toast Warning
                </Button>
              </Col>
            </Row>
            <Row style={{ marginTop: 10 }} className="justify-content-between">
                <Col sm className="text-center">
                    <Button variant="outline-success" onClick={() => success("Nice! it is a success message", { category: "modal" })}>
                        Modal Success
                    </Button>
                </Col>
                <Col sm className="text-center">
                    <Button variant="outline-warning" onClick={() => warning("Op... it is a warning message", { category: "modal" })}>
                        Modal Warning
                    </Button>
                </Col>
            </Row>
            <Row style={{ marginTop: 10 }} className="justify-content-center">
              <Col sm className="text-center">
                <Button variant="outline-success" onClick={() => success("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec mollis enim eros, sit amet ultrices sapien fermentum ut. Praesent rutrum accumsan augue feugiat scelerisque. Curabitur imperdiet blandit nisl id mollis. Suspendisse nec convallis sem, eget dictum orci. Suspendisse rutrum metus nisi, eu ultrices odio pretium a. Aenean sit amet est ut tortor viverra suscipit. Nullam ex diam, rutrum id semper ac, ullamcorper at diam. Donec vel arcu nisi. Mauris faucibus magna ac nulla ornare gravida. Nulla facilisi. Morbi at nulla et mi tincidunt ultricies. Suspendisse consequat sit amet arcu ac egestas. In posuere tellus sit amet imperdiet bibendum. Maecenas vestibulum dapibus hendrerit. In hac habitasse platea dictumst. Nulla sed mi rutrum, feugiat nulla non, lacinia diam.\n" +
                    "\n" +
                    "Etiam malesuada non dui et dapibus. Pellentesque volutpat velit a dapibus sollicitudin. Phasellus aliquet dui ac lectus fermentum vehicula. Quisque aliquet quis tortor eget feugiat. Fusce a nunc nisl. Curabitur bibendum nisl scelerisque urna luctus aliquet. Quisque dui lectus, feugiat nec turpis id, semper feugiat libero. Vestibulum non massa diam. Donec hendrerit a mauris sed venenatis.\n" +
                    "\n" +
                    "Ut congue placerat magna id pellentesque. Duis ornare ut elit quis consectetur. Donec quis convallis neque. Aliquam quis ante vel dolor dignissim consectetur. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Suspendisse at massa placerat, ultricies eros sed, tincidunt dui. Proin luctus suscipit nunc ultricies consectetur. Curabitur rhoncus eu risus pellentesque tincidunt. Aliquam neque elit, mollis tristique semper eget, mattis sollicitudin elit. Maecenas sed risus felis. Quisque id ante in ipsum dictum aliquam. Mauris ipsum dui, ultricies in blandit ac, gravida ac ex.\n" +
                    "\n" +
                    "Donec egestas, sem et dapibus placerat, justo diam rhoncus odio, ac tristique lacus nibh in odio. Vestibulum posuere, tellus at ultrices viverra, sapien odio sollicitudin mauris, eget elementum orci nunc sed magna. Etiam luctus ex nec ligula pulvinar egestas. Sed pharetra porta eros vel efficitur. Nulla tristique cursus ligula, quis consectetur velit. Ut commodo, massa et malesuada porta, sem est hendrerit est, ac tincidunt odio nisl in tellus. Donec nulla diam, ullamcorper id dictum hendrerit, ultrices nec nulla.\n" +
                    "\n" +
                    "Curabitur malesuada ipsum ex, quis tempor est feugiat finibus. Praesent mollis lorem nec augue luctus, et porta nibh tincidunt. Praesent convallis, purus sed tincidunt ullamcorper, nunc velit pretium ex, quis finibus risus nibh non sapien. Aliquam suscipit ante ut sagittis iaculis. Nunc lacinia quis sem vitae laoreet. Vestibulum scelerisque lacus eget massa cursus, a hendrerit lectus auctor. Pellentesque dictum ante posuere metus aliquam hendrerit. Ut efficitur condimentum turpis eget tincidunt.", { category: "modal" })}>
                    Long Text
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
    )
}

export default API;
