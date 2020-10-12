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
      <el-table-column prop="asn" :label="$t('announcements.asn')" width="110"></el-table-column>
      <el-table-column :label="$t('announcements.prefix')">
        <template slot-scope="scope">
          {{ scope.row.prefix }}{{ scope.row.max_length ? "-" + scope.row.max_length : "" }}
        </template>
      </el-table-column>
      <el-table-column prop="state" :label="$t('announcements.stateLabel')">
        <template slot-scope="scope">
          <stateVisualizer :scope="scope"></stateVisualizer>
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
import StateVisualizer from "./StateVisualizer.vue";

export default {
  components: {
    stateVisualizer: StateVisualizer,
  },
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
        return ann.state !== "announcement_valid";
      });
      this.totalRecords = filtered.length;
      this.filteredAnnouncements = filtered.slice(
        (this.currentPage - 1) * this.pageSize,
        Math.min(this.announcements.length, this.currentPage * this.pageSize)
      );
      this.loadingTable = false;
    }
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
