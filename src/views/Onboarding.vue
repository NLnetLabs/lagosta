<template>
  <div class="loading">Welcome to Lagosta.</div>
</template>

<script>
export default {
  data() {
    return {
      loading: false
    };
  },
  created() {
    this.loading = true;
  },
  methods: {}
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
