/* eslint-disable react/prop-types */
import React, { useState, useReducer, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./Login.css";
import Container from "@mui/material/Container";
import { GoogleLogin } from '@react-oauth/google';
import { postFormDataToCallBack } from "../utils/api";

const Login = props => {
  useEffect(() => {
    if (props.authCheckAgent) {
      props.authCheckAgent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [validated, setValidated] = useState(false);
  const [showErrorSummary, setShowErrorSummary] = useState(false);
  const [pageErrorMessage, setPageErrorMessage] = useState("");
  const [viewPassword, setViewPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userDetails = {
    userName: "",
    password: ""
  };

  const [credentials, setCredentials] = useReducer((state, newState) => ({ ...state, ...newState }), userDetails);

  const handleChange = e => {
    const name = e.currentTarget.name;
    const value = e.currentTarget.value;
    setCredentials({ [name]: value });
  };

  return (
    <>
      <Container maxWidth="md" className="card-page-container">
        <div className="card-page-sm">
        {showErrorSummary === true && (
          <div>
          {pageErrorMessage}
         </div>)}
          <Form noValidate validated={validated} onSubmit={e => handleSubmit(e)}>
          <h2 className="page-heading">Login</h2>
            <Form.Group as={Row} controlId="username">
              <Col>
                <Form.Control
                  type="text"
                  name="userName"
                  placeholder=" "
                  value={credentials.userName}
                  onChange={handleChange}
                  required
                  autoFocus
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Username or Email address</Form.Label>
                {/* <Feedback message="Please enter username." /> */}
              </Col>
            </Form.Group>

            <Form.Group as={Row} controlId="password" className="mt-4">
              <Col>
                <Form.Control
                  type={viewPassword ? "text" : "password"}
                  name="password"
                  placeholder=" "
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  autoComplete="password"
                  className={"custom-text-fields"}
                />
                <Form.Label className={"label required-asterik"}>Password</Form.Label>
                {credentials.password ? (
                  <FontAwesomeIcon
                    className={"password-visibility"}
                    key={"view"}
                    icon={["far", viewPassword ? "eye" : "eye-slash"]}
                    size="xs"
                    alt="Password Visibility Icon"
                    title="view password"
                    onClick={() => setViewPassword(!viewPassword)}
                  />   
                ) : (
                  ""
                )}
                {/* <Feedback message="Please enter password." /> */}
              </Col>
            </Form.Group>
            <br />
            
            <div className="text-center">
              <Button type="submit" className="gg-btn-blue">
                Log In
              </Button>
             
              <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">OR</p>
          </div>
              <GoogleLogin
            onSuccess={credentialResponse => {
              console.log(credentialResponse);
            }}
          
            onError={() => {
              console.log('Login Failed');
            }}
          
          />
           <hr />
              <div>
                <Link to="/signup">New user?</Link>
              </div>
              <div>
                <Link to="/forgotPassword">Forgot password?</Link>
              </div>
              <div>
                <Link to="/forgotUsername">Forgot username?</Link>
              </div>
            </div>
          </Form>
        </div>
      </Container>
    </>
  );

  function handleSubmit(e) {
    e.preventDefault();
    setValidated(true);
    if (e.currentTarget.checkValidity() === true) {
      const loginData = { username: credentials.userName, password: credentials.password };
      postFormDataToCallBack("api/account/authenticate", loginData, {}, logInSuccess, logInError);
    }
  }

  function logInSuccess(response) {
    var token = response.data;
    var base = process.env.REACT_APP_BASENAME;
    window.localStorage.setItem(base ? base + "_token" : "token", token);
    window.localStorage.setItem(base ? base + "_loggedinuser" : "loggedinuser", credentials.userName);
    props.updateLogin(true);

    var redirectedFrom = "";
    if (location.state && location.state.redirectedFrom) {
      redirectedFrom = location.state.redirectedFrom;
    }

    if (redirectedFrom) {
      navigate(redirectedFrom);
    } else {
      navigate("/");
    }
  }

  function logInError() {
    setPageErrorMessage("Invalid credentials. Please try again.");
    setShowErrorSummary(true);
  }
};

export { Login };