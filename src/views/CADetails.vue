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
              <span class="label">{{ $t("caDetails.current") }}</span>
              <el-select
                v-model="handle"
                :placeholder="$t('caDetails.current')"
                size="small"
                @change="switchCA()"
              >
                <el-option
                  v-for="ca in CAs"
                  :key="ca.handle"
                  :value="ca.handle"
                  :label="ca.handle"
                ></el-option>
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
          <p>{{ $t("caDetails.onboardingWarning") }}</p>
        </div>

        <div v-if="!loading && ca" class="main">
          <el-tabs v-model="activeTab">
            <el-tab-pane :label="$t('caDetails.roas')" name="roas">
              <h5 v-if="initializeParent || initializeRepo">{{ $t("caDetails.initialize") }}</h5>

              <el-row v-if="!initializeParent && !initializeRepo">
                <el-col :sm="24" :md="16">
                  <announcementsROAs
                    :handle="handle"
                    :initializeParent="initializeParent"
                    :initializeRepo="initializeRepo"
                    :updated="updatedAnnouncements"
                    @triggerAddROA="triggerAddROA($event)"
                    @triggerError="triggerError($event)"
                    @triggerShowBGP="triggerShowBGP($event)"
                    v-if="!initializeRepo && !initializeParent && !emptyResources"
                  />

                  <el-row>
                    <el-col :span="12">
                      <el-button
                        class="mt-1"
                        size="mini"
                        type="primary"
                        v-if="!initializeParent && !initializeRepo && !emptyResources"
                        @click="
                          resetForm('addROAForm');
                          addROAFormVisible = true;
                        "
                        >{{ $t("caDetails.addRoa") }}</el-button
                      >
                    </el-col>
                    <el-col :span="12" style="text-align:right">
                      <el-button
                        class="mt-1"
                        type="text"
                        v-if="!initializeParent && !initializeRepo && !emptyResources && bgpShown"
                        @click="analysisDetailsVisible = true"
                        >{{ $t("caDetails.analyseThis") }}</el-button
                      >
                    </el-col>
                  </el-row>

                  <div v-if="!initializeParent && !initializeRepo && emptyResources" class="empty">
                    {{ $t("caDetails.noResourcesYet") }}
                    <a href="javascript: void(0)" @click="getContent()">{{
                      $t("caDetails.clickToRefresh")
                    }}</a>
                  </div>
                </el-col>
                <el-col :span="6" :offset="2" class="hidden-sm-only">
                  <el-card class="resource-card">
                    <div class="scrollable">
                      <el-table
                        size="small"
                        v-if="resourcesArray.length"
                        :data="resourcesArray"
                        :show-header="false"
                        style="width: 100%"
                      >
                        <el-table-column
                          class-name="valign-top"
                          prop="prop"
                          :label="$t('caDetails.resource')"
                          width="60"
                        >
                          <template slot-scope="scope">
                            <strong>{{ resourcesArray[scope.$index].prop }}</strong>
                          </template>
                        </el-table-column>
                        <el-table-column prop="value" :label="$t('caDetails.value')">
                          <template slot-scope="scope">
                            <span v-html="resourcesArray[scope.$index].value"></span>
                          </template>
                        </el-table-column>
                      </el-table>
                    </div>

                    <div v-if="resourcesArray.length === 0" class="empty">
                      {{ $t("caDetails.noResources") }}
                    </div>
                  </el-card>
                </el-col>
                <el-col :span="24" class="hidden-md-and-up">
                  <el-card class="mt-3">
                    <el-table
                      size="small"
                      v-if="resourcesArray.length"
                      :data="resourcesArray"
                      :show-header="false"
                      style="width: 100%"
                    >
                      <el-table-column
                        prop="prop"
                        :label="$t('caDetails.resource')"
                      ></el-table-column>
                      <el-table-column prop="value" :label="$t('caDetails.value')">
                        <template slot-scope="scope">
                          <span v-html="resourcesArray[scope.$index].value"></span>
                        </template>
                      </el-table-column>
                    </el-table>

                    <div v-if="resourcesArray.length === 0" class="empty">
                      {{ $t("caDetails.noResources") }}
                    </div>
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
                        <el-table-column
                          property="prop"
                          :label="$t('caDetails.property')"
                        ></el-table-column>
                        <el-table-column
                          property="value"
                          :label="$t('caDetails.value')"
                        ></el-table-column>
                      </el-table>
                      <el-button
                        type="text"
                        slot="reference"
                        @click="getParent(ca.parents[scope.$index])"
                        >{{ ca.parents[scope.$index].handle }}</el-button
                      >
                    </el-popover>
                    <span v-if="ca.parents[scope.$index].kind !== 'rfc6492'">{{
                      ca.parents[scope.$index].handle
                    }}</span>
                  </template>
                </el-table-column>
                <el-table-column prop="kind" :label="$t('caDetails.kind')"></el-table-column>
              </el-table>

              <json-viewer :value="parents" :expand-depth="5"></json-viewer>

              <el-button
                class="mt-1"
                size="mini"
                type="primary"
                v-if="!initializeParent && !initializeRepo && !showAddParent"
                @click="addAdditionalParent()"
                >{{ $t("caDetails.parentsTab.addParent") }}</el-button
              >

              <el-button
                class="mt-1"
                type="text"
                size="mini"
                v-if="!initializeParent && !initializeRepo"
                @click="syncParents"
                >{{ $t("caDetails.syncParents") }}</el-button
              >

              <el-form
                :model="initializeParentForm"
                :rules="initializeParentFormRules"
                ref="initializeParentForm"
                v-if="initializeParent || showAddParent"
              >
                <el-form-item :label="$t('caDetails.parentsTab.request')" prop="xml">
                  <prism-editor
                    :code="initializeParentForm.xml"
                    language="xml"
                    :readonly="true"
                  ></prism-editor>
                </el-form-item>
                <el-row type="flex">
                  <el-form-item>
                    <el-button
                      type="primary"
                      :title="$t('common.copy')"
                      @click="$emit('copy-xml', initializeParentForm.xml)"
                    >
                      <font-awesome-icon icon="clipboard" />
                    </el-button>
                    <el-button
                      type="primary"
                      :title="$t('common.download')"
                      @click="$emit('download-xml', initializeParentForm.xml, 'child_request')"
                    >
                      <font-awesome-icon icon="download" />
                    </el-button>
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
                        <prism-editor
                          v-model="initializeParentForm.response"
                          language="xml"
                        ></prism-editor>
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

                <el-form-item :label="$t('caDetails.parentsTab.name')" prop="name">
                  <el-row class="mt-3" :gutter="10">
                    <el-col :xs="24" :sm="12">
                      <el-input v-model="initializeParentForm.name" autocomplete="off"></el-input>
                    </el-col>
                  </el-row>
                </el-form-item>

                <el-row type="flex" class="modal-footer mt-3">
                  <el-form-item>
                    <el-button @click="showAddParent = false" v-if="showAddParent">{{
                      $t("common.cancel")
                    }}</el-button>
                    <el-button type="primary" @click="addParent()">{{
                      $t("common.confirm")
                    }}</el-button>
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
                  <prism-editor
                    v-model="initializeRepoForm.xml"
                    language="xml"
                    :readonly="true"
                  ></prism-editor>
                </el-form-item>
                <el-row type="flex">
                  <el-form-item>
                    <el-button
                      type="primary"
                      :title="$t('common.copy')"
                      @click="$emit('copy-xml', initializeRepoForm.xml)"
                    >
                      <font-awesome-icon icon="clipboard" />
                    </el-button>
                    <el-button
                      type="primary"
                      :title="$t('common.download')"
                      @click="$emit('download-xml', initializeRepoForm.xml, 'publisher_request')"
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
                        <prism-editor
                          v-model="initializeRepoForm.response"
                          language="xml"
                        ></prism-editor>
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
                    <el-button type="primary" @click="addRepo()">{{
                      $t("common.confirm")
                    }}</el-button>
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

              <json-viewer :value="repoStatus" :expand-depth="5"></json-viewer>

              <el-button class="mt-1" type="text" size="mini" @click="syncRepo">{{
                $t("caDetails.syncRepo")
              }}</el-button>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </el-card>

    <el-dialog
      :title="$t('caDetails.addRoa')"
      :visible.sync="addROAFormVisible"
      :close-on-click-modal="false"
      @close="addROAFormVisible = false"
    >
      <el-form :model="addROAForm" :rules="addROAFormRules" ref="addROAForm">
        <el-form-item :label="$t('announcements.asn')" prop="asn">
          <el-input v-model="addROAForm.asn" autocomplete="off" @change="removeAS()"></el-input>
        </el-form-item>
        <el-form-item
          :label="$t('announcements.prefix')"
          placeholder="ie. 10.1.0.0/22"
          prop="prefix"
        >
          <el-input
            v-model="addROAForm.prefix"
            autocomplete="off"
            @input="updateMaxLength($event)"
          ></el-input>
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
        <el-alert type="error" v-if="error" :closable="false" class="mb-1">{{ error }}</el-alert>
        <el-row type="flex" class="modal-footer" justify="end">
          <el-form-item>
            <el-button @click="resetForm('addROAForm')">{{ $t("common.cancel") }}</el-button>
            <el-button
              type="primary"
              @click="submitForm('addROAForm')"
              :disabled="submittingROAForm"
              >{{ $t("common.confirm") }}</el-button
            >
          </el-form-item>
        </el-row>
      </el-form>
    </el-dialog>

    <el-dialog
      :visible.sync="addROASuggestionsVisible"
      custom-class="suggestion-dialog"
      :close-on-click-modal="false"
      @close="addROASuggestionsVisible = false"
      width="80%"
    >
      <div slot="title" class="el-dialog__title">
        {{ $t("caDetails.suggestions.adding") }} {{ $t("announcements.asn") }}:
        <strong>{{ addROAForm.asn }}</strong
        >, {{ $t("announcements.prefix") }}: <strong>{{ addROAForm.prefix }}</strong
        >, {{ $t("caDetails.maxLength") }}: <strong>{{ addROAForm.maxLength }}</strong> -
        <el-button
          type="text"
          @click="
            addROASuggestionsVisible = false;
            addROAFormVisible = true;
          "
          >{{ $t("common.edit") }}</el-button
        >
      </div>
      <el-row>
        <el-col :xs="24" :sm="11">
          <h3 class="suggestion-title suggestion-title-nopadding">
            {{ $t("caDetails.suggestions.willResult") }}
          </h3>
          <simpleROAsTable :announcements="effects"></simpleROAsTable>
        </el-col>
        <el-col :xs="24" :sm="12">
          <h3 class="suggestion-title">
            {{ $t("caDetails.suggestions.yourChoice") }}
          </h3>
          <el-table
            size="small"
            v-if="deltaMine && deltaMine.length"
            :data="deltaMine"
            :default-sort="{ prop: 'asn', order: 'ascending' }"
            style="width: 100%; border: 2px solid #EBEEF5; margin-left: 1rem; padding-left: 1rem"
            max-height="560"
            :empty-text="$t('common.nodata')"
            @selection-change="handleMineSelectionChange"
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="" width="50">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    $t('caDetails.suggestions.willAdd', {
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason)
                    })
                  "
                  placement="right"
                >
                  <el-tag
                    type="success"
                    size="mini"
                    v-if="scope.row.action === 'add'"
                    disable-transitions
                    ><i class="el-icon-check"></i
                  ></el-tag>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    $t('caDetails.suggestions.willRemove', {
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason)
                    })
                  "
                  placement="right"
                >
                  <el-tag
                    type="danger"
                    size="mini"
                    v-if="scope.row.action === 'remove'"
                    disable-transitions
                    ><i class="el-icon-delete"></i
                  ></el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="asn"
              :label="$t('announcements.asn')"
              sortable
              width="200"
            ></el-table-column>

            <el-table-column :label="$t('announcements.prefix')" sortable>
              <template slot-scope="scope">
                {{ scope.row.prefix }}{{ scope.row.max_length ? "-" + scope.row.max_length : "" }}
              </template>
            </el-table-column>
          </el-table>

          <h3 class="suggestion-title">
            {{ $t("caDetails.suggestions.ourSuggestion") }}
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('caDetails.suggestions.ourSuggestionHelp')"
              placement="right"
            >
              <sup>?</sup>
            </el-tooltip>
          </h3>
          <el-table
            size="small"
            v-if="deltaSuggestions && deltaSuggestions.length"
            :data="deltaSuggestions"
            :default-sort="{ prop: 'asn', order: 'ascending' }"
            style="width: 100%; border: 2px solid #EBEEF5; margin-left: 1rem; padding-left: 1rem"
            max-height="560"
            :empty-text="$t('common.nodata')"
            @selection-change="handleSuggestionSelectionChange"
          >
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column label="" width="50">
              <template slot-scope="scope">
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    $t('caDetails.suggestions.willAdd', {
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason)
                    })
                  "
                  placement="right"
                >
                  <el-tag
                    type="success"
                    size="mini"
                    v-if="scope.row.action === 'add'"
                    disable-transitions
                    ><i class="el-icon-check"></i
                  ></el-tag>
                </el-tooltip>
                <el-tooltip
                  class="item"
                  effect="dark"
                  :content="
                    $t('caDetails.suggestions.willRemove', {
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason)
                    })
                  "
                  placement="right"
                >
                  <el-tag
                    type="danger"
                    size="mini"
                    v-if="scope.row.action === 'remove'"
                    disable-transitions
                    ><i class="el-icon-delete"></i
                  ></el-tag>
                </el-tooltip>
              </template>
            </el-table-column>
            <el-table-column
              prop="asn"
              :label="$t('announcements.asn')"
              sortable
              width="200"
            ></el-table-column>

            <el-table-column :label="$t('announcements.prefix')" sortable>
              <template slot-scope="scope">
                {{ scope.row.prefix }}{{ scope.row.max_length ? "-" + scope.row.max_length : "" }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button
          type="text"
          @click="
            resetForm('addROAForm');
            addROASuggestionsVisible = false;
          "
          >{{ $t("common.cancel") }}</el-button
        >
        <el-button
          type="primary"
          @click="addSuggestedROA"
          :disabled="
            submittingSuggestionForm ||
              (deltaCart.added.length === 0 && deltaCart.removed.length === 0)
          "
          >{{ $t("common.confirm") }}</el-button
        >
      </span>
    </el-dialog>

    <el-dialog
      :visible.sync="analysisDetailsVisible"
      custom-class="suggestion-dialog"
      :title="$t('caDetails.analysis')"
      :close-on-click-modal="false"
      @close="analysisDetailsVisible = false"
      @open="getROAsSuggestions"
      width="50%"
    >
      <el-row>
        <el-col :xs="24">
          <el-table
            size="small"
            v-if="deltaSuggestions && deltaSuggestions.length"
            :data="deltaSuggestions"
            :default-sort="{ prop: 'asn', order: 'ascending' }"
            max-height="560"
            :empty-text="$t('common.nodata')"
          >
            <el-table-column label="" width="100">
              <template slot-scope="scope">
                <el-tag
                  type="success"
                  size="mini"
                  v-if="scope.row.action === 'add'"
                  disable-transitions
                  >{{ $t("caDetails.suggestions.addThis") }}</el-tag
                >

                <el-tag
                  type="danger"
                  size="mini"
                  v-if="scope.row.action === 'remove'"
                  disable-transitions
                  >{{ $t("caDetails.suggestions.removeThis") }}</el-tag
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="asn"
              :label="$t('announcements.asn')"
              sortable
              width="200"
            ></el-table-column>

            <el-table-column :label="$t('announcements.prefix')" sortable>
              <template slot-scope="scope">
                {{ scope.row.prefix }}{{ scope.row.max_length ? "-" + scope.row.max_length : "" }}
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="analysisDetailsVisible = false">{{
          $t("common.ok")
        }}</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AnnouncementsROAs from "../components/AnnouncementsROAs.vue";
import SimpleROAsTable from "../components/SimpleROAsTable.vue";

import "element-ui/lib/theme-chalk/display.css";
import router from "@/router";
import APIService from "@/services/APIService.js";
const cidrRegex = require("cidr-regex");
const xml2js = require("xml2js");
export default {
  components: {
    announcementsROAs: AnnouncementsROAs,
    simpleROAsTable: SimpleROAsTable
  },
  data() {
    const checkASN = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.addROAForm.required")));
      } else {
        if (value.toLowerCase().indexOf("as") === 0) {
          value = value.substr(2) * 1;
        }
        if (value >= 0 && value <= 4294967295) {
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
    const checkHandle = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.parentsTab.namerequired")));
      } else {
        if (new RegExp(/^[a-zA-Z0-9-_]+$/).test(value)) {
          callback();
        } else {
          callback(new Error(this.$t("caDetails.parentsTab.nameformat")));
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
      addROASuggestionsVisible: false,
      effects: [],
      suggestions: [],
      deltaMine: [],
      deltaMineCart: {
        added: [],
        removed: []
      },
      deltaSuggestions: [],
      deltaSuggestionsCart: {
        added: [],
        removed: []
      },
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
      submittingROAForm: false,
      submittingSuggestionForm: false,
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
        name: ""
      },
      initializeParentFormRules: {
        name: [
          {
            required: true,
            validator: checkHandle
          }
        ]
      },
      fileList: [],
      resourcesSearch: "",
      updatedAnnouncements: 0,
      bgpShown: false,
      analysisDetailsVisible: false,
      parents: {},
      repoStatus: {}
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
            value: res[k].split(", ").join("<br>")
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
    },
    deltaCart: function() {
      return {
        added: this.deltaMineCart.added.concat(this.deltaSuggestionsCart.added),
        removed: this.deltaMineCart.removed.concat(this.deltaSuggestionsCart.removed)
      };
    }
  },
  watch: {
    "initializeParentForm.response"(xml) {
      const self = this;
      xml2js.parseString(xml, function(err, result) {
        if (result && result.parent_response) {
          self.initializeParentForm.name = result.parent_response.$.parent_handle;
        }
      });
    },
    suggestions(suggestions) {
      let delta = [];

      let addToDelta = function(category, isAdd) {
        if (suggestions[category]) {
          suggestions[category].forEach(s => {
            if (category === "too_permissive") {
              delta.push({
                action: "remove",
                reason: category,
                asn: s.current.asn,
                prefix: s.current.prefix,
                max_length: s.current.max_length
              });
              s.new.forEach(n => {
                delta.push({
                  action: "add",
                  reason: category,
                  asn: n.asn,
                  prefix: n.prefix,
                  max_length: n.prefix ? n.prefix.split("/")[1] * 1 : ""
                });
              });
            } else {
              delta.push({
                action: isAdd ? "add" : "remove",
                reason: category,
                asn: s.asn,
                prefix: s.prefix,
                max_length: s.prefix ? s.prefix.split("/")[1] * 1 : ""
              });
            }
          });
        }
      };

      addToDelta("not_found", true);
      addToDelta("invalid_asn", true);
      addToDelta("invalid_length", true);

      addToDelta("stale", false);
      addToDelta("as0_redundant", false);
      addToDelta("too_permissive", false);

      this.deltaSuggestions = delta;

      this.deltaMine = [
        {
          action: "add",
          reason: "new",
          asn: this.addROAForm.asn,
          prefix: this.addROAForm.prefix,
          max_length: this.addROAForm.maxLength * 1
        }
      ];
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
    handleMineSelectionChange(val) {
      this.deltaMineCart = {
        added: val.filter(row => row.action === "add"),
        removed: val.filter(row => row.action === "remove")
      };
    },
    handleSuggestionSelectionChange(val) {
      this.deltaSuggestionsCart = {
        added: val.filter(row => row.action === "add"),
        removed: val.filter(row => row.action === "remove")
      };
    },
    getROAsSuggestions() {
      APIService.getROAsSuggestions(this.handle).then(r => {
        this.suggestions = r.data;
      });
    },
    getParents() {
      APIService.getParents(this.handle).then(response => {
        this.parents = response.data;
      });
    },
    syncParents() {
      APIService.syncParents().then(() => {
        this.getParents();
      });
    },
    getRepoStatus() {
      APIService.getRepoStatus(this.handle).then(response => {
        this.repoStatus = response.data;
      });
    },
    syncRepo() {
      APIService.syncRepo().then(() => {
        this.getRepoStatus();
      });
    },
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
      APIService.getCA(this.handle)
        .then(response => {
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
          } else {
            this.getParents();
          }
        })
        .catch(error => {
          self.parseError(error);
          localStorage.removeItem("lagostaLastCA");
          router.push("/interstitial");
        });
      APIService.getRepo(this.handle)
        .then(response => {
          this.getRepoStatus();
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

      this.loadCAs();
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
    addSuggestedROA: function() {
      const self = this;
      self.submittingSuggestionForm = true;

      APIService.updateROAs(this.handle, this.deltaCart)
        .then(() => {
          self.addROASuggestionsVisible = false;
          self.$notify({
            title: this.$t("caDetails.confirmation.added"),
            message: this.$t("caDetails.confirmation.addedSuccess"),
            type: "success"
          });
          self.updatedAnnouncements = new Date().getTime();
          self.$emit("refreshAnnouncements");
        })
        .catch(function(error) {
          self.submittingSuggestionForm = false;
          self.parseError(error);
        });
    },
    addROA: function() {
      const self = this;
      APIService.updateROAs(
        this.handle,
        {
          added: [
            {
              asn: parseInt(this.addROAForm.asn),
              prefix: this.addROAForm.prefix,
              max_length: parseInt(this.addROAForm.maxLength) || 0
            }
          ],
          removed: []
        },
        this.bgpShown
      )
        .then(r => {
          self.submittingROAForm = false;
          self.addROAFormVisible = false;
          if (r.data) {
            self.addROASuggestionsVisible = true;
            self.effects = r.data.effect.sort((a, b) => (a.state > b.state ? 1 : -1));
            self.suggestions = r.data.suggestion;
          } else {
            self.$notify({
              title: this.$t("caDetails.confirmation.added"),
              message: this.$t("caDetails.confirmation.addedSuccess"),
              type: "success"
            });
            self.updatedAnnouncements = new Date().getTime();
            self.$emit("refreshAnnouncements");
          }
        })
        .catch(function(error) {
          self.submittingROAForm = false;
          self.parseError(error);
        });
    },
    triggerError: function(error) {
      this.parseError(error);
    },
    triggerAddROA: function(row) {
      this.addROAForm.asn = row.asn + "";
      this.addROAForm.prefix = row.prefix;
      this.updateMaxLength(row.prefix);
      this.addROAFormVisible = true;
    },
    triggerShowBGP: function(val) {
      this.bgpShown = val;
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
          APIService.updateROAs(
            this.handle,
            {
              added: [],
              removed: [row]
            },
            self.bgpShown
          )
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
    removeAS() {
      if (this.addROAForm.asn.toLowerCase().indexOf("as") === 0) {
        this.addROAForm.asn = this.addROAForm.asn.substr(2);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.submittingROAForm = true;
          this.addROA();
        } else {
          return false;
        }
      });
    },
    resetForm(formName) {
      this.error = "";
      this.addROAFormVisible = false;
      if (this.$refs[formName]) {
        this.$refs[formName].resetFields();
      }
    },
    updateMaxLength(value) {
      if (value.indexOf("/") > -1) {
        this.addROAForm.maxLength = value.split("/")[1];
      }
    },
    beforeUpload(file, what) {
      const self = this;
      var reader = new FileReader();

      reader.onload = (function() {
        return function(e) {
          if (what === "repo") {
            self.initializeRepoForm.response = atob(e.target.result.substring(21));
          } else {
            self.initializeParentForm.response = atob(e.target.result.substring(21));
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
      APIService.getChildRequestXML(this.handle).then(response => {
        this.initializeParentForm.xml = response.data;
      });
      this.showAddParent = true;
    },
    addParent() {
      const self = this;
      APIService.addParentResponse(
        this.handle,
        this.initializeParentForm.response,
        this.initializeParentForm.name
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
  &.suggestion-title {
    margin-bottom: 1rem;
    margin-left: 1rem;
    margin-top: 1rem;
    font-weight: 500;
  }
  &.suggestion-title-nopadding {
    margin-left: 0;
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
  .scrollable {
    max-height: calc(100vh - 350px);
    overflow-y: auto;
  }
  .search-input {
    margin-bottom: 10px;
  }
}
</style>

<style lang="scss">
.suggestion-dialog {
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 0;
  }
}
</style>
