// Checked by `npm run check`: the types in index.d.ts, as users import them
import Lazy from 'svelte-lazy';
import type { ComponentProps } from 'svelte';

type Props = ComponentProps<Lazy>;

export const props: Props = {
  height: '50vh',
  keep: true,
  offset: 300,
  placeholder: 'Loading...',
  placeholderProps: { size: 'large' },
  id: 'comments',
  class: 'card',
  fadeOption: null,
  onload: (node) => node.scrollIntoView(),
  resetHeightDelay: 100,
};

// @ts-expect-error height is a number or a string
export const wrongHeight: Props = { height: true };
// @ts-expect-error onload gets an element
export const wrongOnload: Props = { onload: (node: number) => node };
// Other props are allowed, as before 1.4.0
export const otherProps: Props = { style: 'color: red', 'data-id': 1 };
