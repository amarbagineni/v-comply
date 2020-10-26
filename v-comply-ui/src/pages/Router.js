import * as React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Home from './Home/Home';
import User from './User/User';
import Workflows from './Workflows/Workflows';
import Vendors from './Vendors/Vendors';
import DefaultLayout from "../default-layout/default-layout";

const Router = () => (
    <>
    <DefaultLayout>
        <Switch>
            <Route exact path="/" render={() => (
                <Redirect to="/home"></Redirect>
            )} />
            <Route exact path="/home" component={Home} />
            <Route path="/users" component={User} />
            <Route path="/vendors" component={Vendors} />
            <Route path="/workflows" component={Workflows} />
        </Switch>
    </DefaultLayout>
    </>
);

export default Router;
