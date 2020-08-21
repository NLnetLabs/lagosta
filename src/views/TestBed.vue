<template>
  <div style="margin-left: 20%; margin-right: 20%;">
    <el-row v-loading="loading">
      <el-col>
        <div class="text-center">
          <div class="welcome">
            <img src="@/assets/images/welcome.svg" />
          </div>

          <h3>{{ $t("testbed.welcome") }}</h3>
        </div>

        <h4>TAL</h4>
        <p v-html="$t('testbed.welcomeHtml')"></p>

        <a href="/ta/ta.tal" target="_blank">{{
          $t("testbed.tallink")
        }}</a>

        <h4>Register/Unregister</h4>

        <el-alert type="error" v-if="error" :closable="true" show-icon title="Error" style="margin-bottom: 10px;">{{ error }}</el-alert>

        <el-tabs type="border-card">
          <el-tab-pane label="Register CA">
            <el-form :model="addChildRespForm" :rules="rules" ref="addChildRespForm" v-show="addChildRespForm.parentRespXML != ''">
              <el-form-item label="Testbed response XML" prop="parentRespXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.2" target="_blank" icon="el-icon-info">Click to view the RFC-8183 documentation for this XML</el-link>
                <prism-editor
                  v-model="addChildRespForm.parentRespXML"
                  language="xml"
                  v-bind:readonly=true
                  style="height:180px"
                ></prism-editor>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button
                    type="primary"
                    :title="$t('common.copy')"
                    @click="$emit('copy-xml', addChildRespForm.parentRespXML)"
                  >
                    <font-awesome-icon icon="clipboard" />
                  </el-button>
                  <el-button
                    type="primary"
                    :title="$t('common.download')"
                    @click="$emit('download-xml', addChildRespForm.parentRespXML, 'parent_response')"
                  >
                    <font-awesome-icon icon="download" />
                  </el-button>
                   <el-button @click="resetAddChildForm()">Register another CA</el-button>
                </el-form-item>
              </el-row>
            </el-form>
            <el-form :model="addChildForm" :rules="rules" ref="addChildForm"  v-show="addChildRespForm.parentRespXML == ''">
              <el-form-item label="Child Request XML" prop="childReqXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.1" target="_blank" icon="el-icon-info">Click to view the RFC-8183 documentation for this XML</el-link>
                <prism-editor
                  v-model="addChildForm.childReqXML"
                  language="xml"
                  style="height:180px"
                ></prism-editor>
              </el-form-item>
              <el-form-item label="ASN Resources" prop="asn_res">
                <el-input
                  ref="asn_res"
                  placeholder="The AS resources: e.g. AS1, AS3-4"
                  v-model="addChildForm.asn_res"
                ></el-input>
              </el-form-item>
              <el-form-item label="IPv4 Resources" prop="ipv4_res">
                <el-input
                  ref="ipv4_res"
                  placeholder="The IPv4 resources: e.g. 192.168.0.0/16"
                  v-model="addChildForm.ipv4_res"
                ></el-input>
              </el-form-item>
              <el-form-item label="IPv6 Resources" prop="ipv6_res">
                <el-input
                  ref="ipv6_res"
                  placeholder="The IPv6 resources: e.g. 2001:db8::/32"
                  v-model="addChildForm.ipv6_res"
                ></el-input>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitAddChildForm()">{{
                    $t("testbed.addChildForm.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="Unregister CA">
            <el-form :model="removeChildForm" :rules="rules" ref="removeChildForm">
              <el-form-item label="Child Handle" prop="child_handle">
                <el-input
                  ref="child_handle"
                  placeholder="Enter the CA name to remove"
                  v-model="removeChildForm.child_handle"
                ></el-input>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitRemoveChildForm()">{{
                    $t("testbed.removeChildForm.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="Register Publisher">
            <el-form :model="addPublisherRespForm" :rules="rules" ref="addPublisherRespForm" v-show="addPublisherRespForm.repoRespXML != ''">
              <el-form-item label="Testbed response XML" prop="repoRespXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.4" target="_blank" icon="el-icon-info">Click to view the RFC-8183 documentation for this XML</el-link>
                <prism-editor
                  v-model="addPublisherRespForm.repoRespXML"
                  language="xml"
                  v-bind:readonly=true
                  style="height:180px"
                ></prism-editor>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button
                    type="primary"
                    :title="$t('common.copy')"
                    @click="$emit('copy-xml', addPublisherRespForm.repoRespXML)"
                  >
                    <font-awesome-icon icon="clipboard" />
                  </el-button>
                  <el-button
                    type="primary"
                    :title="$t('common.download')"
                    @click="$emit('download-xml', addPublisherRespForm.repoRespXML, 'repository_response')"
                  >
                    <font-awesome-icon icon="download" />
                  </el-button>
                   <el-button @click="resetAddPublisherForm()">Register another Publisher</el-button>
                </el-form-item>
              </el-row>
            </el-form>
            <el-form :model="addPublisherForm" :rules="rules" ref="addPublisherForm" v-show="addPublisherRespForm.repoRespXML == ''">
              <el-form-item label="Publisher Request XML" prop="pubReqXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.3" target="_blank" icon="el-icon-info">Click to view the RFC-8183 documentation for this XML</el-link>
                <prism-editor
                  v-model="addPublisherForm.pubReqXML"
                  placeholder="<publisher_request ..."
                  language="xml"
                  style="height:180px"
                ></prism-editor>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitAddPublisherForm()">{{
                    $t("testbed.addPublisherForm.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>

          <el-tab-pane label="Unregister Publisher">
            <el-form :model="removePublisherForm" :rules="rules" ref="removePublisherForm">
              <el-form-item label="Publisher Handle" prop="publisher_handle">
                <el-input
                  ref="publisher_handle"
                  placeholder="Enter the Publisher name to remove"
                  v-model="removePublisherForm.publisher_handle"
                ></el-input>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitRemovePublisherForm()">{{
                    $t("testbed.removePublisherForm.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>
        </el-tabs>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import APIService from "@/services/APIService.js";
const xml2js = require("xml2js");
export default {
  data() {
    const checkReqXML = (rule, value, callback) => {
      if (!value || value.trim() === "") {
        callback(new Error(this.$t("testbed.addChildForm.required")));
      } else {
        xml2js.parseString(value, function(err, json) {
          if (err) {
            callback(new Error("Invalid RFC 8183 XML: " + err, true));
          } else {
            if (!json.child_request) {
              callback(new Error("Invalid RFC 8183 XML: Missing <child_request> element"));
            } else if (!json.child_request.$.child_handle) {
              callback(new Error("Invalid RFC 8183 XML: Missing child_handle attribute on <child_request> element"));
            } else if (!json.child_request.child_bpki_ta) {
              callback(new Error("Invalid RFC 8183 XML: Missing child_bpki_ta child element of the <child_request> element"));
            } else if (json.child_request.child_bpki_ta.length == 0) {
              callback(new Error("Invalid RFC 8183 XML: Missing child_bpki_ta child array element of the <child_request> element"));
            } else {
              callback();
            }
          }
        });
      }
    };
    const checkPubXML = (rule, value, callback) => {
      if (!value || value.trim() === "") {
        callback(new Error(this.$t("testbed.addPublisherForm.required")));
      } else {
        xml2js.parseString(value, function(err, json) {
          if (err) {
            callback(new Error("Invalid RFC 8183 XML: " + err, true));
          } else {
            if (!json.publisher_request) {
              callback(new Error("Invalid RFC 8183 XML: Missing <publisher_request> element"));
            } else if (!json.publisher_request.$.publisher_handle) {
              callback(new Error("Invalid RFC 8183 XML: Missing child_handle attribute on <publisher_request> element"));
            } else if (!json.publisher_request.publisher_bpki_ta) {
              callback(new Error("Invalid RFC 8183 XML: Missing publisher_bpki_ta child element of the <publisher_request> element"));
            } else if (json.publisher_request.publisher_bpki_ta.length == 0) {
              callback(new Error("Invalid RFC 8183 XML: Missing publisher_bpki_ta child array element of the <publisher_request> element"));
            } else {
              callback();
            }
          }
        });
      }
    };
    return {
      loading: false,
      error: "",
      addChildForm: {
        childReqXML: "Paste your <child_request/> XML here",
      },
      addChildRespForm: {
        parentRespXML: ""
      },
      removeChildForm: {
        child_handle: ""
      },
      addPublisherForm: {
        pubReqXML: "Paste your <publisher_request/> XML here",
      },
      addPublisherRespForm: {
        repoRespXML: ""
      },
      removePublisherForm: {
        publisher_handle: ""
      },
      rules: {
        childReqXML: [
          {
            required: true,
            validator: checkReqXML,
          }
        ],
        pubReqXML: [
          {
            required: true,
            validator: checkPubXML,
          }
        ],
        child_handle: [
          {
            required: true,
            message: "Child Handle is required"
          }
        ],
        publisher_handle: [
          {
            required: true,
            message: "Publisher Handle is required"
          }
        ]
      },
      enterPressed: false
    };
  },
  beforeRouteEnter(to, from, next) {
    // don't show the testbed UI if the testbed feature is disabled
    if (to.name == "testbed") {
      APIService.getConfig().then(response => {
        if (!response.data.testbed_enabled) {
          next({ name: 'home' });
        } else {
          next();
        }
      })
      .catch(() => next({ name: 'home' }));
    }
  },
  methods: {
    parseError(error, notify) {
      let e = error;
      if (error.data) {
        e = error.data.label
          ? this.$t("errors." + error.data.label, error.data.args)
          : this.$t("errors." + error.data.code);
        if (e === "errors." + (error.data.label ? error.data.label : error.data.code)) {
          e = error.data.msg;
        }
      }

      this.error = e;
      if (notify) {
        this.$notify({
          title: this.$t("common.error"),
          message: this.error,
          type: "error"
        });
      }
    },
    resetAddChildForm() {
      this.$refs.addChildForm.resetFields();
      this.$refs.addChildRespForm.resetFields();
    },
    submitAddChildForm(fromKeyboard = false) {
      const self = this;
      if (!self.enterPressed) {
        this.$refs["addChildForm"].validate(valid => {
          if (valid) {
            this.$confirm(
              this.$t("testbed.addChildForm.confirmation.message"),
              this.$t("testbed.addChildForm.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                self.loading = true;
                xml2js.parseStringPromise(this.addChildForm.childReqXML)
                  .then(function(result) {
                    let id_cert = result.child_request.child_bpki_ta[0];
                    let child_handle = result.child_request.$.child_handle;
                    APIService.unauthenticatedAddChild(
                      "testbed",
                      child_handle,
                      self.addChildForm.asn_res,
                      self.addChildForm.ipv4_res,
                      self.addChildForm.ipv6_res, id_cert)
                      .then(() => {
                        APIService.unauthenticatedGetParentResponseXML("testbed", child_handle)
                          .then(response => {
                            self.loading = false;
                            self.parseError("", false);
                            self.addChildRespForm.parentRespXML = response.data;
                            self.$message("Child CA '" + child_handle + "' has been added to the testbed.");
                          })
                          .catch(error => {
                            self.loading = false;
                            self.parseError(error.response, true);
                          });
                      })
                      .catch(error => {
                        self.loading = false;
                        self.parseError(error.response, true);
                      });
                  })
                  .catch(function(err) {
                    self.loading = false;
                    self.parseError("XML parsing error: " + err, true);
                  });
              })
              .catch(() => {
                self.enterPressed = false;
              });
          } else {
            return false;
          }
        });
      }
      self.enterPressed = fromKeyboard;
    },
    submitRemoveChildForm(fromKeyboard = false) {
      const self = this;
      if (!self.enterPressed) {
        this.$refs["removeChildForm"].validate(valid => {
          if (valid) {
            this.$confirm(
              this.$t("testbed.removeChildForm.confirmation.message"),
              this.$t("testbed.removeChildForm.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                self.loading = true;
                let child_handle = self.removeChildForm.child_handle;
                APIService.unauthenticatedRemoveChild("testbed", child_handle)
                  .then(() => {
                      self.loading = false;
                      self.parseError("", false);
                      self.$refs.removeChildForm.resetFields();
                      self.$message("Child CA '" + child_handle + "' has been removed from the testbed.");
                  })
                  .catch(error => {
                    self.loading = false;
                    self.parseError(error.response, true);
                  });
              })
              .catch(() => {
                self.enterPressed = false;
              });
          } else {
            return false;
          }
        });
      }
      self.enterPressed = fromKeyboard;
    },
    resetAddPublisherForm() {
      this.$refs.addPublisherForm.resetFields();
      this.$refs.addPublisherRespForm.resetFields();
    },
    submitAddPublisherForm(fromKeyboard = false) {
      const self = this;
      if (!self.enterPressed) {
        this.$refs["addPublisherForm"].validate(valid => {
          if (valid) {
            this.$confirm(
              this.$t("testbed.addPublisherForm.confirmation.message"),
              this.$t("testbed.addPublisherForm.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                self.loading = true;
                xml2js.parseStringPromise(this.addPublisherForm.pubReqXML)
                  .then(function(result) {
                    let id_cert = result.publisher_request.publisher_bpki_ta[0];
                    let publisher_handle = result.publisher_request.$.publisher_handle;
                    APIService.unauthenticatedAddPublisher(publisher_handle, id_cert)
                      .then(() => {
                        APIService.unauthenticatedGetRepositoryResponseXML(publisher_handle)
                          .then(response => {
                            self.loading = false;
                            self.parseError("", false);
                            self.addPublisherRespForm.repoRespXML = response.data;
                            self.$message("Publisher '" + publisher_handle + "' has been added to the testbed.");
                          })
                          .catch(error => {
                            self.loading = false;
                            self.parseError(error.response, true);
                          });
                      })
                      .catch(error => {
                        self.loading = false;
                        self.parseError(error.response, true);
                      });
                  })
                  .catch(function(err) {
                    self.loading = false;
                    self.parseError("XML parsing error: " + err, true);
                  });
              })
              .catch(() => {
                self.enterPressed = false;
              });
          } else {
            return false;
          }
        });
      }
      self.enterPressed = fromKeyboard;
    },
    submitRemovePublisherForm(fromKeyboard = false) {
      const self = this;
      if (!self.enterPressed) {
        this.$refs["removePublisherForm"].validate(valid => {
          if (valid) {
            this.$confirm(
              this.$t("testbed.removePublisherForm.confirmation.message"),
              this.$t("testbed.removePublisherForm.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                self.loading = true;
                let publisher_handle = self.removePublisherForm.publisher_handle;
                APIService.unauthenticatedRemovePublisher(publisher_handle)
                  .then(() => {
                      self.loading = false;
                      self.parseError("", false);
                      self.$refs.removePublisherForm.resetFields();
                      self.$message("Publisher '" + publisher_handle + "' has been removed from the testbed.");
                  })
                  .catch(error => {
                    self.loading = false;
                    self.parseError(error.response, true);
                  });
              })
              .catch(() => {
                self.enterPressed = false;
              });
          } else {
            return false;
          }
        });
      }
      self.enterPressed = fromKeyboard;
    },
  }
};
</script>

<style lang="scss" scoped>
.text-center {
  text-align: center;
}

.welcome {
  img {
    height: 160px;
    width: 200px;
    margin: 2.5rem;
  }
}

.loading {
  margin: 2rem;
  font-size: 4rem;
  color: #999;
  text-align: center;
}
</style>
