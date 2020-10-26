import React, { useEffect, useState } from "react";
import {
    Tabs,
    Tab,
  } from "react-bootstrap";
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
    }

    return users && <Tabs
        id="controlled-tab-users"
        activeKey={key}
        onSelect={(k) => setKey(k)}
      >
          {users.map(user => {
              return <Tab key={`user${user.id}`} eventKey={`user${user.id}`} title={user.name}>
                  <ViewUserData user={user}></ViewUserData>
              </Tab>
          })}
      </Tabs>;
  }
  
const ViewUserData = (props) => {




    return <div>
        {props.user.id} - {props.user.name}
    </div>
}

export default User;
