import { useEffect, useMemo, useReducer, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getAuthorizationHeader, getJson, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import { Container } from "@mui/material";
import { Feedback, FormLabel, PageHeading } from "../components/FormControls";
import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import TextAlert from "../components/TextAlert";
import DialogAlert from "../components/DialogAlert";
import { Loading } from "../components/Loading";
import Table from "../components/Table";

const Collection = (props) => {
    const [searchParams] = useSearchParams();
    let collectionId = searchParams.get("collectionId");
    const navigate = useNavigate();
    const [error, setError] = useState(false);
    const [validate, setValidate] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    const [alertDialogInput, setAlertDialogInput] = useReducer(
        (state, newState) => ({ ...state, ...newState }),
        { show: false, id: "" }
    );

    const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
    );

    const collection = {
        name: "",
        description: "",
        glycans: []
    };

    const reducer = (state, newState) => ({ ...state, ...newState });
    const [userSelection, setUserSelection] = useReducer(reducer, collection);

    const [showGlycanTable, setShowGlycanTable] = useState(false);
    const [selectedGlycans, setSelectedGlycans] = useState([]);
    const [initialSelection, setInitialSelection] = useState({});

    useEffect(props.authCheckAgent, []);

    useEffect(() => {
        if (collectionId) 
            fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionId]);

    const fetchData = async () => {
        setShowLoading(true);
        getJson ("api/data/getcollection/" + collectionId, getAuthorizationHeader())
            .then ((json) => {
                setUserSelection (json.data.data);
                if (json.data.data.glycans) {
                    setSelectedGlycans (json.data.data.glycans);
                    let initialIds = {};
                    json.data.data.glycans.forEach ((glycan) => {
                        initialIds [glycan.glycanId] = true;
                    });
                    setInitialSelection(initialIds);
                }
                setShowLoading(false);
        }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setShowLoading(false);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                setShowLoading(false);
                axiosError(error, null, setAlertDialogInput);
            }
        });
    }

    const handleChange = e => {
        const name = e.target.name;
        const newValue = e.target.value;
        setTextAlertInput({"show": false, id: ""});
    
        if (name === "name" && newValue && newValue.trim().length > 1) {
            setValidate(false);
            setError(false);
        }
        setUserSelection({ [name]: newValue });
    };

    const handleSubmit = e => {
        props.authCheckAgent();
        setValidate(false);
        if (userSelection.name === "" || userSelection.name.trim().length < 1) {
            setValidate(true);
            setError(true);
            return;
        }

        const collection = { 
            name: userSelection.name,
            description: userSelection.description
        }
        
        setShowLoading(true);
        setError(false);
        props.authCheckAgent();

        postJson ("api/data/addcollection", collection, getAuthorizationHeader()).then ( (data) => {
            setShowLoading(false);
            navigate("/collections");
          }).catch (function(error) {
            if (error && error.response && error.response.data) {
                setError(true);
                setTextAlertInput ({"show": true, "message": error.response.data["message"]});
            } else {
                axiosError(error, null, setAlertDialogInput);
            }
            setShowLoading(false);
          }
        );
        e.preventDefault();
    }

    const columns = useMemo(
        () => [
          {
            accessorKey: 'glytoucanID', 
            header: 'GlyTouCan ID',
            size: 50,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            size: 100,
            enableColumnFilter: false,
          },
          {
            accessorKey: 'cartoon',
            header: 'Image',
            size: 150,
            columnDefType: 'display',
            Cell: ({ cell }) => <img src={"data:image/png;base64, " + cell.getValue()} alt="cartoon" />,
          },
          {
            accessorKey: 'mass', 
            header: 'Mass',
            size: 80,
            Cell: ({ cell }) => cell.getValue() ? Number(cell.getValue().toFixed(2)).toLocaleString('en-US') : null,
          }
        ],
        [],
      );

    const listGlycans = () => {
        return (
          <>
            <Table
                authCheckAgent={props.authCheckAgent}
                ws="api/data/getglycans"
                columns={columns}
                enableRowActions={false}
                setAlertDialogInput={setAlertDialogInput}
                initialSortColumn="dateCreated"
                rowSelection={true}
                rowSelectionChange={handleGlycanSelectionChange}
                rowId="glycanId"
                selected = {initialSelection}
            />
            </>
        );
    };

    const handleGlycanSelect = () => {
        console.log("selected glycans" + selectedGlycans);
        setUserSelection({"glycans": selectedGlycans});
        let initialIds = {};
        selectedGlycans.forEach ((glycan) => {
            initialIds [glycan.glycanId] = true;
        });
        setInitialSelection(initialIds);
        setShowGlycanTable(false);
    }

    const handleGlycanSelectionChange = (selected) => {
        /*let glycans = [];
        let alreadySelectedGlycans = selectedGlycans;
        if (alreadySelectedGlycans !== null && alreadySelectedGlycans.length > 0) {
            alreadySelectedGlycans.forEach ((glycan) => {
                glycans.push(glycan);
            });
        }
        if (selected !== null && selected.length > 0) {
            selected.forEach ((glycan) => {
                glycans.push(glycan);
            });
        }
        setSelectedGlycans(glycans);*/
        setSelectedGlycans(selected);
    }

    return (
        <>
        <Container maxWidth="xl">
            <div className="page-container">
             <PageHeading title={collectionId ? "Edit Collection" : "Add Collection"} subTitle="Please provide the information for the new collection." />
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
            {showGlycanTable && (
                <Modal
                    size="xl"
                    aria-labelledby="contained-modal-title-vcenter"
                    centered
                    show={showGlycanTable}
                    onHide={() => setShowGlycanTable(false)}
                >
                    <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter" className="gg-blue">
                        Select Glycans:
                    </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{listGlycans()}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" className="mt-2 gg-ml-20"
                            onClick={(()=> setShowGlycanTable(false))}>Close</Button>
                        <Button variant="primary" className="gg-btn-blue mt-2 gg-ml-20"
                            onClick={handleGlycanSelect}>Add Selected Glycans</Button>
                     </Modal.Footer>
                </Modal>
            )}
            <Form>
                <Form.Group
                  as={Row}
                  controlId="name"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Name" className="required-asterik" />
                    <Form.Control
                      type="text"
                      name="name"
                      placeholder="Enter name of the collection"
                      value={userSelection.name}
                      onChange={handleChange}
                      required={true}
                      isInvalid={validate}
                    />
                    <Feedback message="Name is required"></Feedback>
                    </Col>
                </Form.Group>
                
                {/* Description */}
                <Form.Group
                  as={Row}
                  controlId="description"
                  className="gg-align-center mb-3"
                >
                  <Col xs={12} lg={9} style={{ textAlign: "left" }}>
                    <FormLabel label="Description" />
                    <Form.Control
                      as="textarea"
                      rows="5"
                      name="description"
                      placeholder="Enter description"
                      value={userSelection.description}
                      onChange={handleChange}
                      required={false}
                      isInvalid={validate}
                      maxLength={5000}
                    />
                </Col>
                </Form.Group>
            </Form>
            <Loading show={showLoading}></Loading>
            </div>

            <div className="text-center mb-2">
                <Link to="/collections">
                    <Button className="gg-btn-outline mt-2 gg-mr-20 btn-to-lower">Back to Collections</Button>
                </Link>
                <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                    disabled={error} onClick={handleSubmit}>
                    Save
                </Button> 
            </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
            <h5 class="gg-blue" style={{textAlign: "left"}}>
                Glycans in the Collection</h5>
                <Row>
                    <Col md={12} style={{ textAlign: "right" }}>
                    <div className="text-right mb-3">
                        <Button variant="contained" className="gg-btn-blue mt-2 gg-ml-20" 
                         disabled={error} onClick={()=> setShowGlycanTable(true)}>
                         Add/Remove Glycan
                        </Button>
                        </div>
                    </Col>
                    </Row>
                
                <Table 
                    authCheckAgent={props.authCheckAgent}
                    rowId = "glycanId"
                    data = {userSelection.glycans}
                    columns={columns}
                    enableRowActions={false}
                    setAlertDialogInput={setAlertDialogInput}
                    initialSortColumn="dateCreated"
                />
            </Card.Body>
          </Card>
        </div>
      </Container>
        </>
    );
};

export default Collection;