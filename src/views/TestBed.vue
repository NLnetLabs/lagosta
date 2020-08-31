<template>
  <div style="margin-left: 20%; margin-right: 20%;">
    <el-row v-loading="loading">
      <el-col>
        <div class="text-center">
          <div class="welcome">
            <img src="@/assets/images/welcome.svg" />
          </div>

          <h1>{{ $t("testbed.welcome") }}</h1>
        </div>

        <h4>{{ $t('testbed.disclaimer.heading')}}</h4>
        <p v-html="$t('testbed.disclaimer.body')"></p>

        <h4>{{ $t('testbed.rpconfighelp.heading') }}</h4>
        <p v-html="$t('testbed.rpconfighelp.body', { tallink: '/testbed.tal' })"></p>

        <h4>{{ $t('testbed.regunreg.heading') }}</h4>
        <p v-html="$t('testbed.regunreg.body')"></p>

        <el-alert type="error" v-if="error" :closable="true" show-icon title="Error" style="margin-bottom: 10px;">{{ error }}</el-alert>

        <el-tabs type="border-card">
          <el-tab-pane :label="$t('testbed.addChild.heading')">
            <el-form :model="addChildRespForm" :rules="rules" ref="addChildRespForm" v-show="addChildRespForm.parentRespXML != ''">
              <el-form-item :label="$t('testbed.responseXML')" prop="parentRespXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.2" target="_blank" icon="el-icon-info">{{ $t('testbed.rfcdoclink') }}</el-link>
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
                   <el-button @click="resetAddChildForm()">{{ $t('testbed.addChild.registeranother') }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
            <el-form :model="addChildForm" :rules="rules" ref="addChildForm"  v-show="addChildRespForm.parentRespXML == ''">
              <el-form-item :label="$t('testbed.addChild.requestXML.label')" prop="childReqXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.1" target="_blank" icon="el-icon-info">{{ $t('testbed.rfcdoclink') }}</el-link>
                <prism-editor
                  v-model="addChildForm.childReqXML"
                  language="xml"
                  style="height:180px"
                ></prism-editor>
              </el-form-item>
              <el-form-item :label="$t('testbed.addChild.asnresources.label')" prop="asn_res">
                <el-input
                  ref="asn_res"
                  :placeholder="$t('testbed.addChild.asnresources.placeholder')"
                  v-model="addChildForm.asn_res"
                ></el-input>
              </el-form-item>
              <el-form-item :label="$t('testbed.addChild.ipv4resources.label')" prop="ipv4_res">
                <el-input
                  ref="ipv4_res"
                  :placeholder="$t('testbed.addChild.ipv4resources.placeholder')"
                  v-model="addChildForm.ipv4_res"
                ></el-input>
              </el-form-item>
              <el-form-item :label="$t('testbed.addChild.ipv6resources.label')" prop="ipv6_res">
                <el-input
                  ref="ipv6_res"
                  :placeholder="$t('testbed.addChild.ipv6resources.placeholder')"
                  v-model="addChildForm.ipv6_res"
                ></el-input>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitAddChildForm()">{{
                    $t("testbed.addChild.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>

          <el-tab-pane :label="$t('testbed.removeChild.heading')">
            <el-form :model="removeChildForm" :rules="rules" ref="removeChildForm">
              <el-form-item :label="$t('testbed.childhandle')" prop="child_handle">
                <el-input
                  ref="child_handle"
                  :placeholder="$t('testbed.removeChild.placeholder')"
                  v-model="removeChildForm.child_handle"
                ></el-input>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitRemoveChildForm()">{{
                    $t("testbed.removeChild.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>

          <el-tab-pane :label="$t('testbed.addPublisher.heading')">
            <el-form :model="addPublisherRespForm" :rules="rules" ref="addPublisherRespForm" v-show="addPublisherRespForm.repoRespXML != ''">
              <el-form-item :label="$t('testbed.responseXML')" prop="repoRespXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.4" target="_blank" icon="el-icon-info">{{ $t('testbed.rfcdoclink') }}</el-link>
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
                   <el-button @click="resetAddPublisherForm()">{{ $t('testbed.addPublisher.registeranother') }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
            <el-form :model="addPublisherForm" :rules="rules" ref="addPublisherForm" v-show="addPublisherRespForm.repoRespXML == ''">
              <el-form-item :label="$t('testbed.addPublisher.requestXML.label')" prop="pubReqXML">
                <el-link href="https://tools.ietf.org/html/rfc8183#section-5.2.3" target="_blank" icon="el-icon-info">{{ $t('testbed.rfcdoclink') }}</el-link>
                <prism-editor
                  v-model="addPublisherForm.pubReqXML"
                  language="xml"
                  style="height:180px"
                ></prism-editor>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitAddPublisherForm()">{{
                    $t("testbed.addPublisher.confirm")
                  }}</el-button>
                </el-form-item>
              </el-row>
            </el-form>
          </el-tab-pane>

          <el-tab-pane :label="$t('testbed.removePublisher.heading')">
            <el-form :model="removePublisherForm" :rules="rules" ref="removePublisherForm">
              <el-form-item :label="$t('testbed.publisherhandle')" prop="publisher_handle">
                <el-input
                  ref="publisher_handle"
                  :placeholder="$t('testbed.removePublisher.placeholder')"
                  v-model="removePublisherForm.publisher_handle"
                ></el-input>
              </el-form-item>
              <el-row type="flex" class="modal-footer" justify="end">
                <el-form-item>
                  <el-button type="primary" @click="submitRemovePublisherForm()">{{
                    $t("testbed.removePublisher.confirm")
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
        callback(new Error(this.$t("testbed.addChild.required")));
      } else {
        const self = this;
        xml2js.parseString(value, function(err, json) {
          if (err) {
            callback(new Error(self.$t('testbed.errors.invalid-xml', { err: err }), true));
          } else {
            if (typeof json.child_request === 'undefined') {
              callback(new Error(self.$t('testbed.errors.missing-xml-el', { el: '<child_request>' } )));
            } else if (!json.child_request) {
              callback(new Error(self.$t('testbed.errors.empty-xml-el', { el: '<child_request>' } )));
            } else if (typeof json.child_request.$ === 'undefined' || typeof json.child_request.$.child_handle === 'undefined') {
              callback(new Error(self.$t('testbed.errors.missing-xml-attr', { attr: 'child_handle', el: '<child_request>' } )));
            } else if (json.child_request.$.child_handle.length == 0) {
              callback(new Error(self.$t('testbed.errors.empty-xml-attr', { attr: 'child_handle', el: '<child_request>' } )));
            } else if (typeof json.child_request.child_bpki_ta === 'undefined') {
              callback(new Error(self.$t('testbed.errors.missing-xml-child-el', { el: '<child_bpki_ta>', parent: '<child_request>' } )));
            } else if (json.child_request.child_bpki_ta[0].length == 0) {
              callback(new Error(self.$t('testbed.errors.empty-xml-el', { el: '<child_bpki_ta>' } )));
            } else {
              callback();
            }
          }
        });
      }
    };
    const checkPubXML = (rule, value, callback) => {
      if (!value || value.trim() === "") {
        callback(new Error(this.$t("testbed.addPublisher.required")));
      } else {
        const self = this;
        xml2js.parseString(value, function(err, json) {
          if (err) {
            callback(new Error(self.$t('testbed.errors.invalid-xml', { err: err } ), true));
          } else {
            if (typeof json.publisher_request === 'undefined') {
              callback(new Error(self.$t('testbed.errors.missing-xml-el', { el: '<publisher_request>' } )));
            } else if (!json.publisher_request) {
              callback(new Error(self.$t('testbed.errors.empty-xml-el', { el: '<publisher_request>' } )));
            } else if (typeof json.publisher_request.$ === 'undefined' || typeof json.publisher_request.$.publisher_handle === 'undefined') {
              callback(new Error(self.$t('testbed.errors.missing-xml-attr', { attr: 'publisher_handle', el: '<publisher_request>' } )));
            } else if (json.publisher_request.$.publisher_handle.length == 0) {
              callback(new Error(self.$t('testbed.errors.empty-xml-attr', { attr: 'publisher_handle', el: '<publisher_request>' } )));
            } else if (typeof json.publisher_request.publisher_bpki_ta === 'undefined') {
              callback(new Error(self.$t('testbed.errors.missing-xml-child-el', { el: '<publisher_bpki_ta>', parent: '<publisher_request>' } )));
            } else if (json.publisher_request.publisher_bpki_ta[0].length == 0) {
              callback(new Error(self.$t('testbed.errors.empty-xml-el', { el: '<publisher_bpki_ta>' } )));
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
        childReqXML: this.$t('testbed.addChild.requestXML.placeholder'),
      },
      addChildRespForm: {
        parentRespXML: ""
      },
      removeChildForm: {
        child_handle: ""
      },
      addPublisherForm: {
        pubReqXML: this.$t('testbed.addPublisher.requestXML.placeholder'),
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
            message: this.$t('testbed.errors.child-handle-required')
          }
        ],
        publisher_handle: [
          {
            required: true,
            message: this.$t('testbed.errors.publisher-handle-required')
          }
        ]
      },
      enterPressed: false
    };
  },
  beforeRouteEnter(to, from, next) {
    // don't show the testbed UI if the testbed feature is disabled
    if (to.name == "testbed") {
      APIService.testbedEnabled()
        .then(() => next())
        .catch(() => next({ name: 'home' }));
    }
  },
  methods: {
    parseError(error, notify) {
      let e = error;
      if (typeof error.data !== 'undefined') {
        e = error.data.label
          ? this.$t("testbed.errors." + error.data.label, error.data.args)
          : this.$t("testbed.errors." + error.data.code);
        if (e === "testbed.errors." + (error.data.label ? error.data.label : error.data.code)) {
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
              this.$t("testbed.addChild.confirmation.message"),
              this.$t("testbed.addChild.confirmation.title"),
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
                    APIService.testbedAddChild(
                      child_handle,
                      self.addChildForm.asn_res,
                      self.addChildForm.ipv4_res,
                      self.addChildForm.ipv6_res, id_cert)
                      .then(() => {
                        APIService.testbedGetParentResponseXML(child_handle)
                          .then(response => {
                            self.loading = false;
                            self.parseError("", false);
                            self.addChildRespForm.parentRespXML = response.data;
                            self.$message({
                              message: self.$t('testbed.addChild.success', { child_handle: child_handle }),
                              type: 'success'
                            });
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
                    self.parseError(self.$t('testbed.errors.invalid-xml', { err: err } ), true);
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
              this.$t("testbed.removeChild.confirmation.message"),
              this.$t("testbed.removeChild.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                self.loading = true;
                let child_handle = self.removeChildForm.child_handle;
                APIService.testbedRemoveChild(child_handle)
                  .then(() => {
                      self.loading = false;
                      self.parseError("", false);
                      self.$refs.removeChildForm.resetFields();
                      self.$message({
                        message: self.$t('testbed.removeChild.success', { child_handle: child_handle }),
                        type: 'success'
                      });
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
              this.$t("testbed.addPublisher.confirmation.message"),
              this.$t("testbed.addPublisher.confirmation.title"),
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
                    APIService.testbedAddPublisher(publisher_handle, id_cert)
                      .then(() => {
                        APIService.testbedGetRepositoryResponseXML(publisher_handle)
                          .then(response => {
                            self.loading = false;
                            self.parseError("", false);
                            self.addPublisherRespForm.repoRespXML = response.data;
                            self.$message({
                              message: self.$t('testbed.addPublisher.success', { publisher_handle: publisher_handle }),
                              type: 'success'
                            });
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
                    self.parseError(self.$t('testbed.errors.invalid-xml', { err: err } ), true);
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
              this.$t("testbed.removePublisher.confirmation.message"),
              this.$t("testbed.removePublisher.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                self.loading = true;
                let publisher_handle = self.removePublisherForm.publisher_handle;
                APIService.testbedRemovePublisher(publisher_handle)
                  .then(() => {
                      self.loading = false;
                      self.parseError("", false);
                      self.$refs.removePublisherForm.resetFields();
                      self.$message({
                        message: self.$t('testbed.removePublisher.success', { publisher_handle: publisher_handle }),
                        type: 'success'
                      });
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
