<!-- Chart previews for the showcase: line, donut, kpi or bars -->
<script>
  let { type } = $props();

  // Line: visitors per day
  const visits = [14, 22, 18, 30, 26, 38, 34, 46];
  const max = Math.max(...visits);
  const points = visits.map((v, i) => [(i / (visits.length - 1)) * 240, 96 - (v / max) * 84]);
  const line = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' ');
  const area = `${line} L240,100 L0,100 Z`;

  // Donut: traffic sources, as parts of the circle
  const sources = [
    { label: 'Search', value: 46, color: '#7c5cff' },
    { label: 'Social', value: 32, color: '#1fb6a6' },
    { label: 'Direct', value: 22, color: '#ff8a3d' },
  ];
  const circumference = 2 * Math.PI * 38;
  let offset = 0;
  const arcs = sources.map((source) => {
    const length = (source.value / 100) * circumference;
    const arc = { ...source, dash: `${length} ${circumference - length}`, offset: -offset };
    offset += length;
    return arc;
  });

  // Bars: sales per month
  const sales = [40, 72, 55, 90, 64, 80, 48];
</script>

<div class="chart">
  {#if type === 'line'}
    <svg viewBox="0 0 240 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#7c5cff" stop-opacity="0.35" />
          <stop offset="1" stop-color="#7c5cff" stop-opacity="0" />
        </linearGradient>
      </defs>
      {#each [25, 50, 75] as y (y)}
        <line x1="0" x2="240" y1={y} y2={y} class="grid" />
      {/each}
      <path d={area} fill="url(#fill)" />
      <path d={line} class="line" />
    </svg>
  {:else if type === 'donut'}
    <div class="donut">
      <svg viewBox="0 0 100 100">
        {#each arcs as arc (arc.label)}
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke={arc.color}
            stroke-dasharray={arc.dash}
            stroke-dashoffset={arc.offset}
          />
        {/each}
        <text x="50" y="56">4.2k</text>
      </svg>
      <ul>
        {#each sources as source (source.label)}
          <li><i style="background: {source.color}"></i>{source.label} {source.value}%</li>
        {/each}
      </ul>
    </div>
  {:else if type === 'kpi'}
    <div class="kpi">
      <div>
        <div class="value">$12.4k</div>
        <div class="change">▲ 8.2% this week</div>
      </div>
      <div class="spark">
        {#each [30, 45, 38, 52, 48, 66, 72] as v, i (i)}
          <span style="height: {v}%"></span>
        {/each}
      </div>
    </div>
  {:else}
    <div class="bars">
      {#each sales as bar, i (i)}
        <div class="bar" style="height: {bar}%"></div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .chart {
    height: 132px;
    border-radius: 8px;
    background: #f6f5ff;
    overflow: hidden;
  }
  svg {
    display: block;
    width: 100%;
    height: 100%;
  }
  .grid {
    stroke: #e3defc;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }
  .line {
    fill: none;
    stroke: #7c5cff;
    stroke-width: 2.5;
    stroke-linejoin: round;
    vector-effect: non-scaling-stroke;
  }
  .donut {
    display: flex;
    align-items: center;
    gap: 16px;
    height: 100%;
    padding: 0 16px;
  }
  .donut svg {
    width: 104px;
    height: 104px;
    flex: none;
    transform: rotate(-90deg);
  }
  .donut circle {
    fill: none;
    stroke-width: 14;
  }
  .donut text {
    transform: rotate(90deg);
    transform-origin: 50px 50px;
    text-anchor: middle;
    font-size: 17px;
    font-weight: 700;
    fill: #1f2328;
  }
  .donut ul {
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 13px;
    line-height: 1.9;
  }
  .donut i {
    display: inline-block;
    width: 10px;
    height: 10px;
    margin-right: 6px;
    border-radius: 3px;
  }
  .kpi {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;
    padding: 18px 16px;
    box-sizing: border-box;
  }
  .value {
    font-size: 32px;
    font-weight: 800;
    letter-spacing: -0.5px;
  }
  .change {
    margin-top: 4px;
    font-size: 13px;
    color: #1a7f37;
  }
  .spark {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 56px;
  }
  .spark span {
    width: 8px;
    border-radius: 2px;
    background: #1fb6a6;
  }
  .bars {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 100%;
    padding: 12px 10px 0;
    box-sizing: border-box;
  }
  .bar {
    flex: 1;
    border-radius: 4px 4px 0 0;
    background: #7c5cff;
  }
</style>
