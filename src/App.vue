<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="4">
            <router-link :to="{ name: getTlLinkTarget() }">
              <div class="logo">
                <img src="@/assets/images/krill_logo_white.svg" />
              </div>
            </router-link>
          </el-col>
          <el-col :span="14">&nbsp;</el-col>
          <el-col :span="6">
            <div class="toolbar">
              <el-select v-model="$i18n.locale" placeholder="Language" size="small">
                <el-option
                  v-for="lang in langs"
                  :key="lang.iso"
                  :value="lang.iso"
                  :label="lang.label"
                ></el-option>
              </el-select>
              <el-popover v-if="user"
                placement="bottom"
                :title="$t('common.userInfo.title')"
                trigger="click">
                <font-awesome-icon icon="user" class="user" slot="reference" id="userinfo" />
                <table class="userinfo" slot="default" id="userinfo_table">
                  <tr>
                    <td class="userattr">{{ $t('common.userInfo.user') }}:</td>
                    <td>{{ user.id }}</td>
                  </tr>
                  <tr v-for="(item, index) in user.attributes" :key="index">
                    <td class="userattr">{{ index }}:</td>
                    <td>{{ item }}</td>
                  </tr>
                </table>
              </el-popover>
              <font-awesome-icon icon="sign-out-alt" v-if="user" class="logout" @click="logout" />
            </div>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <router-view v-on:auth-event="loadUser" v-on:copy-xml="copyXML" v-on:download-file="downloadFile" />
      </el-main>

      <el-footer height="40px">
        <el-row>
          <el-col :span="12">
            &copy; {{ new Date().getFullYear() }} Stichting NLnet Labs
            <span v-if="krillVersion !== ''" :title="krillStarted"> - Krill v{{ krillVersion }}</span
            >

            <el-tooltip
              class="item"
              effect="dark"
              :content="krillLatestVersion"
              placement="top"
              v-if="
                krillVersion !== '' &&
                  krillLatestVersion !== '' &&
                  krillLatestVersion !== krillVersion
              "
            >
              <a :href="krillLatestVersionURL" target="_blank"> - {{ $t("common.newversion") }}</a>
            </el-tooltip>
          </el-col>
          <el-col :span="12" class="text-right">
            <a href="https://nlnetlabs.nl/services/contracts/" target="_blank">{{
              $t("common.supportcontracts")
            }}</a>
            -
            <a href="https://rpki.readthedocs.io/en/latest/krill/index.html" target="_blank">{{
              $t("common.readthedocs")
            }}</a>
            -
            <a href="https://github.com/NLnetLabs/krill/issues/new" target="_blank">{{
              $t("common.report")
            }}</a>
          </el-col>
        </el-row>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import router from "@/router";
import APIService from "@/services/APIService.js";
import * as moment from "moment";
import { LOCALSTORAGE_NAME } from "@/auth-header";

export default {
  data() {
    return {
      krillVersion: "",
      krillLatestVersion: "",
      krillLatestVersionURL: "",
      krillStarted: "",
      user: null,
      langs: [
        { iso: "de", label: "Deutsch" },
        { iso: "en", label: "English" },
        { iso: "es", label: "Español" },
        { iso: "gr", label: "Ελληνικά" },
        { iso: "fr", label: "Français" },
        { iso: "nl", label: "Nederlands" },
        { iso: "pt", label: "Português" }
      ]
    };
  },
  onIdle() {
    if (this.$route.name !== "login") {
      this.$notify({
        title: this.$t("common.warning"),
        message: this.$t("common.idle"),
        type: "warning",
        duration: 0
      });
      this.logout();
    }
  },
  watch: {
    "$i18n.locale"(locale) {
      localStorage.lagostaLocale = locale;
      moment.locale(locale);
      this.loadStats();
    }
  },
  created() {
    this.loadStats();
    this.loadUser();
    if (localStorage.lagostaLocale) {
      this.$i18n.locale = localStorage.lagostaLocale;
    }
    moment.locale(this.$i18n.locale);
    this.checkLatestVersions();
  },
  methods: {
    copyXML(xml) {
      const self = this;
      this.$copyText(xml).then(function() {
        self.$notify({
          title: self.$t("common.success"),
          message: self.$t("common.copySuccess"),
          type: "success"
        });
      });
    },
    downloadFile(content, filename) {
      const url = window.URL.createObjectURL(new Blob([content]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
    },
    getTlLinkTarget() {
      // stay in the testbed UI, don't navigate outside of it
      return (this.$route.name === "testbed" ? "testbed" : "home");
    },
    checkLatestVersions() {
      APIService.getLatestKrillVersion()
        .then(success => {
          const gh = success.data;
          this.krillLatestVersion =
            gh.tag_name.indexOf("v") === 0 ? gh.tag_name.substr(1) : gh.tag_name;
          this.krillLatestVersionURL = gh.html_url;
        })
        .catch(() => {});
    },
    beforeUnload() {
      localStorage.removeItem(LOCALSTORAGE_NAME);
    },
    loadStats() {
      APIService.getKrillStats().then(stats => {
        if (stats && stats.data) {
          this.krillVersion = stats.data.version;
          this.krillStarted =
            this.$t("common.started") +
            " " +
            moment(stats.data.started * 1000).format("MMMM Do YYYY, HH:mm:ss");
        }
      });
    },
    loadUser() {
      this.user = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME));
    },
    logout() {
      return APIService.logout().then(response => {
        // Ensure the top bar reflects the current (not) logged in state.
        localStorage.removeItem(LOCALSTORAGE_NAME);
        this.$emit("auth-event");

        var logout_url = response.data;

        // send the user to the right location to complete the logout process,
        // e.g. at a 3rd party login provider
        if (logout_url.indexOf('http') === 0) {
          window.location.href = logout_url
        } else {
          router.push(logout_url);
        }
      });
    }
  }
};
</script>

<style lang="scss">
html,
body {
  padding: 0;
  margin: 0;
  font-family: "Lato", sans-serif;
  background-color: #fff;
}

.el-container {
  min-height: 100vh;
}

.el-header {
  background: linear-gradient(45deg, #f63107, #f63107);
  line-height: 60px;
  color: #ffffff;
  z-index: 3;
}

.el-menu-item a {
  text-decoration: none;
}

.logo {
  line-height: 10px;
  img {
    width: 146px;
    margin-left: -14px;
  }
}

.logout, .user {
  margin-left: 2rem;
  cursor: pointer;
}

.toolbar,
.text-right {
  text-align: right;
}

.el-footer {
  z-index: 100;
  background-color: #fafafa;
  color: #999;
  font-size: 13px;
  line-height: 40px;
  a,
  a:hover {
    color: #999;
    font-weight: bold;
    text-decoration: none;
  }
}

a {
  color: #f63107;
  &:hover {
    color: #f85a39;
  }
}

.valign-top {
  vertical-align: top !important;
}

.userattr {
  font-weight: bold;
  text-transform: capitalize;
}

</style>
