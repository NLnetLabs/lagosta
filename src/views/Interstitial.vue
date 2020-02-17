<template>
  <div class="loading">
    <span v-if="loading">
      <i class="el-icon-loading"></i>
    </span>
  </div>
</template>

<script>
import router from "@/router";
import APIService from "@/services/APIService.js";
export default {
  data() {
    return {
      loading: false
    };
  },
  created() {
    this.loading = true;
    this.loadCAs();
  },
  methods: {
    loadCAs: function() {
      APIService.getCAs().then(response => {
        this.loading = false;
        if (response.data.cas && response.data.cas.length > 0) {
          let filtered = response.data.cas.map(ca => ca.handle).filter(ca => ca !== "ta");
          if (filtered.length > 0) {
            let handle = filtered[0];
            if (localStorage.lagostaLastCA) {
              handle = localStorage.lagostaLastCA;
            }
            router.push("/cas/" + handle);
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/onboarding");
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.loading {
  margin: 2rem;
  font-size: 4rem;
  color: #999;
  text-align: center;
}
</style>
