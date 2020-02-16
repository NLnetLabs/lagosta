<template>
  <div>
    <el-card class="box-card" v-if="ca.handle">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :xs="24" :sm="14">
            <h3>
              {{ $t("cas.ca") }}
              <strong>{{ handle }}</strong>
            </h3>
          </el-col>
          <el-col :xs="24" :sm="10">
            <div class="switcher" v-if="CAs.length > 1">
              <span class="label">{{ $t('caDetails.current') }}</span>
              <el-select
                v-model="handle"
                :placeholder="$t('caDetails.current')"
                size="small"
                @change="switchCA()"
              >
                <el-option v-for="ca in CAs" :key="ca.handle" :value="ca.handle" :label="ca.handle"></el-option>
              </el-select>
            </div>
          </el-col>
        </el-row>
      </div>
      <div class="text item">
        <span v-if="loading">
          <i class="el-icon-loading"></i>
          <span v-t="{ path: 'caDetails.loading', args: { handle: handle } }"></span>
        </span>

        <div class="onboarding" v-if="initializeRepo && initializeParent">
          <p>{{ $t('caDetails.onboardingWarning') }}</p>
        </div>

        <div v-if="!loading && ca" class="main">
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('caDetails.roas')" name="roas">
              <h5 v-if="initializeParent || initializeRepo">{{ $t('caDetails.initialize') }}</h5>

              <el-row v-if="!initializeParent && !initializeRepo">
                <el-col :xs="24" :sm="16">
                  <i class="el-icon-loading" v-if="loadingRoas"></i>
                  <el-table
                    size="small"
                    v-if="!loadingRoas && roas.length"
                    :data="roas"
                    style="width: 100%"
                  >
                    <el-table-column prop="asn" label="ASN"></el-table-column>
                    <el-table-column prop="prefix" label="Prefix"></el-table-column>
                    <el-table-column prop="max_length" :label="$t('caDetails.maxLength')"></el-table-column>
                    <el-table-column label width="80">
                      <template slot-scope="scope">
                        <el-button
                          size="mini"
                          icon="el-icon-delete"
                          type="primary"
                          round
                          @click="deleteROA(scope.row)"
                        ></el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div
                    v-if="!loadingRoas && roas.length === 0 && !initializeRepo && !initializeParent && !emptyResources"
                    class="empty"
                  >{{ $t("caDetails.noRoas") }}</div>

                  <el-button
                    class="mt-1"
                    size="mini"
                    type="primary"
                    v-if="!initializeParent && !initializeRepo && !emptyResources"
                    @click="addROAFormVisible = true"
                  >{{ $t("caDetails.addRoa") }}</el-button>

                  <div v-if="!initializeParent && !initializeRepo && emptyResources" class="empty">
                    {{ $t('caDetails.noResourcesYet') }}
                    <a
                      href="javascript: void(0)"
                      @click="getContent()"
                    >{{ $t('caDetails.clickToRefresh') }}</a>
                  </div>
                </el-col>
                <el-col :span="6" :offset="2" class="hidden-xs-only">
                  <el-card class="resource-card">
                    <el-table
                      size="small"
                      v-if="resourcesArray.length"
                      :data="resourcesArray"
                      style="width: 100%"
                    >
                      <el-table-column prop="prop" :label="$t('caDetails.resource')"></el-table-column>
                      <el-table-column prop="value" :label="$t('caDetails.value')"></el-table-column>
                    </el-table>

                    <div
                      v-if="resourcesArray.length === 0"
                      class="empty"
                    >{{ $t("caDetails.noResources") }}</div>
                  </el-card>
                </el-col>
                <el-col :span="24" class="hidden-sm-and-up">
                  <el-card class="mt-3">
                    <el-table
                      size="small"
                      v-if="resourcesArray.length"
                      :data="resourcesArray"
                      style="width: 100%"
                    >
                      <el-table-column prop="prop" :label="$t('caDetails.resource')"></el-table-column>
                      <el-table-column prop="value" :label="$t('caDetails.value')"></el-table-column>
                    </el-table>

                    <div
                      v-if="resourcesArray.length === 0"
                      class="empty"
                    >{{ $t("caDetails.noResources") }}</div>
                  </el-card>
                </el-col>
              </el-row>
            </el-tab-pane>
            <el-tab-pane :label="$t('caDetails.parents')" name="parents">
              <el-table
                size="small"
                v-if="ca.parents.length && !showAddParent"
                :data="ca.parents"
                style="width: 100%"
              >
                <el-table-column prop="handle" label="Handle">
                  <template slot-scope="scope">
                    <el-popover
                      v-if="ca.parents[scope.$index].kind === 'rfc6492'"
                      placement="right"
                      width="400"
                      trigger="click"
                    >
                      <i class="el-icon-loading" v-if="loadingParent"></i>
                      <el-table :data="parentDetails">
                        <el-table-column property="prop" :label="$t('caDetails.property')"></el-table-column>
                        <el-table-column property="value" :label="$t('caDetails.value')"></el-table-column>
                      </el-table>
                      <el-button
                        type="text"
                        slot="reference"
                        @click="getParent(ca.parents[scope.$index])"
                      >{{ ca.parents[scope.$index].handle }}</el-button>
                    </el-popover>
                    <span
                      v-if="ca.parents[scope.$index].kind !== 'rfc6492'"
                    >{{ ca.parents[scope.$index].handle }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="kind" :label="$t('caDetails.kind')"></el-table-column>
              </el-table>
              <el-button
                class="mt-1"
                size="mini"
                type="primary"
                v-if="!initializeParent && !initializeRepo && !showAddParent"
                @click="addAdditionalParent()"
              >{{ $t("caDetails.parentsTab.addParent") }}</el-button>

              <el-form
                :model="initializeParentForm"
                ref="initializeParentForm"
                v-if="initializeParent || showAddParent"
              >
                <el-form-item :label="$t('caDetails.parentsTab.request')" prop="xml">
                  <prism-editor :code="initializeParentForm.xml" language="xml" :readonly="true"></prism-editor>
                </el-form-item>
                <el-row type="flex">
                  <el-form-item>
                    <el-button
                      type="primary"
                      :title="$t('common.copy')"
                      @click="copyXML(initializeParentForm.xml)"
                    >
                      <font-awesome-icon icon="clipboard" />
                    </el-button>
                    <el-button
                      type="primary"
                      :title="$t('common.download')"
                      @click="downloadXML(initializeParentForm.xml, 'child_request')"
                    >
                      <font-awesome-icon icon="download" />
                    </el-button>
                    <el-switch
                      class="ml-1"
                      v-model="initializeParentForm.ARINCompatible"
                      :active-text="$t('caDetails.parentsTab.arin')"
                      inactive-text="">
                    </el-switch>
                  </el-form-item>
                </el-row>

                <el-form-item
                  :label="$t('caDetails.parentsTab.response')"
                  prop="response"
                  class="mt-3"
                >
                  <el-row class="mt-3" :gutter="10">
                    <el-col :xs="24" :sm="12">
                      <div style="height:180px">
                        <prism-editor v-model="initializeParentForm.response" language="xml"></prism-editor>
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                      <el-upload
                        drag
                        action
                        :before-upload="beforeUploadParent"
                        :file-list="fileList"
                      >
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text" v-html="$t('common.dropOrClick')"></div>
                      </el-upload>
                    </el-col>
                  </el-row>
                </el-form-item>

                <el-row type="flex" class="modal-footer">
                  <el-form-item>
                    <el-button
                      @click="showAddParent = false"
                      v-if="showAddParent"
                    >{{ $t('common.cancel') }}</el-button>
                    <el-button type="primary" @click="addParent()">{{ $t('common.confirm') }}</el-button>
                  </el-form-item>
                </el-row>
              </el-form>
            </el-tab-pane>
            <el-tab-pane
              :label="$t('caDetails.children')"
              name="children"
              v-if="childrenArray.length"
            >
              <el-table
                size="small"
                v-if="childrenArray.length"
                :data="childrenArray"
                style="width: 100%"
              >
                <el-table-column prop="handle" :label="$t('caDetails.handle')"></el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane :label="$t('caDetails.repo')" name="repo">
              <el-form :model="initializeRepoForm" ref="initializeRepoForm" v-if="initializeRepo">
                <el-form-item :label="$t('caDetails.repoTab.request')" prop="xml">
                  <prism-editor v-model="initializeRepoForm.xml" language="xml" :readonly="true"></prism-editor>
                </el-form-item>
                <el-row type="flex">
                  <el-form-item>
                    <el-button
                      type="primary"
                      :title="$t('common.copy')"
                      @click="copyXML(initializeRepoForm.xml)"
                    >
                      <font-awesome-icon icon="clipboard" />
                    </el-button>
                    <el-button
                      type="primary"
                      :title="$t('common.download')"
                      @click="downloadXML(initializeRepoForm.xml, 'publisher_request')"
                    >
                      <font-awesome-icon icon="download" />
                    </el-button>
                  </el-form-item>
                </el-row>
                <el-form-item
                  :label="$t('caDetails.repoTab.response')"
                  prop="response"
                  class="mt-3"
                >
                  <el-row class="mt-3" :gutter="10">
                    <el-col :xs="24" :sm="12">
                      <div style="height:180px">
                        <prism-editor v-model="initializeRepoForm.response" language="xml"></prism-editor>
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="12">
                      <el-upload
                        drag
                        action
                        :before-upload="beforeUploadRepo"
                        :file-list="fileList"
                      >
                        <i class="el-icon-upload"></i>
                        <div class="el-upload__text" v-html="$t('common.dropOrClick')"></div>
                      </el-upload>
                    </el-col>
                  </el-row>
                </el-form-item>
                <el-row type="flex">
                  <el-form-item>
                    <el-button type="primary" @click="addRepo()">{{ $t('common.confirm') }}</el-button>
                  </el-form-item>
                </el-row>
              </el-form>

              <el-table
                size="small"
                v-if="properties.length"
                :data="properties"
                style="width: 100%"
              >
                <el-table-column prop="type" :label="$t('caDetails.type')"></el-table-column>
                <el-table-column prop="props" :label="$t('caDetails.properties')">
                  <template slot-scope="scope">
                    <ul>
                      <li :key="prop.prop" v-for="prop in properties[scope.$index].props">
                        {{ prop.prop }}:
                        <a :href="prop.value" target="_blank">{{ prop.value }}</a>
                      </li>
                    </ul>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>

    <el-dialog
      :title="$t('caDetails.addRoa')"
      :visible.sync="addROAFormVisible"
      :close-on-click-modal="false"
      @close="resetForm('addROAForm')"
    >
      <el-form :model="addROAForm" :rules="addROAFormRules" ref="addROAForm">
        <el-form-item label="ASN" prop="asn">
          <el-input v-model="addROAForm.asn" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Prefix" placeholder="ie. 10.1.0.0/22" prop="prefix">
          <el-input v-model="addROAForm.prefix" autocomplete="off" @input="updateMaxLength($event)"></el-input>
        </el-form-item>
        <el-form-item :label="$t('caDetails.maxLength')" placeholder="ie. 24" prop="maxLength">
          <el-input
            v-model="addROAForm.maxLength"
            autocomplete="off"
            type="number"
            min="4"
            max="64"
          ></el-input>
        </el-form-item>
        <el-alert type="error" v-if="error" :closable="false" class="mb-1">{{error}}</el-alert>
        <el-row type="flex" class="modal-footer" justify="end">
          <el-form-item>
            <el-button @click="resetForm('addROAForm')">{{ $t('common.cancel') }}</el-button>
            <el-button type="primary" @click="submitForm('addROAForm')">{{ $t('common.confirm') }}</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import "element-ui/lib/theme-chalk/display.css";
import router from "@/router";
import APIService from "@/services/APIService.js";
const cidrRegex = require("cidr-regex");
const xml2js = require('xml2js');
export default {
  data() {
    const checkASN = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.addROAForm.required")));
      } else {
        if (
          new RegExp(
            "^([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-8][0-9]{4}|9[0-8][0-9]{3}|99[0-8][0-9]{2}|999[0-8][0-9]|9999[0-9]|[12][0-9]{5}|3[0-8][0-9]{4}|39[0-8][0-9]{3}|399[01][0-9]{2}|3992[0-5][0-9]|399260)$"
          ).test(value)
        ) {
          callback();
        } else {
          callback(new Error(this.$t("caDetails.addROAForm.asn_format")));
        }
      }
    };
    const checkPrefix = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.addROAForm.required")));
      } else {
        if (cidrRegex({ exact: true }).test(value)) {
          callback();
        } else {
          callback(new Error(this.$t("caDetails.addROAForm.prefix_format")));
        }
      }
    };

    return {
      activeTab: this.$route.params.tab ? this.$route.params.tab : "roas",
      handle: this.$route.params.handle,
      loading: false,
      loadingRoas: false,
      loadingRepo: false,
      loadingParent: false,
      loadingCAs: false,
      CAs: [],
      ca: {},
      roas: {},
      repo: {},
      parentDetails: [],
      error: "",
      addROAFormVisible: false,
      addROAForm: {
        asn: "",
        prefix: "",
        maxLength: ""
      },
      addROAFormRules: {
        asn: [
          {
            required: true,
            validator: checkASN,
            message: this.$t("caDetails.addROAForm.asn_format")
          }
        ],
        prefix: [
          {
            validator: checkPrefix,
            required: true
          }
        ]
      },
      initializeRepo: false,
      initializeRepoForm: {
        xml: "",
        response: ""
      },
      showAddParent: false,
      initializeParent: false,
      initializeParentForm: {
        xml: "",
        originalXml: "",
        response: "",
        ARINCompatible: false
      },
      fileList: []
    };
  },
  computed: {
    properties: function() {
      if (this.repo) {
        if (this.repo.embedded) {
          return [
            {
              type: "Embedded",
              props: [
                {
                  prop: "Base URI",
                  value: this.repo.embedded.base_uri
                },
                {
                  prop: "RPKI Notify",
                  value: this.repo.embedded.rpki_notify
                }
              ]
            }
          ];
        } else if (this.repo.rfc8181) {
          return [
            {
              type: "Remote",
              props: [
                {
                  prop: "Service URI",
                  value: this.repo.rfc8181.service_uri
                }
              ]
            }
          ];
        }
      }
      return [];
    },
    resourcesArray: function() {
      let resArray = [];
      if (this.ca) {
        let res = this.ca.resources;
        Object.keys(res).forEach(k => {
          resArray.push({
            prop: k,
            value: res[k]
          });
        });
      }
      return resArray;
    },
    childrenArray: function() {
      return this.ca
        ? this.ca.children.map(c => {
            return {
              handle: c
            };
          })
        : [];
    },
    emptyResources: function() {
      let empty = true;
      this.resourcesArray.forEach(r => {
        if (r.value !== "") {
          empty = false;
        }
      });
      return empty;
    }
  },
  watch: {
    "initializeParentForm.ARINCompatible"(enable) {
      const self = this;
      if (enable) {
        this.initializeParentForm.originalXml = this.initializeParentForm.xml;
        xml2js.parseString(this.initializeParentForm.xml, function (err, result) {
            const builder = new xml2js.Builder();
            const ARINxmlObj = {
              identity: {
                '$': {
                  'xmlns': 'http://www.hactrn.net/uris/rpki/myrpki/',
                  'version': '2',
                  'handle': result.child_request.$.child_handle
                },
                child_bpki_ta: result.child_request.child_bpki_ta
              }
            }
            const ARINxml = builder.buildObject(ARINxmlObj).split('\n');
            ARINxml.shift();
            self.initializeParentForm.xml = ARINxml.join('\n');
        });
      } else {
        self.initializeParentForm.xml = this.initializeParentForm.originalXml;
      }
    }
  },
  created() {
    this.getContent();
  },
  beforeRouteUpdate(to, from, next) {
    this.handle = to.params.handle;
    this.activeTab = to.params.tab;
    this.getContent();
    next();
  },
  methods: {
    parseError(error, notify) {
      let e = error;
      if (error.data) {
        e = error.data.label
          ? this.$t("errors." + error.data.label, error.data.args)
          : this.$t("errors." + error.data.code);
        if (
          e ===
          "errors." + (error.data.label ? error.data.label : error.data.code)
        ) {
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
    getContent() {
      const self = this;
      this.activeTab = this.$route.params.tab ? this.$route.params.tab : "roas";
      this.loading = true;
      this.loadingRoas = true;
      this.loadingRepo = true;
      this.initializeParent = false;
      this.initializeRepo = false;
      this.showAddParent = false;
      this.CAs = [];
      this.ca = {};
      this.roas = {};
      this.repo = {};
      this.parentDetails = [];
      localStorage.lagostaLastCA = this.handle;
      APIService.getCA(this.handle).then(response => {
        this.loading = false;
        this.ca = response.data;
        if (!this.ca.parents || this.ca.parents.length === 0) {
          this.initializeParent = true;
          if (this.activeTab === "roas") {
            this.activeTab = "parents";
          }
          APIService.getChildRequestXML(this.handle).then(response => {
            this.initializeParentForm.xml = response.data;
          });
        }
      }).catch(error => {
        self.parseError(error);
        localStorage.removeItem('lagostaLastCA');
        router.push("/interstitial");
      });
      APIService.getRepo(this.handle)
        .then(response => {
          this.loadingRepo = false;
          if (this.initializeParent) {
            this.activeTab = "parents";
          }
          this.repo = response.data.contact;
        })
        .catch(() => {
          this.initializeRepo = true;
          this.activeTab = "repo";
          APIService.getRepoRequestXML(this.handle).then(response => {
            this.initializeRepoForm.xml = response.data;
          });
        });

      this.getROAs();
      this.loadCAs();
    },
    getROAs() {
      APIService.getROAs(this.handle).then(response => {
        this.loadingRoas = false;
        this.roas = response.data;
      });
    },
    getParent: function(row) {
      this.loadingParent = true;
      this.parentDetails = [];
      APIService.getParentContact(this.handle, row.handle).then(response => {
        this.loadingParent = false;
        if (response.data.rfc6492) {
          this.parentDetails = [
            {
              prop: "Parent handle",
              value: response.data.rfc6492.parent_handle
            },
            {
              prop: "Child handle",
              value: response.data.rfc6492.child_handle
            },
            {
              prop: "Service URI",
              value: response.data.rfc6492.service_uri
            }
          ];
        }
      });
    },
    loadCAs: function() {
      APIService.getCAs().then(response => {
        this.loadingCAs = false;
        this.CAs = response.data.cas;
      });
    },
    loadCA: function(row) {
      router.push("/cas/" + row.handle);
    },
    switchCA: function() {
      router.push("/cas/" + this.handle);
    },
    addROA: function() {
      const self = this;
      APIService.updateROAs(this.handle, {
        added: [
          {
            asn: parseInt(this.addROAForm.asn),
            prefix: this.addROAForm.prefix,
            max_length: parseInt(this.addROAForm.maxLength) || 0
          }
        ],
        removed: []
      })
        .then(() => {
          self.$notify({
            title: this.$t("caDetails.confirmation.added"),
            message: this.$t("caDetails.confirmation.addedSuccess"),
            type: "success"
          });
          self.addROAFormVisible = false;
          self.getROAs();
        })
        .catch(function(error) {
          self.parseError(error);
        });
    },
    deleteROA: function(row) {
      const self = this;
      this.$confirm(
        this.$t("caDetails.confirmation.message"),
        this.$t("caDetails.confirmation.title"),
        {
          confirmButtonText: this.$t("common.ok"),
          cancelButtonText: this.$t("common.cancel")
        }
      )
        .then(() => {
          APIService.updateROAs(this.handle, {
            added: [],
            removed: [row]
          })
            .then(() => {
              self.$notify({
                title: this.$t("caDetails.confirmation.retired"),
                message: this.$t("caDetails.confirmation.retiredSuccess"),
                type: "success"
              });
              self.getROAs();
              self.resetForm("addROAForm");
            })
            .catch(error => {
              self.parseError(error);
            });
        })
        .catch(() => {});
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.addROA();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.error = "";
      this.addROAFormVisible = false;
      this.$refs[formName].resetFields();
    },
    updateMaxLength(value) {
      if (value.indexOf("/") > -1) {
        this.addROAForm.maxLength = value.split("/")[1];
      }
    },
    copyXML(xml) {
      const self = this;
      this.$copyText(xml).then(function() {
        self.$notify({
          title: self.$t("common.success"),
          message: self.$t("caDetails.copySuccess"),
          type: "success"
        });
      });
    },
    downloadXML(xml, filename) {
      const url = window.URL.createObjectURL(new Blob([xml]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename + ".xml");
      document.body.appendChild(link);
      link.click();
    },
    beforeUpload(file, what) {
      const self = this;
      var reader = new FileReader();

      reader.onload = (function() {
        return function(e) {
          if (what === "repo") {
            self.initializeRepoForm.response = atob(
              e.target.result.substring(21)
            );
          } else {
            self.initializeParentForm.response = atob(
              e.target.result.substring(21)
            );
          }
        };
      })(file);

      reader.readAsDataURL(file);
      return false;
    },
    beforeUploadRepo(file) {
      return this.beforeUpload(file, "repo");
    },
    beforeUploadParent(file) {
      return this.beforeUpload(file, "parent");
    },
    addAdditionalParent() {
      this.initializeParentForm.xml = "";
      this.initializeParentForm.response = "";
      this.initializeParentForm.ARINCompatible = false;
      APIService.getChildRequestXML(this.handle).then(response => {
        this.initializeParentForm.xml = response.data;
      });
      this.showAddParent = true;
    },
    addParent() {
      const self = this;
      APIService.addParentResponse(
        this.handle,
        this.initializeParentForm.response
      )
        .then(() => {
          this.$notify({
            title: this.$t("common.success"),
            message: this.$t("caDetails.parentsTab.addParentSuccess"),
            type: "success"
          });
          this.getContent();
        })
        .catch(error => {
          self.parseError(error, true);
        });
    },
    addRepo() {
      const self = this;
      APIService.addRepoResponse(this.handle, this.initializeRepoForm.response)
        .then(() => {
          this.$notify({
            title: this.$t("common.success"),
            message: this.$t("caDetails.repoTab.addRepoSuccess"),
            type: "success"
          });
          this.getContent();
        })
        .catch(error => {
          self.parseError(error, true);
        });
    }
  }
};
</script>

<style lang="scss" scoped>
h3 {
  font-weight: 300;
  margin: 0;
  padding-top: 0.3rem;
}

.box-card {
  margin: 0;
  border: 0;
  box-shadow: none !important;
}

.title {
  font-size: 16px;
  margin-top: 4rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f9eadd;
  text-decoration: underline;
  text-decoration-color: #f63107;
}

.main .title:first-child {
  margin-top: 0;
}

.empty {
  font-size: 14px;
}

ul {
  list-style: none;
  padding-left: 0;
}

.mt-1 {
  margin-top: 1rem;
}

.mt-2 {
  margin-top: 2rem;
}

.mt-3 {
  margin-top: 3rem;
}

.mb-1 {
  margin-bottom: 1rem;
}

.ml-1 {
  margin-left: 1rem;
}

.switcher {
  text-align: right;
  .label {
    font-size: 0.8rem;
    padding-right: 0.5rem;
  }
}

.onboarding {
  padding: 8px 16px;
  background-color: #fef0f0;
  border-radius: 4px;
  border-left: 5px solid #f63107;
  margin: 20px 0;
}

.resource-card {
  min-height: calc(100vh - 310px);
}
</style>
