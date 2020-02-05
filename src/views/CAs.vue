<template>
  <div>

    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">{{ $t("cas.cas") }}</el-breadcrumb-item>
        </el-breadcrumb>
        <div class="search-input" v-if="!loading">
          <el-form :inline="true">
            <el-form-item>
              <el-input
                size="mini"
                :placeholder="$t('cas.search')"
                prefix-icon="el-icon-search"
                v-model="search"
                v-if="CAs.length > 0"
                clearable
              ></el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div class="text item">
        <span v-if="loading">
          <i class="el-icon-loading"></i>
          {{ $t("cas.loading") }}
        </span>
        <el-table
          v-if="CAs.length > 0"
          :data="filteredCAs"
          @row-click="loadCA"
          style="width: 100%"
        >
          <el-table-column label="Handle" v-if="!loading">
            <template slot-scope="scope">
              <router-link
                :to="{ name: 'caDetails', params: { handle: filteredCAs[scope.$index].handle }}"
              >
                <el-button type="text">{{ filteredCAs[scope.$index].handle }}</el-button>
              </router-link>
            </template>
          </el-table-column>
        </el-table>

        <div v-if="!loading && CAs.length === 0" class="empty">{{ $t("cas.noCas") }}</div>
      </div>
    </el-card>
  </div>
</template>

<script>
import router from "@/router";
import APIService from "@/services/APIService.js";
export default {
  data() {
    return {
      loading: false,
      CAs: [],
      search: "",
      error: "",
    };
  },
  computed: {
    filteredCAs: function() {
      let src = this.search;
      return this.CAs.filter(function(ca) {
        return ca.handle.toLowerCase().indexOf(src) > -1;
      });
    }
  },
  created() {
    this.loading = true;
    this.loadCAs();
  },
  methods: {
    loadCAs: function() {
      APIService.getCAs().then(response => {
        this.loading = false;
        this.CAs = response.data.cas;
      });
    },
    loadCA: function(row) {
      router.push("/cas/" + row.handle);
    }
  }
};
</script>

<style lang="scss" scoped>
.box-card {
  margin: 2rem;
}
.search-input {
  float: right;
  margin-top: -27px;
}
.modal-footer {
  margin-top: 30px;
  .el-form-item {
    margin-bottom: 0;
  }
}
.empty {
  font-size: 14px;
}
</style>
