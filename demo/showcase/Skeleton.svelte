<script>
  // Rows of long lists are a dot and a line
  let { row = false } = $props();
</script>

<div class="skeleton" class:row>
  <div class="block"></div>
  <div class="line"></div>
</div>

<style>
  .skeleton {
    height: 100%;
    padding: 16px;
    box-sizing: border-box;
  }
  .block,
  .line {
    border-radius: 8px;
    background: linear-gradient(90deg, #eceef1 25%, #f6f7f9 50%, #eceef1 75%);
    background-size: 200% 100%;
    animation: shimmer 1.2s infinite linear;
  }
  .block {
    height: 132px;
  }
  .line {
    height: 14px;
    width: 60%;
    margin-top: 12px;
  }
  @keyframes shimmer {
    from {
      background-position: 200% 0;
    }
    to {
      background-position: -200% 0;
    }
  }
  .row {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .row .block {
    width: 32px;
    height: 32px;
    flex: none;
    border-radius: 50%;
  }
  .row .line {
    margin: 0;
    width: 40%;
  }
</style>
