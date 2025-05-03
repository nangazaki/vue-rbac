<script setup lang="ts">
import { onMounted } from "vue";
import { useRBAC } from "@nangazaki/vue-rbac";

const { setUserRoles, hasPermission } = useRBAC();

onMounted(() => {
  setUserRoles("editor");

  if (hasPermission("delete:posts")) {
    console.log("Can create a post");
  }
});
</script>

<template>
  <div>
    <pre style="text-align: left"></pre>
    <button v-rbac:permission="'create:posts'">Teste</button>
  </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
