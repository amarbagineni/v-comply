/* eslint-disable no-restricted-globals */
const getAPIURL = () => {
  if (location.host.indexOf("localhost") > -1) {
    // it is the localhost
    return "http://localhost:3000/api/v1/";
  } else {
    // the hosted URL here
    return location.origin + "/api/v1/";
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  APP_NAME: "v-comply approvals",
  API_URL: getAPIURL(),
};
