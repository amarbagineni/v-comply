import React from "react";
import { Navbar, Nav } from "react-bootstrap";

function DefaultLayout(props) {
  return (
    <>
    <Navbar bg="dark" variant="dark">
      <Navbar.Brand href="/">V-Comply Approvals</Navbar.Brand>
      <Nav className="mr-auto">
        <Nav.Link href="/Vendors">Vendors</Nav.Link>
        <Nav.Link href="/workflows">Workflows</Nav.Link>
        <Nav.Link href="/users">Users</Nav.Link>
      </Nav>
    </Navbar>
    <div>{props.children}</div>
    <br/><br/>
    <hr></hr>
    <footer>This is footer</footer>
  </>
  );
}

export default DefaultLayout;
