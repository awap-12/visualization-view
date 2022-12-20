import React, { useState } from "react";
import {Button, Col, Container, Form, Row, Stack} from "react-bootstrap";
import ApiProvider, { ApiContext } from "./components/context";
import useFallback from "./components/fallback";
import useFetch from "./components/fetch";
import Holder from "./components/holder";

export { ApiProvider, ApiContext, useFallback, Holder };

const TEST_URL = "https://unpkg.com/browse/react/";

function API() {
    const [address, setAddress] = useState(TEST_URL);
    const { success, warning } = useFallback();
    const { setUrl } = useFetch(TEST_URL, { method: "GET", mode: "cors" });

    return (
        <div className="position-fixed" style={{ zIndex: 99999 }}>
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
                <Button variant="outline-success" onClick={() => success("Success")}>
                  Success
                </Button>
              </Col>
              <Col sm className="text-center">
                <Button variant="outline-warning" onClick={() => warning("Warning")}>
                  Warning
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
    )
}

export default API;
