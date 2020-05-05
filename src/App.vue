<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-row>
          <el-col :span="4">
            <router-link :to="{ name: 'home' }">
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
              <font-awesome-icon icon="sign-out-alt" v-if="user" class="logout" @click="logout" />
            </div>
          </el-col>
        </el-row>
      </el-header>

      <el-main>
        <router-view v-on:authEvent="loadUser" />
      </el-main>

      <el-footer height="40px">
        <el-row>
          <el-col :span="12">
            &copy; {{ new Date().getFullYear() }} Stichting NLnet Labs - Lagosta v{{
              lagostaVersion
            }}

            <!-- <el-tooltip class="item" effect="dark" :content="lagostaLatestVersion" placement="top" v-if="lagostaLatestVersion !== '' && lagostaLatestVersion !== lagostaVersion">
              <a :href="lagostaLatestVersionURL" target="_blank">({{$t("common.newversion")}})</a>
            </el-tooltip> -->

            <span v-if="krillVersion !== ''" :title="krillStarted"
              >, Krill v{{ krillVersion }}</span
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
      lagostaVersion: process.env.PACKAGE_VERSION || "0",
      lagostaLatestVersion: "",
      lagostaLatestVersionURL: "",
      krillVersion: "",
      krillLatestVersion: "",
      krillLatestVersionURL: "",
      krillStarted: "",
      user: null,
      langs: [
        { iso: "en", label: "English" },
        { iso: "es", label: "Español" },
        { iso: "gr", label: "Ελληνικά" },
        { iso: "fr", label: "Français" },
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
    checkLatestVersions() {
      APIService.getLatestLagostaVersion()
        .then(success => {
          const gh = success.data;
          this.lagostaLatestVersion =
            gh.tag_name.indexOf("v") === 0 ? gh.tag_name.substr(1) : gh.tag_name;
          this.lagostaLatestVersionURL = gh.html_url;
        })
        .catch(() => {});
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
            moment(stats.data.started * 1000).format("MMMM Do YYYY, h:mm:ss a");
        }
      });
    },
    loadUser() {
      this.user = JSON.parse(localStorage.getItem(LOCALSTORAGE_NAME));
    },
    logout() {
      return APIService.logout().then(() => {
        this.user = null;
        router.push("/login");
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

.logout {
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
</style>
