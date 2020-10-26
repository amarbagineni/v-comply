import React, { useEffect, useState } from "react";
import { Tabs, Tab, Dropdown, ListGroup, Button, Table } from "react-bootstrap";
import QueryService from "../../services/queryService";
import "./workflows.scss";

const nodeTypes = [
  { id: "sequential", label: "Sequential" },
  { id: "roundRobin", label: "Round Robin" },
  { id: "anyOne", label: "Any One" },
];

// const dbusers = [
//   { id: "abc1", name: "User1", role: "staff" },
//   { id: "abc2", name: "User2", role: "staff" },
//   { id: "abc3", name: "User3", role: "staff" },
//   { id: "abc4", name: "User4", role: "staff" },
// ];

function Workflows() {
  return (
    <div>
      <center>
        <h3>Workflows</h3>
      </center>
      <ControlledTabs></ControlledTabs>
    </div>
  );
}

function ControlledTabs() {
  const [key, setKey] = useState("all");

  return (
    <Tabs
      id="controlled-tab-workflows"
      activeKey={key}
      onSelect={(k) => setKey(k)}
    >
      <Tab eventKey="all" title="All">
        <ViewAll></ViewAll>
      </Tab>
      <Tab eventKey="create" title="Create">
        <CreateForm></CreateForm>
      </Tab>
    </Tabs>
  );
}

function ViewAll() {
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    getAllSchemas();
  }, []);

  const getAllSchemas = () => {
    const queries = new QueryService();
    queries
      .runQuery("workflow/fetch", "GET")
      .then((result) => {
        setSchemas(result.data);
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
  }

  const getUserRepresentation = (type, users) => {
    users = users.map(user => `"${user.name}"`)
    if (type === "sequential") {
      return users.join(" -> ");
    } else if (type === "anyOne") {
      return users.join(" or ");
    } else {
      return users.join(" and ");
    }
  };

  const removeSchema = (name) => {
    const queries = new QueryService();
    queries
      .runQuery("workflow/remove", "POST", {name})
      .then((result) => {
        alert("Schema removed successfully ", result.data);
        getAllSchemas();
      })
      .catch((err) => {
        console.log("query failed to run - remove schema", err);
      });
  }

  return (
    <div className="schema-container">
      {schemas.map((schema, index) => {
        const workflow = schema.workflow;
        return (
          <div key={index} className="schema">
            <br />
            <div className="name-bar">
              <h5 className="schema-name">{workflow.name}</h5>
              <Button variant="link" className="remove-schema" onClick={() => removeSchema(workflow.name)}>
                Remove
              </Button>
            </div>

            <ul className="list-group">
              {workflow.workflow.map((level, levelIndex) => {
                // a single level and its details
                return (
                  <li key={level.id} className="list-group-item">
                    <div className="level-name">Level {level.level}</div>
                    <div className="users-list">
                      {getUserRepresentation(
                        level.type,
                        level.users
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function CreateForm() {
  const [type, setType] = useState(nodeTypes[0]);
  const [users, setUser] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [dbUsers, setDbUsers] = useState([]);

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const setUsers = (user) => {
    const newUsers = [...users];
    users.indexOf(user) === -1 && newUsers.push(user);
    setUser(newUsers);
  };

  const fetchAllUsers = () => {
    const queries = new QueryService();
    queries
      .runQuery("user/fetch", "GET")
      .then((result) => {
        setDbUsers(result.data);
      })
      .catch((err) => {
        console.log("query failed to run ", err);
      });
}

  const removeuser = (user) => {
    const updated = [...users].filter((item) => {
      return item.id !== user.id;
    });
    setUser(updated);
  };

  const addToWorkflow = () => {
    if (users.length === 0) {
      alert("please select some users");
      return;
    }
    const id = type.id + workflows.length + 1;

    // update the next id of the current last node
    const updated = workflows.map((workflow) => {
      if (workflow.nextId === null) {
        return { ...workflow, nextId: id };
      }
      return workflow;
    });
    // push the new node with a 'null' nextId
    setWorkflows([
      ...updated,
      {
        id,
        type: type,
        users,
        level: workflows.length + 1,
      },
    ]);
  };

  const resetSelection = () => {
    setType(nodeTypes[0]);
    setUser([]);
  };

  const getWorkflowNodeById = (id) => {
    return workflows.filter((workflow) => workflow.id === id)[0];
  };

  const removeLevel = (id) => {
    let levelToRemove = getWorkflowNodeById(id);
    // move the next level's numbers to up
    let updated = workflows.map((workflow) => {
      let update = { ...workflow };
      // upadate the level labels
      if (workflow.level >= levelToRemove.level) {
        update = { ...update, level: workflow.level - 1 };
      }
      return update;
    });
    // remove item
    setWorkflows([...updated].filter((workflow) => workflow.id !== id));
  };

  const moveLevelUp = (id) => {
    let currentNode = getWorkflowNodeById(id);
    const updated = [...workflows];
    // first item -- do nothing
    if (currentNode.level === 1 || workflows.length === 1) {
      return;
    } else {
      // swap between previous node and current node
      const currentPos = [...workflows]
        .map((workflow) => workflow.id)
        .indexOf(id);
      const temp = updated[currentPos - 1];

      updated[currentPos - 1] = {
        ...updated[currentPos],
        level: updated[currentPos]["level"] - 1,
      };
      updated[currentPos] = { ...temp, level: temp["level"] + 1 };
    }
    setWorkflows(updated);
  };

  const moveLevelDown = (id) => {
    let currentNode = workflows.filter((workflow) => workflow.id === id)[0];
    const updated = [...workflows];

    // last item -- do nothing
    if (currentNode.level === workflows.length || workflows.length === 1) {
      return;
    } else {
      // swap between previous node and current node
      const currentPos = [...workflows]
        .map((workflow) => workflow.id)
        .indexOf(id);
      const temp = updated[currentPos + 1];
      updated[currentPos + 1] = {
        ...updated[currentPos],
        level: updated[currentPos]["level"] + 1,
      };
      updated[currentPos] = { ...temp, level: temp["level"] - 1 };
    }
    setWorkflows(updated);
  };

  const getUserRepresentation = (type, users) => {
    users = users.map(user => `"${user}"`)
    if (type === "sequential") {
      return users.join(" -> ");
    } else if (type === "anyOne") {
      return users.join(" or ");
    } else {
      return users.join(" and ");
    }
  };

  const saveWorkflow = () => {
    const payload = workflows.map((workflow) => {
      return {
        id: workflow.id,
        level: workflow.level,
        type: workflow.type.id,
        users: workflow.users.map((user) => user),
      };
    });
    let name = prompt("Please enter a name for this schema");
    if (name && name.trim().length > 0) {
      const queries = new QueryService();
      queries
        .runQuery("workflow/add", "POST", { name, workflow: payload })
        .then((result) => {
          console.log("query ran successfully", result);
          resetSelection();
          setWorkflows([]);
          alert("Saved Schema " + name);
          window.location.href = "/workflows";
        })
        .catch((err) => {
          console.log("query failed to run ", err);
        });
    } else {
      alert("aborted saving - invalid name");
    }
  };

  return (
    <div className="workflow-form">
      <div className="workflow-type">
        <div className="label">Type</div>
        <Dropdown>
          <Dropdown.Toggle variant="info" id="dropdown-basic">
            {type && type.label}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {nodeTypes.map((item) => {
              return (
                <Dropdown.Item key={item.id} onClick={() => setType(item)}>
                  {item.label}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <br />

      {/* USERS */}
      <div className="users">
        <div className="user-dropdown">
          <div className="label">Users</div>
          <Dropdown>
            <Dropdown.Toggle variant="info" id="dropdown-basic">
              Select User
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {dbUsers.map((item) => {
                return (
                  <Dropdown.Item key={item.id} onClick={() => setUsers(item)}>
                    {item.name}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <ListGroup>
          {users.map((user, index) => {
            return (
              <ListGroup.Item key={user.id}>
                <div className="user-list-item">
                  <div className="name">
                    {type.id === "sequential" && <span>({index + 1})</span>}{" "}
                    {user.name}
                  </div>
                  <div className="user-remove" onClick={() => removeuser(user)}>
                    X
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>

      <br />
      <div className="button-panel">
        <Button variant="link" onClick={resetSelection}>
          Reset
        </Button>
        <Button variant="dark" onClick={() => addToWorkflow()}>
          Add
        </Button>
      </div>
      <div style={{ clear: "both" }}></div>
      <hr />

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Level</th>
            <th>Approvals</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workflows.length > 0 ? (
            workflows.map((workflow, index) => {
              const { level, type, users, id } = workflow;
              return (
                <tr key={index}>
                  <td>Level {level}</td>
                  <td>
                    {getUserRepresentation(
                      type.id,
                      users.map((user) => user.name)
                    )}
                  </td>
                  <td className="actions-col">
                    <div className="directions">
                      <div>
                        <Button variant="link" onClick={() => moveLevelUp(id)}>
                          Move Up
                        </Button>
                      </div>
                      <div>
                        <Button
                          variant="link"
                          onClick={() => moveLevelDown(id)}
                        >
                          Move Down
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Button variant="link" onClick={() => removeLevel(id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4">
                <center>No Nodes added yet</center>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {workflows.length > 1 && (
        <small>
          ** Yes, a better experience would be to have a draggable/sortable
          table, with a simple swipe for delete. But, for demonstration purpose
          of the list action, adding move up and down individually
        </small>
      )}
      <br />
      <div className="button-panel">
        <Button variant="link">Cancel</Button>
        <Button variant="dark" onClick={() => saveWorkflow()}>
          Save
        </Button>
      </div>
      <div style={{ clear: "both" }}></div>
      <hr />
    </div>
  );
}

export default Workflows;
