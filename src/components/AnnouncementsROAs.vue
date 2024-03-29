<template>
  <div>
    <i class="el-icon-loading" v-if="loadingAnnouncements"></i>

    <div v-if="!loadingAnnouncements && announcements.length === 0" class="empty">
      {{ $t("announcements.noRoasOrAnnouncements") }}
    </div>

    <el-row
      v-if="!initializeParent && !initializeRepo && announcements.length"
      align="middle"
      class="table-header"
    >
      <el-col :xs="24" :sm="8">
        <el-input
          size="mini"
          prefix-icon="el-icon-search"
          v-model="search"
          clearable
          :placeholder="$t('announcements.search')"
        ></el-input>
      </el-col>
      <el-col :xs="24" :sm="16">
        <div class="show-bgp">
          <download-csv
            class="download-csv"
            :fields="['asn', 'prefix', 'max_length', 'state']"
            :data="filteredAnnouncements"
            :name="handle + '.csv'"
          >
            <el-button class="mt-1" type="text">
              <font-awesome-icon icon="file-csv" /> {{ $t("announcements.download") }}
            </el-button>
          </download-csv>
        </div>
      </el-col>
    </el-row>

    <i class="el-icon-loading" v-if="loadingTable"></i>

    <el-table
      ref="roaTable"
      size="small"
      v-if="!loadingAnnouncements && !loadingTable && announcements.length"
      :data="filteredAnnouncements"
      :default-sort="currentSort"
      style="width: 100%"
      :row-class-name="getRowClass"
      :empty-text="$t('common.nodata')"
      @sort-change="sortChange"
    >
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row align="middle" v-if="scope.row.authorizes || scope.row.disallows" :gutter="20">
            <el-col :xs="24" :sm="12">
              <h4 class="popover-title">
                <span
                  v-t="{
                    path: 'announcements.authorizes',
                    args: { number: scope.row.authorizes ? scope.row.authorizes.length : '0' },
                  }"
                ></span>
              </h4>
              <el-table
                size="small"
                :data="scope.row.authorizes"
                style="width: 100%; margin-bottom: 2rem"
                :empty-text="$t('common.nodata')"
              >
                <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
                <el-table-column
                  prop="prefix"
                  :label="$t('announcements.prefix')"
                ></el-table-column>
              </el-table>
            </el-col>
            <el-col :xs="24" :sm="12">
              <h4 class="popover-title">
                <span
                  v-t="{
                    path: 'announcements.disallows',
                    args: { number: scope.row.disallows ? scope.row.disallows.length : '0' },
                  }"
                ></span>
              </h4>
              <el-table
                size="small"
                :data="scope.row.disallows"
                cell-class-name="el-cell--mini"
                style="width: 100%"
                :empty-text="$t('common.nodata')"
              >
                <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
                <el-table-column
                  prop="prefix"
                  :label="$t('announcements.prefix')"
                ></el-table-column>
                <el-table-column width="70">
                  <template slot-scope="scope">
                    <el-button
                      icon="el-icon-plus"
                      type="primary"
                      size="mini"
                      round
                      @click="triggerAddROA(scope.row)"
                    ></el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-col>
          </el-row>
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
      <el-table-column prop="state" :label="$t('announcements.stateLabel')" sortable>
        <template slot-scope="scope">
          <stateVisualizer :scope="scope"></stateVisualizer>
        </template>
      </el-table-column>
      <el-table-column prop="state" width="130" align="right">
        <template slot-scope="scope">
          <el-button
            icon="el-icon-plus"
            type="primary"
            size="mini"
            round
            @click="triggerAddROA(scope.row)"
            v-if="
              scope.row.state === 'announcement_not_found' ||
              scope.row.state === 'announcement_invalid_asn' ||
              scope.row.state === 'announcement_invalid_length'
            "
          ></el-button>

          <el-button
            size="mini"
            icon="el-icon-delete"
            type="primary"
            round
            v-if="scope.row.state !== 'announcement_not_found' && scope.row.max_length"
            @click="deleteROA(scope.row)"
            style="margin-left: 4px"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="
        !loadingAnnouncements &&
        !loadingTable &&
        announcements.length > 0 &&
        filteredAnnouncements.length > 0
      "
      background
      :current-page.sync="currentPage"
      :page-sizes="[10, 25, 100, 500]"
      :page-size.sync="pageSize"
      @current-change="preFilterAnnouncements"
      layout="sizes, prev, pager, next"
      :total="totalRecords"
    >
    </el-pagination>
  </div>
</template>

<script>
import APIService from "@/services/APIService.js";
import ip6addr from "ip6addr";
import StateVisualizer from "./StateVisualizer.vue";

export default {
  components: {
    stateVisualizer: StateVisualizer,
  },
  props: ["handle", "initializeParent", "initializeRepo", "updated"],
  data() {
    return {
      announcements: [],
      filteredAnnouncements: [],
      loadingAnnouncements: false,
      loadingTable: false,
      search: "",
      error: "",
      currentPage: 1,
      pageSize: 25,
      totalRecords: 0,
      debounceTimeout: -1,
      currentSort: { order: "ascending", prop: "asn" },
    };
  },
  watch: {
    updated() {
      this.loadAnnouncements();
    },
    search() {
      this.currentPage = 1;
      this.debounce(this.preFilterAnnouncements, 500);
    },
    pageSize() {
      this.preFilterAnnouncements();
    },
  },
  created() {
    this.loadingAnnouncements = true;
    this.loadAnnouncements();
  },
  methods: {
    debounce(func, wait = 100) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        func.apply(this);
      }, wait);
    },
    preFilterAnnouncements() {
      this.loadingTable = true;
      this.debounce(this.filterAnnouncements, 200);
    },
    filterAnnouncements() {
      const self = this;
      const reg = /[^0-9a-zΆ-ωΑ-ώ./-]/gi;
      const src = self.search.toLowerCase().replace(reg, "");
      this.announcements = this.announcements.sort((a, b) => {
        switch (this.currentSort.prop) {
          case "prefix":
            return (
              ip6addr.compareCIDR(a.prefix.split("-")[0], b.prefix.split("-")[0]) *
              (this.currentSort.order === "ascending" ? 1 : -1)
            );
          default:
            if (a[this.currentSort.prop] < b[this.currentSort.prop]) {
              return this.currentSort.order === "ascending" ? -1 : 1;
            }
            if (a[this.currentSort.prop] > b[this.currentSort.prop]) {
              return this.currentSort.order === "ascending" ? 1 : -1;
            }
            return 0;
        }
      });
      let filtered = this.announcements.filter(function (ann) {
        let inAuth = false;
        if (ann.authorizes) {
          inAuth = JSON.stringify(ann.authorizes).replace(reg, "").indexOf(src) > -1;
        }
        let inDis = false;
        if (ann.disallows) {
          inDis = JSON.stringify(ann.disallows).replace(reg, "").indexOf(src) > -1;
        }

        // We should skip 'valid announcement' entries because they are already
        // shown as roa_seen lines.
        let is_valid_announcement = ann.state === "announcement_valid";

        let stateLabel = true;
        if (self.$t("announcements.state")[ann.state]) {
          stateLabel =
            self.$t("announcements.state")[ann.state].toLowerCase().replace(reg, "").indexOf(src) >
            -1;
        } else {
          stateLabel = false;
        }

        return (
          ((ann.asn + "").toLowerCase().replace(reg, "").indexOf(src) > -1 ||
            ann.prefix.toLowerCase().replace(reg, "").indexOf(src) > -1 ||
            ann.state.toLowerCase().replace(reg, "").indexOf(src) > -1 ||
            stateLabel ||
            inAuth ||
            inDis) &&
          !is_valid_announcement
        );
      });
      this.totalRecords = filtered.length;
      this.filteredAnnouncements = filtered.slice(
        (this.currentPage - 1) * this.pageSize,
        Math.min(this.announcements.length, this.currentPage * this.pageSize)
      );
      this.loadingTable = false;
    },
    sortChange(sort) {
      this.currentSort = sort;
      this.filterAnnouncements();
    },
    getRowClass(data) {
      if (data.row.max_length) {
        if (data.row.state === "roa_as0" && !data.row.authorizes && !data.row.disallows) {
          return "row-as0";
        }
        if (data.row.state === "roa_no_announcement_info") {
          return "row-no-announcement";
        }
        if (data.row.state === "roa_unseen") {
          return "row-unseen";
        }
        if (data.row.state === "roa_not_held") {
          return "row-not-held";
        }
        return "row-dark";
      }
      return "row-announcement";
    },
    loadAnnouncements() {
      APIService.getBGPAnalysis(this.handle).then((r) => {
        const filtered = r.data.filter(
          (ann) =>
            typeof ann.max_length !== "undefined" ||
            ann.state === "announcement_not_found" ||
            ann.state.indexOf("invalid_") > -1
        );
        this.currentPage = 1;
        this.announcements = filtered;
        this.preFilterAnnouncements();
        this.loadingAnnouncements = false;
      });
    },
    triggerAddROA(row) {
      this.$emit("trigger-add-ROA", row);
    },
    deleteROA(row) {
      const self = this;
      this.$confirm(
        this.$t("caDetails.confirmation.message", row),
        this.$t("caDetails.confirmation.title"),
        {
          confirmButtonText: this.$t("common.ok"),
          cancelButtonText: this.$t("common.cancel"),
        }
      )
        .then(() => {
          APIService.updateROAs(this.handle, {
            added: [],
            removed: [row],
          })
            .then((r) => {
              if (r.data) {
                self.$emit("trigger-suggestions", { remove: row, data: r.data });
              } else {
                self.$notify({
                  title: this.$t("caDetails.confirmation.retired"),
                  message: this.$t("caDetails.confirmation.retiredSuccess"),
                  type: "success",
                });
                self.loadAnnouncements();
              }
            })
            .catch((error) => {
              self.$emit("trigger-error", error);
            });
        })
        .catch(() => {});
    },
  },
};
</script>

<style lang="scss" scoped>
.table-header {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.show-bgp {
  text-align: right;
}
.popover-title {
  margin-top: 0;
}
.el-tag {
  margin-right: 5px;
}
</style>

<style lang="scss">
.el-cell--mini .el-button--mini {
  padding: 4px 6px !important;
}
.el-table tr.row-dark,
.el-table tr.row-unseen {
  background-color: #f5f7fa;
}

.el-table__expanded-cell[class*="cell"] {
  border: 8px solid #f5f7fa;
  border-top: none;
}

.remove-expanded {
  .el-table__expanded-cell[class*="cell"],
  .expandable .cell {
    display: none;
  }
}

.row-announcement,
.row-unseen,
.row-not-held,
.row-no-announcement,
.row-as0 {
  .el-table__expand-column .cell,
  .el-table__expand-icon {
    display: none;
  }
}

.el-pagination {
  margin-top: 1rem;
  text-align: right;
}

.download-csv {
  display: inline;
  margin-right: 1rem;
}
</style>
