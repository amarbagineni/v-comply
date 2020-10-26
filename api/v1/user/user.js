const { users } = require('./../../../app');

// add users
const add = (req, res) => {
    const {name, role} = req.user;
    users.addUser(name, role).then((docref) => {
        res.send({status: "success", id: docref.id});
    });    
}

// remove user
const remove = (req, res) => {
    const {id} = req.user;
    users.removeUser(id).then((id) => {
        res.send({message: "Added removed success"})
    });    
}

// remove user
const fetch = (req, res) => {
    users.getUsersByRole(['staff']).then((users) => {
        res.send(users)
    });    
}

module.exports = { 
    add,
    remove,
    fetch
}
