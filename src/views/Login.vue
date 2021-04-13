<template>
  <div class="login">
    <el-row type="flex" class="row-index" justify="center">
      <el-col :span="10">
        <el-card class="box-card" v-if="withLogin">
          <div class="text item">
            <el-form :model="form" :rules="rules" :inline="inline" ref="loginForm" @submit.prevent.native="submitForm">
              <el-form-item v-if="withId" :label="$t('login.id')" prop="id">
                <el-input
                  type="text"
                  :placeholder="$t('login.idPlaceholder')"
                  v-model="form.id"
                  clearable
                  id="login_id"
                ></el-input>
                <div class="el-form-item__error" slot="error" slot-scope="scope">
                  <span v-html="scope.error"></span>
                </div>
              </el-form-item>
              <el-form-item :label="$t('login.password')" prop="token">
                <el-input
                  type="password"
                  :placeholder="$t('login.placeholder')"
                  v-model="form.token"
                  clearable
                  @keyup.enter.native="submitForm"
                  id="login_password"
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
        <el-alert type="error" v-if="error" :closable="false">{{ error }}
          <div style="margin-top:10px;" v-if="retryUrl">
            <i18n v-if="retryUrl" path="login.retry">
              <router-link :to="retryUrl">{{ $t('login.here') }}</router-link>
            </i18n>
          </div>
        </el-alert>
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
import sha256 from 'crypto-js/sha256';
import router from "../router";
import APIService from "@/services/APIService.js";

export default {
  data() {
    return {
      form: {
        id: "",
        token: ""
      },
      withId: false,
      withLogin: true,
      retryUrl: undefined,
      submitted: false,
      loading: false,
      returnUrl: "",
      error: ""
    };
  },
  computed: {
    inline: function() {
      // Show the form inline (on a single row) when just asking for the master
      // token, but show it on multiple rows when also asking for the login id.
      return !this.withId
    },
    rules() {
      // Use dynamic rules so that we only check the entered id when we are
      // configured to render the id input field.
      return {
        id: [
          {
            required: this.withId,
            validator: this.checkId
          }
        ],
        token: [
          {
            required: true,
            validator: this.checkToken
          }
        ]
      }
    }
  },
  created() {
    this.returnUrl = this.$route.query.returnUrl || "/";

    // Handle OpenID Connect post login redirect with the id of the now logged
    // in user and the token that should be used to authenticat and authorize
    // subsequent API calls.
    if (this.$route.query.error) {
      if (this.$route.query.error.label === undefined) {
        this.postLogin(false, JSON.parse(atob(this.$route.query.error)));
      } else {
        this.postLogin(false, this.$route.query.error);
      }
      // Hide the usual login form
      this.withLogin = false;
      // Show a retry link in the error message
      this.retryUrl = this.returnUrl;
    } else if (this.$route.query.id && this.$route.query.token && this.$route.query.attributes) {
      APIService.recordLogin(
        this.$route.query.id,
        this.$route.query.token,
        JSON.parse(atob(this.$route.query.attributes))
      );
      this.postLogin(true);
    } else {
      if (this.$route.query.withId) {
        // Configure the login form for id/password mode instead of master token
        // mode.
        this.withId = true;
      }
      // Ensure the top bar reflects the current (not) logged in state.
      this.$emit("auth-event");
    }
  },
  methods: {
    checkId(rule, value, callback) {
      if (value === "") {
        callback(new Error(this.$t("login.idRequired")));
      } else {
        callback();
      }
    },
    checkToken(rule, value, callback) {
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
    },
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
      this.loading = true;

      // Handle username/password based login
      if (this.withId) {
        // Send a hash of the password to avoid storing a password on the server
        // that (shouldn't be but) might be the same password the user uses for
        // other systems.
        let hashedPassword = sha256(this.form.token);
        APIService.login(hashedPassword, this.form.id).then(success => {
          this.postLogin(success)
        });
      } else {
        // Handle master token based login
        APIService.login(this.form.token).then(success => {
          this.postLogin(success)
        });
      }
    },
    postLogin(success, error = undefined) {
      this.loading = false;
      if (success) {
        this.$emit("auth-event");
        router.push(this.returnUrl);
      } else {
        if (error === undefined) {
          this.error = this.$t("login.error");
        } else {
          this.error = error.label
            ? this.$t("errors." + error.label, error.args)
            : this.$t("errors." + error.code);
        }
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
div.el-form-item {
  margin-top: 10px;
}
</style>
