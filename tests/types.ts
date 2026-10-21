// Checked by `npm run check`: the types in dist/, as users import them
import Lazy, { type LazyProps } from 'svelte-lazy';
import type { ComponentProps, Snippet } from 'svelte';

type Props = ComponentProps<typeof Lazy>;

declare const spinner: Snippet;

export const props: Props = {
  height: '50vh',
  keep: true,
  offset: 300,
  placeholder: 'Loading...',
  id: 'comments',
  class: 'card',
  fadeOption: null,
  onload: (node) => node.scrollIntoView(),
  resetHeightDelay: 100,
};

export const snippetPlaceholder: LazyProps = { placeholder: spinner };
// Attributes of the container div
export const attributes: Props = { style: 'color: red', 'data-id': 1, 'aria-label': 'Photo' };

// @ts-expect-error height is a number or a string
export const wrongHeight: Props = { height: true };
// @ts-expect-error onload gets an element
export const wrongOnload: Props = { onload: (node: number) => node };
// @ts-expect-error placeholderProps is removed in 2.0
export const placeholderProps: Props = { placeholderProps: { size: 'large' } };
