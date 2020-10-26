import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  InputGroup,
  FormControl,
  Dropdown,
  Button,
  Alert,
} from "react-bootstrap";
import QueryService from "../../services/queryService";
import "./vendors.scss";

const vendorOperations = [
  {
    id: "onboarding",
    label: "On-Boarding",
  },
  {
    id: "payment",
    label: "Payment",
  },
];

function Vendors() {
  return (
    <div>
      <center>
        <h3>Vendors</h3>
        <AddVendorForm></AddVendorForm>
        <div style={{ clear: "both" }}></div>
      </center>
      <hr />
      <ControlledTabs></ControlledTabs>
    </div>
  );
}

function ControlledTabs() {
  const [key, setKey] = useState("active");

  return (
    <Tabs
      id="controlled-tab-vendors"
      activeKey={key}
      onSelect={(k) => setKey(k)}
    >
      <Tab eventKey="active" title="Active">
        <ViewVendors type="active"></ViewVendors>
      </Tab>
      <Tab eventKey="terminated" title="Terminated">
        <ViewVendors type="terminated"></ViewVendors>
      </Tab>
      <Tab eventKey="executed" title="Executed">
        <ViewVendors type="executed"></ViewVendors>
      </Tab>
    </Tabs>
  );
}

function AddVendorForm() {
  const [operationOnForm, setOperationOnForm] = useState(vendorOperations[1]);
  const [workflowOnForm, setWorkflowOnForm] = useState("");
  const [vendorNameOnForm, setVendorNameOnForm] = useState("");
  const [workflows, setWorkflows] = useState([]);

  useEffect(() => {
    getAllWorkflows();
  }, []);

  const getAllWorkflows = () => {
    const queries = new QueryService();
    queries
      .runQuery("workflow/fetch", "GET")
      .then((result) => {
        setWorkflows(result.data);
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
  };

  const resetSelection = () => {
    setWorkflowOnForm("");
    setVendorNameOnForm("");
  };

  const AddVendor = () => {
    if (vendorNameOnForm === "" || workflowOnForm === "") {
      alert("please complete the form");
      return;
    }

    const getWorkflowByName = (workflow) => {
      const queries = new QueryService();
      return queries.runQuery(`workflow/fetch/${workflow}`, "GET");
    };

    const getVendorId = () => {
      console.log(vendorNameOnForm);
        return `${vendorNameOnForm.replace(/ /g, '_')}_${Date.now()}`
    }

    getWorkflowByName(workflowOnForm).then((result) => {
      let approvals = result.data[0].workflow.workflow.map((level) => {
        return {
          ...level,
          isLevelApproved: null,
          users: level.users.map((user) => {
            return { ...user, hasApproved: null };
          }),
        };
      });
      const payload = {
        id: getVendorId(),
        name: vendorNameOnForm,
        operation: operationOnForm.id,
        status: "active",
        workflow: workflowOnForm,
        approvals,
      };

      const queries = new QueryService();
      queries
        .runQuery("vendors/add", "POST", payload)
        .then((result) => {
          console.log("query ran successfully", result);
          resetSelection();
          window.location.href = "/vendors";
        })
        .catch((err) => {
          console.log("query failed to run ", err);
        });
    });
  };

  return (
    <div className="add-vendor-form">
      <InputGroup className="vendor-name">
        <FormControl
          onChange={(event) => setVendorNameOnForm(event.target.value)}
          placeholder="Vendor Name"
          aria-label="vendorName"
          aria-describedby="basic-addon1"
        />
      </InputGroup>
      <Dropdown>
        <Dropdown.Toggle variant="info" id="dropdown-basic">
          {operationOnForm.label}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {vendorOperations.map((item) => {
            return (
              <Dropdown.Item
                key={item.id}
                onClick={() => setOperationOnForm(item)}
              >
                {item.label}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <Dropdown>
        <Dropdown.Toggle variant="info" id="dropdown-basic">
          {workflowOnForm === "" ? "Select Workflow" : workflowOnForm}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {workflows.map((item, index) => {
            return (
              <Dropdown.Item
                key={`${item.workflow.name}${index}`}
                onClick={() => setWorkflowOnForm(item.workflow.name)}
              >
                {item.workflow.name}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
      <Button variant="dark" className="add-vendor" onClick={() => AddVendor()}>
        Add Vendor
      </Button>
    </div>
  );
}

function ViewVendors(props) {
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    getVendors();
  }, []);

  const getVendors = () => {
    const queries = new QueryService();
    queries
      .runQuery(`vendors/fetch/${props.type}`, "GET")
      .then((result) => {
        console.log(result.data, ' IN THE REEEEEEE')
        setVendors(result.data);
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
  };

  const getApprovalLevelView = (type, levelUsers) => {
    console.log(levelUsers);
      const levelSymbol = type === 'sequential' ? '->' : ( type === 'anyOne' ? 'or' : 'and');
    return levelUsers.map((user, idx) => {
        return <div className="user-item">
            {idx > 0 && <div className="level-symbol">{levelSymbol}</div>}
            <div className={`user ${user.hasApproved ? 'success' : (user.hasApproved === null ? 'pending' : 'failed')}`}>
        {user.name}
    </div>
        </div>;
    })
  };

  return (
    <div className="schema-container">
      {vendors.map((vendor, index) => {
        console.log(vendor, " IS THE VENDOR ");
        return (
          <div key={index} className="schema vendors">
            <br />
            <h5 className="schema-name">
              {vendor.name} - <small>{vendor.operation}</small>
            </h5>
            <ul className="list-group">
              {vendor.approvals.map((level, idx) => 
                {return <Alert key={idx} variant={level.isLevelApproved ? 'success' : ( level.isLevelApproved === null ? 'secondary' : 'danger')}>
                  <div className="level-name">Level {level.level}</div>
                    <div className="users-list">
                      {getApprovalLevelView(
                        level.type,
                        level.users
                      )}
                    </div>
                </Alert>}
              )}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export default Vendors;
