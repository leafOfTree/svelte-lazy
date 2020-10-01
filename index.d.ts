import { SvelteComponent } from 'svelte';

declare class SvelteLazy extends SvelteComponent {
  $$prop_def: {
    height?: number | string;
    offset?: number;
    placeholder?: string | SvelteComponent;
    class?: string;
    fadeOption?: {
      delay?: number;
      duration?: number;
    };
    onload?: (node: HTMLElement) => void;
    resetHeightDelay?: number;
  };
}

export default SvelteLazy;