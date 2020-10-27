import React, { useEffect, useState } from "react";
import { Tabs, Alert, Tab, Button } from "react-bootstrap";
import QueryService from "../../services/queryService";
import "./users.scss";

function User() {
  return (
    <div>
      <center>
        <h3>Users</h3>
        <div style={{ clear: "both" }}></div>
      </center>
      <hr />
      <ControlledTabs></ControlledTabs>
    </div>
  );
}

function ControlledTabs() {
  const [key, setKey] = useState("user2");
  const [users, setUsers] = useState(null);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = () => {
    const queries = new QueryService();
    queries
      .runQuery("user/fetch", "GET")
      .then((result) => {
        setUsers(result.data);
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
  };

  return (
    users && (
      <Tabs
        id="controlled-tab-users"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
        {users.map((user) => {
          return (
            <Tab
              key={`user${user.id}`}
              eventKey={`user${user.id}`}
              title={user.name}
            >
              <ViewUserData user={user}></ViewUserData>
            </Tab>
          );
        })}
      </Tabs>
    )
  );
}

const ViewUserData = (props) => {
  const [actions, setActions] = useState([]);

  useEffect(() => {
    fetchPendingActions();
  }, []);

  const fetchPendingActions = () => {
    const queries = new QueryService();
    queries
      .runQuery(`action/fetch/${props.user.id}`, "GET")
      .then((result) => {
        setActions(result.data);
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
  };

  const setApprovalStatus = (id, status, action) => {
    const queries = new QueryService();
    queries
      .runQuery(`action/update`, "POST", {id, status, action})
      .then((result) => {
        fetchPendingActions();
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
  }

  return (
    <div className="user-approval-list">
      {actions.length === 0 && <div className="no-approval-message">No Approvals in pending for you.</div>}
      {actions.map((action, idx) => {
        const actionId = action.id;
        action = action.action;
        return (
          <Alert key={actionId} variant="dark">
            <div className="user-action">
              <div className="approval-text">
                {action.operation} approval for {action.vendorId.split("_")[0]}
              </div>
              <div className="approval-options">
                <Button variant="success" size="sm" onClick={() => setApprovalStatus(actionId, 'completed', action)}>
                  Approve
                </Button>
                <Button variant="danger" size="sm" onClick={() => setApprovalStatus(actionId, 'rejected', action)}>
                  Reject
                </Button>
              </div>
            </div>
          </Alert>
        );
      })}
    </div>
  );
};

export default User;
