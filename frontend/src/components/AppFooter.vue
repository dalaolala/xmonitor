<script setup>
</script>

<template>
  <div class="footer">{{$t('open-source')}} <a href="https://github.com/dalaolala/xmonitor">GitHub</a></div>
  <div class="footer">Copyright © 2023-{{new Date().getFullYear()}} X Monitor Team.</div>
</template>

<style lang="scss" scoped>
.footer {
  line-height: 20px;
  text-align: center;
  color: #86909c;
  font-size: 12px;
  padding: 8px 0;

  a {
    color: #165DFF;
  }
}
</style>

<style lang="scss">
body[arco-theme='dark'] {
  .footer {
    color: #5c5c5c;
  }
}
</style>