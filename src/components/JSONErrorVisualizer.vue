<template>
  <div class="json-error">
    <el-row v-if="json.duplicates && json.duplicates.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.duplicates") }}</div>
      </el-col>
      <el-col :span="20">
        <el-table size="small" :data="json.duplicates">
          <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="prefix" :label="$t('announcements.prefix')"></el-table-column>
          <el-table-column prop="max_length" :label="$t('caDetails.maxLength')"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="json.covered && json.covered.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.covered") }}</div>
      </el-col>
      <el-col :span="20">
        <el-table size="small" :data="json.covered">
          <el-table-column prop="covered_by.asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="covered_by.prefix" :label="$t('announcements.prefix')"></el-table-column>
          <el-table-column prop="covered_by.max_length" :label="$t('caDetails.maxLength')"></el-table-column>
        </el-table>
      </el-col>
    </el-row>


    <el-row v-if="json.notheld && json.notheld.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.notheld") }}</div>
      </el-col>
      <el-col :span="20">
        <el-table size="small" :data="json.notheld">
          <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="prefix" :label="$t('announcements.prefix')"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="json.unknowns && json.unknowns.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.unknowns") }}</div>
      </el-col>
      <el-col :span="20">
        <el-table size="small" :data="json.unknowns">
          <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="prefix" :label="$t('announcements.prefix')"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="json.invalid_length && json.invalid_length.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.invalid_length") }}</div>
      </el-col>
      <el-col :span="20">
        <el-table size="small" :data="json.invalid_length">
          <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="prefix" :label="$t('announcements.prefix')"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="json.covering && json.covering.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.covering") }}</div>
      </el-col>
      <el-col :span="20">
        <div v-for="cover in json.covering" v-bind:key="cover.addition.prefix">
        <el-table size="small" :data="cover.covering">
          <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="prefix" :label="$t('announcements.prefix')"></el-table-column>
          <el-table-column prop="max_length" :label="$t('caDetails.maxLength')"></el-table-column>
        </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row v-if="json.as0_exists && json.as0_exists.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.as0_exists") }}</div>
      </el-col>
      <el-col :span="20">
        <el-table size="small" :data="json.as0_exists">
          <el-table-column prop="existing_as0.asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="existing_as0.prefix" :label="$t('announcements.prefix')"></el-table-column>
        </el-table>
      </el-col>
    </el-row>

    <el-row v-if="json.as0_overlaps && json.as0_overlaps.length" class="row">
      <el-col :span="4">
        <div class="title">{{ $t("deltaErrors.as0_overlaps") }}</div>
      </el-col>
      <el-col :span="20">
        <div v-for="over in json.as0_overlaps" v-bind:key="over.addition.prefix">
        <el-table size="small" :data="over.existing">
          <el-table-column prop="asn" :label="$t('announcements.asn')"></el-table-column>
          <el-table-column prop="prefix" :label="$t('announcements.prefix')"></el-table-column>
        </el-table>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  props: ["json"],
};
</script>

<style lang="scss">
.json-error {
  font-size: 0.7rem;
  border: 2px solid #fef0f0;
  padding: 8px 24px;
  color: #f56c6c;
  max-height: 4rem;
  margin-top: -1rem;
  margin-bottom: 1rem;
  overflow: auto;
  .title {
    font-weight: bold;
    margin-top: 12px;
  }
  .row {
    margin-bottom: 2rem;
  }
}
</style>
