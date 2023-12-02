import { SvelteComponent } from 'svelte';
import { fade } from 'svelte/transition';

type FadeParams = Parameters<typeof fade>[1]

declare class SvelteLazy extends SvelteComponent {
  $$prop_def: {
    height?: number | string;
    keep?: boolean;
    offset?: number;
    placeholder?: string | SvelteComponent;
    class?: string;
    fadeOption?: FadeParams;
    onload?: (node: HTMLElement) => void;
    resetHeightDelay?: number;
  };
}

export default SvelteLazy;