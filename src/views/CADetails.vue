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
                    @trigger-add-ROA="triggerAddROA($event)"
                    @trigger-error="triggerError($event)"
                    @trigger-suggestions="triggerSuggestions($event)"
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
                          resetAddRoaForm();
                          addROAFormVisible = true;
                        "
                        >{{ $t("caDetails.addRoa") }}</el-button
                      >
                    </el-col>
                    <el-col :span="12" style="text-align: right">
                      <el-button
                        class="mt-1"
                        type="text"
                        v-if="!initializeParent && !initializeRepo && !emptyResources"
                        @click="analysisDetailsVisible = true"
                        >{{ $t("caDetails.analyseThis") }}</el-button
                      >
                    </el-col>
                  </el-row>

                  <div v-if="!initializeParent && !initializeRepo && emptyResources" class="empty">
                    {{ $t("caDetails.noResourcesYet") }}
                    <a
                      href="javascript: void(0)"
                      @click="getContent()"
                      id="no_resources_click_to_refresh"
                      >{{ $t("caDetails.clickToRefresh") }}</a
                    >
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
                default-expand-all
                row-class-name="row-dark"
                :show-header="false"
              >
                <el-table-column type="expand">
                  <template slot-scope="props">
                    <div v-if="parents && parents[props.row.handle]">
                      <p>
                        <el-row>
                          <el-col :span="2">
                            <strong>{{ $t("caDetails.exchangeUri") }}</strong>
                          </el-col>
                          <el-col :span="22">
                            {{ parents[props.row.handle].last_exchange.uri }}
                          </el-col>
                        </el-row>
                      </p>

                      <p>
                        <el-row>
                          <el-col :span="2">
                            <strong>{{ $t("caDetails.lastExchange") }}</strong>
                          </el-col>
                          <el-col :span="22">
                            {{ getDate(parents[props.row.handle].last_exchange.timestamp) }}
                            <span
                              v-if="parents[props.row.handle].last_exchange.result === 'Success'"
                            >
                              <i class="el-icon-success" style="color: #67c23a"></i>
                            </span>
                            <span
                              v-if="parents[props.row.handle].last_exchange.result !== 'Success'"
                            >
                              <i class="el-icon-error" style="color: #f56c6c"></i>
                              {{ parents[props.row.handle].last_exchange.result }}
                            </span>
                          </el-col>
                        </el-row>
                      </p>

                      <p>
                        <el-row>
                          <el-col :span="2"
                            ><strong>{{ $t("caDetails.allResources") }}</strong></el-col
                          >
                          <el-col :span="22">
                            ASN: {{ parents[props.row.handle].all_resources.asn }}<br />
                            IPv4: {{ parents[props.row.handle].all_resources.ipv4 }}<br />
                            IPv6: {{ parents[props.row.handle].all_resources.ipv6 }}<br />
                          </el-col>
                        </el-row>
                      </p>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="handle" label="Handle">
                  <template slot-scope="scope">
                    <strong>{{ ca.parents[scope.$index].handle }}</strong>
                  </template>
                </el-table-column>
              </el-table>

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
                v-if="!initializeParent && !initializeRepo && !showAddParent"
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
                      @click="$emit('download-file', initializeParentForm.xml, 'child_request.xml')"
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
                      <div style="height: 180px">
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
                      @click="
                        $emit('download-file', initializeRepoForm.xml, 'publisher_request.xml')
                      "
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
                      <div style="height: 180px">
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
                default-expand-all
                row-class-name="row-dark"
                :show-header="false"
              >
                <el-table-column type="expand">
                  <template>
                    <div v-if="repoStatus">
                      <p v-if="repoStatus.last_exchange">
                        <strong>{{ $t("caDetails.lastExchange") }}</strong
                        >&nbsp;
                        {{ getDate(repoStatus.last_exchange.timestamp) }}
                        <span v-if="repoStatus.last_exchange.result === 'Success'"
                          ><i class="el-icon-success" style="color: #67c23a"></i
                        ></span>
                        <span v-if="repoStatus.last_exchange.result !== 'Success'"
                          ><i class="el-icon-error" style="color: #f56c6c"></i>
                          {{ repoStatus.last_exchange.result }}
                          <strong>URI</strong> {{ repoStatus.last_exchange.uri }}
                        </span>
                      </p>
                      <p>
                        <strong>{{ $t("caDetails.nextExchange") }}</strong
                        >&nbsp;
                        {{ getDate(repoStatus.next_exchange_before) }}
                      </p>
                      <p>
                        <el-row>
                          <el-col :span="2"
                            ><strong>{{ $t("caDetails.published") }}</strong></el-col
                          >
                          <el-col :span="22">
                            <p
                              :key="pub.uri"
                              v-for="pub in repoStatus.published"
                              style="margin-top: 0"
                            >
                              <el-row>
                                <el-col :span="12"
                                  >{{ pub.uri.split("/").pop() }}
                                  <el-button
                                    type="text"
                                    size="mini"
                                    class="mini-download"
                                    :title="$t('common.copy')"
                                    @click="$copyText(pub.uri)"
                                  >
                                    <font-awesome-icon icon="clipboard" />
                                  </el-button>
                                  <el-button
                                    type="text"
                                    size="mini"
                                    class="mini-download"
                                    style="padding-left: 0"
                                    :title="$t('common.download')"
                                    @click="
                                      $emit(
                                        'download-file',
                                        convertB64(pub.base64),
                                        pub.uri.split('/').pop()
                                      )
                                    "
                                  >
                                    <font-awesome-icon icon="download" />
                                  </el-button>
                                </el-col>
                              </el-row>
                            </p>
                          </el-col>
                        </el-row>
                      </p>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="type" :label="$t('caDetails.type')">
                  <template>
                    {{ $t("caDetails.repo") }}
                  </template>
                </el-table-column>
              </el-table>

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
      custom-class="add-roa-dialog"
      :close-on-click-modal="false"
      @close="
        error = '';
        addROAFormVisible = false;
      "
    >
      <el-form :model="addROAForm" :rules="addROAFormRules" ref="addROAForm">
        <el-form-item :label="$t('announcements.asn')" prop="asn">
          <el-input
            v-model="addROAForm.asn"
            autocomplete="off"
            @change="removeAS()"
            id="add_roa_asn"
          ></el-input>
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
            id="add_roa_prefix"
          ></el-input>
        </el-form-item>
        <el-form-item :label="$t('caDetails.maxLength')" placeholder="ie. 24" prop="maxLength">
          <el-input
            v-model="addROAForm.maxLength"
            autocomplete="off"
            type="number"
            :readonly="addROAForm.asn === '0'"
            min="4"
            max="64"
            id="add_roa_maxlength"
          ></el-input>
        </el-form-item>
        <el-alert type="error" v-if="error" :closable="false" class="mb-1">{{ error }}</el-alert>
        <jsonErrorVisualizer :json="deltaError" v-if="error && deltaError"></jsonErrorVisualizer>
        <el-row type="flex" class="modal-footer" justify="end">
          <el-form-item>
            <el-button @click="resetAddRoaForm()">{{ $t("common.cancel") }}</el-button>
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
      @opened="$refs.deltaMineTable.toggleRowSelection(deltaMine[0])"
      width="80%"
    >
      <div slot="title" class="el-dialog__title">
        <span v-if="!removeROASuggestions">
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
        </span>
        <span v-if="removeROASuggestions">
          {{ $t("caDetails.suggestions.removing") }}
        </span>
      </div>
      <el-row>
        <el-col :xs="24" :sm="12">
          <h3 class="suggestion-title">
            {{ $t("caDetails.suggestions.yourChoice") }}
          </h3>
          <el-table
            size="small"
            ref="deltaMineTable"
            v-if="deltaMine && deltaMine.length"
            :data="deltaMine"
            :default-sort="{ prop: 'asn', order: 'ascending' }"
            style="width: 100%; border: 2px solid #ebeef5"
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
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason),
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
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason),
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
          <h4 v-if="!deltaSuggestions || deltaSuggestions.length === 0">
            {{ $t("caDetails.suggestions.keep") }}
          </h4>
          <el-table
            size="small"
            ref="deltaSuggestionsTable"
            v-if="deltaSuggestions && deltaSuggestions.length"
            :data="deltaSuggestions"
            :default-sort="{ prop: 'asn', order: 'ascending' }"
            style="width: 100%; border: 2px solid #ebeef5"
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
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason),
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
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason),
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
        <el-col :xs="24" :sm="11" :offset="1">
          <h3 class="suggestion-title suggestion-title-nopadding">
            {{ $t("caDetails.suggestions.willResult") }}
          </h3>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button
          type="text"
          @click="
            resetAddRoaForm();
            addROASuggestionsVisible = false;
          "
          >{{ $t("common.cancel") }}</el-button
        >
        <el-button
          type="primary"
          @click="addSuggestedROA"
          :disabled="deltaCart.added.length === 0 && deltaCart.removed.length === 0"
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
          <h3
            v-if="deltaSuggestions && deltaSuggestions.length"
            class="suggestion-title suggestion-title-nopadding suggestion-title-light"
          >
            <span v-html="$t('caDetails.suggestions.following')">.</span>
          </h3>
          <h3
            v-if="deltaSuggestions && deltaSuggestions.length === 0"
            class="suggestion-title suggestion-title-nopadding suggestion-title-light"
          >
            {{ $t("caDetails.suggestions.nochanges") }}
          </h3>
          <el-table
            size="small"
            v-if="deltaSuggestions && deltaSuggestions.length"
            :data="deltaSuggestions"
            :default-sort="{ prop: 'asn', order: 'ascending' }"
            max-height="560"
            :empty-text="$t('common.nodata')"
            @selection-change="handleSuggestionSelectionChange"
          >
            <el-table-column type="selection" width="45"> </el-table-column>
            <el-table-column label="" width="45">
              <template slot-scope="scope">
                <el-tag
                  type="success"
                  size="mini"
                  :title="
                    $t('caDetails.suggestions.willAdd', {
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason),
                    })
                  "
                  v-if="scope.row.action === 'add'"
                  disable-transitions
                  ><i class="el-icon-check"></i
                ></el-tag>
                <el-tag
                  type="danger"
                  size="mini"
                  :title="
                    $t('caDetails.suggestions.willRemove', {
                      reason: $t('caDetails.suggestions.reasons.' + scope.row.reason),
                    })
                  "
                  v-if="scope.row.action === 'remove'"
                  disable-transitions
                  ><i class="el-icon-delete"></i
                ></el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="asn"
              :label="$t('announcements.asn')"
              sortable
              width="100"
            ></el-table-column>

            <el-table-column :label="$t('announcements.prefix')" sortable width="200">
              <template slot-scope="scope">
                {{ scope.row.prefix }}{{ scope.row.max_length ? "-" + scope.row.max_length : "" }}
              </template>
            </el-table-column>
            <el-table-column label="">
              <template slot-scope="scope">
                <div class="suggestion-reason">
                  {{ $t("caDetails.suggestions.reasons." + scope.row.reason) }}
                </div>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>

      <span slot="footer" class="dialog-footer">
        <el-button
          type="text"
          @click="analysisDetailsVisible = false"
          v-if="deltaSuggestions && deltaSuggestions.length"
          >{{ $t("common.cancel") }}</el-button
        >
        <el-button
          type="primary"
          v-if="deltaSuggestions && deltaSuggestions.length"
          @click="addSuggestedROA"
          :disabled="deltaCart.added.length === 0 && deltaCart.removed.length === 0"
          >{{ $t("common.confirm") }}</el-button
        >
        <el-button
          type="primary"
          v-if="deltaSuggestions && deltaSuggestions.length === 0"
          @click="analysisDetailsVisible = false"
          >{{ $t("common.ok") }}</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import AnnouncementsROAs from "../components/AnnouncementsROAs.vue";
import JSONErrorVisualizer from "../components/JSONErrorVisualizer.vue";

import "element-ui/lib/theme-chalk/display.css";
import router from "@/router";
import APIService from "@/services/APIService.js";
const cidrRegex = require("cidr-regex");
const xml2js = require("xml2js");
import * as moment from "moment";

export default {
  components: {
    announcementsROAs: AnnouncementsROAs,
    jsonErrorVisualizer: JSONErrorVisualizer,
  },
  data() {
    const checkASN = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("caDetails.addROAForm.required")));
      } else {
        if (value && value.toLowerCase().indexOf("as") === 0) {
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
        if (!value || cidrRegex({ exact: true }).test(value)) {
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
      deltaError: null,
      addROAFormVisible: false,
      addROASuggestionsVisible: false,
      removeROASuggestions: false,
      effects: [],
      suggestions: [],
      deltaMine: [],
      deltaMineCart: {
        added: [],
        removed: [],
      },
      deltaSuggestions: [],
      deltaSuggestionsCart: {
        added: [],
        removed: [],
      },
      addROAForm: {
        asn: "",
        prefix: "",
        maxLength: "",
      },
      addROAFormRules: {
        asn: [
          {
            required: true,
            validator: checkASN,
            message: this.$t("caDetails.addROAForm.asn_format"),
          },
        ],
        prefix: [
          {
            validator: checkPrefix,
            required: true,
          },
        ],
      },
      submittingROAForm: false,
      submittingSuggestionForm: false,
      initializeRepo: false,
      initializeRepoForm: {
        xml: "",
        response: "",
      },
      showAddParent: false,
      initializeParent: false,
      initializeParentForm: {
        xml: "",
        originalXml: "",
        response: "",
        name: "",
      },
      initializeParentFormRules: {
        name: [
          {
            required: true,
            validator: checkHandle,
          },
        ],
      },
      fileList: [],
      resourcesSearch: "",
      updatedAnnouncements: 0,
      updatedPreview: 0,
      analysisDetailsVisible: false,
      parents: {},
      repoStatus: {},
      showEntitlements: false,
      lastModifiedTable: null,
    };
  },
  computed: {
    properties: function () {
      if (this.repo.repository_response && this.repoStatus) {
        return [
          {
            props: [
              {
                prop: "Base URI",
                value: this.repo.repository_response.repo_info.sia_base,
              },
              {
                prop: "RPKI Notify",
                value: this.repo.repository_response.repo_info.rrdp_notification_uri,
              },
              {
                prop: "Service URI",
                value: this.repo.repository_response.service_uri,
              },
            ],
          },
        ];
      }
      return [];
    },
    resourcesArray: function () {
      let resArray = [];
      if (this.ca) {
        let res = this.ca.resources;
        Object.keys(res).forEach((k) => {
          resArray.push({
            prop: k,
            value: res[k].split(", ").join("<br>"),
          });
        });
      }
      return resArray;
    },
    childrenArray: function () {
      return this.ca
        ? this.ca.children.map((c) => {
            return {
              handle: c,
            };
          })
        : [];
    },
    emptyResources: function () {
      let empty = true;
      this.resourcesArray.forEach((r) => {
        if (r.value !== "") {
          empty = false;
        }
      });
      return empty;
    },
    deltaCart: function () {
      return {
        added: this.deltaMineCart.added.concat(this.deltaSuggestionsCart.added),
        removed: this.deltaMineCart.removed.concat(this.deltaSuggestionsCart.removed),
      };
    },
  },
  watch: {
    "initializeParentForm.response"(xml) {
      const self = this;
      xml2js.parseString(xml, function (err, result) {
        if (result && result.parent_response) {
          self.initializeParentForm.name = result.parent_response.$.parent_handle;
        }
      });
    },
    suggestions(suggestions) {
      let delta = [];

      let addToDelta = function (category, isAdd) {
        if (suggestions[category]) {
          suggestions[category].forEach((s) => {
            if (category === "too_permissive") {
              delta.push({
                action: "remove",
                reason: category,
                asn: s.current.asn,
                prefix: s.current.prefix,
                max_length: s.current.max_length,
              });
              s.new.forEach((n) => {
                delta.push({
                  action: "add",
                  reason: "specific",
                  asn: n.asn,
                  prefix: n.prefix,
                  max_length: n.prefix ? n.prefix.split("/")[1] * 1 : "",
                });
              });
            } else {
              delta.push({
                action: isAdd ? "add" : "remove",
                reason: category,
                asn: s.asn,
                prefix: s.prefix,
                max_length: s.prefix ? s.prefix.split("/")[1] * 1 : "",
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
      addToDelta("not_held", false);
      addToDelta("redundant", false);
      addToDelta("too_permissive", false);
      addToDelta("disallowing", false);

      this.deltaSuggestions = delta;
      if (!this.removeROASuggestions) {
        this.deltaMine = [
          {
            action: "add",
            reason: "new",
            asn: this.addROAForm.asn * 1,
            prefix: this.addROAForm.prefix,
            max_length: this.addROAForm.maxLength * 1,
          },
        ];
      }
    },
  },
  created() {
    moment.locale(this.$i18n.locale);
    this.getContent();
  },
  beforeRouteUpdate(to, from, next) {
    this.handle = to.params.handle;
    this.activeTab = to.params.tab;
    this.getContent();
    next();
  },
  methods: {
    getDate(timestamp) {
      return moment(timestamp * 1000).format("MMMM Do YYYY, HH:mm:ss");
    },
    convertB64(b64) {
      return atob(b64);
    },
    previewUpdates() {
      APIService.updateROAsDryRun(this.handle, this.deltaCart).then((r) => {
        this.effects = r.data.sort((a, b) => (a.state > b.state ? 1 : -1));
        this.updatedPreview = new Date().getTime();
      });
    },
    handleMineSelectionChange(val) {
      const self = this;
      this.deltaMineCart = {
        added: val.filter((row) => row.action === "add"),
        removed: val.filter((row) => row.action === "remove"),
      };
      if (this.lastModifiedTable !== "mine" && this.$refs["deltaSuggestionsTable"]) {
        this.$refs["deltaSuggestionsTable"].clearSelection();
      }
      window.setTimeout(function () {
        self.previewUpdates();
      }, 1000);
      this.lastModifiedTable = "mine";
    },
    handleSuggestionSelectionChange(val) {
      const self = this;
      this.deltaSuggestionsCart = {
        added: val.filter((row) => row.action === "add"),
        removed: val.filter((row) => row.action === "remove"),
      };
      if (this.lastModifiedTable !== "suggestions" && this.$refs["deltaMineTable"]) {
        this.$refs["deltaMineTable"].clearSelection();
      }
      window.setTimeout(function () {
        self.previewUpdates();
      }, 1000);
      this.lastModifiedTable = "suggestions";
    },
    getROAsSuggestions() {
      this.suggestions = [];
      APIService.getROAsSuggestions(this.handle)
        .then((r) => {
          this.suggestions = r.data;
        })
        .catch((error) => {
          this.parseError(error, true);
        });
    },
    getParents() {
      APIService.getParents(this.handle)
        .then((response) => {
          this.parents = response.data;
        })
        .catch((error) => {
          this.parseError(error, true);
        });
    },
    syncParents() {
      APIService.syncParents()
        .then(() => {
          this.getParents();
        })
        .catch((error) => {
          this.parseError(error, true);
        });
    },
    getRepoStatus() {
      APIService.getRepoStatus(this.handle)
        .then((response) => {
          this.repoStatus = response.data;
        })
        .catch((error) => {
          this.parseError(error, true);
        });
    },
    syncRepo() {
      APIService.syncRepo()
        .then(() => {
          this.getRepoStatus();
        })
        .catch((error) => {
          this.parseError(error, true);
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
        if (error.data.delta_error) {
          this.deltaError = error.data.delta_error;
        } else {
          this.deltaError = null;
        }
      }

      this.error = e;
      if (notify) {
        this.$notify({
          title: this.$t("common.error"),
          message: this.error,
          type: "error",
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
        .then((response) => {
          this.loading = false;
          this.ca = response.data;
          if (!this.ca.parents || this.ca.parents.length === 0) {
            this.initializeParent = true;
            if (this.activeTab === "roas") {
              this.activeTab = "parents";
            }
            APIService.getChildRequestXML(this.handle)
              .then((response) => {
                this.initializeParentForm.xml = response.data;
              })
              .catch((error) => {
                self.parseError(error, true);
              });
          } else {
            this.getParents();
          }
        })
        .catch((error) => {
          self.parseError(error);
          localStorage.removeItem("lagostaLastCA");
          router.push("/interstitial");
        });
      APIService.getRepo(this.handle)
        .then((response) => {
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
          APIService.getRepoRequestXML(this.handle)
            .then((response) => {
              this.initializeRepoForm.xml = response.data;
            })
            .catch((error) => {
              self.parseError(error, true);
            });
        });

      this.loadCAs();
    },
    getParent(row) {
      const self = this;
      this.loadingParent = true;
      this.parentDetails = [];
      APIService.getParentContact(this.handle, row.handle)
        .then((response) => {
          this.loadingParent = false;
          if (response.data.rfc6492) {
            this.parentDetails = [
              {
                prop: "Parent handle",
                value: response.data.rfc6492.parent_handle,
              },
              {
                prop: "Child handle",
                value: response.data.rfc6492.child_handle,
              },
              {
                prop: "Service URI",
                value: response.data.rfc6492.service_uri,
              },
            ];
          }
        })
        .catch((error) => {
          self.parseError(error, true);
        });
    },
    loadCAs() {
      const self = this;
      APIService.getCAs()
        .then((response) => {
          this.loadingCAs = false;
          this.CAs = response.data.cas;
        })
        .catch((error) => {
          self.parseError(error, true);
        });
    },
    loadCA(row) {
      router.push("/cas/" + row.handle);
    },
    switchCA() {
      router.push("/cas/" + this.handle);
    },
    resetDeltaCarts() {
      this.deltaMineCart = {
        added: [],
        removed: [],
      };
      this.deltaSuggestionsCart = {
        added: [],
        removed: [],
      };
    },
    addSuggestedROA() {
      const self = this;
      self.submittingSuggestionForm = true;

      APIService.updateROAs(this.handle, this.deltaCart)
        .then(() => {
          self.addROASuggestionsVisible = false;
          self.analysisDetailsVisible = false;
          self.$notify({
            title: this.$t("caDetails.confirmation.added"),
            message: this.$t("caDetails.confirmation.addedSuccess"),
            type: "success",
          });
          self.updatedAnnouncements = new Date().getTime();
        })
        .catch(function (error) {
          self.submittingSuggestionForm = false;
          self.parseError(error);
        });
    },
    addROA() {
      const self = this;
      this.removeROASuggestions = false;
      APIService.updateROAs(this.handle, {
        added: [
          {
            asn: parseInt(this.addROAForm.asn),
            prefix: this.addROAForm.prefix,
            max_length: parseInt(this.addROAForm.maxLength) || 0,
          },
        ],
        removed: [],
      })
        .then((r) => {
          self.submittingROAForm = false;
          self.addROAFormVisible = false;
          if (r.data) {
            self.resetDeltaCarts();
            self.addROASuggestionsVisible = true;
            self.effects = r.data.effect.sort((a, b) => (a.state > b.state ? 1 : -1));
            self.suggestions = r.data.suggestion;
          } else {
            self.$notify({
              title: this.$t("caDetails.confirmation.added"),
              message: this.$t("caDetails.confirmation.addedSuccess"),
              type: "success",
            });
            self.updatedAnnouncements = new Date().getTime();
          }
        })
        .catch(function (error) {
          self.submittingROAForm = false;
          self.parseError(error);
        });
    },
    triggerError(error) {
      this.parseError(error);
    },
    triggerAddROA(row) {
      this.addROAForm.asn = row.asn + "";
      this.addROAForm.prefix = row.prefix;
      this.updateMaxLength(row.prefix);
      this.addROAFormVisible = true;
    },
    triggerSuggestions(event) {
      this.removeROASuggestions = true;
      this.resetDeltaCarts();
      this.addROASuggestionsVisible = true;
      this.effects = event.data.effect.sort((a, b) => (a.state > b.state ? 1 : -1));
      this.suggestions = event.data.suggestion;
      this.deltaMine = [
        {
          action: "remove",
          reason: "new",
          asn: event.remove.asn * 1,
          prefix: event.remove.prefix,
          max_length: event.remove.maxLength * 1,
        },
      ];
    },
    removeAS() {
      if (this.addROAForm.asn.toLowerCase().indexOf("as") === 0) {
        this.addROAForm.asn = this.addROAForm.asn.substr(2);
      }
      if (this.addROAForm.asn === "0") {
        this.updateMaxLength(this.addROAForm.prefix);
      }
    },
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.submittingROAForm = true;
          this.addROA();
        } else {
          return false;
        }
      });
    },
    resetAddRoaForm() {
      this.error = "";
      this.addROAFormVisible = false;
      this.submittingROAForm = false;
      this.$set(this.addROAForm, "asn", null);
      this.$set(this.addROAForm, "prefix", null);
      this.$set(this.addROAForm, "maxLength", "");
    },
    updateMaxLength(value) {
      if (value && value.indexOf("/") > -1) {
        this.addROAForm.maxLength = value.split("/")[1];
      }
    },
    beforeUpload(file, what) {
      const self = this;
      var reader = new FileReader();

      reader.onload = (function () {
        return function (e) {
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
      const self = this;
      this.initializeParentForm.xml = "";
      this.initializeParentForm.response = "";
      APIService.getChildRequestXML(this.handle)
        .then((response) => {
          this.initializeParentForm.xml = response.data;
        })
        .catch((error) => {
          self.parseError(error, true);
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
            type: "success",
          });
          this.getContent();
        })
        .catch((error) => {
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
            type: "success",
          });
          this.getContent();
        })
        .catch((error) => {
          self.parseError(error, true);
        });
    },
  },
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
    line-height: 1.5rem;
  }
  &.suggestion-title-nopadding {
    margin-left: 0;
  }
  &.suggestion-title-light {
    font-weight: 300;
  }
}

h4 {
  font-weight: 300;
  margin-left: 1rem;
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

.mini-download {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  padding-left: 10px;
}
</style>

<style lang="scss">
.suggestion-dialog {
  .el-dialog__body {
    padding-top: 0;
    padding-bottom: 0;
  }
}
.add-roa-dialog {
  input:read-only {
    background-color: #f0f0f0;
  }
  .modal-footer {
    .el-form-item {
      margin-bottom: 0;
    }
  }
}

.el-table tr.row-dark {
  background-color: #f5f7fa;
}

.suggestion-reason {
  font-style: italic;
  color: #999;
  word-break: normal;
}
</style>
