import React, { useState, useReducer } from "react";
import { Form, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Feedback, Title } from "../components/FormControls";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Container from "@mui/material/Container";
import { getJson, isValidURL, postJson } from "../utils/api";
import { axiosError } from "../utils/axiosError";
import DialogAlert from "../components/DialogAlert";
import TextAlert from "../components/TextAlert";
import FeedbackWidget from "../components/FeedbackWidget";

const Signup = () => {
  const [userInput, setUserInput] = useReducer((state, newState) => ({ ...state, ...newState }), {
    userName: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    email: "",
    affiliation: "",
    affiliationWebsite: "",
    groupName: "",
    department: ""
  });

  const [validURL, setValidURL] = useState(true);
  const [validated, setValidated] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showEye, setShowEye] = useState(false);
  const [showEye2, setShowEye2] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const [viewConfirmPassword, setViewConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const [alertDialogInput, setAlertDialogInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const [textAlertInput, setTextAlertInput] = useReducer(
    (state, newState) => ({ ...state, ...newState }),
    { show: false, id: "" }
  );

  const handleChange = e => {
    const name = e.target.name;
    const newValue = e.target.value;
    setValidURL(true);
    if (newValue) {
      if (name === "password") setShowEye(true);
      if (name === "confirmPassword") setShowEye2(true);
    }
    setShowError(false);
    setUserInput({ [name]: newValue });
    if (!e.currentTarget.checkValidity()) {
      if (name === "password") setShowEye(false);
      if (name === "confirmPassword") setShowEye2(false);
    }
    if (newValue && newValue.trim().length > 0 && name === "affiliationWebsite") {
      setValidURL(isValidURL(newValue));
    }
  };

  return (
    <>
      <FeedbackWidget setAlertDialogInput={setAlertDialogInput}/>
      <Container maxWidth="lg" className="card-page-container">
        <div className="card-page-md">
          <Title title={"Sign Up"} />
          {showError && (
            <div>
                {pageErrorMessage}
            </div>
          )}
          <TextAlert alertInput={textAlertInput}/>
          <DialogAlert
              alertInput={alertDialogInput}
              setOpen={input => {
                setAlertDialogInput({ show: input });
              }}
            />
          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="firstname">
                  <Form.Control
                    type="text"
                    placeholder=" "
                    name="firstName"
                    onChange={handleChange}
                    value={userInput.firstName}
                    required
                    maxLength={100}
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label required-asterik"}>First name</Form.Label>
                  <Feedback className={"feedback"} message="Please enter first name." />
                  {/* {userInput.firstName && userInput.firstName.length > 100 ? (
                    <Feedback message="Entry is too long - max length is 100." maxLength={true} />
                  ) : (
                  <Feedback message="Please enter first name." />
                  )} */}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="lastname">
                  <Form.Control
                    type="text"
                    placeholder=" "
                    name="lastName"
                    onChange={handleChange}
                    value={userInput.lastName}
                    required
                    maxLength={100}
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label required-asterik"}>Last name</Form.Label>
                  <Feedback className={"feedback"} message="Please enter last name." />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="validationuserName">
                  <Form.Control
                    type="text"
                    name="userName"
                    placeholder=" "
                    onChange={handleChange}
                    onBlur={() => checkUserName()}
                    value={userInput.username}
                    minLength={5}
                    maxLength={20}
                    required
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label required-asterik"}>Username</Form.Label>
                  <Feedback className={"feedback"} message="Username should be between 5 and 20 characters." />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="validaitonEmail">
                  <Form.Control
                    type="email"
                    placeholder=" "
                    name="email"
                    value={userInput.emailAddress}
                    onChange={handleChange}
                    required
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label required-asterik"}>Email</Form.Label>
                  <Feedback className={"feedback"} message="Please enter a valid email" />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group as={Row} controlId="newpassword">
                  <Col>
                    <Form.Control
                      type={viewPassword ? "text" : "password"}
                      placeholder=" "
                      name="password"
                      value={userInput.password}
                      onChange={handleChange}
                      pattern="^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{5,30}$"
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Password</Form.Label>
                    <Feedback className={"feedback"} message="Password must contain at least:" />
                    <Feedback className="feedback ml-2" message={`* 5 - 30 characters in length,`} />
                    <Feedback className="feedback ml-2" message={`* at least 1 uppercase character,`} />
                    <Feedback className="feedback ml-2" message={`* at least 1 lowercase character,`} />
                    <Feedback className="feedback ml-2" message={`* at least 1 numeric value,`} />
                    <Feedback className="feedback ml-2" message={`* at least 1 special character (!@#$%^&).`} />
                    {showEye && (
                      <FontAwesomeIcon
                        className={"password-visibility"}
                        key={"view"}
                        icon={["far", viewPassword ? "eye" : "eye-slash"]}
                        size="xs"
                        alt="Password Visibility Icon"
                        title="password"
                        onClick={() => setViewPassword(!viewPassword)}
                      />
                    )}
                  </Col>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group as={Row} controlId="confirmpassword">
                  <Col>
                    <Form.Control
                      type={viewConfirmPassword ? "text" : "password"}
                      placeholder=" "
                      name="confirmPassword"
                      value={userInput.confirmPassword}
                      onChange={handleChange}
                      required
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label required-asterik"}>Confirm password</Form.Label>
                    <Feedback className={"feedback"} message="Please confirm password." />

                    {showEye2 && (
                      <FontAwesomeIcon
                        className={"password-visibility"}
                        key={"view"}
                        icon={["far", viewConfirmPassword ? "eye" : "eye-slash"]}
                        alt="Password Visibility Icon"
                        size="xs"
                        title="confirm password"
                        onClick={() => setViewConfirmPassword(!viewConfirmPassword)}
                      />
                    )}
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="formGroupName">
                  <Form.Control
                    type="text"
                    placeholder=" "
                    name="groupName"
                    value={userInput.groupName}
                    onChange={handleChange}
                    maxLength={250}
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label"}>Group name</Form.Label>
                </Form.Group>
              </Col>
              </Row>
              <Row>
              <Col md={12}>
                <Form.Group as={Row} controlId="formDepartment">
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder=" "
                      name="department"
                      value={userInput.department}
                      onChange={handleChange}
                      maxLength={250}
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label"}>Department</Form.Label>
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group controlId="formAffiliation">
                  <Form.Control
                    type="text"
                    placeholder=" "
                    name="affiliation"
                    value={userInput.affiliation}
                    onChange={handleChange}
                    maxLength={250}
                    className={"custom-text-fields"}
                  />
                  <Form.Label className={"label"}>Organization/Institution</Form.Label>
                </Form.Group>
              </Col>
              </Row><Row>
              <Col md={12}>
                <Form.Group as={Row} controlId="formAffiliationWebsite">
                  <Col>
                    <Form.Control
                      type="text"
                      placeholder=" "
                      name="affiliationWebsite"
                      value={userInput.affiliationWebsite}
                      onChange={handleChange}
                      maxLength={250}
                      isInvalid={!validURL}
                      className={"custom-text-fields"}
                    />
                    <Form.Label className={"label"}>Website</Form.Label>
                    <Feedback className={"feedback"} message="Please enter a valid affiliation website." />
                  </Col>
                </Form.Group>
              </Col>
            </Row>
            {/* <br /> */}
            <div className="text-center mt-4">
              <Button type="submit" disabled={showError} className="gg-btn-blue">
                Sign Up
              </Button>
              <hr />
              <div>
                Already have an account? <Link to="/login">Log In</Link>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function checkUserName() {
    const username = userInput.userName;
    if (username !== "" && username !== null) {
      //wsCall("username", "GET", { username: username }, false, null, checkUsernameSuccess, checkUsernameFailure);
      getJson ("api/account/availableUsername?username=" + username).then()
      .catch(function(error) {
        setShowError(true);
        // check error code to display the appropriate message
        if (error && error.response && error.response.data && error.response.data["code"] === "400") {
            // already exists
            setAlertDialogInput ({"show": true, "id": "duplicateAccount"});
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
    });
    }
  }

  /*function checkUsernameSuccess() {}

  function checkUsernameFailure(response) {
    if (!response.ok) {
      if (response.status === 500) {
        setPageErrorMessage("Internal Server Error - Please try again.");
        setShowErrorSummary(true);
      } else if (response.status === 409) {
        response.json().then(resp => {
          setPageErrorsJson(resp);
          setShowErrorSummary(true);
        });
      }
    }
  }*/

  function handleSubmit(e) {
    setValidated(true);
    setTextAlertInput({show: false, id: ""});

    if (
      userInput.password !== "" &&
      userInput.confirmPassword !== "" &&
      userInput.password !== userInput.confirmPassword
    ) {
      setTextAlertInput ({"show": true, "id" : "", "message": "New and confirm passwords must match."});
    } else if (e.currentTarget.checkValidity()) {
      checkUserName();
      postJson ("api/account/register", userInput, null).then ( (data) => {
            navigate("/verifyToken");
      }).catch(function(error) {

        if (error && error.response && error.response.data && error.response.data["code"] === "400") {
            // duplicate
            setTextAlertInput ({"show": true, "message": error.response.data["message"]});
        } else {
            axiosError(error, null, setAlertDialogInput);
        }
      });
    } else {
        setShowEye(false);
        setShowEye2(false);
    }
    e.preventDefault();
  }

 /* function signUpSuccess() {
    navigate("/verifyToken");
  }

  function signUpFailure(response)  {
      setPageErrorsJson(response.data);
      setShowErrorSummary(true);
  }*/
};

export { Signup };