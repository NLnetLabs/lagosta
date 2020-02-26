<template>
  <div>
    <el-row>
      <el-col :span="8" :offset="8">
        <div class="text-center">
          <div class="welcome">
            <img src="@/assets/images/welcome.svg" />
          </div>

          <h3>{{ $t("onboarding.welcome") }}</h3>
        </div>
        <p v-html="$t('onboarding.welcomeHtml')"></p>

        <el-form :model="addCAForm" :rules="rules" ref="addCAForm">
          <el-form-item label="CA Handle" prop="handle">
            <el-input
              ref="handle"
              v-model="addCAForm.handle"
              autocomplete="off"
              @keyup.enter.native="submitForm(true)"
            ></el-input>
          </el-form-item>
          <el-alert type="error" v-if="error" :closable="false">{{ error }}</el-alert>
          <el-row type="flex" class="modal-footer" justify="end">
            <el-form-item>
              <el-button type="primary" @click="submitForm()">{{
                $t("onboarding.addCAForm.confirm")
              }}</el-button>
            </el-form-item>
          </el-row>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import router from "@/router";
import APIService from "@/services/APIService.js";
export default {
  data() {
    const checkHandle = (rule, value, callback) => {
      if (value === "") {
        callback(new Error(this.$t("onboarding.addCAForm.required")));
      } else {
        if (new RegExp(/^[a-zA-Z0-9-_]+$/).test(value)) {
          callback();
        } else {
          callback(new Error(this.$t("onboarding.addCAForm.format")));
        }
      }
    };
    return {
      loading: false,
      error: "",
      addCAForm: {
        handle: ""
      },
      rules: {
        handle: [
          {
            required: true,
            validator: checkHandle,
            message: this.$t("onboarding.addCAForm.format")
          }
        ]
      },
      enterPressed: false
    };
  },
  created() {
    this.loading = true;
    if (this.$route.name === "onboarding") {
      APIService.getCAs().then(response => {
        if (response.data.cas && response.data.cas.length > 0) {
          const handle = response.data.cas[0]["handle"];
          if (handle !== "ta") {
            router.push("/cas/" + handle);
          }
        }
      });
    }
  },
  mounted() {
    this.$refs.handle.$refs.input.focus();
  },
  methods: {
    parseError(error, notify) {
      let e = error;
      if (error.data) {
        e = error.data.label
          ? this.$t("errors." + error.data.label, error.data.args)
          : this.$t("errors." + error.data.code);
        if (e === "errors." + (error.data.label ? error.data.label : error.data.code)) {
          e = error.data.msg;
        }
      }

      this.error = e;
      if (notify) {
        this.$notify({
          title: this.$t("common.error"),
          message: this.error,
          type: "error"
        });
      }
    },
    submitForm(fromKeyboard = false) {
      const self = this;
      if (!self.enterPressed) {
        this.$refs["addCAForm"].validate(valid => {
          if (valid) {
            this.$confirm(
              this.$t("onboarding.addCAForm.confirmation.message"),
              this.$t("onboarding.addCAForm.confirmation.title"),
              {
                confirmButtonText: this.$t("common.ok"),
                cancelButtonText: this.$t("common.cancel")
              }
            )
              .then(() => {
                APIService.createCA(this.addCAForm.handle)
                  .then(() => {
                    router.push("/cas/" + this.addCAForm.handle);
                  })
                  .catch(error => {
                    self.parseError(error, true);
                  });
              })
              .catch(() => {
                self.enterPressed = false;
              });
          } else {
            return false;
          }
        });
      }
      self.enterPressed = fromKeyboard;
    }
  }
};
</script>

<style lang="scss" scoped>
.text-center {
  text-align: center;
}

.welcome {
  img {
    height: 160px;
    width: 200px;
    margin: 2.5rem;
  }
}

.loading {
  margin: 2rem;
  font-size: 4rem;
  color: #999;
  text-align: center;
}
</style>
