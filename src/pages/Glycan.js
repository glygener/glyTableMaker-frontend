import React, { useReducer, useState, useEffect } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { Feedback, FormLabel } from "../components/FormControls";
import moleculeExamples from "../data/moleculeExamples";
import ExampleSequenceControl from "../components/ExampleSequenceControl";
import Container from "@mui/material/Container";
import { Card } from "react-bootstrap";
import { PageHeading } from "../components/FormControls";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import GlycoGlyph from "../components/GlycoGlyph";
import { Loading } from "../components/Loading";
import { getAuthorizationHeader, postJson } from "../utils/api";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { axiosError } from "../utils/axiosError";
import Composition from "../components/Composition";

const Glycan = (props) => {

    const [searchParams] = useSearchParams();
    let type = searchParams ? searchParams.get("type") : "sequence";

    useEffect(props.authCheckAgent, []);

    const [glycoGlyphDialog, setGlycoGlyphDialog] = useState(type ? type === "draw" : false);
    const [compositionDialog, setCompositionDialog] = useState(type ? type === "composition" : false);
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [readOnly, setReadOnly] = useState(false);
    const [error, setError] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
    );
    const navigate = useNavigate();

    const initialState = {
        glytoucanId: "",
        sequence: "",
        sequenceType: "GLYCOCT",
        glycoGlyphName: "",
        composition: ""
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, initialState);

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if ((name === "sequence" || name === "glytoucanId") && newValue.trim().length > 1) {
            setValidate(false);
        }
        setUserSelection({ [name]: newValue });
    };

    const handleClassSelect = e => {
        const select = e.target.options[e.target.selectedIndex].value;
        setUserSelection({ sequenceType: select });
    };

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        if (type === "sequence") {
            if (userSelection.sequence === "" || userSelection.sequence.trim().length < 1) {
                setValidate(true);
                setError(true);
                return;
            }
        } else if (type === "glytoucan") {
            if (userSelection.glytoucanId === "" || userSelection.glytoucanId.trim().length < 1) {
                setValidate(true);
                setError(true);
                return;
            }
        } else if (type === "composition") {
            if (userSelection.composition === "" || userSelection.compostion.trim().length < 1) {
              setValidate(true);
              setError(true);
              return;
          }
        }

        const glycan = { 
            sequence: userSelection.sequence,
            glytoucanID: userSelection.glytoucanId,
            composition: userSelection.composition,
            format: userSelection.sequenceType}
        
        addGlycan(glycan);
        e.preventDefault();
    };

    const handleBackToDraw = e => {
        setError(false);
        setTextAlertInput({"show": false, id: ""});
        setGlycoGlyphDialog(true);
    }

    function handleSequenceChange(inputSequence) {    
        setTextAlertInput({"show": false, id: ""});
        setUserSelection({ sequence: inputSequence, sequenceType: "GLYCOCT" });
    }

    function addGlycan(glycan) {
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        postJson ("api/data/addglycan", glycan, getAuthorizationHeader()).then ( (data) => {
            addGlycanSuccess(data);
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                if (type === "draw") {
                    setGlycoGlyphDialog(false);
                }
                setError(true);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );
    }

    function addGlycanSuccess() {
        setShowLoading(false);
        navigate("/glycans");
    }

    return (
        <>
        <GlycoGlyph
            show={glycoGlyphDialog}
            glySequenceChange={handleSequenceChange}
            glySequence={userSelection.sequence}
            setInputValue={setUserSelection}
            inputValue={userSelection}
            title={"GlycoGlyph"}
            setOpen={(input) => {
                setGlycoGlyphDialog(input)
            }}
            submit={(input) => addGlycan(input)}
        />
         <Composition
            show={compositionDialog}
            composition={userSelection.composition}
            setInputValue={setUserSelection}
            inputValue={userSelection}
            title={"Glycan Composition"}
            setOpen={(input) => {
                setCompositionDialog(input)
            }}
            submit={(input) => addGlycan(input)}
        />
        <Container maxWidth="xl">
            <div className="page-container">
             <PageHeading title="Add Glycan" subTitle="Please provide the information for the new glycan." />
            <Card>
            <Card.Body>
            <div className="mt-4 mb-4">
            <TextAlert alertInput={textAlertInput}/>
            <DialogAlert
                alertInput={alertDialogInput}
                setOpen={input => {
                    setAlertDialogInput({ show: input });
                }}
                />
            <Form>
                { type === "glytoucan" && (
                <Form.Group
                  as={Row}
                  controlId="glytoucanId"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="GlyTouCan ID" className="required-asterik"/>
                    <Form.Control
                      type="text"
                      name="glytoucanId"
                      placeholder="Enter GlyTouCan ID of the glycan"
                      value={userSelection.glytoucanId}
                      onChange={handleChange}
                      minLength={8}
                      maxLength={10}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Please enter a valid Glytoucan ID" />
                    </Col>
                </Form.Group>) }
                {/* Sequence Type */}
                { type === "sequence" && (
                <Form.Group
                  as={Row}
                  controlId="sequenceType"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Sequence Format" className="required-asterik" />
                    <Form.Control
                      as="select"
                      name="sequenceType"
                      placeholder="GlycoCT (first dropdown by default)"
                      value={userSelection.sequenceType}
                      onChange={handleClassSelect}
                      disabled={readOnly}
                      required={true}
                    >
                      <option value="GLYCOCT">GlycoCT</option>
                      <option value="GWS">GlycoWorkbench</option>
                      <option value="WURCS">WURCS</option>
                      
                    </Form.Control>
                    <Feedback message="Sequence Format is required"></Feedback>
                  </Col>
                </Form.Group> )}
                {/* Sequence */}
                { type === "sequence" && (
                <Form.Group
                  as={Row}
                  controlId="sequence"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9}>
                    <FormLabel label="Sequence" className="required-asterik" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="sequence"
                      placeholder="Enter glycan sequence"
                      value={userSelection.sequence}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                      maxLength={5000}
                      readOnly={readOnly}
                    />
                    <Feedback message="Please enter Valid Sequence" />
                    <Row>
                      <Col className="gg-align-left">
                        {userSelection.sequenceType && !readOnly && (
                          <ExampleSequenceControl
                            setInputValue={id => {
                              setUserSelection({ sequence: id });
                            }}
                            inputValue={moleculeExamples.glycan[userSelection.sequenceType].examples}
                          />
                        )}
                      </Col>
                      <Col className="text-right text-muted">
                        {userSelection.sequence && userSelection.sequence.length > 0
                          ? userSelection.sequence.length
                          : "0"}
                        /5000
                      </Col>
                    </Row>
                </Col>
                </Form.Group>)}
                {/* type === "draw" && (
                    <Form.Group
                    as={Row}
                    className="gg-align-center mb-3"
                  >
                    <Col xs="auto">
                        <Button
                          className="gg-btn-blue"
                          onClick={() => setGlycoGlyphDialog(true)}>
                          Draw with Glyco Glyph
                        </Button>
                    </Col>
                </Form.Group>
                )*/}  
            </Form>
            <Loading show={showLoading}></Loading>
            </div>

            <div className="text-center mb-2">
                <Link to="/glycans">
                <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Glycans</Button>
                </Link>
                { (type !== "draw" || !error) &&
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleSubmit}>
                Submit
                </Button> }
                { type === "draw" && error && 
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" onClick={handleBackToDraw}>
                Draw Glycan
                </Button> }
            </div>
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
}

export default Glycan;