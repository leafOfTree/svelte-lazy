<script>
import Lazy from '../src/index.svelte';

let search = '';
let data = [
  {id: 1, text: "one"},
  {id: 2, text: "two"},
  {id: 3, text: "three"},
  {id: 4, text: "four"},
  {id: 5, text: "five"},
  {id: 6, text: "six"},
  {id: 7, text: "seven"},
  {id: 8, text: "eight"},
  {id: 9, text: "nine"},
  {id: 10, text: "ten"},
  {id: 11, text: "eleven"},
  {id: 12, text: "twelve"},
  {id: 13, text: "thirteen"},
  {id: 14, text: "fourteen"},
  {id: 15, text: "fifteen"},
  {id: 16, text: "sixteen"},
  {id: 17, text: "seventeen"},
  {id: 18, text: "eighteen"},
  {id: 19, text: "nineteen"},
  {id: 20, text: "twenty"},
  {id: 21, text: "twenty-one"},
  {id: 22, text: "twenty-two"},
  {id: 23, text: "twenty-three"},
  {id: 24, text: "twenty-four"},
  {id: 25, text: "twenty-five"},
  {id: 26, text: "twenty-six"},
  {id: 27, text: "twenty-seven"},
  {id: 28, text: "twenty-eight"},
  {id: 29, text: "twenty-nine"},
  {id: 30, text: "thirty"},
  {id: 31, text: "thirty-one"},
  {id: 32, text: "thirty-two"},
  {id: 33, text: "thirty-three"},
  {id: 34, text: "thirty-four"},
  {id: 35, text: "thirty-five"},
  {id: 36, text: "thirty-six"},
  {id: 37, text: "thirty-seven"},
  {id: 38, text: "thirty-eight"},
  {id: 39, text: "thirty-nine"},
];

const filterData = (() => {
  if (search.length == 0)
    return [...data]
  else 
    return [...data.filter(x => x.text.toLowerCase().includes(search.toLowerCase()))]
})
$: filteredData = filterData(search);

</script>

<input bind:value={search}/>
<div class="container">
  {#each filteredData as item, i (item.id)}
    <Lazy height="30px" placeholder="Loading..." fadeOption="null">
      <div>
        <b>{i + 1}</b>: {item.text}
      </div>
    </Lazy>
  {/each}
</div>

<style>
.container {
  font-size: 200%;
}
</style>
