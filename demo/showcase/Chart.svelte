<script>
  const bars = [40, 72, 55, 90, 64, 80, 48];
</script>

<div class="chart">
  {#each bars as bar, i (i)}
    <div class="bar" style="height: {bar}%"></div>
  {/each}
</div>

<style>
  .chart {
    height: 132px;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    padding: 0 8px;
    border-radius: 8px;
    background: #f4f1ff;
  }
  .bar {
    flex: 1;
    border-radius: 4px 4px 0 0;
    background: #7c5cff;
  }
</style>
