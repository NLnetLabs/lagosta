import axios from "axios";
import { authHeader, LOCALSTORAGE_NAME } from "../auth-header";

const apiClient = axios.create({
  withCredentials: true,
  headers: authHeader()
});

apiClient.interceptors.response.use(function (response) {
  // Any status code that lie within the range of 2xx cause this function to trigger
  // Do something with response data
  if (response.headers["authorization"] !== undefined) {
    apiClient.defaults.headers["Authorization"] = response.headers["authorization"];
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
    apiClient.defaults.headers["Authorization"] = "Bearer " + token;

    // Handle id/password login mode where we have to submit an id and password,
    // not just a token as when in master token mode.
    let queryParams = "";
    if (id !== undefined) {
      queryParams = "?id=" + id;
    }

    return apiClient
      .post("/auth/login" + queryParams)
      .then(response => {
        apiClient.defaults.headers["Authorization"] = "Bearer " + response.data.token;
        localStorage.setItem(
          LOCALSTORAGE_NAME,
          JSON.stringify({
            authdata: response.data.token,
            id: response.data.id,
            role: response.data.role
          })
        );
        return true;
      })
      .catch(() => {
        localStorage.removeItem(LOCALSTORAGE_NAME);
        return false;
      });
  },
  recordLogin(id, token, role) {
    apiClient.defaults.headers["Authorization"] = "Bearer " + token;
    localStorage.setItem(
      LOCALSTORAGE_NAME,
      JSON.stringify({
        authdata: token,
        id: id,
        role: role
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
    return apiClient.get("/api/v1/cas/" + handle + "/child_request.xml").catch(handleError);
  },
  addParentResponse(handle, xml, name) {
    return apiClient.post("/api/v1/cas/" + handle + "/parents-xml/" + name, xml).catch(handleError);
  },
  getRepoRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo/request.xml").catch(handleError);
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
      handle: child,
      resources: {
        asn: typeof asn_res !== "undefined" ? asn_res : "",
        v4: typeof ipv4_res !== "undefined" ? ipv4_res : "",
        v6: typeof ipv6_res !== "undefined" ? ipv6_res : ""
      },
      auth: {
        rfc8183: {
          tag: null,
          child_handle: child,
          id_cert: id_cert
        }
      }
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
      publisher_handle: publisher_handle,
      id_cert: publisher_request_xml
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