const { actions } = require('./../../../app');

// update action
const update = (req, res) => {
    const {id, status, action} = req.body;
    actions.setActionStatus(id, status, action).then((docref) => {
        res.send({status: "success", id: docref.id});
    });    
}

// fetch actions by userId
const fetchByUser = (req, res) => {
    actions.getPendingActionsByUser(req.params.user).then((actions) => {
        res.send(actions)
    });    
}

module.exports = { 
    update,
    fetchByUser,
}
