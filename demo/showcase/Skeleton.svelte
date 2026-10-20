<div class="skeleton">
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
</style>
