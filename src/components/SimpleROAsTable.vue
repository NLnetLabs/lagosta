<template>
  <div class="simple-roas-table">
    <el-table
      ref="roaTable"
      size="small"
      v-if="announcements"
      :data="filteredAnnouncements"
      style="width: 100%"
      :empty-text="$t('common.nodata')"
    >
      <el-table-column
        prop="asn"
        :label="$t('announcements.asn')"
        width="110"
      ></el-table-column>
      <el-table-column :label="$t('announcements.prefix')">
        <template slot-scope="scope">
          {{ scope.row.prefix }}{{ scope.row.max_length ? "-" + scope.row.max_length : "" }}
        </template>
      </el-table-column>
      <el-table-column prop="state" :label="$t('announcements.stateLabel')">
        <template slot-scope="scope">
          <el-tag
            type="success"
            size="medium"
            v-if="scope.row.state === 'roa_seen'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.roa_seen") }}</el-tag
          >
          <el-tag
            type="warning"
            size="medium"
            v-if="scope.row.state === 'roa_too_permissive'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.roa_too_permissive") }}</el-tag
          >
          <el-tag
            type="success"
            size="mini"
            v-if="scope.row.authorizes && scope.row.authorizes.length"
            disable-transitions
            >{{ scope.row.authorizes.length }}</el-tag
          >
          <el-tag
            type="warning"
            size="mini"
            v-if="scope.row.disallows && scope.row.disallows.length"
            disable-transitions
            >{{ scope.row.disallows.length }}</el-tag
          >
          <el-tag
            type="info"
            size="medium"
            v-if="scope.row.state === 'announcement_not_found'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.announcement_not_found") }}</el-tag
          >
          <el-tag
            type="warning"
            size="medium"
            v-if="scope.row.state === 'roa_unseen'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.roa_unseen") }}</el-tag
          >
          <el-tag
            type="danger"
            size="medium"
            v-if="scope.row.state === 'announcement_invalid_length'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.announcement_invalid_length") }}</el-tag
          >
          <el-tag
            type="danger"
            size="medium"
            v-if="scope.row.state === 'announcement_invalid_asn'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.announcement_invalid_asn") }}</el-tag
          >
          <el-tag
            type="danger"
            size="medium"
            v-if="scope.row.state === 'roa_no_announcement_info'"
            disable-transitions
            effect="plain"
            >{{ $t("announcements.state.roa_no_announcement_info") }}</el-tag
          >
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      background
      :current-page.sync="currentPage"
      :page-size="pageSize"
      :hide-on-single-page="true"
      @current-change="preFilterAnnouncements"
      layout="prev, pager, next"
      :total="totalRecords"
    >
    </el-pagination>
  </div>
</template>

<script>
export default {
  props: ["announcements", "updated"],
  data() {
    return {
      filteredAnnouncements: [],
      error: "",
      currentPage: 1,
      pageSize: 10,
      totalRecords: 0,
      loadingTable: false
    };
  },
  watch: {
    updated() {
      this.preFilterAnnouncements();
    }
  },
  created() {
    this.preFilterAnnouncements();
  },
  methods: {
    debounce: function(func, wait = 100) {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        func.apply(this);
      }, wait);
    },
    preFilterAnnouncements: function() {
      this.debounce(this.filterAnnouncements, 200);
    },
    filterAnnouncements: function() {
      let filtered = this.announcements.filter(function(ann) {
        return (
          ann.state !== 'announcement_valid'
        );
      });
      this.totalRecords = filtered.length;
      this.filteredAnnouncements = filtered.slice(
        (this.currentPage - 1) * this.pageSize,
        Math.min(this.announcements.length, this.currentPage * this.pageSize)
      );
      this.loadingTable = false;
    },
  }
};
</script>

<style lang="scss" scoped>
.el-tag {
  margin-right: 5px;
}
</style>

<style lang="scss">
.simple-roas-table {

.el-pagination {
  margin-top: 1rem;
  text-align: left;
}
}
</style>
