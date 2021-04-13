import axios from "axios";
import { authHeader, LOCALSTORAGE_NAME } from "../auth-header";

const apiClient = axios.create({
  withCredentials: true,
  headers: authHeader()
});

apiClient.interceptors.response.use(function (response) {
  if (response.headers["authorization"] !== undefined) {
    let new_token = response.headers["authorization"].split("Bearer ")[1];

    // The server generated a new API token for us to use in subsequent requests
    // e.g. because the current one is about to expire. Use this token for
    // subsequent API calls in this browser session,
    apiClient.defaults.headers["Authorization"] = "Bearer " + new_token;

    // Save the token so that it will also be used for API calls made in a 
    // future browser session.
    let user = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME));

    // If this somehow crosses over with a logout the localStorage.getItem() call
    // might return null if the stored item has already been removed, causing
    // parse() to also return null. In that case we'd fail below when accessing
    // user.xxx so check first.
    if (user) {
      localStorage.setItem(
        LOCALSTORAGE_NAME,
        JSON.stringify({
          authdata: new_token,
          id: user.id,
          attributes: user.attributes
        })
      );
    }
  }
  return response;
}, function (error) {
  // Any status codes that falls outside the range of 2xx cause this function to trigger
  // Do something with response error
  throw error;
});

const simpleClient = axios.create();

function handleError(error) {
  if (error.response && error.response.data) {
    return Promise.reject({
      data: error.response.data
    });
  }
  return Promise.reject({
    data: {
      code: -1
    }
  });
}

export default {
  isAuthorized() {
    return apiClient
      .get("/api/v1/authorized")
      .then(() => true)
      .catch(() => false);
  },
  login(token, id = undefined) {
    localStorage.removeItem(LOCALSTORAGE_NAME);

    // Handle id/password login mode where we have to submit an id and password,
    // not just a token as when in master token mode.
    let queryParams = "";
    if (id !== undefined) {
      queryParams = "?id=" + id;
    }

    // Use the given token in the login request
    apiClient.defaults.headers["Authorization"] = "Bearer " + token;

    return apiClient
      .post("/auth/login" + queryParams)
      .then(response => {
        // Set the token to use for subsequent API calls in this browser session,
        apiClient.defaults.headers["Authorization"] = "Bearer " + response.data.token;

        // Save the token to use for API calls in a future browser session.
        // Save details about the user that we want to display in the UI for the
        // same duration as the token.
        localStorage.setItem(
          LOCALSTORAGE_NAME,
          JSON.stringify({
            authdata: response.data.token,
            id: response.data.id,
            attributes: response.data.attributes
          })
        );
        return true;
      })
      .catch(() => {
        localStorage.removeItem(LOCALSTORAGE_NAME);
        return false;
      });
  },
  recordLogin(id, token, attributes) {
    // Set the token to use for subsequent API calls in this browser session,
    apiClient.defaults.headers["Authorization"] = "Bearer " + token;

    // Save the token to use for API calls in a future browser session.
    // Save details about the user that we want to display in the UI for the
    // same duration as the token.
    localStorage.setItem(
      LOCALSTORAGE_NAME,
      JSON.stringify({
        authdata: token,
        id: id,
        attributes: attributes
      })
    );
  },
  logout() {
    localStorage.removeItem(LOCALSTORAGE_NAME);
    // returns the URL to which the user should be sent to complete the logout
    // process, e.g. when using a 3rd party login provider.
    return apiClient.post("/auth/logout").catch(handleError);
  },
  getCAs() {
    return apiClient.get("/api/v1/cas").catch(handleError);
  },
  getCA(handle) {
    return apiClient.get("/api/v1/cas/" + handle).catch(handleError);
  },
  getROAs(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes").catch(handleError);
  },
  getRepo(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo").catch(handleError);
  },
  getRepoStatus(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo/status").catch(handleError);
  },
  getParents(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/parents").catch(handleError);
  },
  getParentContact(handle, parent) {
    return apiClient.get("/api/v1/cas/" + handle + "/parents/" + parent).catch(handleError);
  },
  updateROAs(handle, delta, trial) {
    return apiClient.post("/api/v1/cas/" + handle + "/routes" + (trial ? "/try" : ""), delta).catch(handleError);
  },
  updateROAsDryRun(handle, delta) {
    return apiClient.post("/api/v1/cas/" + handle + "/routes/analysis/dryrun", delta).catch(handleError);
  },
  createCA(handle) {
    return apiClient.post("/api/v1/cas", { handle }).catch(handleError);
  },
  getChildRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/id/child_request.xml").catch(handleError);
  },
  addParentResponse(handle, xml, name) {
    return apiClient.post("/api/v1/cas/" + handle + "/parents/" + name, xml).catch(handleError);
  },
  getRepoRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/id/publisher_request.xml").catch(handleError);
  },
  addRepoResponse(handle, xml) {
    return apiClient.post("/api/v1/cas/" + handle + "/repo", xml).catch(handleError);
  },
  getKrillStats() {
    return apiClient.get("/stats/info").catch(handleError);
  },
  getLatestKrillVersion() {
    return simpleClient.get("https://api.github.com/repos/nlnetlabs/krill/releases/latest").catch(handleError);
  },
  getBGPAnalysis(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes/analysis/full").catch(handleError);
  },
  testbedAddChild(child, asn_res, ipv4_res, ipv6_res, id_cert) {
    return simpleClient.post("/testbed/children", {
      handle: child.trim(),
      resources: {
        asn: typeof asn_res !== "undefined" ? asn_res.trim() : "",
        v4: typeof ipv4_res !== "undefined" ? ipv4_res.trim() : "",
        v6: typeof ipv6_res !== "undefined" ? ipv6_res.trim() : ""
      },
      id_cert: id_cert.trim()
    }).catch(handleError);
  },
  testbedGetParentResponseXML(child) {
    return simpleClient.get("/testbed/children/" + child + "/parent_response.xml").catch(handleError);
  },
  testbedRemoveChild(child) {
    return simpleClient.delete("/testbed/children/" + child).catch(handleError);
  },
  testbedAddPublisher(publisher_handle, publisher_request_xml) {
    return simpleClient.post("/testbed/publishers", {
      tag: null,
      publisher_handle: publisher_handle.trim(),
      id_cert: publisher_request_xml.trim()
    }).catch(handleError);
  },
  testbedGetRepositoryResponseXML(publisher) {
    return simpleClient.get("/testbed/publishers/" + publisher + "/response.xml").catch(handleError);
  },
  testbedRemovePublisher(publisher) {
    return simpleClient.delete("/testbed/publishers/" + publisher).catch(handleError);
  },
  testbedEnabled() {
    return simpleClient.get("/testbed/enabled").catch(handleError);
  },
  getROAsSuggestions(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes/analysis/suggest").catch(handleError);
  },
  syncParents() {
    return apiClient.post("/api/v1/bulk/cas/sync/parent").catch(handleError);
  },
  syncRepo() {
    return apiClient.post("/api/v1/bulk/cas/sync/repo").catch(handleError);
  },
  getLoginURL() {
    return simpleClient.get("/auth/login").catch(handleError);
  }
};
