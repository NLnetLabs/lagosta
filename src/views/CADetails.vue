<template>
  <div>
    <el-card class="box-card" v-if="ca.handle">
      <div slot="header" class="clearfix">
        <el-row>
          <el-col :span="18">
            <h3>
              {{ $t("cas.ca") }}
              <strong>{{ handle }}</strong>
            </h3>
          </el-col>
          <el-col :span="6">
            <div class="switcher">
              <span class="label">{{ $t('caDetails.current') }}</span>
              <el-select
                v-model="handle"
                placeholder="$t('caDetails.current')"
                size="small"
                @change="getContent()"
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

        <div v-if="!loading && ca" class="main">
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('caDetails.resources')" name="resources">
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

              <el-tabs v-model="activeTabInner" class="inner-tab">
                <el-tab-pane :label="$t('caDetails.roas')" name="roas">
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
                </el-tab-pane>
              </el-tabs>

              <div
                v-if="!loadingRoas && roas.length === 0"
                class="empty"
              >{{ $t("caDetails.noRoas") }}</div>

              <el-button
                class="addRoa"
                size="mini"
                type="primary"
                @click="addROAFormVisible = true"
              >{{ $t("caDetails.addRoa") }}</el-button>
            </el-tab-pane>
            <el-tab-pane :label="$t('caDetails.parents')" name="parents">
              <el-table
                size="small"
                v-if="ca.parents.length"
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
    >
      <el-form :model="form" :rules="rules" ref="addROAForm">
        <el-form-item label="ASN" prop="asn">
          <el-input v-model="form.asn" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="Prefix" placeholder="ie. 10.1.0.0/22" prop="prefix">
          <el-input v-model="form.prefix" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item :label="$t('caDetails.maxLength')" placeholder="ie. 24" prop="maxLength">
          <el-input v-model="form.maxLength" autocomplete="off" type="number" min="4" max="64"></el-input>
        </el-form-item>
        <el-alert type="error" v-if="error" :closable="false">{{error}}</el-alert>
        <el-row type="flex" class="modal-footer" justify="end">
          <el-form-item>
            <el-button @click="resetForm('addROAForm')">{{ $t('caDetails.form.cancel') }}</el-button>
            <el-button
              type="primary"
              @click="submitForm('addROAForm')"
            >{{ $t('caDetails.form.confirm') }}</el-button>
          </el-form-item>
        </el-row>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import router from "@/router";
import APIService from "@/services/APIService.js";
const cidrRegex = require("cidr-regex");
export default {
  data() {
    const checkASN = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.form.required")));
      } else {
        if (
          new RegExp(
            "^([1-9]|[1-8][0-9]|9[0-9]|[1-8][0-9]{2}|9[0-8][0-9]|99[0-9]|[1-8][0-9]{3}|9[0-8][0-9]{2}|99[0-8][0-9]|999[0-9]|[1-8][0-9]{4}|9[0-8][0-9]{3}|99[0-8][0-9]{2}|999[0-8][0-9]|9999[0-9]|[12][0-9]{5}|3[0-8][0-9]{4}|39[0-8][0-9]{3}|399[01][0-9]{2}|3992[0-5][0-9]|399260)$"
          ).test(value)
        ) {
          callback();
        } else {
          callback(new Error(this.$t("caDetails.form.asn_format")));
        }
      }
    };
    const checkPrefix = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.form.required")));
      } else {
        if (cidrRegex({ exact: true }).test(value)) {
          callback();
        } else {
          callback(new Error(this.$t("caDetails.form.prefix_format")));
        }
      }
    };

    return {
      activeTab: "resources",
      activeTabInner: "roas",
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
      form: {
        asn: "",
        prefix: "",
        maxLength: ""
      },
      rules: {
        asn: [
          {
            required: true,
            validator: checkASN,
            message: this.$t("caDetails.form.asn_format")
          }
        ],
        prefix: [
          {
            validator: checkPrefix,
            required: true
          }
        ]
      }
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
    }
  },
  created() {
    this.getContent();
  },
  beforeRouteUpdate(to, from, next) {
    this.handle = to.params.handle;
    this.getContent();
    next();
  },
  methods: {
    getContent() {
      this.loading = true;
      this.loadingRoas = true;
      this.loadingRepo = true;
      APIService.getCA(this.handle).then(response => {
        this.loading = false;
        this.ca = response.data;
      });
      APIService.getRepo(this.handle).then(response => {
        this.loadingRepo = false;
        this.repo = response.data.contact;
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
    addROA: function() {
      const self = this;
      APIService.updateROAs(this.handle, {
        added: [
          {
            asn: parseInt(this.form.asn),
            prefix: this.form.prefix,
            max_length: parseInt(this.form.maxLength) || 0
          }
        ],
        removed: []
      })
        .then(() => {
          this.$notify({
            title: this.$t("caDetails.confirm.added"),
            message: this.$t("caDetails.confirm.addedSuccess"),
            type: "success"
          });
          this.addROAFormVisible = false;
          this.getROAs();
        })
        .catch(function(error) {
          let e = self.$t("errors." + error.data.code);
          if (e === "errors." + error.data.code) {
            e = error.data.msg;
          }
          self.error = e;
        });
    },
    deleteROA: function(row) {
      const self = this;
      this.$confirm(
        this.$t("caDetails.confirm.message"),
        this.$t("caDetails.confirm.title"),
        {
          confirmButtonText: this.$t("caDetails.confirm.ok"),
          cancelButtonText: this.$t("caDetails.confirm.cancel")
        }
      )
        .then(() => {
          APIService.updateROAs(this.handle, {
            added: [],
            removed: [row]
          })
            .then(() => {
              this.$notify({
                title: this.$t("caDetails.confirm.retired"),
                message: this.$t("caDetails.confirm.retiredSuccess"),
                type: "success"
              });
              this.getROAs();
              this.resetForm("addROAForm");
            })
            .catch(error => {
              let e = self.$t("errors." + error.data.code);
              if (e === "errors." + error.data.code) {
                e = error.data.msg;
              }
              self.error = e;
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
a {
  color: #f63107;
  &:hover {
    color: #f85a39;
  }
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

.addRoa {
  margin-top: 1rem;
}

.switcher {
  text-align: right;
  .label {
    font-size: 0.8rem;
    padding-right: 0.5rem;
  }
}

.inner-tab {
  margin-top: 2rem;
}
</style>
