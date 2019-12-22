<template>
  <div>
    <div class="title">New Tag</div>
    <div class="container-item">
      <autocomplete label="Standard items:" placeholder="span, div, h1..." />
    </div>
  </div>
</template>

<script>
import Autocomplete from './Autocomplete';

export default {
  name: 'new-tag',
  components: { Autocomplete },
};
</script>

<style scoped>
</style>
