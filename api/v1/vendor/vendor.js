const { vendors } = require('./../../../app');

// add vendor
const add = (req, res) => {
    // we deconstruct to make sure the fields we are looking for exisat - before entering to the db
    const {id, name, operation, status, workflow, approvals} = req.body;
    const activeLevel = 1;
    vendors.add({id, name, operation, status, workflow, approvals, activeLevel}).then((docref) => {
        res.send({status: "success", id: docref.id});
    });
}

// all vendors 
const fetchAll = (req, res) => {
    vendors.allVendors().then((vendors) => {
        res.send(vendors);
    });
}

// vendor by the status of the workflow
const fetchByStatus = (req, res) => {
    vendors.vendorsByStatus(req.params.status).then((users) => {
        res.send(users);
    });    
}

module.exports = { 
    add,
    fetchByStatus,
    fetchAll,
}
