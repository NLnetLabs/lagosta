<template>
  <div class="roa-state">
    <el-tag
      type="success"
      size="medium"
      v-if="scope.row.state === 'roa_seen'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_seen_help')"
      >{{ $t("announcements.state.roa_seen") }}</el-tag
    >
    <el-tag
      type="warning"
      size="medium"
      v-if="scope.row.state === 'roa_too_permissive'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_too_permissive_help')"
      >{{ $t("announcements.state.roa_too_permissive") }}</el-tag
    >
    <el-tag
      type="warning"
      size="medium"
      v-if="scope.row.state === 'roa_disallowing'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_disallowing_help')"
      >{{ $t("announcements.state.roa_disallowing") }}</el-tag
    >
    <el-tag
      type="warning"
      size="medium"
      v-if="scope.row.state === 'roa_as0'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_as0_help')"
      >{{ $t("announcements.state.roa_as0") }}</el-tag
    >
    <el-tag
      type="warning"
      size="medium"
      v-if="scope.row.state === 'roa_as0_redundant'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_as0_redundant_help')"
      >{{ $t("announcements.state.roa_as0_redundant") }}</el-tag
    >
    <el-tag
      type="warning"
      size="medium"
      v-if="scope.row.state === 'roa_redundant'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_redundant_help')"
      >{{ $t("announcements.state.roa_redundant") }}</el-tag
    >
    <el-tag
      type="danger"
      size="medium"
      v-if="scope.row.state === 'roa_not_held'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_not_held_help')"
      >{{ $t("announcements.state.roa_not_held") }}</el-tag
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
      :title="$t('announcements.state.announcement_not_found_help')"
      >{{ $t("announcements.state.announcement_not_found") }}</el-tag
    >
    <el-tag
      type="warning"
      size="medium"
      v-if="scope.row.state === 'roa_unseen'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.roa_unseen_help')"
      >{{ $t("announcements.state.roa_unseen") }}</el-tag
    >
    <el-tag
      type="danger"
      size="medium"
      v-if="scope.row.state === 'announcement_invalid_length'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.announcement_invalid_length_help')"
      >{{ $t("announcements.state.announcement_invalid_length") }}</el-tag
    >
    <el-tag
      type="danger"
      size="medium"
      v-if="scope.row.state === 'announcement_invalid_asn'"
      disable-transitions
      effect="plain"
      :title="$t('announcements.state.announcement_invalid_asn_help')"
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
  </div>
</template>

<script>
export default {
  props: ["scope"],
};
</script>

<style lang="scss" scoped>
.el-tag {
  margin-right: 5px;
}
</style>
