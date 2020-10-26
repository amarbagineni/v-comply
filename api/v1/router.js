const express = require('express');
const user = require('./user/user');
const workflow = require('./workflow/workflow');
const vendors = require('./vendor/vendor');

const router = express.Router();

/**
 * GET v1/user
 */
router.use('/user/add', user.add);
router.use('/user/remove', user.remove);
router.use('/user/fetch', user.fetch);

/**
 * GET v1/workflow
 */
router.post('/workflow/add', workflow.add);
router.post('/workflow/remove', workflow.remove);
router.get('/workflow/fetch', workflow.fetch);
router.get('/workflow/fetch/:name', workflow.fetchByName);

/**
 * GET v1/vendors
 */
router.post('/vendors/add', vendors.add);
router.get('/vendors/fetch/:status', vendors.fetchByStatus);
router.get('/vendors/fetch', vendors.fetchAll);

module.exports = router;
