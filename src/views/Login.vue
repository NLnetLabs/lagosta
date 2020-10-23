<template>
  <div class="login">
    <el-row type="flex" class="row-index" justify="center">
      <el-col :span="10">
        <el-card class="box-card">
          <div class="text item">
            <el-form :model="form" :rules="rules" :inline="true" ref="loginForm" @submit.prevent.native="submitForm">
              <el-form-item :label="$t('login.password')" prop="token">
                <el-input
                  type="password"
                  :placeholder="$t('login.placeholder')"
                  v-model="form.token"
                  clearable
                  @keyup.enter.native="submitForm"
                ></el-input>
                <div class="el-form-item__error" slot="error" slot-scope="scope">
                  <span v-html="scope.error"></span>
                </div>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="submitForm" v-loading="loading">{{
                  $t("login.signin")
                }}</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row type="flex" class="row-index alert-row" justify="center">
      <el-col :span="10">
        <el-alert type="error" v-if="error" :closable="false">{{ error }}</el-alert>
      </el-col>
    </el-row>
    <div class="route-left">
      <img src="@/assets/images/route_left.svg" />
    </div>
    <div class="route-right">
      <img src="@/assets/images/route_right.svg" />
    </div>
  </div>
</template>

<script>
import router from "../router";
import APIService from "@/services/APIService.js";

export default {
  data() {
    const checkToken = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("login.required")));
      } else {
        if (
          value
            .toLowerCase()
            .replace(/-/gi, "")
            .indexOf("correcthorsebatterystaple") === 0
        ) {
          callback(new Error(this.$t("login.copied")));
        } else {
          callback();
        }
      }
    };
    return {
      form: {
        token: ""
      },
      rules: {
        token: [
          {
            required: true,
            validator: checkToken
          }
        ]
      },
      submitted: false,
      loading: false,
      returnUrl: "",
      error: ""
    };
  },
  created() {
    this.returnUrl = this.$route.query.returnUrl || "/";
    if (this.$route.query.id && this.$route.query.token) {
      APIService.recordLogin(
        window.atob(this.$route.query.id),
        this.$route.query.token
      );
      this.postLogin(true);
    }
  },
  methods: {
    submitForm() {
      this.$refs["loginForm"].validate(valid => {
        if (valid) {
          this.login();
        } else {
          return false;
        }
      });
    },
    login() {
      this.submitted = true;

      const self = this;
      this.loading = true;
      APIService.login(this.form.token).then(success => {
        this.postLogin(success)
      });
    },
    postLogin(success) {
      if (success) {
        this.$emit("auth-event");
        router.push(this.returnUrl);
      } else {
        self.error = this.$t("login.error");
        self.loading = false;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.login {
  margin-top: 40px;
}
.box-card {
  .el-form {
    padding: 2rem;
    text-align: center;
    .el-form-item {
      margin-bottom: 0 !important;
    }
  }
  .el-form-item__error {
    line-height: 18px !important;
  }
}
.alert-row {
  margin-top: 1rem;
}
.row-index {
  z-index: 3;
}
.route-left {
  position: fixed;
  left: -100px;
  bottom: -280px;
  z-index: 2;
}
.route-right {
  position: fixed;
  right: -196px;
  top: 40px;
  z-index: 2;
}
</style>
