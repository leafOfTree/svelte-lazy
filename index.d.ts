import { SvelteComponentTyped } from 'svelte';
import { fade } from 'svelte/transition';

type FadeParams = Parameters<typeof fade>[1];

export interface LazyProps {
  /** Height of the container before loading, in px or any CSS length */
  height?: number | string;
  /** Keep the content after it leaves the viewport, instead of unloading it */
  keep?: boolean;
  /** Load when the top is within this many px below the bottom of the view */
  offset?: number;
  /** Shown before loading: a string or a component */
  placeholder?: string | (new (...args: any[]) => any) | ((...args: any[]) => any) | null;
  /** Props for a component placeholder */
  placeholderProps?: Record<string, any> | null;
  id?: string;
  class?: string;
  /** Options of the fade transition, null to disable it */
  fadeOption?: FadeParams | null;
  /** Called with the container element when the content is loaded */
  onload?: ((node: HTMLElement) => void) | null;
  /** Delay in ms before the container height becomes auto after loading */
  resetHeightDelay?: number;
  /** Other props are allowed, as before 1.4.0, though they have no effect */
  [prop: string]: any;
}

// SvelteComponentTyped works with the types of Svelte 3, 4 and 5
export default class SvelteLazy extends SvelteComponentTyped<
  LazyProps,
  Record<string, never>,
  { default: Record<string, never> }
> {}
