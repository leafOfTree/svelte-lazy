import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { FadeParams } from 'svelte/transition';

export interface LazyProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'children' | 'class' | 'onload' | 'placeholder'
> {
  /** Height of the container before loading, in px or any CSS length */
  height?: number | string;
  /** Keep the content after it leaves the viewport, instead of unloading it */
  keep?: boolean;
  /** Load when the top is within this many px below the bottom of the view */
  offset?: number;
  /** Shown before loading, and while images in the content are loading */
  placeholder?: string | Snippet | null;
  /** Class added to the container, after `svelte-lazy` */
  class?: string;
  /** Options of the fade transition, null to disable it */
  fadeOption?: FadeParams | null;
  /** Called with the container element when the content is loaded */
  onload?: ((node: HTMLElement) => void) | null;
  /** Delay in ms before the container height becomes auto after loading */
  resetHeightDelay?: number;
  /** The content to lazy load */
  children?: Snippet;
}
