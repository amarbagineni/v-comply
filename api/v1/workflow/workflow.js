const { workflowSchemas } = require('../../../app');

// add users
const add = (req, res) => {
    workflowSchemas.addWorkflowSchemaToDB(req.body).then((docref) => {
        res.json({status: 'success', id: docref.id});
    }).catch((err) => {
        res.err({status: 'error', err: err});
    });
}

// remove workflows
const remove = (req, res) => {
    const {name} = req.body;
    workflowSchemas.removeWorkFlowSchemaFromDB(name).then(() => {
        res.send({message: "remove Successful"})
    });    
}

// fetch workflows
const fetch = (req, res) => {
    workflowSchemas.getAllWorkFlowSchemas().then((schemas) => {
        res.json(schemas);
    });
}

// fetch workflows
const fetchByName = (req, res) => {
    workflowSchemas.getWorkFlowSchemasByName(req.params.name).then((schemas) => {
        res.json(schemas);
    });
}


module.exports = {
    add,
    remove,
    fetch,
    fetchByName,
}
