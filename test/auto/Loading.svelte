<div>Loading {name}</div>

<style>
  div {
    background: #eee;
  }
</style>

<script>
  /**
   * @typedef {Object} Props
   * @property {string} [name]
   */

  /** @type {Props} */
  let { name = "Component" } = $props();
</script>
