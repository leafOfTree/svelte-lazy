<!-- Table preview for the showcase -->
<script>
  const orders = [
    { id: '#1042', customer: 'Ada', total: '$120', status: 'Paid' },
    { id: '#1043', customer: 'Linus', total: '$89', status: 'Pending' },
    { id: '#1044', customer: 'Grace', total: '$240', status: 'Paid' },
    { id: '#1045', customer: 'Alan', total: '$56', status: 'Refunded' },
  ];
</script>

<table>
  <thead>
    <tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr>
  </thead>
  <tbody>
    {#each orders as order (order.id)}
      <tr>
        <td>{order.id}</td>
        <td>{order.customer}</td>
        <td>{order.total}</td>
        <td><span class={order.status.toLowerCase()}>{order.status}</span></td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  table {
    width: 100%;
    height: 132px;
    border-collapse: collapse;
    font-size: 12px;
  }
  th {
    text-align: left;
    color: #59636e;
    font-weight: 600;
    border-bottom: 1px solid #e6e8eb;
  }
  td {
    border-bottom: 1px solid #f0f1f3;
  }
  th,
  td {
    padding: 0 4px;
  }
  span {
    padding: 2px 6px;
    border-radius: 10px;
    font-size: 11px;
  }
  .paid {
    background: #dafbe1;
    color: #1a7f37;
  }
  .pending {
    background: #fff1d6;
    color: #9a6700;
  }
  .refunded {
    background: #f0f1f3;
    color: #59636e;
  }
</style>
