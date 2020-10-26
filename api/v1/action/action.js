const { actions } = require('./../../../app');

// update action
const update = (req, res) => {
    const {id, status} = req.body;
    actions.setActionStatus(id, status).then((docref) => {
        res.send({status: "success", id: docref.id});
    });    
}

// fetch actions by userId
const fetchByUser = (req, res) => {
    console.log(req.params.user, ' AT the inter')
    actions.getPendingActionsByUser(req.params.user).then((actions) => {
        res.send(actions)
    });    
}

module.exports = { 
    update,
    fetchByUser,
}
