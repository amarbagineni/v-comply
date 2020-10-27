const firebase = require('firebase');

var firebaseConfig = {
    apiKey: "AIzaSyCsyAoTx4SOBcHToc4BLeiDdErcYiG0fHg",
    authDomain: "vcomply-approvals.firebaseapp.com",
    databaseURL: "https://vcomply-approvals.firebaseio.com",
    projectId: "vcomply-approvals",
    storageBucket: "vcomply-approvals.appspot.com",
    messagingSenderId: "516122955336",
    appId: "1:516122955336:web:db4dbe82391a74a65d927d",
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

// Users
const Users = (userCollection) => {

    this.users = userCollection;

    const getAllUsers = () => {
        return new Promise((resolve, reject) => {
            this.users.get().then((snapshot) => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    docs.push(doc.data());
                })
                resolve(docs);
            });
        });
    }

    const getUsersByRole = (roles) => {
        return new Promise((resolve, reject) => {
            this.users.where('role', 'in', roles).get().then((snapshot) => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    docs.push(doc.data());
                })
                resolve(docs);
            });
        });
    }

    const addUser = (name, role) => {
        let id = null;
        return new Promise((resolve, reject) => {
            const response = this.users.add({
                name,
                role
            });
            resolve(response);
        });
        
    }

    const removeUser = (id) => {
        this.users.where('id', 'in', [id]).get().then((snapshot) => {
            const batch = db.batch();
            snapshot.forEach(doc => {
                batch.delete(doc.ref)
            });
            return batch.commit();
        })
    }

    return {
        getUsersByRole,
        addUser,
        removeUser,
        getAllUsers,
    }
}

// Vendors
const Vendors = (vendorCollection) => {

    this.vendors = vendorCollection;

    const vendorsByStatus = (status) => {
        return new Promise((resolve, reject) => {
            this.vendors.where('status', '==', status).get().then((snapshot) => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    console.log('Doc Id of vendors ', doc.id);
                    docs.push(doc.data());
                })
                resolve(docs);
            });
        });
    }

    const allVendors = () => {
        return new Promise((resolve, reject) => {
            this.vendors.get().then((snapshot) => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    docs.push(doc.data());
                })
                resolve(docs);
            });
        });
    }

    const add = (payload) => {
        return new Promise((resolve, reject) => {
            // add the pending actions to the payload based on the response
            const response = this.vendors.add(payload);

            // check if the approval chain type is sequential
            const vendorId = payload.id;
            const activeLevel = 1;
            const operation = payload.operation;
            const levelType = payload.approvals[0]['type'];
            if (payload.approvals[0]['type'] === "sequential") {
                // Insert and entry into the approval actions table as pending action
                const userId = payload.approvals[0]['users'][0]['id'];
                actions.addAction(userId, vendorId, activeLevel, levelType, operation).then((resp) => {
                    resolve(response);
                });
            } else {
                // insert all user's pending actions into pending table
                const allUpdates = payload.approvals[0]['users'].map(user => {
                    return actions.addAction(user.id, vendorId, activeLevel, levelType);
                });
                Promise.all(allUpdates).then(() => {
                    resolve(response);
                })
            }
        });
    }

    const updateActiveLevel = (vendorId, level) => {
        return new Promise((resolve, reject) => {
            this.vendors.where('id', '==', vendorId).get().then(snapshot => {
                this.vendors.doc(snapshot.docs[0].id).update({
                    activeLevel: level
                });
            })
        });
    } 

    const terminateApproval = (action) => {
        this.vendors.where('id', '==', action.vendorId).get().then(snapshot => {
            snapshot.docs.forEach(doc => {
                // find the level and make it's approval as false
                const activeLevel = doc.data().activeLevel;
                const approvals = doc.data().approvals.map(approval => {
                    if (activeLevel === approval.level) {
                        const users = approval.users.map(user => {
                            if(action.userId === user.id) {
                                return {...user, hasApproved: false}
                            }
                            return user;
                        });
                        return {...approval, isLevelApproved: false, users: users};
                    }
                    return approval
                });
                // update vendor status as terminated
                this.vendors.doc(doc.id).update({
                    status: 'terminated',
                    approvals,
                });
            });
        });
    }

    const applySequenceTypeApproval = (action) => {
        this.vendors.where('id', '==', action.vendorId).get().then(snapshot => {
            let updatedActiveLevel = null;
            snapshot.docs.forEach(doc => {
                // find the level and make it's approval as false
                const activeLevel = doc.data().activeLevel;
                updatedActiveLevel = activeLevel;
                let users = [];
                const approvals = doc.data().approvals.map(approval => {
                    if (activeLevel === approval.level) {
                        users = approval.users.map(user => {
                            if(action.userId === user.id) {
                                return {...user, hasApproved: true}
                            }
                            //check if this was the last level 
                            return user;
                        });
                        // check if the user is last in sequence
                        if(approval.users[approval.users.length - 1]['id'] === action.userId) {
                            // Yes the user was last in sequence 
                            updatedActiveLevel += 1;
                            return {...approval, isLevelApproved: true, users: users};
                        } else {
                            // add action for user + 1 to the pending actions
                            let nextUserPos = null;
                            approval.users.forEach((user, index) => {
                                if (user.id === action.userId) {
                                    // the next user has to be the one to have a pending action
                                    nextUserPos = index + 1; 
                                }
                            });
                            const nextUsersId = approval.users[nextUserPos]['id'];
                            actions.addAction(nextUsersId, action.vendorId, updatedActiveLevel, action.levelType, action.operation);
                            return {...approval, users: users};
                        }
                    }
                    return approval;
                });
                this.vendors.doc(doc.id).update({
                    status: (updatedActiveLevel > approvals.length) ? 'executed' : 'active',
                    approvals,
                    activeLevel: updatedActiveLevel,
                });
                
                if(updatedActiveLevel > action.activeLevel) {
                    const updatedLevel = approvals[updatedActiveLevel - 1];
                    if (updatedLevel['type'] === "sequential") {
                        // Insert and entry into the approval actions table as pending action
                        const userId = updatedLevel['users'][0]['id'];
                        actions.addAction(userId, action.vendorId, updatedActiveLevel, updatedLevel.type, action.operation).then((resp) => {
                            return true;
                        });
                    } else {
                        console.log(updatedLevel, ' just to look');
                        // insert all user's pending actions into pending table
                        const allUpdates = updatedLevel['users'].map(user => {
                            console.log(user.id, action.vendorId, updatedActiveLevel, updatedLevel.type, action.operation, ' ALL PARAMS ');
                            return actions.addAction(user.id, action.vendorId, updatedActiveLevel, updatedLevel.type, action.operation);
                        });
                        Promise.all(allUpdates).then(() => {
                            return true;
                        })
                    }
                }
            });
        });
    }

    return {
        allVendors,
        add,
        vendorsByStatus,
        updateActiveLevel,
        terminateApproval,
        applySequenceTypeApproval,
    }
}

// All functions Based on the flowchart
/**
 * Actions statuses are as follow - 
 * pending, completed, cancelled
 */
const Actions = (actionCollection) => {

    this.actions = actionCollection;

    const addAction = (userId, vendorId, activeLevel, levelType, operation) => {
        const id = `${vendorId}${userId}${activeLevel}-${Date.now()}`;
        const status = 'pending';
        return new Promise((resolve, reject) => {
            // add the pending actions to the payload based on the response
            const response = this.actions.add({id, userId, vendorId, activeLevel, levelType, operation, status});
            resolve(response);
        });
    }

    const getPendingActionsByUser = (userId) => {
        return new Promise((resolve, reject) => {
            this.actions.where('status', '==', 'pending').where('userId', '==', Number(userId)).get().then(snapshot => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    console.log('Loading up the ', doc.id);
                    docs.push({action: doc.data(), id: doc.id});
                })
                resolve(docs);
            });
        });
    }

    const setActionStatus = (id, status, action) => {
        return new Promise((resolve, reject) => {
            this.actions.doc(id).update({
                status: status
            }).then(() => {
                console.log('coming to then', status, id);
                if (status === 'rejected') {
                    vendors.terminateApproval(action);
                } else {
                    // THe user has approved.. 
                    if (action.levelType === "sequential") {
                        vendors.applySequenceTypeApproval(action);
                    } else {
                        // follow the non sequential flow
                    }
                }
                resolve(true)
            });
        });
    }

    return {
        addAction,
        getPendingActionsByUser,
        setActionStatus
    }
}

// Workflows Schemas
const WorkflowSchema = (schemasCollection) => {

    this.schemas = schemasCollection;

    const getAllWorkFlowSchemas = () => {
        return new Promise((resolve, reject) => {
            this.schemas.get().then((snapshot) => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    docs.push(doc.data());
                })
                resolve(docs);
            });
        });
    }

    const getWorkFlowSchemasByName = (name) => {
        return new Promise((resolve, reject) => {
            this.schemas.where('workflow.name', '==', name).get().then((snapshot) => {
                const docs = [];
                snapshot.docs.forEach(doc => {
                    docs.push(doc.data());
                });
                resolve(docs);
            });
        });
    }

    const addWorkflowSchemaToDB = (workflow) => {
        return new Promise((resolve, reject) => {
            const response = this.schemas.add({workflow});
            resolve(response);
        });
    }

    const removeWorkFlowSchemaFromDB = (name) => {
        return new Promise((resolve, reject) => {
            this.schemas.where('workflow.name', 'in', [name]).get().then((snapshot) => {
                const batch = db.batch();
                snapshot.forEach(element => {
                    batch.delete(element.ref)
                });
                resolve(batch.commit());
            });
        });
    }

    return {
        addWorkflowSchemaToDB,
        removeWorkFlowSchemaFromDB,
        getWorkFlowSchemasByName,
        getAllWorkFlowSchemas
    }
}


/**
 USAGE OF ABOVE Classes
//*/

const users = Users(db.collection('user'));
const workflowSchemas = WorkflowSchema(db.collection('schemas'));
const vendors = Vendors(db.collection('vendor'));
const actions = Actions(db.collection('actions'));

module.exports = {
    users,
    workflowSchemas,
    vendors,
    actions,
}
