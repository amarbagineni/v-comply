## Intro

The app has two structures -
1. the nodeJs server on the root 
2. a react front end in the folder v-comply-ui

All though the app has all the features mentioned in the pdf
The following items are todo items - according to my note pad - mentioned at the end in ** betterments


## Instructions
In the project directory, you can run:

### `npm install`

then since the UI app is independent as of now - although the build of the same could be used in the public folder and served through the same node app. 

### `cd v-comply-ui && npm install`

come back to root `cd..` and start the node server

### `npm start`

start the UI serve 

### `cd v-comply-ui && npm start` 

You should be able to view the application on the browser on http://localhost:3000/workflows

<hr/>

Note: Refresh the User page after approvals/rejects to update the queues for each user - Left it so, as it is meant to signify user data fetch on login



### Preferred Usage - 
1. Create a Workflow
2. Add a vendor using the created workflow
3. Approve/Reject on the user's queue appropriately
4. Observe the workflow updates on the Vendors page (Active, Terminated and Executed Tabs)


### betterments p[ossible on the code, but stopping for the submission sake
1. Include classed to be BEM
2. Better file structure of the ui app
3. Componentizing on the UI is absent right now - used simple bootstrap to spin up something quick
4. Better API management, with cors, helmet etc
5. Optimising code repetition
6. speedup page loads by making data fetch and update instead of refresh
7. Only happy path has been tested. Althogh all looks fine - can test further
8. Vendor could be an auto complete Input, if there were pre-defined vendors
9. Keyboard interactions and WCAG standards could be implemented
10. Comments could be better assigned. Although I prefer structuring the code in a way that you dont need comments.
11. Breaking up functions with more than 5 lines into independent pieces
12. constants can be stored as a config for the app, currently in the page level

