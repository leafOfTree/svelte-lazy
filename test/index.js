
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
	'use strict';

	/** @returns {void} */
	function noop() {}

	const identity = (x) => x;

	/**
	 * @template T
	 * @template S
	 * @param {T} tar
	 * @param {S} src
	 * @returns {T & S}
	 */
	function assign(tar, src) {
		// @ts-ignore
		for (const k in src) tar[k] = src[k];
		return /** @type {T & S} */ (tar);
	}

	function run(fn) {
		return fn();
	}

	function blank_object() {
		return Object.create(null);
	}

	/**
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function run_all(fns) {
		fns.forEach(run);
	}

	/**
	 * @param {any} thing
	 * @returns {thing is Function}
	 */
	function is_function(thing) {
		return typeof thing === 'function';
	}

	/** @returns {boolean} */
	function safe_not_equal(a, b) {
		return a != a ? b == b : a !== b || (a && typeof a === 'object') || typeof a === 'function';
	}

	let src_url_equal_anchor;

	/**
	 * @param {string} element_src
	 * @param {string} url
	 * @returns {boolean}
	 */
	function src_url_equal(element_src, url) {
		if (element_src === url) return true;
		if (!src_url_equal_anchor) {
			src_url_equal_anchor = document.createElement('a');
		}
		// This is actually faster than doing URL(..).href
		src_url_equal_anchor.href = url;
		return element_src === src_url_equal_anchor.href;
	}

	/** @returns {boolean} */
	function is_empty(obj) {
		return Object.keys(obj).length === 0;
	}

	function create_slot(definition, ctx, $$scope, fn) {
		if (definition) {
			const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
			return definition[0](slot_ctx);
		}
	}

	function get_slot_context(definition, ctx, $$scope, fn) {
		return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
	}

	function get_slot_changes(definition, $$scope, dirty, fn) {
		if (definition[2] && fn) {
			const lets = definition[2](fn(dirty));
			if ($$scope.dirty === undefined) {
				return lets;
			}
			if (typeof lets === 'object') {
				const merged = [];
				const len = Math.max($$scope.dirty.length, lets.length);
				for (let i = 0; i < len; i += 1) {
					merged[i] = $$scope.dirty[i] | lets[i];
				}
				return merged;
			}
			return $$scope.dirty | lets;
		}
		return $$scope.dirty;
	}

	/** @returns {void} */
	function update_slot_base(
		slot,
		slot_definition,
		ctx,
		$$scope,
		slot_changes,
		get_slot_context_fn
	) {
		if (slot_changes) {
			const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
			slot.p(slot_context, slot_changes);
		}
	}

	/** @returns {any[] | -1} */
	function get_all_dirty_from_scope($$scope) {
		if ($$scope.ctx.length > 32) {
			const dirty = [];
			const length = $$scope.ctx.length / 32;
			for (let i = 0; i < length; i++) {
				dirty[i] = -1;
			}
			return dirty;
		}
		return -1;
	}

	function null_to_empty(value) {
		return value == null ? '' : value;
	}

	function action_destroyer(action_result) {
		return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
	}

	const is_client = typeof window !== 'undefined';

	/** @type {() => number} */
	let now = is_client ? () => window.performance.now() : () => Date.now();

	let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;

	const tasks = new Set();

	/**
	 * @param {number} now
	 * @returns {void}
	 */
	function run_tasks(now) {
		tasks.forEach((task) => {
			if (!task.c(now)) {
				tasks.delete(task);
				task.f();
			}
		});
		if (tasks.size !== 0) raf(run_tasks);
	}

	/**
	 * Creates a new task that runs on each raf frame
	 * until it returns a falsy value or is aborted
	 * @param {import('./private.js').TaskCallback} callback
	 * @returns {import('./private.js').Task}
	 */
	function loop(callback) {
		/** @type {import('./private.js').TaskEntry} */
		let task;
		if (tasks.size === 0) raf(run_tasks);
		return {
			promise: new Promise((fulfill) => {
				tasks.add((task = { c: callback, f: fulfill }));
			}),
			abort() {
				tasks.delete(task);
			}
		};
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @returns {void}
	 */
	function append(target, node) {
		target.appendChild(node);
	}

	/**
	 * @param {Node} node
	 * @returns {ShadowRoot | Document}
	 */
	function get_root_for_style(node) {
		if (!node) return document;
		const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
		if (root && /** @type {ShadowRoot} */ (root).host) {
			return /** @type {ShadowRoot} */ (root);
		}
		return node.ownerDocument;
	}

	/**
	 * @param {Node} node
	 * @returns {CSSStyleSheet}
	 */
	function append_empty_stylesheet(node) {
		const style_element = element('style');
		// For transitions to work without 'style-src: unsafe-inline' Content Security Policy,
		// these empty tags need to be allowed with a hash as a workaround until we move to the Web Animations API.
		// Using the hash for the empty string (for an empty tag) works in all browsers except Safari.
		// So as a workaround for the workaround, when we append empty style tags we set their content to /* empty */.
		// The hash 'sha256-9OlNO0DNEeaVzHL4RZwCLsBHA8WBQ8toBp/4F5XV2nc=' will then work even in Safari.
		style_element.textContent = '/* empty */';
		append_stylesheet(get_root_for_style(node), style_element);
		return style_element.sheet;
	}

	/**
	 * @param {ShadowRoot | Document} node
	 * @param {HTMLStyleElement} style
	 * @returns {CSSStyleSheet}
	 */
	function append_stylesheet(node, style) {
		append(/** @type {Document} */ (node).head || node, style);
		return style.sheet;
	}

	/**
	 * @param {Node} target
	 * @param {Node} node
	 * @param {Node} [anchor]
	 * @returns {void}
	 */
	function insert(target, node, anchor) {
		target.insertBefore(node, anchor || null);
	}

	/**
	 * @param {Node} node
	 * @returns {void}
	 */
	function detach(node) {
		if (node.parentNode) {
			node.parentNode.removeChild(node);
		}
	}

	/**
	 * @returns {void} */
	function destroy_each(iterations, detaching) {
		for (let i = 0; i < iterations.length; i += 1) {
			if (iterations[i]) iterations[i].d(detaching);
		}
	}

	/**
	 * @template {keyof HTMLElementTagNameMap} K
	 * @param {K} name
	 * @returns {HTMLElementTagNameMap[K]}
	 */
	function element(name) {
		return document.createElement(name);
	}

	/**
	 * @param {string} data
	 * @returns {Text}
	 */
	function text(data) {
		return document.createTextNode(data);
	}

	/**
	 * @returns {Text} */
	function space() {
		return text(' ');
	}

	/**
	 * @returns {Text} */
	function empty() {
		return text('');
	}

	/**
	 * @param {EventTarget} node
	 * @param {string} event
	 * @param {EventListenerOrEventListenerObject} handler
	 * @param {boolean | AddEventListenerOptions | EventListenerOptions} [options]
	 * @returns {() => void}
	 */
	function listen(node, event, handler, options) {
		node.addEventListener(event, handler, options);
		return () => node.removeEventListener(event, handler, options);
	}

	/**
	 * @param {Element} node
	 * @param {string} attribute
	 * @param {string} [value]
	 * @returns {void}
	 */
	function attr(node, attribute, value) {
		if (value == null) node.removeAttribute(attribute);
		else if (node.getAttribute(attribute) !== value) node.setAttribute(attribute, value);
	}

	/**
	 * @param {Element} element
	 * @returns {ChildNode[]}
	 */
	function children(element) {
		return Array.from(element.childNodes);
	}

	/**
	 * @param {Text} text
	 * @param {unknown} data
	 * @returns {void}
	 */
	function set_data(text, data) {
		data = '' + data;
		if (text.data === data) return;
		text.data = /** @type {string} */ (data);
	}

	/**
	 * @returns {void} */
	function set_input_value(input, value) {
		input.value = value == null ? '' : value;
	}

	/**
	 * @returns {void} */
	function set_style(node, key, value, important) {
		if (value == null) {
			node.style.removeProperty(key);
		} else {
			node.style.setProperty(key, value, '');
		}
	}

	/**
	 * @template T
	 * @param {string} type
	 * @param {T} [detail]
	 * @param {{ bubbles?: boolean, cancelable?: boolean }} [options]
	 * @returns {CustomEvent<T>}
	 */
	function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
		return new CustomEvent(type, { detail, bubbles, cancelable });
	}

	function construct_svelte_component(component, props) {
		return new component(props);
	}

	/**
	 * @typedef {Node & {
	 * 	claim_order?: number;
	 * 	hydrate_init?: true;
	 * 	actual_end_child?: NodeEx;
	 * 	childNodes: NodeListOf<NodeEx>;
	 * }} NodeEx
	 */

	/** @typedef {ChildNode & NodeEx} ChildNodeEx */

	/** @typedef {NodeEx & { claim_order: number }} NodeEx2 */

	/**
	 * @typedef {ChildNodeEx[] & {
	 * 	claim_info?: {
	 * 		last_index: number;
	 * 		total_claimed: number;
	 * 	};
	 * }} ChildNodeArray
	 */

	// we need to store the information for multiple documents because a Svelte application could also contain iframes
	// https://github.com/sveltejs/svelte/issues/3624
	/** @type {Map<Document | ShadowRoot, import('./private.d.ts').StyleInformation>} */
	const managed_styles = new Map();

	let active = 0;

	// https://github.com/darkskyapp/string-hash/blob/master/index.js
	/**
	 * @param {string} str
	 * @returns {number}
	 */
	function hash(str) {
		let hash = 5381;
		let i = str.length;
		while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
		return hash >>> 0;
	}

	/**
	 * @param {Document | ShadowRoot} doc
	 * @param {Element & ElementCSSInlineStyle} node
	 * @returns {{ stylesheet: any; rules: {}; }}
	 */
	function create_style_information(doc, node) {
		const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
		managed_styles.set(doc, info);
		return info;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {number} a
	 * @param {number} b
	 * @param {number} duration
	 * @param {number} delay
	 * @param {(t: number) => number} ease
	 * @param {(t: number, u: number) => string} fn
	 * @param {number} uid
	 * @returns {string}
	 */
	function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
		const step = 16.666 / duration;
		let keyframes = '{\n';
		for (let p = 0; p <= 1; p += step) {
			const t = a + (b - a) * ease(p);
			keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
		}
		const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
		const name = `__svelte_${hash(rule)}_${uid}`;
		const doc = get_root_for_style(node);
		const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
		if (!rules[name]) {
			rules[name] = true;
			stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
		}
		const animation = node.style.animation || '';
		node.style.animation = `${
		animation ? `${animation}, ` : ''
	}${name} ${duration}ms linear ${delay}ms 1 both`;
		active += 1;
		return name;
	}

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {string} [name]
	 * @returns {void}
	 */
	function delete_rule(node, name) {
		const previous = (node.style.animation || '').split(', ');
		const next = previous.filter(
			name
				? (anim) => anim.indexOf(name) < 0 // remove specific animation
				: (anim) => anim.indexOf('__svelte') === -1 // remove all Svelte animations
		);
		const deleted = previous.length - next.length;
		if (deleted) {
			node.style.animation = next.join(', ');
			active -= deleted;
			if (!active) clear_rules();
		}
	}

	/** @returns {void} */
	function clear_rules() {
		raf(() => {
			if (active) return;
			managed_styles.forEach((info) => {
				const { ownerNode } = info.stylesheet;
				// there is no ownerNode if it runs on jsdom.
				if (ownerNode) detach(ownerNode);
			});
			managed_styles.clear();
		});
	}

	let current_component;

	/** @returns {void} */
	function set_current_component(component) {
		current_component = component;
	}

	const dirty_components = [];
	const binding_callbacks = [];

	let render_callbacks = [];

	const flush_callbacks = [];

	const resolved_promise = /* @__PURE__ */ Promise.resolve();

	let update_scheduled = false;

	/** @returns {void} */
	function schedule_update() {
		if (!update_scheduled) {
			update_scheduled = true;
			resolved_promise.then(flush);
		}
	}

	/** @returns {void} */
	function add_render_callback(fn) {
		render_callbacks.push(fn);
	}

	// flush() calls callbacks in this order:
	// 1. All beforeUpdate callbacks, in order: parents before children
	// 2. All bind:this callbacks, in reverse order: children before parents.
	// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
	//    for afterUpdates called during the initial onMount, which are called in
	//    reverse order: children before parents.
	// Since callbacks might update component values, which could trigger another
	// call to flush(), the following steps guard against this:
	// 1. During beforeUpdate, any updated components will be added to the
	//    dirty_components array and will cause a reentrant call to flush(). Because
	//    the flush index is kept outside the function, the reentrant call will pick
	//    up where the earlier call left off and go through all dirty components. The
	//    current_component value is saved and restored so that the reentrant call will
	//    not interfere with the "parent" flush() call.
	// 2. bind:this callbacks cannot trigger new flush() calls.
	// 3. During afterUpdate, any updated components will NOT have their afterUpdate
	//    callback called a second time; the seen_callbacks set, outside the flush()
	//    function, guarantees this behavior.
	const seen_callbacks = new Set();

	let flushidx = 0; // Do *not* move this inside the flush() function

	/** @returns {void} */
	function flush() {
		// Do not reenter flush while dirty components are updated, as this can
		// result in an infinite loop. Instead, let the inner flush handle it.
		// Reentrancy is ok afterwards for bindings etc.
		if (flushidx !== 0) {
			return;
		}
		const saved_component = current_component;
		do {
			// first, call beforeUpdate functions
			// and update components
			try {
				while (flushidx < dirty_components.length) {
					const component = dirty_components[flushidx];
					flushidx++;
					set_current_component(component);
					update(component.$$);
				}
			} catch (e) {
				// reset dirty state to not end up in a deadlocked state and then rethrow
				dirty_components.length = 0;
				flushidx = 0;
				throw e;
			}
			set_current_component(null);
			dirty_components.length = 0;
			flushidx = 0;
			while (binding_callbacks.length) binding_callbacks.pop()();
			// then, once components are updated, call
			// afterUpdate functions. This may cause
			// subsequent updates...
			for (let i = 0; i < render_callbacks.length; i += 1) {
				const callback = render_callbacks[i];
				if (!seen_callbacks.has(callback)) {
					// ...so guard against infinite loops
					seen_callbacks.add(callback);
					callback();
				}
			}
			render_callbacks.length = 0;
		} while (dirty_components.length);
		while (flush_callbacks.length) {
			flush_callbacks.pop()();
		}
		update_scheduled = false;
		seen_callbacks.clear();
		set_current_component(saved_component);
	}

	/** @returns {void} */
	function update($$) {
		if ($$.fragment !== null) {
			$$.update();
			run_all($$.before_update);
			const dirty = $$.dirty;
			$$.dirty = [-1];
			$$.fragment && $$.fragment.p($$.ctx, dirty);
			$$.after_update.forEach(add_render_callback);
		}
	}

	/**
	 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
	 * @param {Function[]} fns
	 * @returns {void}
	 */
	function flush_render_callbacks(fns) {
		const filtered = [];
		const targets = [];
		render_callbacks.forEach((c) => (fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c)));
		targets.forEach((c) => c());
		render_callbacks = filtered;
	}

	/**
	 * @type {Promise<void> | null}
	 */
	let promise;

	/**
	 * @returns {Promise<void>}
	 */
	function wait() {
		if (!promise) {
			promise = Promise.resolve();
			promise.then(() => {
				promise = null;
			});
		}
		return promise;
	}

	/**
	 * @param {Element} node
	 * @param {INTRO | OUTRO | boolean} direction
	 * @param {'start' | 'end'} kind
	 * @returns {void}
	 */
	function dispatch(node, direction, kind) {
		node.dispatchEvent(custom_event(`${'intro' }${kind}`));
	}

	const outroing = new Set();

	/**
	 * @type {Outro}
	 */
	let outros;

	/**
	 * @returns {void} */
	function group_outros() {
		outros = {
			r: 0,
			c: [],
			p: outros // parent group
		};
	}

	/**
	 * @returns {void} */
	function check_outros() {
		if (!outros.r) {
			run_all(outros.c);
		}
		outros = outros.p;
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} [local]
	 * @returns {void}
	 */
	function transition_in(block, local) {
		if (block && block.i) {
			outroing.delete(block);
			block.i(local);
		}
	}

	/**
	 * @param {import('./private.js').Fragment} block
	 * @param {0 | 1} local
	 * @param {0 | 1} [detach]
	 * @param {() => void} [callback]
	 * @returns {void}
	 */
	function transition_out(block, local, detach, callback) {
		if (block && block.o) {
			if (outroing.has(block)) return;
			outroing.add(block);
			outros.c.push(() => {
				outroing.delete(block);
				if (callback) {
					if (detach) block.d(1);
					callback();
				}
			});
			block.o(local);
		} else if (callback) {
			callback();
		}
	}

	/**
	 * @type {import('../transition/public.js').TransitionConfig}
	 */
	const null_transition = { duration: 0 };

	/**
	 * @param {Element & ElementCSSInlineStyle} node
	 * @param {TransitionFn} fn
	 * @param {any} params
	 * @returns {{ start(): void; invalidate(): void; end(): void; }}
	 */
	function create_in_transition(node, fn, params) {
		/**
		 * @type {TransitionOptions} */
		const options = { direction: 'in' };
		let config = fn(node, params, options);
		let running = false;
		let animation_name;
		let task;
		let uid = 0;

		/**
		 * @returns {void} */
		function cleanup() {
			if (animation_name) delete_rule(node, animation_name);
		}

		/**
		 * @returns {void} */
		function go() {
			const {
				delay = 0,
				duration = 300,
				easing = identity,
				tick = noop,
				css
			} = config || null_transition;
			if (css) animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
			tick(0, 1);
			const start_time = now() + delay;
			const end_time = start_time + duration;
			if (task) task.abort();
			running = true;
			add_render_callback(() => dispatch(node, true, 'start'));
			task = loop((now) => {
				if (running) {
					if (now >= end_time) {
						tick(1, 0);
						dispatch(node, true, 'end');
						cleanup();
						return (running = false);
					}
					if (now >= start_time) {
						const t = easing((now - start_time) / duration);
						tick(t, 1 - t);
					}
				}
				return running;
			});
		}
		let started = false;
		return {
			start() {
				if (started) return;
				started = true;
				delete_rule(node);
				if (is_function(config)) {
					config = config(options);
					wait().then(go);
				} else {
					go();
				}
			},
			invalidate() {
				started = false;
			},
			end() {
				if (running) {
					cleanup();
					running = false;
				}
			}
		};
	}

	/** @typedef {1} INTRO */
	/** @typedef {0} OUTRO */
	/** @typedef {{ direction: 'in' | 'out' | 'both' }} TransitionOptions */
	/** @typedef {(node: Element, params: any, options: TransitionOptions) => import('../transition/public.js').TransitionConfig} TransitionFn */

	/**
	 * @typedef {Object} Outro
	 * @property {number} r
	 * @property {Function[]} c
	 * @property {Object} p
	 */

	/**
	 * @typedef {Object} PendingProgram
	 * @property {number} start
	 * @property {INTRO|OUTRO} b
	 * @property {Outro} [group]
	 */

	/**
	 * @typedef {Object} Program
	 * @property {number} a
	 * @property {INTRO|OUTRO} b
	 * @property {1|-1} d
	 * @property {number} duration
	 * @property {number} start
	 * @property {number} end
	 * @property {Outro} [group]
	 */

	// general each functions:

	function ensure_array_like(array_like_or_iterator) {
		return array_like_or_iterator?.length !== undefined
			? array_like_or_iterator
			: Array.from(array_like_or_iterator);
	}

	/** @returns {void} */
	function outro_and_destroy_block(block, lookup) {
		transition_out(block, 1, 1, () => {
			lookup.delete(block.key);
		});
	}

	/** @returns {any[]} */
	function update_keyed_each(
		old_blocks,
		dirty,
		get_key,
		dynamic,
		ctx,
		list,
		lookup,
		node,
		destroy,
		create_each_block,
		next,
		get_context
	) {
		let o = old_blocks.length;
		let n = list.length;
		let i = o;
		const old_indexes = {};
		while (i--) old_indexes[old_blocks[i].key] = i;
		const new_blocks = [];
		const new_lookup = new Map();
		const deltas = new Map();
		const updates = [];
		i = n;
		while (i--) {
			const child_ctx = get_context(ctx, list, i);
			const key = get_key(child_ctx);
			let block = lookup.get(key);
			if (!block) {
				block = create_each_block(key, child_ctx);
				block.c();
			} else {
				// defer updates until all the DOM shuffling is done
				updates.push(() => block.p(child_ctx, dirty));
			}
			new_lookup.set(key, (new_blocks[i] = block));
			if (key in old_indexes) deltas.set(key, Math.abs(i - old_indexes[key]));
		}
		const will_move = new Set();
		const did_move = new Set();
		/** @returns {void} */
		function insert(block) {
			transition_in(block, 1);
			block.m(node, next);
			lookup.set(block.key, block);
			next = block.first;
			n--;
		}
		while (o && n) {
			const new_block = new_blocks[n - 1];
			const old_block = old_blocks[o - 1];
			const new_key = new_block.key;
			const old_key = old_block.key;
			if (new_block === old_block) {
				// do nothing
				next = new_block.first;
				o--;
				n--;
			} else if (!new_lookup.has(old_key)) {
				// remove old block
				destroy(old_block, lookup);
				o--;
			} else if (!lookup.has(new_key) || will_move.has(new_key)) {
				insert(new_block);
			} else if (did_move.has(old_key)) {
				o--;
			} else if (deltas.get(new_key) > deltas.get(old_key)) {
				did_move.add(new_key);
				insert(new_block);
			} else {
				will_move.add(old_key);
				o--;
			}
		}
		while (o--) {
			const old_block = old_blocks[o];
			if (!new_lookup.has(old_block.key)) destroy(old_block, lookup);
		}
		while (n) insert(new_blocks[n - 1]);
		run_all(updates);
		return new_blocks;
	}

	/** @returns {{}} */
	function get_spread_update(levels, updates) {
		const update = {};
		const to_null_out = {};
		const accounted_for = { $$scope: 1 };
		let i = levels.length;
		while (i--) {
			const o = levels[i];
			const n = updates[i];
			if (n) {
				for (const key in o) {
					if (!(key in n)) to_null_out[key] = 1;
				}
				for (const key in n) {
					if (!accounted_for[key]) {
						update[key] = n[key];
						accounted_for[key] = 1;
					}
				}
				levels[i] = n;
			} else {
				for (const key in o) {
					accounted_for[key] = 1;
				}
			}
		}
		for (const key in to_null_out) {
			if (!(key in update)) update[key] = undefined;
		}
		return update;
	}

	function get_spread_object(spread_props) {
		return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
	}

	/** @returns {void} */
	function create_component(block) {
		block && block.c();
	}

	/** @returns {void} */
	function mount_component(component, target, anchor) {
		const { fragment, after_update } = component.$$;
		fragment && fragment.m(target, anchor);
		// onMount happens before the initial afterUpdate
		add_render_callback(() => {
			const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
			// if the component was destroyed immediately
			// it will update the `$$.on_destroy` reference to `null`.
			// the destructured on_destroy may still reference to the old array
			if (component.$$.on_destroy) {
				component.$$.on_destroy.push(...new_on_destroy);
			} else {
				// Edge case - component was destroyed immediately,
				// most likely as a result of a binding initialising
				run_all(new_on_destroy);
			}
			component.$$.on_mount = [];
		});
		after_update.forEach(add_render_callback);
	}

	/** @returns {void} */
	function destroy_component(component, detaching) {
		const $$ = component.$$;
		if ($$.fragment !== null) {
			flush_render_callbacks($$.after_update);
			run_all($$.on_destroy);
			$$.fragment && $$.fragment.d(detaching);
			// TODO null out other refs, including component.$$ (but need to
			// preserve final state?)
			$$.on_destroy = $$.fragment = null;
			$$.ctx = [];
		}
	}

	/** @returns {void} */
	function make_dirty(component, i) {
		if (component.$$.dirty[0] === -1) {
			dirty_components.push(component);
			schedule_update();
			component.$$.dirty.fill(0);
		}
		component.$$.dirty[(i / 31) | 0] |= 1 << i % 31;
	}

	// TODO: Document the other params
	/**
	 * @param {SvelteComponent} component
	 * @param {import('./public.js').ComponentConstructorOptions} options
	 *
	 * @param {import('./utils.js')['not_equal']} not_equal Used to compare props and state values.
	 * @param {(target: Element | ShadowRoot) => void} [append_styles] Function that appends styles to the DOM when the component is first initialised.
	 * This will be the `add_css` function from the compiled component.
	 *
	 * @returns {void}
	 */
	function init(
		component,
		options,
		instance,
		create_fragment,
		not_equal,
		props,
		append_styles = null,
		dirty = [-1]
	) {
		const parent_component = current_component;
		set_current_component(component);
		/** @type {import('./private.js').T$$} */
		const $$ = (component.$$ = {
			fragment: null,
			ctx: [],
			// state
			props,
			update: noop,
			not_equal,
			bound: blank_object(),
			// lifecycle
			on_mount: [],
			on_destroy: [],
			on_disconnect: [],
			before_update: [],
			after_update: [],
			context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
			// everything else
			callbacks: blank_object(),
			dirty,
			skip_bound: false,
			root: options.target || parent_component.$$.root
		});
		append_styles && append_styles($$.root);
		let ready = false;
		$$.ctx = instance
			? instance(component, options.props || {}, (i, ret, ...rest) => {
					const value = rest.length ? rest[0] : ret;
					if ($$.ctx && not_equal($$.ctx[i], ($$.ctx[i] = value))) {
						if (!$$.skip_bound && $$.bound[i]) $$.bound[i](value);
						if (ready) make_dirty(component, i);
					}
					return ret;
			  })
			: [];
		$$.update();
		ready = true;
		run_all($$.before_update);
		// `false` as a special case of no DOM component
		$$.fragment = create_fragment ? create_fragment($$.ctx) : false;
		if (options.target) {
			if (options.hydrate) {
				// TODO: what is the correct type here?
				// @ts-expect-error
				const nodes = children(options.target);
				$$.fragment && $$.fragment.l(nodes);
				nodes.forEach(detach);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				$$.fragment && $$.fragment.c();
			}
			if (options.intro) transition_in(component.$$.fragment);
			mount_component(component, options.target, options.anchor);
			flush();
		}
		set_current_component(parent_component);
	}

	/**
	 * Base class for Svelte components. Used when dev=false.
	 *
	 * @template {Record<string, any>} [Props=any]
	 * @template {Record<string, any>} [Events=any]
	 */
	class SvelteComponent {
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$ = undefined;
		/**
		 * ### PRIVATE API
		 *
		 * Do not use, may change at any time
		 *
		 * @type {any}
		 */
		$$set = undefined;

		/** @returns {void} */
		$destroy() {
			destroy_component(this, 1);
			this.$destroy = noop;
		}

		/**
		 * @template {Extract<keyof Events, string>} K
		 * @param {K} type
		 * @param {((e: Events[K]) => void) | null | undefined} callback
		 * @returns {() => void}
		 */
		$on(type, callback) {
			if (!is_function(callback)) {
				return noop;
			}
			const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
			callbacks.push(callback);
			return () => {
				const index = callbacks.indexOf(callback);
				if (index !== -1) callbacks.splice(index, 1);
			};
		}

		/**
		 * @param {Partial<Props>} props
		 * @returns {void}
		 */
		$set(props) {
			if (this.$$set && !is_empty(props)) {
				this.$$.skip_bound = true;
				this.$$set(props);
				this.$$.skip_bound = false;
			}
		}
	}

	/**
	 * @typedef {Object} CustomElementPropDefinition
	 * @property {string} [attribute]
	 * @property {boolean} [reflect]
	 * @property {'String'|'Boolean'|'Number'|'Array'|'Object'} [type]
	 */

	// generated during release, do not modify

	const PUBLIC_VERSION = '4';

	if (typeof window !== 'undefined')
		// @ts-ignore
		(window.__svelte || (window.__svelte = { v: new Set() })).v.add(PUBLIC_VERSION);

	/* test/Tabs.svelte generated by Svelte v4.2.19 */

	function get_each_context$4(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[3] = list[i];
		return child_ctx;
	}

	function get_each_context_1$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[3] = list[i];
		return child_ctx;
	}

	// (9:0) {#each items as item}
	function create_each_block_1$3(ctx) {
		let li;
		let button;
		let t0_value = /*item*/ ctx[3].label + "";
		let t0;
		let t1;
		let li_class_value;
		let mounted;
		let dispose;

		return {
			c() {
				li = element("li");
				button = element("button");
				t0 = text(t0_value);
				t1 = space();
				attr(button, "class", "svelte-1mrb2wg");

				attr(li, "class", li_class_value = "" + (null_to_empty(/*activeTabValue*/ ctx[0] === /*item*/ ctx[3].value
				? 'active'
				: '') + " svelte-1mrb2wg"));
			},
			m(target, anchor) {
				insert(target, li, anchor);
				append(li, button);
				append(button, t0);
				append(li, t1);

				if (!mounted) {
					dispose = listen(button, "click", function () {
						if (is_function(/*handleClick*/ ctx[2](/*item*/ ctx[3].value))) /*handleClick*/ ctx[2](/*item*/ ctx[3].value).apply(this, arguments);
					});

					mounted = true;
				}
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				if (dirty & /*items*/ 2 && t0_value !== (t0_value = /*item*/ ctx[3].label + "")) set_data(t0, t0_value);

				if (dirty & /*activeTabValue, items*/ 3 && li_class_value !== (li_class_value = "" + (null_to_empty(/*activeTabValue*/ ctx[0] === /*item*/ ctx[3].value
				? 'active'
				: '') + " svelte-1mrb2wg"))) {
					attr(li, "class", li_class_value);
				}
			},
			d(detaching) {
				if (detaching) {
					detach(li);
				}

				mounted = false;
				dispose();
			}
		};
	}

	// (16:1) {#if activeTabValue == item.value}
	function create_if_block$2(ctx) {
		let div;
		let switch_instance;
		let t;
		let current;
		var switch_value = /*item*/ ctx[3].component;

		function switch_props(ctx, dirty) {
			return {};
		}

		if (switch_value) {
			switch_instance = construct_svelte_component(switch_value, switch_props());
		}

		return {
			c() {
				div = element("div");
				if (switch_instance) create_component(switch_instance.$$.fragment);
				t = space();
				attr(div, "class", "box svelte-1mrb2wg");
			},
			m(target, anchor) {
				insert(target, div, anchor);
				if (switch_instance) mount_component(switch_instance, div, null);
				append(div, t);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*items*/ 2 && switch_value !== (switch_value = /*item*/ ctx[3].component)) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component(switch_value, switch_props());
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, div, t);
					} else {
						switch_instance = null;
					}
				}
			},
			i(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (switch_instance) destroy_component(switch_instance);
			}
		};
	}

	// (15:0) {#each items as item}
	function create_each_block$4(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*activeTabValue*/ ctx[0] == /*item*/ ctx[3].value && create_if_block$2(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (/*activeTabValue*/ ctx[0] == /*item*/ ctx[3].value) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*activeTabValue, items*/ 3) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$2(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};
	}

	function create_fragment$8(ctx) {
		let ul;
		let t;
		let each1_anchor;
		let current;
		let each_value_1 = ensure_array_like(/*items*/ ctx[1]);
		let each_blocks_1 = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks_1[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
		}

		let each_value = ensure_array_like(/*items*/ ctx[1]);
		let each_blocks = [];

		for (let i = 0; i < each_value.length; i += 1) {
			each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		return {
			c() {
				ul = element("ul");

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t = space();

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				each1_anchor = empty();
				attr(ul, "class", "svelte-1mrb2wg");
			},
			m(target, anchor) {
				insert(target, ul, anchor);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(ul, null);
					}
				}

				insert(target, t, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(target, anchor);
					}
				}

				insert(target, each1_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (dirty & /*activeTabValue, items, handleClick*/ 7) {
					each_value_1 = ensure_array_like(/*items*/ ctx[1]);
					let i;

					for (i = 0; i < each_value_1.length; i += 1) {
						const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

						if (each_blocks_1[i]) {
							each_blocks_1[i].p(child_ctx, dirty);
						} else {
							each_blocks_1[i] = create_each_block_1$3(child_ctx);
							each_blocks_1[i].c();
							each_blocks_1[i].m(ul, null);
						}
					}

					for (; i < each_blocks_1.length; i += 1) {
						each_blocks_1[i].d(1);
					}

					each_blocks_1.length = each_value_1.length;
				}

				if (dirty & /*items, activeTabValue*/ 3) {
					each_value = ensure_array_like(/*items*/ ctx[1]);
					let i;

					for (i = 0; i < each_value.length; i += 1) {
						const child_ctx = get_each_context$4(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$4(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(each1_anchor.parentNode, each1_anchor);
						}
					}

					group_outros();

					for (i = each_value.length; i < each_blocks.length; i += 1) {
						out(i);
					}

					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(ul);
					detach(t);
					detach(each1_anchor);
				}

				destroy_each(each_blocks_1, detaching);
				destroy_each(each_blocks, detaching);
			}
		};
	}

	function instance$7($$self, $$props, $$invalidate) {
		let { items = [] } = $$props;
		let { activeTabValue = 1 } = $$props;
		const handleClick = tabValue => () => $$invalidate(0, activeTabValue = tabValue);

		$$self.$$set = $$props => {
			if ('items' in $$props) $$invalidate(1, items = $$props.items);
			if ('activeTabValue' in $$props) $$invalidate(0, activeTabValue = $$props.activeTabValue);
		};

		return [activeTabValue, items, handleClick];
	}

	class Tabs extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$7, create_fragment$8, safe_not_equal, { items: 1, activeTabValue: 0 });
		}
	}

	/**
	 * Animates the opacity of an element from 0 to the current opacity for `in` transitions and from the current opacity to 0 for `out` transitions.
	 *
	 * https://svelte.dev/docs/svelte-transition#fade
	 * @param {Element} node
	 * @param {import('./public').FadeParams} [params]
	 * @returns {import('./public').TransitionConfig}
	 */
	function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
		const o = +getComputedStyle(node).opacity;
		return {
			delay,
			duration,
			easing,
			css: (t) => `opacity: ${t * o}`
		};
	}

	/* src/components/Placeholder.svelte generated by Svelte v4.2.19 */

	function create_if_block$1(ctx) {
		let div;
		let show_if;
		let current_block_type_index;
		let if_block;
		let current;
		const if_block_creators = [create_if_block_1$1, create_if_block_2$1];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (dirty & /*placeholder*/ 1) show_if = null;
			if (typeof /*placeholder*/ ctx[0] === 'string') return 0;
			if (show_if == null) show_if = !!['function', 'object'].includes(typeof /*placeholder*/ ctx[0]);
			if (show_if) return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx, -1))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		return {
			c() {
				div = element("div");
				if (if_block) if_block.c();
				attr(div, "class", placeholderClass);
			},
			m(target, anchor) {
				insert(target, div, anchor);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div, null);
				}

				current = true;
			},
			p(ctx, dirty) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx, dirty);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];

						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block.c();
						} else {
							if_block.p(ctx, dirty);
						}

						transition_in(if_block, 1);
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}
			}
		};
	}

	// (5:66) 
	function create_if_block_2$1(ctx) {
		let switch_instance;
		let switch_instance_anchor;
		let current;
		const switch_instance_spread_levels = [/*placeholderProps*/ ctx[1]];
		var switch_value = /*placeholder*/ ctx[0];

		function switch_props(ctx, dirty) {
			let switch_instance_props = {};

			for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
				switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
			}

			if (dirty !== undefined && dirty & /*placeholderProps*/ 2) {
				switch_instance_props = assign(switch_instance_props, get_spread_update(switch_instance_spread_levels, [get_spread_object(/*placeholderProps*/ ctx[1])]));
			}

			return { props: switch_instance_props };
		}

		if (switch_value) {
			switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
		}

		return {
			c() {
				if (switch_instance) create_component(switch_instance.$$.fragment);
				switch_instance_anchor = empty();
			},
			m(target, anchor) {
				if (switch_instance) mount_component(switch_instance, target, anchor);
				insert(target, switch_instance_anchor, anchor);
				current = true;
			},
			p(ctx, dirty) {
				if (dirty & /*placeholder*/ 1 && switch_value !== (switch_value = /*placeholder*/ ctx[0])) {
					if (switch_instance) {
						group_outros();
						const old_component = switch_instance;

						transition_out(old_component.$$.fragment, 1, 0, () => {
							destroy_component(old_component, 1);
						});

						check_outros();
					}

					if (switch_value) {
						switch_instance = construct_svelte_component(switch_value, switch_props(ctx, dirty));
						create_component(switch_instance.$$.fragment);
						transition_in(switch_instance.$$.fragment, 1);
						mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
					} else {
						switch_instance = null;
					}
				} else if (switch_value) {
					const switch_instance_changes = (dirty & /*placeholderProps*/ 2)
					? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*placeholderProps*/ ctx[1])])
					: {};

					switch_instance.$set(switch_instance_changes);
				}
			},
			i(local) {
				if (current) return;
				if (switch_instance) transition_in(switch_instance.$$.fragment, local);
				current = true;
			},
			o(local) {
				if (switch_instance) transition_out(switch_instance.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(switch_instance_anchor);
				}

				if (switch_instance) destroy_component(switch_instance, detaching);
			}
		};
	}

	// (3:4) {#if typeof placeholder === 'string'}
	function create_if_block_1$1(ctx) {
		let div;
		let t;

		return {
			c() {
				div = element("div");
				t = text(/*placeholder*/ ctx[0]);
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, t);
			},
			p(ctx, dirty) {
				if (dirty & /*placeholder*/ 1) set_data(t, /*placeholder*/ ctx[0]);
			},
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	function create_fragment$7(ctx) {
		let if_block_anchor;
		let current;
		let if_block = /*placeholder*/ ctx[0] && create_if_block$1(ctx);

		return {
			c() {
				if (if_block) if_block.c();
				if_block_anchor = empty();
			},
			m(target, anchor) {
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(ctx, [dirty]) {
				if (/*placeholder*/ ctx[0]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*placeholder*/ 1) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block$1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(if_block_anchor);
				}

				if (if_block) if_block.d(detaching);
			}
		};
	}

	const placeholderClass = 'svelte-lazy-placeholder';

	function instance$6($$self, $$props, $$invalidate) {
		let { placeholder = null } = $$props;
		let { placeholderProps = null } = $$props;

		$$self.$$set = $$props => {
			if ('placeholder' in $$props) $$invalidate(0, placeholder = $$props.placeholder);
			if ('placeholderProps' in $$props) $$invalidate(1, placeholderProps = $$props.placeholderProps);
		};

		return [placeholder, placeholderProps];
	}

	class Placeholder extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$6, create_fragment$7, safe_not_equal, { placeholder: 0, placeholderProps: 1 });
		}
	}

	/* src/index.svelte generated by Svelte v4.2.19 */

	function create_if_block_2(ctx) {
		let placeholder_1;
		let current;

		placeholder_1 = new Placeholder({
				props: {
					placeholder: /*placeholder*/ ctx[1],
					placeholderProps: /*placeholderProps*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(placeholder_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(placeholder_1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const placeholder_1_changes = {};
				if (dirty & /*placeholder*/ 2) placeholder_1_changes.placeholder = /*placeholder*/ ctx[1];
				if (dirty & /*placeholderProps*/ 4) placeholder_1_changes.placeholderProps = /*placeholderProps*/ ctx[2];
				placeholder_1.$set(placeholder_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(placeholder_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(placeholder_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(placeholder_1, detaching);
			}
		};
	}

	// (2:2) {#if loaded}
	function create_if_block(ctx) {
		let div;
		let div_intro;
		let t;
		let if_block_anchor;
		let current;
		const default_slot_template = /*#slots*/ ctx[16].default;
		const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[15], null);
		const default_slot_or_fallback = default_slot || fallback_block();
		let if_block = !/*contentShow*/ ctx[3] && /*placeholder*/ ctx[1] && create_if_block_1(ctx);

		return {
			c() {
				div = element("div");
				if (default_slot_or_fallback) default_slot_or_fallback.c();
				t = space();
				if (if_block) if_block.c();
				if_block_anchor = empty();
				attr(div, "class", contentClass);
				attr(div, "style", /*contentStyle*/ ctx[5]);
			},
			m(target, anchor) {
				insert(target, div, anchor);

				if (default_slot_or_fallback) {
					default_slot_or_fallback.m(div, null);
				}

				insert(target, t, anchor);
				if (if_block) if_block.m(target, anchor);
				insert(target, if_block_anchor, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;

				if (default_slot) {
					if (default_slot.p && (!current || dirty & /*$$scope*/ 32768)) {
						update_slot_base(
							default_slot,
							default_slot_template,
							ctx,
							/*$$scope*/ ctx[15],
							!current
							? get_all_dirty_from_scope(/*$$scope*/ ctx[15])
							: get_slot_changes(default_slot_template, /*$$scope*/ ctx[15], dirty, null),
							null
						);
					}
				}

				if (!current || dirty & /*contentStyle*/ 32) {
					attr(div, "style", /*contentStyle*/ ctx[5]);
				}

				if (!/*contentShow*/ ctx[3] && /*placeholder*/ ctx[1]) {
					if (if_block) {
						if_block.p(ctx, dirty);

						if (dirty & /*contentShow, placeholder*/ 10) {
							transition_in(if_block, 1);
						}
					} else {
						if_block = create_if_block_1(ctx);
						if_block.c();
						transition_in(if_block, 1);
						if_block.m(if_block_anchor.parentNode, if_block_anchor);
					}
				} else if (if_block) {
					group_outros();

					transition_out(if_block, 1, 1, () => {
						if_block = null;
					});

					check_outros();
				}
			},
			i(local) {
				if (current) return;
				transition_in(default_slot_or_fallback, local);

				if (local) {
					if (!div_intro) {
						add_render_callback(() => {
							div_intro = create_in_transition(div, fade, /*fadeOption*/ ctx[0] || {});
							div_intro.start();
						});
					}
				}

				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(default_slot_or_fallback, local);
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
					detach(t);
					detach(if_block_anchor);
				}

				if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
				if (if_block) if_block.d(detaching);
			}
		};
	}

	// (8:12) Lazy load content
	function fallback_block(ctx) {
		let t;

		return {
			c() {
				t = text("Lazy load content");
			},
			m(target, anchor) {
				insert(target, t, anchor);
			},
			d(detaching) {
				if (detaching) {
					detach(t);
				}
			}
		};
	}

	// (10:4) {#if !contentShow && placeholder}
	function create_if_block_1(ctx) {
		let placeholder_1;
		let current;

		placeholder_1 = new Placeholder({
				props: {
					placeholder: /*placeholder*/ ctx[1],
					placeholderProps: /*placeholderProps*/ ctx[2]
				}
			});

		return {
			c() {
				create_component(placeholder_1.$$.fragment);
			},
			m(target, anchor) {
				mount_component(placeholder_1, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const placeholder_1_changes = {};
				if (dirty & /*placeholder*/ 2) placeholder_1_changes.placeholder = /*placeholder*/ ctx[1];
				if (dirty & /*placeholderProps*/ 4) placeholder_1_changes.placeholderProps = /*placeholderProps*/ ctx[2];
				placeholder_1.$set(placeholder_1_changes);
			},
			i(local) {
				if (current) return;
				transition_in(placeholder_1.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(placeholder_1.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(placeholder_1, detaching);
			}
		};
	}

	function create_fragment$6(ctx) {
		let div;
		let current_block_type_index;
		let if_block;
		let current;
		let mounted;
		let dispose;
		const if_block_creators = [create_if_block, create_if_block_2];
		const if_blocks = [];

		function select_block_type(ctx, dirty) {
			if (/*loaded*/ ctx[4]) return 0;
			if (/*placeholder*/ ctx[1]) return 1;
			return -1;
		}

		if (~(current_block_type_index = select_block_type(ctx))) {
			if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
		}

		return {
			c() {
				div = element("div");
				if (if_block) if_block.c();
				attr(div, "class", /*rootClass*/ ctx[6]);
				set_style(div, "height", /*rootInitialHeight*/ ctx[7]);
			},
			m(target, anchor) {
				insert(target, div, anchor);

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].m(div, null);
				}

				current = true;

				if (!mounted) {
					dispose = action_destroyer(/*load*/ ctx[8].call(null, div));
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				let previous_block_index = current_block_type_index;
				current_block_type_index = select_block_type(ctx);

				if (current_block_type_index === previous_block_index) {
					if (~current_block_type_index) {
						if_blocks[current_block_type_index].p(ctx, dirty);
					}
				} else {
					if (if_block) {
						group_outros();

						transition_out(if_blocks[previous_block_index], 1, 1, () => {
							if_blocks[previous_block_index] = null;
						});

						check_outros();
					}

					if (~current_block_type_index) {
						if_block = if_blocks[current_block_type_index];

						if (!if_block) {
							if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
							if_block.c();
						} else {
							if_block.p(ctx, dirty);
						}

						transition_in(if_block, 1);
						if_block.m(div, null);
					} else {
						if_block = null;
					}
				}
			},
			i(local) {
				if (current) return;
				transition_in(if_block);
				current = true;
			},
			o(local) {
				transition_out(if_block);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div);
				}

				if (~current_block_type_index) {
					if_blocks[current_block_type_index].d();
				}

				mounted = false;
				dispose();
			}
		};
	}

	const contentClass = 'svelte-lazy-content';

	function addListeners(handler) {
		document.addEventListener('scroll', handler, true);
		window.addEventListener('resize', handler);
	}

	function removeListeners(handler) {
		document.removeEventListener('scroll', handler, true);
		window.removeEventListener('resize', handler);
	}

	function getContainerHeight(e) {
		if (e?.target?.getBoundingClientRect) {
			return e.target.getBoundingClientRect().bottom;
		} else {
			return window.innerHeight;
		}
	}

	// From underscore souce code
	function throttle(func, wait, options) {
		let context, args, result;
		let timeout = null;
		let previous = 0;
		if (!options) options = {};

		const later = function () {
			previous = options.leading === false ? 0 : new Date();
			timeout = null;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		};

		return function (event) {
			const now = new Date();
			if (!previous && options.leading === false) previous = now;
			const remaining = wait - (now - previous);
			context = this;
			args = arguments;

			if (remaining <= 0 || remaining > wait) {
				if (timeout) {
					clearTimeout(timeout);
					timeout = null;
				}

				previous = now;
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			} else if (!timeout && options.trailing !== false) {
				timeout = setTimeout(later, remaining);
			}

			return result;
		};
	}

	function instance$5($$self, $$props, $$invalidate) {
		let contentStyle;
		let { $$slots: slots = {}, $$scope } = $$props;
		let { keep = false } = $$props;
		let { height = 0 } = $$props;
		let { offset = 150 } = $$props;
		let { fadeOption = { delay: 0, duration: 400 } } = $$props;
		let { resetHeightDelay = 0 } = $$props;
		let { onload = null } = $$props;
		let { placeholder = null } = $$props;
		let { placeholderProps = null } = $$props;
		let { class: className = '' } = $$props;
		const rootClass = 'svelte-lazy' + (className ? ' ' + className : '');
		const rootInitialHeight = getStyleHeight();
		let loaded = false;
		let contentShow = true;

		function load(node) {
			setHeight(node);
			const handler = createHandler(node);
			addListeners(handler);

			setTimeout(() => {
				handler();
			});

			const observer = observeNode(node);

			return {
				destroy: () => {
					removeListeners(handler);
					observer.unobserve(node);
				}
			};
		}

		function createHandler(node) {
			const handler = throttle(
				e => {
					const nodeTop = node.getBoundingClientRect().top;
					const nodeBottom = node.getBoundingClientRect().bottom;
					const expectedTop = getContainerHeight(e) + offset;

					if (nodeTop <= expectedTop && nodeBottom > 0) {
						loadNode(node);
					} else if (!keep) {
						unload(node);
					}
				},
				200
			);

			return handler;
		}

		function observeNode(node, handler) {
			const observer = new IntersectionObserver(entries => {
					if (entries[0].isIntersecting) {
						loadNode(node);
					}
				});

			observer.observe(node);
			return observer;
		}

		function unload(node) {
			setHeight(node);
			$$invalidate(4, loaded = false);
		}

		function loadNode(node, handler) {
			if (loaded) {
				return;
			}

			$$invalidate(4, loaded = true);
			resetHeight(node);

			if (onload) {
				onload(node);
			}
		}

		function getStyleHeight() {
			return typeof height === 'number' ? height + 'px' : height;
		}

		function setHeight(node) {
			if (height) {
				node.style.height = getStyleHeight();
			}
		}

		function resetHeight(node) {
			setTimeout(
				() => {
					const isLoading = checkImgLoadingStatus(node);

					if (!isLoading) {
						node.style.height = 'auto';
					}
				}, // Add a delay to wait for remote resources like images to load
				resetHeightDelay
			);
		}

		function checkImgLoadingStatus(node) {
			const img = node.querySelector('img');

			if (!img) {
				return false;
			}

			if (!img.complete) {
				$$invalidate(3, contentShow = false);

				node.addEventListener(
					'load',
					() => {
						// Use auto height if loading successfully
						$$invalidate(3, contentShow = true);

						node.style.height = 'auto';
					},
					{ capture: true, once: true }
				);

				node.addEventListener(
					'error',
					() => {
						// Show content with fixed height if there is error
						$$invalidate(3, contentShow = true);
					},
					{ capture: true, once: true }
				);

				return true;
			}

			if (img.naturalHeight === 0) {
				// Use fixed height if img has zero height
				return true;
			}

			return false;
		}

		$$self.$$set = $$props => {
			if ('keep' in $$props) $$invalidate(9, keep = $$props.keep);
			if ('height' in $$props) $$invalidate(10, height = $$props.height);
			if ('offset' in $$props) $$invalidate(11, offset = $$props.offset);
			if ('fadeOption' in $$props) $$invalidate(0, fadeOption = $$props.fadeOption);
			if ('resetHeightDelay' in $$props) $$invalidate(12, resetHeightDelay = $$props.resetHeightDelay);
			if ('onload' in $$props) $$invalidate(13, onload = $$props.onload);
			if ('placeholder' in $$props) $$invalidate(1, placeholder = $$props.placeholder);
			if ('placeholderProps' in $$props) $$invalidate(2, placeholderProps = $$props.placeholderProps);
			if ('class' in $$props) $$invalidate(14, className = $$props.class);
			if ('$$scope' in $$props) $$invalidate(15, $$scope = $$props.$$scope);
		};

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*contentShow*/ 8) {
				$$invalidate(5, contentStyle = !contentShow ? 'display: none' : '');
			}
		};

		return [
			fadeOption,
			placeholder,
			placeholderProps,
			contentShow,
			loaded,
			contentStyle,
			rootClass,
			rootInitialHeight,
			load,
			keep,
			height,
			offset,
			resetHeightDelay,
			onload,
			className,
			$$scope,
			slots
		];
	}

	class Src extends SvelteComponent {
		constructor(options) {
			super();

			init(this, options, instance$5, create_fragment$6, safe_not_equal, {
				keep: 9,
				height: 10,
				offset: 11,
				fadeOption: 0,
				resetHeightDelay: 12,
				onload: 13,
				placeholder: 1,
				placeholderProps: 2,
				class: 14
			});
		}
	}

	/* test/Loading.svelte generated by Svelte v4.2.19 */

	function create_fragment$5(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				div.textContent = "Loading Component";
				attr(div, "class", "svelte-ynrwa7");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			i: noop,
			o: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	class Loading extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, null, create_fragment$5, safe_not_equal, {});
		}
	}

	/* test/ScrollList.svelte generated by Svelte v4.2.19 */

	function get_each_context$3(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	function get_each_context_1$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (9:2) <Lazy      class="top"     height={300}      placeholder={'Loading...'}      fadeOption={{delay: 100, duration: 4000}}    >
	function create_default_slot_5$2(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p2.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (19:4) {#each [1, 2, 3] as i}
	function create_each_block_1$2(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p1.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (24:2) <Lazy>
	function create_default_slot_4$2(ctx) {
		let video;

		return {
			c() {
				video = element("video");
				video.innerHTML = `<track kind="captions"/><source src="auto/flower.mp4"/>`;
				video.controls = true;
				attr(video, "height", 300);
				attr(video, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, video, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(video);
				}
			}
		};
	}

	// (31:2) <Lazy height={300}>
	function create_default_slot_3$2(ctx) {
		let video;

		return {
			c() {
				video = element("video");
				video.innerHTML = `<track kind="captions"/><source src="auto/flower.mp4"/>`;
				video.controls = true;
				attr(video, "height", 300);
				attr(video, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, video, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(video);
				}
			}
		};
	}

	// (39:2) <Lazy      class="basic"     height={300}      placeholder={'Loading...'}    >
	function create_default_slot_2$2(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "p3");
				if (!src_url_equal(img.src, img_src_value = "auto/p3.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (48:4) <Lazy        class="extend"       height={300}       onload={onload}        placeholder={Loading}       fadeOption={{delay: 100, duration: 2000}}      >
	function create_default_slot_1$2(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p2.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (47:2) {#each [1, 2, 3] as i}
	function create_each_block$3(ctx) {
		let lazy;
		let current;

		lazy = new Src({
				props: {
					class: "extend",
					height: 300,
					onload: /*onload*/ ctx[0],
					placeholder: Loading,
					fadeOption: { delay: 100, duration: 2000 },
					$$slots: { default: [create_default_slot_1$2] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(lazy.$$.fragment);
			},
			m(target, anchor) {
				mount_component(lazy, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const lazy_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy_changes.$$scope = { dirty, ctx };
				}

				lazy.$set(lazy_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(lazy, detaching);
			}
		};
	}

	// (59:2) <Lazy      class="any-content"     height={300}      offset={300}     placeholder={'Loading...'}      fadeOption={{delay: 100, duration: 2000}}    >
	function create_default_slot$3(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				div.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
				attr(div, "class", "text-content svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	function create_fragment$4(ctx) {
		let div1;
		let lazy0;
		let t0;
		let div0;
		let t1;
		let lazy1;
		let t2;
		let lazy2;
		let t3;
		let lazy3;
		let t4;
		let t5;
		let lazy4;
		let current;

		lazy0 = new Src({
				props: {
					class: "top",
					height: 300,
					placeholder: 'Loading...',
					fadeOption: { delay: 100, duration: 4000 },
					$$slots: { default: [create_default_slot_5$2] },
					$$scope: { ctx }
				}
			});

		let each_value_1 = ensure_array_like([1, 2, 3]);
		let each_blocks_1 = [];

		for (let i = 0; i < 3; i += 1) {
			each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
		}

		lazy1 = new Src({
				props: {
					$$slots: { default: [create_default_slot_4$2] },
					$$scope: { ctx }
				}
			});

		lazy2 = new Src({
				props: {
					height: 300,
					$$slots: { default: [create_default_slot_3$2] },
					$$scope: { ctx }
				}
			});

		lazy3 = new Src({
				props: {
					class: "basic",
					height: 300,
					placeholder: 'Loading...',
					$$slots: { default: [create_default_slot_2$2] },
					$$scope: { ctx }
				}
			});

		let each_value = ensure_array_like([1, 2, 3]);
		let each_blocks = [];

		for (let i = 0; i < 3; i += 1) {
			each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		lazy4 = new Src({
				props: {
					class: "any-content",
					height: 300,
					offset: 300,
					placeholder: 'Loading...',
					fadeOption: { delay: 100, duration: 2000 },
					$$slots: { default: [create_default_slot$3] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				div1 = element("div");
				create_component(lazy0.$$.fragment);
				t0 = space();
				div0 = element("div");

				for (let i = 0; i < 3; i += 1) {
					each_blocks_1[i].c();
				}

				t1 = space();
				create_component(lazy1.$$.fragment);
				t2 = space();
				create_component(lazy2.$$.fragment);
				t3 = space();
				create_component(lazy3.$$.fragment);
				t4 = space();

				for (let i = 0; i < 3; i += 1) {
					each_blocks[i].c();
				}

				t5 = space();
				create_component(lazy4.$$.fragment);
				attr(div0, "class", "preload svelte-repcjo");
				attr(div1, "class", "container svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				mount_component(lazy0, div1, null);
				append(div1, t0);
				append(div1, div0);

				for (let i = 0; i < 3; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(div0, null);
					}
				}

				append(div1, t1);
				mount_component(lazy1, div1, null);
				append(div1, t2);
				mount_component(lazy2, div1, null);
				append(div1, t3);
				mount_component(lazy3, div1, null);
				append(div1, t4);

				for (let i = 0; i < 3; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div1, null);
					}
				}

				append(div1, t5);
				mount_component(lazy4, div1, null);
				current = true;
			},
			p(ctx, [dirty]) {
				const lazy0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy0_changes.$$scope = { dirty, ctx };
				}

				lazy0.$set(lazy0_changes);
				const lazy1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy1_changes.$$scope = { dirty, ctx };
				}

				lazy1.$set(lazy1_changes);
				const lazy2_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy2_changes.$$scope = { dirty, ctx };
				}

				lazy2.$set(lazy2_changes);
				const lazy3_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy3_changes.$$scope = { dirty, ctx };
				}

				lazy3.$set(lazy3_changes);

				if (dirty & /*onload*/ 1) {
					each_value = ensure_array_like([1, 2, 3]);
					let i;

					for (i = 0; i < 3; i += 1) {
						const child_ctx = get_each_context$3(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$3(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div1, t5);
						}
					}

					group_outros();

					for (i = 3; i < 3; i += 1) {
						out(i);
					}

					check_outros();
				}

				const lazy4_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy4_changes.$$scope = { dirty, ctx };
				}

				lazy4.$set(lazy4_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy0.$$.fragment, local);
				transition_in(lazy1.$$.fragment, local);
				transition_in(lazy2.$$.fragment, local);
				transition_in(lazy3.$$.fragment, local);

				for (let i = 0; i < 3; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(lazy4.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy0.$$.fragment, local);
				transition_out(lazy1.$$.fragment, local);
				transition_out(lazy2.$$.fragment, local);
				transition_out(lazy3.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < 3; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(lazy4.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				destroy_component(lazy0);
				destroy_each(each_blocks_1, detaching);
				destroy_component(lazy1);
				destroy_component(lazy2);
				destroy_component(lazy3);
				destroy_each(each_blocks, detaching);
				destroy_component(lazy4);
			}
		};
	}

	function instance$4($$self) {
		window.extend = { onload: false };

		const onload = node => {
			window.extend.onload = true;
			console.log('Trigger onload');
		};

		return [onload];
	}

	class ScrollList extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$4, create_fragment$4, safe_not_equal, {});
		}
	}

	/* test/LongScrollList.svelte generated by Svelte v4.2.19 */

	function get_each_context$2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	function get_each_context_1$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	function get_each_context_2(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (9:2) <Lazy      class="top"     height={300}      placeholder={'Loading...'}      fadeOption={{delay: 100, duration: 4000}}    >
	function create_default_slot_5$1(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p2.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (19:4) {#each [1, 2, 3] as i}
	function create_each_block_2(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p1.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (24:2) <Lazy>
	function create_default_slot_4$1(ctx) {
		let video;

		return {
			c() {
				video = element("video");
				video.innerHTML = `<track kind="captions"/><source src="auto/flower.mp4"/>`;
				video.controls = true;
				attr(video, "height", 300);
				attr(video, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, video, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(video);
				}
			}
		};
	}

	// (33:4) <Lazy height={300}>
	function create_default_slot_3$1(ctx) {
		let video;
		let t;

		return {
			c() {
				video = element("video");
				video.innerHTML = `<track kind="captions"/><source src="auto/flower.mp4"/>`;
				t = space();
				video.controls = true;
				attr(video, "height", 300);
				attr(video, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, video, anchor);
				insert(target, t, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(video);
					detach(t);
				}
			}
		};
	}

	// (32:2) {#each Array.from({ length: 1000 }, (v, k) => k + 1) as i}
	function create_each_block_1$1(ctx) {
		let lazy;
		let current;

		lazy = new Src({
				props: {
					height: 300,
					$$slots: { default: [create_default_slot_3$1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(lazy.$$.fragment);
			},
			m(target, anchor) {
				mount_component(lazy, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const lazy_changes = {};

				if (dirty & /*$$scope*/ 256) {
					lazy_changes.$$scope = { dirty, ctx };
				}

				lazy.$set(lazy_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(lazy, detaching);
			}
		};
	}

	// (42:2) <Lazy      class="basic"     height={300}      placeholder={'Loading...'}    >
	function create_default_slot_2$1(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "p3");
				if (!src_url_equal(img.src, img_src_value = "auto/p3.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (51:4) <Lazy        class="extend"       height={300}       onload={onload}        placeholder={Loading}       fadeOption={{delay: 100, duration: 2000}}      >
	function create_default_slot_1$1(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p2.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (50:2) {#each [1, 2, 3] as i}
	function create_each_block$2(ctx) {
		let lazy;
		let current;

		lazy = new Src({
				props: {
					class: "extend",
					height: 300,
					onload: /*onload*/ ctx[0],
					placeholder: Loading,
					fadeOption: { delay: 100, duration: 2000 },
					$$slots: { default: [create_default_slot_1$1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(lazy.$$.fragment);
			},
			m(target, anchor) {
				mount_component(lazy, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const lazy_changes = {};

				if (dirty & /*$$scope*/ 256) {
					lazy_changes.$$scope = { dirty, ctx };
				}

				lazy.$set(lazy_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(lazy, detaching);
			}
		};
	}

	// (62:2) <Lazy      class="any-content"     height={300}      offset={300}     placeholder={'Loading...'}      fadeOption={{delay: 100, duration: 2000}}    >
	function create_default_slot$2(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				div.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
				attr(div, "class", "text-content svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	function create_fragment$3(ctx) {
		let div1;
		let lazy0;
		let t0;
		let div0;
		let t1;
		let lazy1;
		let t2;
		let t3;
		let lazy2;
		let t4;
		let t5;
		let lazy3;
		let current;

		lazy0 = new Src({
				props: {
					class: "top",
					height: 300,
					placeholder: 'Loading...',
					fadeOption: { delay: 100, duration: 4000 },
					$$slots: { default: [create_default_slot_5$1] },
					$$scope: { ctx }
				}
			});

		let each_value_2 = ensure_array_like([1, 2, 3]);
		let each_blocks_2 = [];

		for (let i = 0; i < 3; i += 1) {
			each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
		}

		lazy1 = new Src({
				props: {
					$$slots: { default: [create_default_slot_4$1] },
					$$scope: { ctx }
				}
			});

		let each_value_1 = ensure_array_like(Array.from({ length: 1000 }, func));
		let each_blocks_1 = [];

		for (let i = 0; i < each_value_1.length; i += 1) {
			each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
		}

		lazy2 = new Src({
				props: {
					class: "basic",
					height: 300,
					placeholder: 'Loading...',
					$$slots: { default: [create_default_slot_2$1] },
					$$scope: { ctx }
				}
			});

		let each_value = ensure_array_like([1, 2, 3]);
		let each_blocks = [];

		for (let i = 0; i < 3; i += 1) {
			each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		lazy3 = new Src({
				props: {
					class: "any-content",
					height: 300,
					offset: 300,
					placeholder: 'Loading...',
					fadeOption: { delay: 100, duration: 2000 },
					$$slots: { default: [create_default_slot$2] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				div1 = element("div");
				create_component(lazy0.$$.fragment);
				t0 = space();
				div0 = element("div");

				for (let i = 0; i < 3; i += 1) {
					each_blocks_2[i].c();
				}

				t1 = space();
				create_component(lazy1.$$.fragment);
				t2 = space();

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].c();
				}

				t3 = space();
				create_component(lazy2.$$.fragment);
				t4 = space();

				for (let i = 0; i < 3; i += 1) {
					each_blocks[i].c();
				}

				t5 = space();
				create_component(lazy3.$$.fragment);
				attr(div0, "class", "preload svelte-repcjo");
				attr(div1, "class", "container svelte-repcjo");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				mount_component(lazy0, div1, null);
				append(div1, t0);
				append(div1, div0);

				for (let i = 0; i < 3; i += 1) {
					if (each_blocks_2[i]) {
						each_blocks_2[i].m(div0, null);
					}
				}

				append(div1, t1);
				mount_component(lazy1, div1, null);
				append(div1, t2);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(div1, null);
					}
				}

				append(div1, t3);
				mount_component(lazy2, div1, null);
				append(div1, t4);

				for (let i = 0; i < 3; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div1, null);
					}
				}

				append(div1, t5);
				mount_component(lazy3, div1, null);
				current = true;
			},
			p(ctx, [dirty]) {
				const lazy0_changes = {};

				if (dirty & /*$$scope*/ 256) {
					lazy0_changes.$$scope = { dirty, ctx };
				}

				lazy0.$set(lazy0_changes);
				const lazy1_changes = {};

				if (dirty & /*$$scope*/ 256) {
					lazy1_changes.$$scope = { dirty, ctx };
				}

				lazy1.$set(lazy1_changes);
				const lazy2_changes = {};

				if (dirty & /*$$scope*/ 256) {
					lazy2_changes.$$scope = { dirty, ctx };
				}

				lazy2.$set(lazy2_changes);

				if (dirty & /*onload*/ 1) {
					each_value = ensure_array_like([1, 2, 3]);
					let i;

					for (i = 0; i < 3; i += 1) {
						const child_ctx = get_each_context$2(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block$2(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div1, t5);
						}
					}

					group_outros();

					for (i = 3; i < 3; i += 1) {
						out(i);
					}

					check_outros();
				}

				const lazy3_changes = {};

				if (dirty & /*$$scope*/ 256) {
					lazy3_changes.$$scope = { dirty, ctx };
				}

				lazy3.$set(lazy3_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy0.$$.fragment, local);
				transition_in(lazy1.$$.fragment, local);

				for (let i = 0; i < each_value_1.length; i += 1) {
					transition_in(each_blocks_1[i]);
				}

				transition_in(lazy2.$$.fragment, local);

				for (let i = 0; i < 3; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(lazy3.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy0.$$.fragment, local);
				transition_out(lazy1.$$.fragment, local);
				each_blocks_1 = each_blocks_1.filter(Boolean);

				for (let i = 0; i < each_blocks_1.length; i += 1) {
					transition_out(each_blocks_1[i]);
				}

				transition_out(lazy2.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < 3; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(lazy3.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				destroy_component(lazy0);
				destroy_each(each_blocks_2, detaching);
				destroy_component(lazy1);
				destroy_each(each_blocks_1, detaching);
				destroy_component(lazy2);
				destroy_each(each_blocks, detaching);
				destroy_component(lazy3);
			}
		};
	}

	const func = (v, k) => k + 1;

	function instance$3($$self) {
		window.extend = { onload: false };

		const onload = node => {
			window.extend.onload = true;
			console.log('Trigger onload');
		};

		return [onload];
	}

	class LongScrollList extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$3, create_fragment$3, safe_not_equal, {});
		}
	}

	/* test/FilterList.svelte generated by Svelte v4.2.19 */

	function get_each_context$1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[5] = list[i];
		child_ctx[7] = i;
		return child_ctx;
	}

	// (60:4) <Lazy height="30px" placeholder="Loading..." fadeOption="null">
	function create_default_slot$1(ctx) {
		let div;
		let b;
		let t0_value = /*i*/ ctx[7] + 1 + "";
		let t0;
		let t1;
		let t2_value = /*item*/ ctx[5].text + "";
		let t2;
		let t3;

		return {
			c() {
				div = element("div");
				b = element("b");
				t0 = text(t0_value);
				t1 = text(": ");
				t2 = text(t2_value);
				t3 = space();
			},
			m(target, anchor) {
				insert(target, div, anchor);
				append(div, b);
				append(b, t0);
				append(div, t1);
				append(div, t2);
				insert(target, t3, anchor);
			},
			p(ctx, dirty) {
				if (dirty & /*filteredData*/ 2 && t0_value !== (t0_value = /*i*/ ctx[7] + 1 + "")) set_data(t0, t0_value);
				if (dirty & /*filteredData*/ 2 && t2_value !== (t2_value = /*item*/ ctx[5].text + "")) set_data(t2, t2_value);
			},
			d(detaching) {
				if (detaching) {
					detach(div);
					detach(t3);
				}
			}
		};
	}

	// (59:2) {#each filteredData as item, i (item.id)}
	function create_each_block$1(key_1, ctx) {
		let first;
		let lazy;
		let current;

		lazy = new Src({
				props: {
					height: "30px",
					placeholder: "Loading...",
					fadeOption: "null",
					$$slots: { default: [create_default_slot$1] },
					$$scope: { ctx }
				}
			});

		return {
			key: key_1,
			first: null,
			c() {
				first = empty();
				create_component(lazy.$$.fragment);
				this.first = first;
			},
			m(target, anchor) {
				insert(target, first, anchor);
				mount_component(lazy, target, anchor);
				current = true;
			},
			p(new_ctx, dirty) {
				ctx = new_ctx;
				const lazy_changes = {};

				if (dirty & /*$$scope, filteredData*/ 258) {
					lazy_changes.$$scope = { dirty, ctx };
				}

				lazy.$set(lazy_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(first);
				}

				destroy_component(lazy, detaching);
			}
		};
	}

	function create_fragment$2(ctx) {
		let input;
		let t;
		let div;
		let each_blocks = [];
		let each_1_lookup = new Map();
		let current;
		let mounted;
		let dispose;
		let each_value = ensure_array_like(/*filteredData*/ ctx[1]);
		const get_key = ctx => /*item*/ ctx[5].id;

		for (let i = 0; i < each_value.length; i += 1) {
			let child_ctx = get_each_context$1(ctx, each_value, i);
			let key = get_key(child_ctx);
			each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
		}

		return {
			c() {
				input = element("input");
				t = space();
				div = element("div");

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].c();
				}

				attr(div, "class", "container svelte-1vele4z");
			},
			m(target, anchor) {
				insert(target, input, anchor);
				set_input_value(input, /*search*/ ctx[0]);
				insert(target, t, anchor);
				insert(target, div, anchor);

				for (let i = 0; i < each_blocks.length; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div, null);
					}
				}

				current = true;

				if (!mounted) {
					dispose = listen(input, "input", /*input_input_handler*/ ctx[2]);
					mounted = true;
				}
			},
			p(ctx, [dirty]) {
				if (dirty & /*search*/ 1 && input.value !== /*search*/ ctx[0]) {
					set_input_value(input, /*search*/ ctx[0]);
				}

				if (dirty & /*filteredData*/ 2) {
					each_value = ensure_array_like(/*filteredData*/ ctx[1]);
					group_outros();
					each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$1, null, get_each_context$1);
					check_outros();
				}
			},
			i(local) {
				if (current) return;

				for (let i = 0; i < each_value.length; i += 1) {
					transition_in(each_blocks[i]);
				}

				current = true;
			},
			o(local) {
				for (let i = 0; i < each_blocks.length; i += 1) {
					transition_out(each_blocks[i]);
				}

				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(input);
					detach(t);
					detach(div);
				}

				for (let i = 0; i < each_blocks.length; i += 1) {
					each_blocks[i].d();
				}

				mounted = false;
				dispose();
			}
		};
	}

	function instance$2($$self, $$props, $$invalidate) {
		let filteredData;
		let search = '';

		let data = [
			{ id: 1, text: "one" },
			{ id: 2, text: "two" },
			{ id: 3, text: "three" },
			{ id: 4, text: "four" },
			{ id: 5, text: "five" },
			{ id: 6, text: "six" },
			{ id: 7, text: "seven" },
			{ id: 8, text: "eight" },
			{ id: 9, text: "nine" },
			{ id: 10, text: "ten" },
			{ id: 11, text: "eleven" },
			{ id: 12, text: "twelve" },
			{ id: 13, text: "thirteen" },
			{ id: 14, text: "fourteen" },
			{ id: 15, text: "fifteen" },
			{ id: 16, text: "sixteen" },
			{ id: 17, text: "seventeen" },
			{ id: 18, text: "eighteen" },
			{ id: 19, text: "nineteen" },
			{ id: 20, text: "twenty" },
			{ id: 21, text: "twenty-one" },
			{ id: 22, text: "twenty-two" },
			{ id: 23, text: "twenty-three" },
			{ id: 24, text: "twenty-four" },
			{ id: 25, text: "twenty-five" },
			{ id: 26, text: "twenty-six" },
			{ id: 27, text: "twenty-seven" },
			{ id: 28, text: "twenty-eight" },
			{ id: 29, text: "twenty-nine" },
			{ id: 30, text: "thirty" },
			{ id: 31, text: "thirty-one" },
			{ id: 32, text: "thirty-two" },
			{ id: 33, text: "thirty-three" },
			{ id: 34, text: "thirty-four" },
			{ id: 35, text: "thirty-five" },
			{ id: 36, text: "thirty-six" },
			{ id: 37, text: "thirty-seven" },
			{ id: 38, text: "thirty-eight" },
			{ id: 39, text: "thirty-nine" }
		];

		const filterData = () => {
			if (search.length == 0) return [...data]; else return [...data.filter(x => x.text.toLowerCase().includes(search.toLowerCase()))];
		};

		function input_input_handler() {
			search = this.value;
			$$invalidate(0, search);
		}

		$$self.$$.update = () => {
			if ($$self.$$.dirty & /*search*/ 1) {
				$$invalidate(1, filteredData = filterData());
			}
		};

		return [search, filteredData, input_input_handler];
	}

	class FilterList extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$2, create_fragment$2, safe_not_equal, {});
		}
	}

	/* test/ScrollListKeep.svelte generated by Svelte v4.2.19 */

	function get_each_context(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	function get_each_context_1(ctx, list, i) {
		const child_ctx = ctx.slice();
		child_ctx[1] = list[i];
		return child_ctx;
	}

	// (9:4) <Lazy         keep={true}         class="top"         height={300}         placeholder={'Loading...'}         fadeOption={{delay: 100, duration: 4000}}     >
	function create_default_slot_5(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p2.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (20:8) {#each [1, 2, 3] as i}
	function create_each_block_1(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p1.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (25:4) <Lazy keep={true}>
	function create_default_slot_4(ctx) {
		let video;

		return {
			c() {
				video = element("video");
				video.innerHTML = `<track kind="captions"/><source src="auto/flower.mp4"/>`;
				video.controls = true;
				attr(video, "height", 300);
				attr(video, "class", "svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, video, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(video);
				}
			}
		};
	}

	// (32:4) <Lazy height={300} keep={true}>
	function create_default_slot_3(ctx) {
		let video;

		return {
			c() {
				video = element("video");
				video.innerHTML = `<track kind="captions"/><source src="auto/flower.mp4"/>`;
				video.controls = true;
				attr(video, "height", 300);
				attr(video, "class", "svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, video, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(video);
				}
			}
		};
	}

	// (40:4) <Lazy         keep={true}         class="basic"         height={300}         placeholder={'Loading...'}     >
	function create_default_slot_2(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "p3");
				if (!src_url_equal(img.src, img_src_value = "auto/p3.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (50:8) <Lazy             keep={true}             class="extend"             height={300}             onload={onload}             placeholder={Loading}             fadeOption={{delay: 100, duration: 2000}}         >
	function create_default_slot_1(ctx) {
		let img;
		let img_src_value;

		return {
			c() {
				img = element("img");
				attr(img, "alt", "");
				if (!src_url_equal(img.src, img_src_value = "auto/p2.jpg")) attr(img, "src", img_src_value);
				attr(img, "class", "svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, img, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(img);
				}
			}
		};
	}

	// (49:4) {#each [1, 2, 3] as i}
	function create_each_block(ctx) {
		let lazy;
		let current;

		lazy = new Src({
				props: {
					keep: true,
					class: "extend",
					height: 300,
					onload: /*onload*/ ctx[0],
					placeholder: Loading,
					fadeOption: { delay: 100, duration: 2000 },
					$$slots: { default: [create_default_slot_1] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				create_component(lazy.$$.fragment);
			},
			m(target, anchor) {
				mount_component(lazy, target, anchor);
				current = true;
			},
			p(ctx, dirty) {
				const lazy_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy_changes.$$scope = { dirty, ctx };
				}

				lazy.$set(lazy_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				destroy_component(lazy, detaching);
			}
		};
	}

	// (62:4) <Lazy         keep={true}         class="any-content"         height={300}         offset={300}         placeholder={'Loading...'}         fadeOption={{delay: 100, duration: 2000}}     >
	function create_default_slot(ctx) {
		let div;

		return {
			c() {
				div = element("div");
				div.textContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
				attr(div, "class", "text-content svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, div, anchor);
			},
			p: noop,
			d(detaching) {
				if (detaching) {
					detach(div);
				}
			}
		};
	}

	function create_fragment$1(ctx) {
		let div1;
		let lazy0;
		let t0;
		let div0;
		let t1;
		let lazy1;
		let t2;
		let lazy2;
		let t3;
		let lazy3;
		let t4;
		let t5;
		let lazy4;
		let current;

		lazy0 = new Src({
				props: {
					keep: true,
					class: "top",
					height: 300,
					placeholder: 'Loading...',
					fadeOption: { delay: 100, duration: 4000 },
					$$slots: { default: [create_default_slot_5] },
					$$scope: { ctx }
				}
			});

		let each_value_1 = ensure_array_like([1, 2, 3]);
		let each_blocks_1 = [];

		for (let i = 0; i < 3; i += 1) {
			each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
		}

		lazy1 = new Src({
				props: {
					keep: true,
					$$slots: { default: [create_default_slot_4] },
					$$scope: { ctx }
				}
			});

		lazy2 = new Src({
				props: {
					height: 300,
					keep: true,
					$$slots: { default: [create_default_slot_3] },
					$$scope: { ctx }
				}
			});

		lazy3 = new Src({
				props: {
					keep: true,
					class: "basic",
					height: 300,
					placeholder: 'Loading...',
					$$slots: { default: [create_default_slot_2] },
					$$scope: { ctx }
				}
			});

		let each_value = ensure_array_like([1, 2, 3]);
		let each_blocks = [];

		for (let i = 0; i < 3; i += 1) {
			each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
		}

		const out = i => transition_out(each_blocks[i], 1, 1, () => {
			each_blocks[i] = null;
		});

		lazy4 = new Src({
				props: {
					keep: true,
					class: "any-content",
					height: 300,
					offset: 300,
					placeholder: 'Loading...',
					fadeOption: { delay: 100, duration: 2000 },
					$$slots: { default: [create_default_slot] },
					$$scope: { ctx }
				}
			});

		return {
			c() {
				div1 = element("div");
				create_component(lazy0.$$.fragment);
				t0 = space();
				div0 = element("div");

				for (let i = 0; i < 3; i += 1) {
					each_blocks_1[i].c();
				}

				t1 = space();
				create_component(lazy1.$$.fragment);
				t2 = space();
				create_component(lazy2.$$.fragment);
				t3 = space();
				create_component(lazy3.$$.fragment);
				t4 = space();

				for (let i = 0; i < 3; i += 1) {
					each_blocks[i].c();
				}

				t5 = space();
				create_component(lazy4.$$.fragment);
				attr(div0, "class", "preload svelte-cvjytg");
				attr(div1, "class", "container svelte-cvjytg");
			},
			m(target, anchor) {
				insert(target, div1, anchor);
				mount_component(lazy0, div1, null);
				append(div1, t0);
				append(div1, div0);

				for (let i = 0; i < 3; i += 1) {
					if (each_blocks_1[i]) {
						each_blocks_1[i].m(div0, null);
					}
				}

				append(div1, t1);
				mount_component(lazy1, div1, null);
				append(div1, t2);
				mount_component(lazy2, div1, null);
				append(div1, t3);
				mount_component(lazy3, div1, null);
				append(div1, t4);

				for (let i = 0; i < 3; i += 1) {
					if (each_blocks[i]) {
						each_blocks[i].m(div1, null);
					}
				}

				append(div1, t5);
				mount_component(lazy4, div1, null);
				current = true;
			},
			p(ctx, [dirty]) {
				const lazy0_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy0_changes.$$scope = { dirty, ctx };
				}

				lazy0.$set(lazy0_changes);
				const lazy1_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy1_changes.$$scope = { dirty, ctx };
				}

				lazy1.$set(lazy1_changes);
				const lazy2_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy2_changes.$$scope = { dirty, ctx };
				}

				lazy2.$set(lazy2_changes);
				const lazy3_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy3_changes.$$scope = { dirty, ctx };
				}

				lazy3.$set(lazy3_changes);

				if (dirty & /*onload*/ 1) {
					each_value = ensure_array_like([1, 2, 3]);
					let i;

					for (i = 0; i < 3; i += 1) {
						const child_ctx = get_each_context(ctx, each_value, i);

						if (each_blocks[i]) {
							each_blocks[i].p(child_ctx, dirty);
							transition_in(each_blocks[i], 1);
						} else {
							each_blocks[i] = create_each_block(child_ctx);
							each_blocks[i].c();
							transition_in(each_blocks[i], 1);
							each_blocks[i].m(div1, t5);
						}
					}

					group_outros();

					for (i = 3; i < 3; i += 1) {
						out(i);
					}

					check_outros();
				}

				const lazy4_changes = {};

				if (dirty & /*$$scope*/ 64) {
					lazy4_changes.$$scope = { dirty, ctx };
				}

				lazy4.$set(lazy4_changes);
			},
			i(local) {
				if (current) return;
				transition_in(lazy0.$$.fragment, local);
				transition_in(lazy1.$$.fragment, local);
				transition_in(lazy2.$$.fragment, local);
				transition_in(lazy3.$$.fragment, local);

				for (let i = 0; i < 3; i += 1) {
					transition_in(each_blocks[i]);
				}

				transition_in(lazy4.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(lazy0.$$.fragment, local);
				transition_out(lazy1.$$.fragment, local);
				transition_out(lazy2.$$.fragment, local);
				transition_out(lazy3.$$.fragment, local);
				each_blocks = each_blocks.filter(Boolean);

				for (let i = 0; i < 3; i += 1) {
					transition_out(each_blocks[i]);
				}

				transition_out(lazy4.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(div1);
				}

				destroy_component(lazy0);
				destroy_each(each_blocks_1, detaching);
				destroy_component(lazy1);
				destroy_component(lazy2);
				destroy_component(lazy3);
				destroy_each(each_blocks, detaching);
				destroy_component(lazy4);
			}
		};
	}

	function instance$1($$self) {
		window.extend = { onload: false };

		const onload = node => {
			window.extend.onload = true;
			console.log('Trigger onload');
		};

		return [onload];
	}

	class ScrollListKeep extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
		}
	}

	/* test/index.svelte generated by Svelte v4.2.19 */

	function create_fragment(ctx) {
		let h1;
		let t1;
		let tabs;
		let current;
		tabs = new Tabs({ props: { items: /*items*/ ctx[0] } });

		return {
			c() {
				h1 = element("h1");
				h1.textContent = "Hello, Lazy!";
				t1 = space();
				create_component(tabs.$$.fragment);
				attr(h1, "class", "svelte-cty3eu");
			},
			m(target, anchor) {
				insert(target, h1, anchor);
				insert(target, t1, anchor);
				mount_component(tabs, target, anchor);
				current = true;
			},
			p: noop,
			i(local) {
				if (current) return;
				transition_in(tabs.$$.fragment, local);
				current = true;
			},
			o(local) {
				transition_out(tabs.$$.fragment, local);
				current = false;
			},
			d(detaching) {
				if (detaching) {
					detach(h1);
					detach(t1);
				}

				destroy_component(tabs, detaching);
			}
		};
	}

	function instance($$self) {
		const items = [
			{
				label: 'Basic',
				value: 1,
				component: ScrollList
			},
			{
				label: 'Long Scroll',
				value: 2,
				component: LongScrollList
			},
			{
				label: 'Scroll (Keep After Show)',
				value: 3,
				component: ScrollListKeep
			},
			{
				label: 'Filter',
				value: 4,
				component: FilterList
			}
		];

		return [items];
	}

	class Test extends SvelteComponent {
		constructor(options) {
			super();
			init(this, options, instance, create_fragment, safe_not_equal, {});
		}
	}

	const app = new Test({
	  target: document.body,
	});

	return app;

})();
