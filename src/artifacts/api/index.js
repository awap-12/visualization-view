import { Button, Col, Container, Row } from "react-bootstrap";
import ApiProvider, { ApiContext } from "./components/context";
import useFallback from "./components/fallback";
import useFetch from "./components/fetch";
import Holder from "./components/holder";

export { ApiProvider, ApiContext, useFallback, Holder };

function API() {
    const { success, warning } = useFallback();
    const { data, error, loading } = useFetch("http://badadress");

    return (
        <div style={{ position: "fixed", zIndex: 99999}}>
          <Container>
            <Row className="justify-content-start">
              <Col md="auto">
                <Button variant="success" onClick={() => success("Success")}>
                    Success
                </Button>
              </Col>
              <Col md="auto">
                <Button variant="warning" onClick={() => warning("Warning")}>
                    Warning
                </Button>
              </Col>
            </Row>
          </Container>
        </div>
    )
}

export default API;
