import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { Row, Col, Button, Table, Modal } from "react-bootstrap";
import { AddGrant } from "./AddGrant";
import { Loading } from "../components/Loading";

const Grants = props => {
  const [showLoading, setShowLoading] = useState(false);
  const [showModal, setShowModal] = useState();

  const getGrantModal = () => {
    return (
      <>
        <Modal
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
          show={showModal}
          onHide={() => {
            setShowModal(false);
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Add Grant</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddGrant
              addGrant={props.addGrant}
              setShowModal={setShowModal}
            />
          </Modal.Body>
          <Modal.Footer></Modal.Footer>
        </Modal>
      </>
    );
  };

  const getGrantTable = () => {
    return (
      <>
        {props.grants &&
          props.grants.map((grant, grantIndex) => {
            return (
              <Table hover style={{ border: "none" }}>
                <tbody style={{ border: "none" }}>
                  <tr style={{ border: "none" }} key={grantIndex}>
                    {props.fromPublicDatasetPage
                      ? grantsPublicTable(grant, grantIndex)
                      : grantsTable(grant, grantIndex)}
                  </tr>
                </tbody>
              </Table>
            );
          })}
      </>
    );
  };

  const grantsTable = (grant, grantIndex) => {
    return (
      <>
        <td key={grantIndex} style={{ border: "none" }}>
          <div>
            <h5>
              <a href={grant.url} target={"_blank"}>
                <strong>{grant.title}</strong>
              </a>
            </h5>
          </div>

          <div>
            <Row>
              <Col md={3}>{grant.fundingOrganization}</Col>
              <Col>{grant.identifier}</Col>
            </Row>
          </div>
        </td>

        <td className="text-right" style={{ border: "none" }}>
          <FontAwesomeIcon
            icon={["far", "trash-alt"]}
            size="lg"
            title="Delete"
            className="caution-color table-btn"
            onClick={() => props.delete(grant.id)}
          />
        </td>
      </>
    );
  };

  const grantsPublicTable = (grant, grantIndex) => {
    return (
      <>
        <div>
          <Row>
            <Col md={3}>
              <a href={grant.url} target={"_blank"}>
                <strong>{grant.title}</strong>
              </a>
            </Col>
          </Row>
        </div>

        <div>
          <Row>
            <Col>{grant.fundingOrganization}-{grant.identifier}</Col>
          </Row>
        </div>
      </>
    );
  };

  return (
    <>
      {!props.fromPublicDatasetPage && (
        <>
          <div className="text-center mt-2 mb-4">
            <Button
              className="gg-btn-blue"
              onClick={() => {
                setShowModal(true);
              }}
            >
              Add Grant
            </Button>
          </div>
          {showModal && getGrantModal()}
        </>
      )}

      {getGrantTable()}

      {showLoading ? <Loading show={showLoading} /> : ""}
    </>
  );
};

Grants.propTypes = {
  deleteWsCall: PropTypes.string,
  fromPublicDatasetPage: PropTypes.bool,
  grants: PropTypes.array,
  delete: PropTypes.func,
  addGrant: PropTypes.func,
};

export { Grants };
