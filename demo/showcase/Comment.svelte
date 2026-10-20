<!-- Text preview for the showcase -->
<div class="comment">
  <div class="head">
    <span class="avatar">M</span>
    <b>Margaret</b>
    <span class="time">2h ago</span>
  </div>
  <p>Wrapped the comments in <code>&lt;Lazy&gt;</code>, and the page now opens twice as fast.</p>
  <div class="actions">♥ 24 · Reply</div>
</div>

<style>
  .comment {
    height: 132px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    font-size: 13px;
  }
  .head {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #3d8bff;
    color: #fff;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
  .time {
    color: #59636e;
  }
  p {
    margin: 0;
    line-height: 1.5;
  }
  code {
    color: #7c5cff;
  }
  .actions {
    color: #59636e;
  }
</style>
