<!-- List preview for the showcase -->
<script>
  const people = [
    { name: 'Ada Lovelace', role: 'Engineer', color: '#7c5cff' },
    { name: 'Grace Hopper', role: 'Admiral', color: '#1fb6a6' },
    { name: 'Alan Turing', role: 'Researcher', color: '#ff8a3d' },
  ];
</script>

<ul>
  {#each people as person (person.name)}
    <li>
      <span class="avatar" style="background: {person.color}">{person.name[0]}</span>
      <span class="name">{person.name}</span>
      <span class="role">{person.role}</span>
    </li>
  {/each}
</ul>

<style>
  ul {
    height: 160px;
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  li {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
  }
  .avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    color: #fff;
    font-weight: 700;
    display: grid;
    place-items: center;
  }
  .name {
    font-weight: 600;
  }
  .role {
    margin-left: auto;
    color: #59636e;
  }
</style>
