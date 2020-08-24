import axios from "axios";
import { authHeader, LOCALSTORAGE_NAME } from "../auth-header";

const apiClient = axios.create({
  withCredentials: true,
  headers: authHeader()
});

const simpleClient = axios.create();

export default {
  isAuthorized() {
    return apiClient
      .get("/api/v1/authorized")
      .then(() => true)
      .catch(() => false);
  },
  login(token) {
    apiClient.defaults.headers["Authorization"] = "Bearer " + token;
    return apiClient
      .get("/api/v1/authorized")
      .then(() => {
        localStorage.setItem(
          LOCALSTORAGE_NAME,
          JSON.stringify({
            authdata: window.btoa(token)
          })
        );
        return true;
      })
      .catch(() => {
        localStorage.removeItem(LOCALSTORAGE_NAME);
        return false;
      });
  },
  logout() {
    localStorage.removeItem(LOCALSTORAGE_NAME);
    return new Promise(function(resolve) {
      resolve("Logged out.");
    });
  },
  getCAs() {
    return apiClient.get("/api/v1/cas");
  },
  getCA(handle) {
    return apiClient.get("/api/v1/cas/" + handle);
  },
  getROAs(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes");
  },
  getRepo(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo");
  },
  getParentContact(handle, parent) {
    return apiClient.get("/api/v1/cas/" + handle + "/parents/" + parent);
  },
  updateROAs(handle, delta) {
    return apiClient.post("/api/v1/cas/" + handle + "/routes", delta).catch(error => {
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
    });
  },
  createCA(handle) {
    return apiClient.post("/api/v1/cas", {
      handle
    });
  },
  getChildRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/child_request.xml");
  },
  addParentResponse(handle, xml, name) {
    return apiClient.post("/api/v1/cas/" + handle + "/parents-xml/" + name, xml);
  },
  getRepoRequestXML(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/repo/request.xml");
  },
  addRepoResponse(handle, xml) {
    return apiClient.post("/api/v1/cas/" + handle + "/repo", xml);
  },
  getKrillStats() {
    return apiClient.get("/stats/info");
  },
  getLatestKrillVersion() {
    return simpleClient.get("https://api.github.com/repos/nlnetlabs/krill/releases/latest");
  },
  getBGPAnalysis(handle) {
    return apiClient.get("/api/v1/cas/" + handle + "/routes/analysis/full");
  },
  testbedAddChild(parent, child, asn_res, ipv4_res, ipv6_res, id_cert) {
    return simpleClient.post("/testbed/children", {
      handle: child,
      resources: {
        asn: (typeof asn_res !== 'undefined' ? asn_res : ""),
        v4: (typeof ipv4_res !== 'undefined' ? ipv4_res : ""),
        v6: (typeof ipv6_res !== 'undefined' ? ipv6_res : "")
      },
      auth: {
        rfc8183: {
          tag: null,
          child_handle: child,
          id_cert: id_cert
        }
      }
    });
  },
  testbedGetParentResponseXML(parent, child) {
    return apiClient.get("/testbed/children/" + child + "/parent_response.xml");
  },
  testbedRemoveChild(parent, child) {
    return simpleClient.delete("/testbed/children/" + child);
  },
  testbedAddPublisher(publisher_handle, publisher_request_xml) {
    return simpleClient.post("/testbed/publishers", {
      tag: null,
      publisher_handle: publisher_handle,
      id_cert: publisher_request_xml
    });
  },
  testbedGetRepositoryResponseXML(publisher) {
    return apiClient.get("/testbed/publishers/" + publisher + "/response.xml");
  },
  testbedRemovePublisher(publisher) {
    return simpleClient.delete("/testbed/publishers/" + publisher);
  },
  testbedEnabled() {
    return simpleClient.get("/testbed/enabled");
  }
};
