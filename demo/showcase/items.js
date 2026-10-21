// Content of the feeds on the examples site
import Chart from './Chart.svelte';
import Table from './Table.svelte';
import List from './List.svelte';
import Comment from './Comment.svelte';

const photo = (name) => ({ name, photo: name.toLowerCase() });

// Any content, also recorded into docs/demo.gif
export const anyContent = [
  { title: 'Images', items: [photo('Valley'), photo('Strawberries'), photo('Fjord')] },
  {
    title: 'Charts',
    items: [
      { name: 'Visitors', component: Chart, props: { type: 'line' } },
      { name: 'Traffic', component: Chart, props: { type: 'donut' } },
      { name: 'Revenue', component: Chart, props: { type: 'kpi' } },
    ],
  },
  {
    title: 'Any content',
    items: [
      { name: 'Orders', component: Table },
      { name: 'Team', component: List },
      { name: 'Comment', component: Comment },
    ],
  },
];

// The home page adds a video, and an image that fails to load: it keeps the
// fixed height
export const anyContentMore = [
  ...anyContent,
  {
    title: 'Video and a broken image',
    items: [
      { name: 'Video', video: 'media/flower.mp4' },
      { name: 'Broken image', photo: 'missing' },
    ],
  },
];

export const keepContent = [
  {
    title: 'Loaded once',
    items: ['Pug', 'Lioness', 'Tea', 'Walrus', 'Snow', 'Bear'].map(photo),
  },
];

const colors = ['#7c5cff', '#1fb6a6', '#ff8a3d', '#3d8bff', '#e5534b'];
export const longList = [
  {
    title: '1000 rows',
    items: Array.from({ length: 1000 }, (_, i) => ({
      name: `Row ${i + 1}`,
      row: colors[i % colors.length],
    })),
  },
];

export const filterContent = [
  {
    title: 'Photos',
    items: [
      'Valley',
      'Strawberries',
      'Pug',
      'Fjord',
      'Lioness',
      'Tea',
      'Walrus',
      'Snow',
      'Vegetables',
      'Bear',
      'Canoe',
      'Laptop',
      'Jellyfish',
    ].map(photo),
  },
];
