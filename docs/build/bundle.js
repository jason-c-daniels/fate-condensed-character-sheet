var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
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
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
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
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value') {
                node.value = node[key] = attributes[key];
            }
            else if (descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                const remove = [];
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j++];
                    if (!attributes[attribute.name]) {
                        remove.push(attribute.name);
                    }
                }
                for (let k = 0; k < remove.length; k++) {
                    node.removeAttribute(remove[k]);
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    class HtmlTag {
        constructor(anchor = null) {
            this.a = anchor;
            this.e = this.n = null;
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.h(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
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
        flushing = false;
        seen_callbacks.clear();
    }
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
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

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
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
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
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.25.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
     */

    (function() {

      /**
       * Basic flow of the loader process
       *
       * There are 4 flows the loader can take when booting up
       *
       * - Synchronous script, no polyfills needed
       *   - wait for `DOMContentLoaded`
       *   - fire WCR event, as there could not be any callbacks passed to `waitFor`
       *
       * - Synchronous script, polyfills needed
       *   - document.write the polyfill bundle
       *   - wait on the `load` event of the bundle to batch Custom Element upgrades
       *   - wait for `DOMContentLoaded`
       *   - run callbacks passed to `waitFor`
       *   - fire WCR event
       *
       * - Asynchronous script, no polyfills needed
       *   - wait for `DOMContentLoaded`
       *   - run callbacks passed to `waitFor`
       *   - fire WCR event
       *
       * - Asynchronous script, polyfills needed
       *   - Append the polyfill bundle script
       *   - wait for `load` event of the bundle
       *   - batch Custom Element Upgrades
       *   - run callbacks pass to `waitFor`
       *   - fire WCR event
       */

      var polyfillsLoaded = false;
      var whenLoadedFns = [];
      var allowUpgrades = false;
      var flushFn;

      function fireEvent() {
        window.WebComponents.ready = true;
        document.dispatchEvent(new CustomEvent('WebComponentsReady', { bubbles: true }));
      }

      function batchCustomElements() {
        if (window.customElements && customElements.polyfillWrapFlushCallback) {
          customElements.polyfillWrapFlushCallback(function (flushCallback) {
            flushFn = flushCallback;
            if (allowUpgrades) {
              flushFn();
            }
          });
        }
      }

      function asyncReady() {
        batchCustomElements();
        ready();
      }

      function ready() {
        // bootstrap <template> elements before custom elements
        if (window.HTMLTemplateElement && HTMLTemplateElement.bootstrap) {
          HTMLTemplateElement.bootstrap(window.document);
        }
        polyfillsLoaded = true;
        runWhenLoadedFns().then(fireEvent);
      }

      function runWhenLoadedFns() {
        allowUpgrades = false;
        var fnsMap = whenLoadedFns.map(function(fn) {
          return fn instanceof Function ? fn() : fn;
        });
        whenLoadedFns = [];
        return Promise.all(fnsMap).then(function() {
          allowUpgrades = true;
          flushFn && flushFn();
        }).catch(function(err) {
          console.error(err);
        });
      }

      window.WebComponents = window.WebComponents || {};
      window.WebComponents.ready = window.WebComponents.ready || false;
      window.WebComponents.waitFor = window.WebComponents.waitFor || function(waitFn) {
        if (!waitFn) {
          return;
        }
        whenLoadedFns.push(waitFn);
        if (polyfillsLoaded) {
          runWhenLoadedFns();
        }
      };
      window.WebComponents._batchCustomElements = batchCustomElements;

      var name = 'webcomponents-loader.js';
      // Feature detect which polyfill needs to be imported.
      var polyfills = [];
      if (!('attachShadow' in Element.prototype && 'getRootNode' in Element.prototype) ||
        (window.ShadyDOM && window.ShadyDOM.force)) {
        polyfills.push('sd');
      }
      if (!window.customElements || window.customElements.forcePolyfill) {
        polyfills.push('ce');
      }

      var needsTemplate = (function() {
        // no real <template> because no `content` property (IE and older browsers)
        var t = document.createElement('template');
        if (!('content' in t)) {
          return true;
        }
        // broken doc fragment (older Edge)
        if (!(t.content.cloneNode() instanceof DocumentFragment)) {
          return true;
        }
        // broken <template> cloning (Edge up to at least version 17)
        var t2 = document.createElement('template');
        t2.content.appendChild(document.createElement('div'));
        t.content.appendChild(t2);
        var clone = t.cloneNode(true);
        return (clone.content.childNodes.length === 0 ||
            clone.content.firstChild.content.childNodes.length === 0);
      })();

      // NOTE: any browser that does not have template or ES6 features
      // must load the full suite of polyfills.
      if (!window.Promise || !Array.from || !window.URL || !window.Symbol || needsTemplate) {
        polyfills = ['sd-ce-pf'];
      }

      if (polyfills.length) {
        var url;
        var polyfillFile = 'bundles/webcomponents-' + polyfills.join('-') + '.js';

        // Load it from the right place.
        if (window.WebComponents.root) {
          url = window.WebComponents.root + polyfillFile;
        } else {
          var script = document.querySelector('script[src*="' + name +'"]');
          // Load it from the right place.
          url = script.src.replace(name, polyfillFile);
        }

        var newScript = document.createElement('script');
        newScript.src = url;
        // if readyState is 'loading', this script is synchronous
        if (document.readyState === 'loading') {
          // make sure custom elements are batched whenever parser gets to the injected script
          newScript.setAttribute('onload', 'window.WebComponents._batchCustomElements()');
          document.write(newScript.outerHTML);
          document.addEventListener('DOMContentLoaded', ready);
        } else {
          newScript.addEventListener('load', function () {
            asyncReady();
          });
          newScript.addEventListener('error', function () {
            throw new Error('Could not load polyfill bundle' + url);
          });
          document.head.appendChild(newScript);
        }
      } else {
        // if readyState is 'complete', script is loaded imperatively on a spec-compliant browser, so just fire WCR
        if (document.readyState === 'complete') {
          polyfillsLoaded = true;
          fireEvent();
        } else {
          // this script may come between DCL and load, so listen for both, and cancel load listener if DCL fires
          window.addEventListener('load', ready);
          window.addEventListener('DOMContentLoaded', function() {
            window.removeEventListener('load', ready);
            ready();
          });
        }
      }
    })();

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __decorate(decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * True if the custom elements polyfill is in use.
     */
    const isCEPolyfill = typeof window !== 'undefined' &&
        window.customElements != null &&
        window.customElements.polyfillWrapFlushCallback !==
            undefined;
    /**
     * Removes nodes, starting from `start` (inclusive) to `end` (exclusive), from
     * `container`.
     */
    const removeNodes = (container, start, end = null) => {
        while (start !== end) {
            const n = start.nextSibling;
            container.removeChild(start);
            start = n;
        }
    };

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * An expression marker with embedded unique key to avoid collision with
     * possible text in templates.
     */
    const marker = `{{lit-${String(Math.random()).slice(2)}}}`;
    /**
     * An expression marker used text-positions, multi-binding attributes, and
     * attributes with markup-like text values.
     */
    const nodeMarker = `<!--${marker}-->`;
    const markerRegex = new RegExp(`${marker}|${nodeMarker}`);
    /**
     * Suffix appended to all bound attribute names.
     */
    const boundAttributeSuffix = '$lit$';
    /**
     * An updatable Template that tracks the location of dynamic parts.
     */
    class Template {
        constructor(result, element) {
            this.parts = [];
            this.element = element;
            const nodesToRemove = [];
            const stack = [];
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
            const walker = document.createTreeWalker(element.content, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
            // Keeps track of the last index associated with a part. We try to delete
            // unnecessary nodes, but we never want to associate two different parts
            // to the same index. They must have a constant node between.
            let lastPartIndex = 0;
            let index = -1;
            let partIndex = 0;
            const { strings, values: { length } } = result;
            while (partIndex < length) {
                const node = walker.nextNode();
                if (node === null) {
                    // We've exhausted the content inside a nested template element.
                    // Because we still have parts (the outer for-loop), we know:
                    // - There is a template in the stack
                    // - The walker will find a nextNode outside the template
                    walker.currentNode = stack.pop();
                    continue;
                }
                index++;
                if (node.nodeType === 1 /* Node.ELEMENT_NODE */) {
                    if (node.hasAttributes()) {
                        const attributes = node.attributes;
                        const { length } = attributes;
                        // Per
                        // https://developer.mozilla.org/en-US/docs/Web/API/NamedNodeMap,
                        // attributes are not guaranteed to be returned in document order.
                        // In particular, Edge/IE can return them out of order, so we cannot
                        // assume a correspondence between part index and attribute index.
                        let count = 0;
                        for (let i = 0; i < length; i++) {
                            if (endsWith(attributes[i].name, boundAttributeSuffix)) {
                                count++;
                            }
                        }
                        while (count-- > 0) {
                            // Get the template literal section leading up to the first
                            // expression in this attribute
                            const stringForPart = strings[partIndex];
                            // Find the attribute name
                            const name = lastAttributeNameRegex.exec(stringForPart)[2];
                            // Find the corresponding attribute
                            // All bound attributes have had a suffix added in
                            // TemplateResult#getHTML to opt out of special attribute
                            // handling. To look up the attribute value we also need to add
                            // the suffix.
                            const attributeLookupName = name.toLowerCase() + boundAttributeSuffix;
                            const attributeValue = node.getAttribute(attributeLookupName);
                            node.removeAttribute(attributeLookupName);
                            const statics = attributeValue.split(markerRegex);
                            this.parts.push({ type: 'attribute', index, name, strings: statics });
                            partIndex += statics.length - 1;
                        }
                    }
                    if (node.tagName === 'TEMPLATE') {
                        stack.push(node);
                        walker.currentNode = node.content;
                    }
                }
                else if (node.nodeType === 3 /* Node.TEXT_NODE */) {
                    const data = node.data;
                    if (data.indexOf(marker) >= 0) {
                        const parent = node.parentNode;
                        const strings = data.split(markerRegex);
                        const lastIndex = strings.length - 1;
                        // Generate a new text node for each literal section
                        // These nodes are also used as the markers for node parts
                        for (let i = 0; i < lastIndex; i++) {
                            let insert;
                            let s = strings[i];
                            if (s === '') {
                                insert = createMarker();
                            }
                            else {
                                const match = lastAttributeNameRegex.exec(s);
                                if (match !== null && endsWith(match[2], boundAttributeSuffix)) {
                                    s = s.slice(0, match.index) + match[1] +
                                        match[2].slice(0, -boundAttributeSuffix.length) + match[3];
                                }
                                insert = document.createTextNode(s);
                            }
                            parent.insertBefore(insert, node);
                            this.parts.push({ type: 'node', index: ++index });
                        }
                        // If there's no text, we must insert a comment to mark our place.
                        // Else, we can trust it will stick around after cloning.
                        if (strings[lastIndex] === '') {
                            parent.insertBefore(createMarker(), node);
                            nodesToRemove.push(node);
                        }
                        else {
                            node.data = strings[lastIndex];
                        }
                        // We have a part for each match found
                        partIndex += lastIndex;
                    }
                }
                else if (node.nodeType === 8 /* Node.COMMENT_NODE */) {
                    if (node.data === marker) {
                        const parent = node.parentNode;
                        // Add a new marker node to be the startNode of the Part if any of
                        // the following are true:
                        //  * We don't have a previousSibling
                        //  * The previousSibling is already the start of a previous part
                        if (node.previousSibling === null || index === lastPartIndex) {
                            index++;
                            parent.insertBefore(createMarker(), node);
                        }
                        lastPartIndex = index;
                        this.parts.push({ type: 'node', index });
                        // If we don't have a nextSibling, keep this node so we have an end.
                        // Else, we can remove it to save future costs.
                        if (node.nextSibling === null) {
                            node.data = '';
                        }
                        else {
                            nodesToRemove.push(node);
                            index--;
                        }
                        partIndex++;
                    }
                    else {
                        let i = -1;
                        while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                            // Comment node has a binding marker inside, make an inactive part
                            // The binding won't work, but subsequent bindings will
                            // TODO (justinfagnani): consider whether it's even worth it to
                            // make bindings in comments work
                            this.parts.push({ type: 'node', index: -1 });
                            partIndex++;
                        }
                    }
                }
            }
            // Remove text binding nodes after the walk to not disturb the TreeWalker
            for (const n of nodesToRemove) {
                n.parentNode.removeChild(n);
            }
        }
    }
    const endsWith = (str, suffix) => {
        const index = str.length - suffix.length;
        return index >= 0 && str.slice(index) === suffix;
    };
    const isTemplatePartActive = (part) => part.index !== -1;
    // Allows `document.createComment('')` to be renamed for a
    // small manual size-savings.
    const createMarker = () => document.createComment('');
    /**
     * This regex extracts the attribute name preceding an attribute-position
     * expression. It does this by matching the syntax allowed for attributes
     * against the string literal directly preceding the expression, assuming that
     * the expression is in an attribute-value position.
     *
     * See attributes in the HTML spec:
     * https://www.w3.org/TR/html5/syntax.html#elements-attributes
     *
     * " \x09\x0a\x0c\x0d" are HTML space characters:
     * https://www.w3.org/TR/html5/infrastructure.html#space-characters
     *
     * "\0-\x1F\x7F-\x9F" are Unicode control characters, which includes every
     * space character except " ".
     *
     * So an attribute is:
     *  * The name: any character except a control character, space character, ('),
     *    ("), ">", "=", or "/"
     *  * Followed by zero or more space characters
     *  * Followed by "="
     *  * Followed by zero or more space characters
     *  * Followed by:
     *    * Any character except space, ('), ("), "<", ">", "=", (`), or
     *    * (") then any non-("), or
     *    * (') then any non-(')
     */
    const lastAttributeNameRegex = 
    // eslint-disable-next-line no-control-regex
    /([ \x09\x0a\x0c\x0d])([^\0-\x1F\x7F-\x9F "'>=/]+)([ \x09\x0a\x0c\x0d]*=[ \x09\x0a\x0c\x0d]*(?:[^ \x09\x0a\x0c\x0d"'`<>=]*|"[^"]*|'[^']*))$/;

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const walkerNodeFilter = 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */;
    /**
     * Removes the list of nodes from a Template safely. In addition to removing
     * nodes from the Template, the Template part indices are updated to match
     * the mutated Template DOM.
     *
     * As the template is walked the removal state is tracked and
     * part indices are adjusted as needed.
     *
     * div
     *   div#1 (remove) <-- start removing (removing node is div#1)
     *     div
     *       div#2 (remove)  <-- continue removing (removing node is still div#1)
     *         div
     * div <-- stop removing since previous sibling is the removing node (div#1,
     * removed 4 nodes)
     */
    function removeNodesFromTemplate(template, nodesToRemove) {
        const { element: { content }, parts } = template;
        const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
        let partIndex = nextActiveIndexInTemplateParts(parts);
        let part = parts[partIndex];
        let nodeIndex = -1;
        let removeCount = 0;
        const nodesToRemoveInTemplate = [];
        let currentRemovingNode = null;
        while (walker.nextNode()) {
            nodeIndex++;
            const node = walker.currentNode;
            // End removal if stepped past the removing node
            if (node.previousSibling === currentRemovingNode) {
                currentRemovingNode = null;
            }
            // A node to remove was found in the template
            if (nodesToRemove.has(node)) {
                nodesToRemoveInTemplate.push(node);
                // Track node we're removing
                if (currentRemovingNode === null) {
                    currentRemovingNode = node;
                }
            }
            // When removing, increment count by which to adjust subsequent part indices
            if (currentRemovingNode !== null) {
                removeCount++;
            }
            while (part !== undefined && part.index === nodeIndex) {
                // If part is in a removed node deactivate it by setting index to -1 or
                // adjust the index as needed.
                part.index = currentRemovingNode !== null ? -1 : part.index - removeCount;
                // go to the next active part.
                partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                part = parts[partIndex];
            }
        }
        nodesToRemoveInTemplate.forEach((n) => n.parentNode.removeChild(n));
    }
    const countNodes = (node) => {
        let count = (node.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */) ? 0 : 1;
        const walker = document.createTreeWalker(node, walkerNodeFilter, null, false);
        while (walker.nextNode()) {
            count++;
        }
        return count;
    };
    const nextActiveIndexInTemplateParts = (parts, startIndex = -1) => {
        for (let i = startIndex + 1; i < parts.length; i++) {
            const part = parts[i];
            if (isTemplatePartActive(part)) {
                return i;
            }
        }
        return -1;
    };
    /**
     * Inserts the given node into the Template, optionally before the given
     * refNode. In addition to inserting the node into the Template, the Template
     * part indices are updated to match the mutated Template DOM.
     */
    function insertNodeIntoTemplate(template, node, refNode = null) {
        const { element: { content }, parts } = template;
        // If there's no refNode, then put node at end of template.
        // No part indices need to be shifted in this case.
        if (refNode === null || refNode === undefined) {
            content.appendChild(node);
            return;
        }
        const walker = document.createTreeWalker(content, walkerNodeFilter, null, false);
        let partIndex = nextActiveIndexInTemplateParts(parts);
        let insertCount = 0;
        let walkerIndex = -1;
        while (walker.nextNode()) {
            walkerIndex++;
            const walkerNode = walker.currentNode;
            if (walkerNode === refNode) {
                insertCount = countNodes(node);
                refNode.parentNode.insertBefore(node, refNode);
            }
            while (partIndex !== -1 && parts[partIndex].index === walkerIndex) {
                // If we've inserted the node, simply adjust all subsequent parts
                if (insertCount > 0) {
                    while (partIndex !== -1) {
                        parts[partIndex].index += insertCount;
                        partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
                    }
                    return;
                }
                partIndex = nextActiveIndexInTemplateParts(parts, partIndex);
            }
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const directives = new WeakMap();
    /**
     * Brands a function as a directive factory function so that lit-html will call
     * the function during template rendering, rather than passing as a value.
     *
     * A _directive_ is a function that takes a Part as an argument. It has the
     * signature: `(part: Part) => void`.
     *
     * A directive _factory_ is a function that takes arguments for data and
     * configuration and returns a directive. Users of directive usually refer to
     * the directive factory as the directive. For example, "The repeat directive".
     *
     * Usually a template author will invoke a directive factory in their template
     * with relevant arguments, which will then return a directive function.
     *
     * Here's an example of using the `repeat()` directive factory that takes an
     * array and a function to render an item:
     *
     * ```js
     * html`<ul><${repeat(items, (item) => html`<li>${item}</li>`)}</ul>`
     * ```
     *
     * When `repeat` is invoked, it returns a directive function that closes over
     * `items` and the template function. When the outer template is rendered, the
     * return directive function is called with the Part for the expression.
     * `repeat` then performs it's custom logic to render multiple items.
     *
     * @param f The directive factory function. Must be a function that returns a
     * function of the signature `(part: Part) => void`. The returned function will
     * be called with the part object.
     *
     * @example
     *
     * import {directive, html} from 'lit-html';
     *
     * const immutable = directive((v) => (part) => {
     *   if (part.value !== v) {
     *     part.setValue(v)
     *   }
     * });
     */
    const directive = (f) => ((...args) => {
        const d = f(...args);
        directives.set(d, true);
        return d;
    });
    const isDirective = (o) => {
        return typeof o === 'function' && directives.has(o);
    };

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * A sentinel value that signals that a value was handled by a directive and
     * should not be written to the DOM.
     */
    const noChange = {};
    /**
     * A sentinel value that signals a NodePart to fully clear its content.
     */
    const nothing = {};

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * An instance of a `Template` that can be attached to the DOM and updated
     * with new values.
     */
    class TemplateInstance {
        constructor(template, processor, options) {
            this.__parts = [];
            this.template = template;
            this.processor = processor;
            this.options = options;
        }
        update(values) {
            let i = 0;
            for (const part of this.__parts) {
                if (part !== undefined) {
                    part.setValue(values[i]);
                }
                i++;
            }
            for (const part of this.__parts) {
                if (part !== undefined) {
                    part.commit();
                }
            }
        }
        _clone() {
            // There are a number of steps in the lifecycle of a template instance's
            // DOM fragment:
            //  1. Clone - create the instance fragment
            //  2. Adopt - adopt into the main document
            //  3. Process - find part markers and create parts
            //  4. Upgrade - upgrade custom elements
            //  5. Update - set node, attribute, property, etc., values
            //  6. Connect - connect to the document. Optional and outside of this
            //     method.
            //
            // We have a few constraints on the ordering of these steps:
            //  * We need to upgrade before updating, so that property values will pass
            //    through any property setters.
            //  * We would like to process before upgrading so that we're sure that the
            //    cloned fragment is inert and not disturbed by self-modifying DOM.
            //  * We want custom elements to upgrade even in disconnected fragments.
            //
            // Given these constraints, with full custom elements support we would
            // prefer the order: Clone, Process, Adopt, Upgrade, Update, Connect
            //
            // But Safari does not implement CustomElementRegistry#upgrade, so we
            // can not implement that order and still have upgrade-before-update and
            // upgrade disconnected fragments. So we instead sacrifice the
            // process-before-upgrade constraint, since in Custom Elements v1 elements
            // must not modify their light DOM in the constructor. We still have issues
            // when co-existing with CEv0 elements like Polymer 1, and with polyfills
            // that don't strictly adhere to the no-modification rule because shadow
            // DOM, which may be created in the constructor, is emulated by being placed
            // in the light DOM.
            //
            // The resulting order is on native is: Clone, Adopt, Upgrade, Process,
            // Update, Connect. document.importNode() performs Clone, Adopt, and Upgrade
            // in one step.
            //
            // The Custom Elements v1 polyfill supports upgrade(), so the order when
            // polyfilled is the more ideal: Clone, Process, Adopt, Upgrade, Update,
            // Connect.
            const fragment = isCEPolyfill ?
                this.template.element.content.cloneNode(true) :
                document.importNode(this.template.element.content, true);
            const stack = [];
            const parts = this.template.parts;
            // Edge needs all 4 parameters present; IE11 needs 3rd parameter to be null
            const walker = document.createTreeWalker(fragment, 133 /* NodeFilter.SHOW_{ELEMENT|COMMENT|TEXT} */, null, false);
            let partIndex = 0;
            let nodeIndex = 0;
            let part;
            let node = walker.nextNode();
            // Loop through all the nodes and parts of a template
            while (partIndex < parts.length) {
                part = parts[partIndex];
                if (!isTemplatePartActive(part)) {
                    this.__parts.push(undefined);
                    partIndex++;
                    continue;
                }
                // Progress the tree walker until we find our next part's node.
                // Note that multiple parts may share the same node (attribute parts
                // on a single element), so this loop may not run at all.
                while (nodeIndex < part.index) {
                    nodeIndex++;
                    if (node.nodeName === 'TEMPLATE') {
                        stack.push(node);
                        walker.currentNode = node.content;
                    }
                    if ((node = walker.nextNode()) === null) {
                        // We've exhausted the content inside a nested template element.
                        // Because we still have parts (the outer for-loop), we know:
                        // - There is a template in the stack
                        // - The walker will find a nextNode outside the template
                        walker.currentNode = stack.pop();
                        node = walker.nextNode();
                    }
                }
                // We've arrived at our part's node.
                if (part.type === 'node') {
                    const part = this.processor.handleTextExpression(this.options);
                    part.insertAfterNode(node.previousSibling);
                    this.__parts.push(part);
                }
                else {
                    this.__parts.push(...this.processor.handleAttributeExpressions(node, part.name, part.strings, this.options));
                }
                partIndex++;
            }
            if (isCEPolyfill) {
                document.adoptNode(fragment);
                customElements.upgrade(fragment);
            }
            return fragment;
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * Our TrustedTypePolicy for HTML which is declared using the html template
     * tag function.
     *
     * That HTML is a developer-authored constant, and is parsed with innerHTML
     * before any untrusted expressions have been mixed in. Therefor it is
     * considered safe by construction.
     */
    const policy = window.trustedTypes &&
        trustedTypes.createPolicy('lit-html', { createHTML: (s) => s });
    const commentMarker = ` ${marker} `;
    /**
     * The return type of `html`, which holds a Template and the values from
     * interpolated expressions.
     */
    class TemplateResult {
        constructor(strings, values, type, processor) {
            this.strings = strings;
            this.values = values;
            this.type = type;
            this.processor = processor;
        }
        /**
         * Returns a string of HTML used to create a `<template>` element.
         */
        getHTML() {
            const l = this.strings.length - 1;
            let html = '';
            let isCommentBinding = false;
            for (let i = 0; i < l; i++) {
                const s = this.strings[i];
                // For each binding we want to determine the kind of marker to insert
                // into the template source before it's parsed by the browser's HTML
                // parser. The marker type is based on whether the expression is in an
                // attribute, text, or comment position.
                //   * For node-position bindings we insert a comment with the marker
                //     sentinel as its text content, like <!--{{lit-guid}}-->.
                //   * For attribute bindings we insert just the marker sentinel for the
                //     first binding, so that we support unquoted attribute bindings.
                //     Subsequent bindings can use a comment marker because multi-binding
                //     attributes must be quoted.
                //   * For comment bindings we insert just the marker sentinel so we don't
                //     close the comment.
                //
                // The following code scans the template source, but is *not* an HTML
                // parser. We don't need to track the tree structure of the HTML, only
                // whether a binding is inside a comment, and if not, if it appears to be
                // the first binding in an attribute.
                const commentOpen = s.lastIndexOf('<!--');
                // We're in comment position if we have a comment open with no following
                // comment close. Because <-- can appear in an attribute value there can
                // be false positives.
                isCommentBinding = (commentOpen > -1 || isCommentBinding) &&
                    s.indexOf('-->', commentOpen + 1) === -1;
                // Check to see if we have an attribute-like sequence preceding the
                // expression. This can match "name=value" like structures in text,
                // comments, and attribute values, so there can be false-positives.
                const attributeMatch = lastAttributeNameRegex.exec(s);
                if (attributeMatch === null) {
                    // We're only in this branch if we don't have a attribute-like
                    // preceding sequence. For comments, this guards against unusual
                    // attribute values like <div foo="<!--${'bar'}">. Cases like
                    // <!-- foo=${'bar'}--> are handled correctly in the attribute branch
                    // below.
                    html += s + (isCommentBinding ? commentMarker : nodeMarker);
                }
                else {
                    // For attributes we use just a marker sentinel, and also append a
                    // $lit$ suffix to the name to opt-out of attribute-specific parsing
                    // that IE and Edge do for style and certain SVG attributes.
                    html += s.substr(0, attributeMatch.index) + attributeMatch[1] +
                        attributeMatch[2] + boundAttributeSuffix + attributeMatch[3] +
                        marker;
                }
            }
            html += this.strings[l];
            return html;
        }
        getTemplateElement() {
            const template = document.createElement('template');
            let value = this.getHTML();
            if (policy !== undefined) {
                // this is secure because `this.strings` is a TemplateStringsArray.
                // TODO: validate this when
                // https://github.com/tc39/proposal-array-is-template-object is
                // implemented.
                value = policy.createHTML(value);
            }
            template.innerHTML = value;
            return template;
        }
    }

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const isPrimitive = (value) => {
        return (value === null ||
            !(typeof value === 'object' || typeof value === 'function'));
    };
    const isIterable = (value) => {
        return Array.isArray(value) ||
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !!(value && value[Symbol.iterator]);
    };
    /**
     * Writes attribute values to the DOM for a group of AttributeParts bound to a
     * single attribute. The value is only set once even if there are multiple parts
     * for an attribute.
     */
    class AttributeCommitter {
        constructor(element, name, strings) {
            this.dirty = true;
            this.element = element;
            this.name = name;
            this.strings = strings;
            this.parts = [];
            for (let i = 0; i < strings.length - 1; i++) {
                this.parts[i] = this._createPart();
            }
        }
        /**
         * Creates a single part. Override this to create a differnt type of part.
         */
        _createPart() {
            return new AttributePart(this);
        }
        _getValue() {
            const strings = this.strings;
            const l = strings.length - 1;
            const parts = this.parts;
            // If we're assigning an attribute via syntax like:
            //    attr="${foo}"  or  attr=${foo}
            // but not
            //    attr="${foo} ${bar}" or attr="${foo} baz"
            // then we don't want to coerce the attribute value into one long
            // string. Instead we want to just return the value itself directly,
            // so that sanitizeDOMValue can get the actual value rather than
            // String(value)
            // The exception is if v is an array, in which case we do want to smash
            // it together into a string without calling String() on the array.
            //
            // This also allows trusted values (when using TrustedTypes) being
            // assigned to DOM sinks without being stringified in the process.
            if (l === 1 && strings[0] === '' && strings[1] === '') {
                const v = parts[0].value;
                if (typeof v === 'symbol') {
                    return String(v);
                }
                if (typeof v === 'string' || !isIterable(v)) {
                    return v;
                }
            }
            let text = '';
            for (let i = 0; i < l; i++) {
                text += strings[i];
                const part = parts[i];
                if (part !== undefined) {
                    const v = part.value;
                    if (isPrimitive(v) || !isIterable(v)) {
                        text += typeof v === 'string' ? v : String(v);
                    }
                    else {
                        for (const t of v) {
                            text += typeof t === 'string' ? t : String(t);
                        }
                    }
                }
            }
            text += strings[l];
            return text;
        }
        commit() {
            if (this.dirty) {
                this.dirty = false;
                this.element.setAttribute(this.name, this._getValue());
            }
        }
    }
    /**
     * A Part that controls all or part of an attribute value.
     */
    class AttributePart {
        constructor(committer) {
            this.value = undefined;
            this.committer = committer;
        }
        setValue(value) {
            if (value !== noChange && (!isPrimitive(value) || value !== this.value)) {
                this.value = value;
                // If the value is a not a directive, dirty the committer so that it'll
                // call setAttribute. If the value is a directive, it'll dirty the
                // committer if it calls setValue().
                if (!isDirective(value)) {
                    this.committer.dirty = true;
                }
            }
        }
        commit() {
            while (isDirective(this.value)) {
                const directive = this.value;
                this.value = noChange;
                directive(this);
            }
            if (this.value === noChange) {
                return;
            }
            this.committer.commit();
        }
    }
    /**
     * A Part that controls a location within a Node tree. Like a Range, NodePart
     * has start and end locations and can set and update the Nodes between those
     * locations.
     *
     * NodeParts support several value types: primitives, Nodes, TemplateResults,
     * as well as arrays and iterables of those types.
     */
    class NodePart {
        constructor(options) {
            this.value = undefined;
            this.__pendingValue = undefined;
            this.options = options;
        }
        /**
         * Appends this part into a container.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendInto(container) {
            this.startNode = container.appendChild(createMarker());
            this.endNode = container.appendChild(createMarker());
        }
        /**
         * Inserts this part after the `ref` node (between `ref` and `ref`'s next
         * sibling). Both `ref` and its next sibling must be static, unchanging nodes
         * such as those that appear in a literal section of a template.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterNode(ref) {
            this.startNode = ref;
            this.endNode = ref.nextSibling;
        }
        /**
         * Appends this part into a parent part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        appendIntoPart(part) {
            part.__insert(this.startNode = createMarker());
            part.__insert(this.endNode = createMarker());
        }
        /**
         * Inserts this part after the `ref` part.
         *
         * This part must be empty, as its contents are not automatically moved.
         */
        insertAfterPart(ref) {
            ref.__insert(this.startNode = createMarker());
            this.endNode = ref.endNode;
            ref.endNode = this.startNode;
        }
        setValue(value) {
            this.__pendingValue = value;
        }
        commit() {
            if (this.startNode.parentNode === null) {
                return;
            }
            while (isDirective(this.__pendingValue)) {
                const directive = this.__pendingValue;
                this.__pendingValue = noChange;
                directive(this);
            }
            const value = this.__pendingValue;
            if (value === noChange) {
                return;
            }
            if (isPrimitive(value)) {
                if (value !== this.value) {
                    this.__commitText(value);
                }
            }
            else if (value instanceof TemplateResult) {
                this.__commitTemplateResult(value);
            }
            else if (value instanceof Node) {
                this.__commitNode(value);
            }
            else if (isIterable(value)) {
                this.__commitIterable(value);
            }
            else if (value === nothing) {
                this.value = nothing;
                this.clear();
            }
            else {
                // Fallback, will render the string representation
                this.__commitText(value);
            }
        }
        __insert(node) {
            this.endNode.parentNode.insertBefore(node, this.endNode);
        }
        __commitNode(value) {
            if (this.value === value) {
                return;
            }
            this.clear();
            this.__insert(value);
            this.value = value;
        }
        __commitText(value) {
            const node = this.startNode.nextSibling;
            value = value == null ? '' : value;
            // If `value` isn't already a string, we explicitly convert it here in case
            // it can't be implicitly converted - i.e. it's a symbol.
            const valueAsString = typeof value === 'string' ? value : String(value);
            if (node === this.endNode.previousSibling &&
                node.nodeType === 3 /* Node.TEXT_NODE */) {
                // If we only have a single text node between the markers, we can just
                // set its value, rather than replacing it.
                // TODO(justinfagnani): Can we just check if this.value is primitive?
                node.data = valueAsString;
            }
            else {
                this.__commitNode(document.createTextNode(valueAsString));
            }
            this.value = value;
        }
        __commitTemplateResult(value) {
            const template = this.options.templateFactory(value);
            if (this.value instanceof TemplateInstance &&
                this.value.template === template) {
                this.value.update(value.values);
            }
            else {
                // Make sure we propagate the template processor from the TemplateResult
                // so that we use its syntax extension, etc. The template factory comes
                // from the render function options so that it can control template
                // caching and preprocessing.
                const instance = new TemplateInstance(template, value.processor, this.options);
                const fragment = instance._clone();
                instance.update(value.values);
                this.__commitNode(fragment);
                this.value = instance;
            }
        }
        __commitIterable(value) {
            // For an Iterable, we create a new InstancePart per item, then set its
            // value to the item. This is a little bit of overhead for every item in
            // an Iterable, but it lets us recurse easily and efficiently update Arrays
            // of TemplateResults that will be commonly returned from expressions like:
            // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
            // If _value is an array, then the previous render was of an
            // iterable and _value will contain the NodeParts from the previous
            // render. If _value is not an array, clear this part and make a new
            // array for NodeParts.
            if (!Array.isArray(this.value)) {
                this.value = [];
                this.clear();
            }
            // Lets us keep track of how many items we stamped so we can clear leftover
            // items from a previous render
            const itemParts = this.value;
            let partIndex = 0;
            let itemPart;
            for (const item of value) {
                // Try to reuse an existing part
                itemPart = itemParts[partIndex];
                // If no existing part, create a new one
                if (itemPart === undefined) {
                    itemPart = new NodePart(this.options);
                    itemParts.push(itemPart);
                    if (partIndex === 0) {
                        itemPart.appendIntoPart(this);
                    }
                    else {
                        itemPart.insertAfterPart(itemParts[partIndex - 1]);
                    }
                }
                itemPart.setValue(item);
                itemPart.commit();
                partIndex++;
            }
            if (partIndex < itemParts.length) {
                // Truncate the parts array so _value reflects the current state
                itemParts.length = partIndex;
                this.clear(itemPart && itemPart.endNode);
            }
        }
        clear(startNode = this.startNode) {
            removeNodes(this.startNode.parentNode, startNode.nextSibling, this.endNode);
        }
    }
    /**
     * Implements a boolean attribute, roughly as defined in the HTML
     * specification.
     *
     * If the value is truthy, then the attribute is present with a value of
     * ''. If the value is falsey, the attribute is removed.
     */
    class BooleanAttributePart {
        constructor(element, name, strings) {
            this.value = undefined;
            this.__pendingValue = undefined;
            if (strings.length !== 2 || strings[0] !== '' || strings[1] !== '') {
                throw new Error('Boolean attributes can only contain a single expression');
            }
            this.element = element;
            this.name = name;
            this.strings = strings;
        }
        setValue(value) {
            this.__pendingValue = value;
        }
        commit() {
            while (isDirective(this.__pendingValue)) {
                const directive = this.__pendingValue;
                this.__pendingValue = noChange;
                directive(this);
            }
            if (this.__pendingValue === noChange) {
                return;
            }
            const value = !!this.__pendingValue;
            if (this.value !== value) {
                if (value) {
                    this.element.setAttribute(this.name, '');
                }
                else {
                    this.element.removeAttribute(this.name);
                }
                this.value = value;
            }
            this.__pendingValue = noChange;
        }
    }
    /**
     * Sets attribute values for PropertyParts, so that the value is only set once
     * even if there are multiple parts for a property.
     *
     * If an expression controls the whole property value, then the value is simply
     * assigned to the property under control. If there are string literals or
     * multiple expressions, then the strings are expressions are interpolated into
     * a string first.
     */
    class PropertyCommitter extends AttributeCommitter {
        constructor(element, name, strings) {
            super(element, name, strings);
            this.single =
                (strings.length === 2 && strings[0] === '' && strings[1] === '');
        }
        _createPart() {
            return new PropertyPart(this);
        }
        _getValue() {
            if (this.single) {
                return this.parts[0].value;
            }
            return super._getValue();
        }
        commit() {
            if (this.dirty) {
                this.dirty = false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                this.element[this.name] = this._getValue();
            }
        }
    }
    class PropertyPart extends AttributePart {
    }
    // Detect event listener options support. If the `capture` property is read
    // from the options object, then options are supported. If not, then the third
    // argument to add/removeEventListener is interpreted as the boolean capture
    // value so we should only pass the `capture` property.
    let eventOptionsSupported = false;
    // Wrap into an IIFE because MS Edge <= v41 does not support having try/catch
    // blocks right into the body of a module
    (() => {
        try {
            const options = {
                get capture() {
                    eventOptionsSupported = true;
                    return false;
                }
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.addEventListener('test', options, options);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            window.removeEventListener('test', options, options);
        }
        catch (_e) {
            // event options not supported
        }
    })();
    class EventPart {
        constructor(element, eventName, eventContext) {
            this.value = undefined;
            this.__pendingValue = undefined;
            this.element = element;
            this.eventName = eventName;
            this.eventContext = eventContext;
            this.__boundHandleEvent = (e) => this.handleEvent(e);
        }
        setValue(value) {
            this.__pendingValue = value;
        }
        commit() {
            while (isDirective(this.__pendingValue)) {
                const directive = this.__pendingValue;
                this.__pendingValue = noChange;
                directive(this);
            }
            if (this.__pendingValue === noChange) {
                return;
            }
            const newListener = this.__pendingValue;
            const oldListener = this.value;
            const shouldRemoveListener = newListener == null ||
                oldListener != null &&
                    (newListener.capture !== oldListener.capture ||
                        newListener.once !== oldListener.once ||
                        newListener.passive !== oldListener.passive);
            const shouldAddListener = newListener != null && (oldListener == null || shouldRemoveListener);
            if (shouldRemoveListener) {
                this.element.removeEventListener(this.eventName, this.__boundHandleEvent, this.__options);
            }
            if (shouldAddListener) {
                this.__options = getOptions(newListener);
                this.element.addEventListener(this.eventName, this.__boundHandleEvent, this.__options);
            }
            this.value = newListener;
            this.__pendingValue = noChange;
        }
        handleEvent(event) {
            if (typeof this.value === 'function') {
                this.value.call(this.eventContext || this.element, event);
            }
            else {
                this.value.handleEvent(event);
            }
        }
    }
    // We copy options because of the inconsistent behavior of browsers when reading
    // the third argument of add/removeEventListener. IE11 doesn't support options
    // at all. Chrome 41 only reads `capture` if the argument is an object.
    const getOptions = (o) => o &&
        (eventOptionsSupported ?
            { capture: o.capture, passive: o.passive, once: o.once } :
            o.capture);

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * The default TemplateFactory which caches Templates keyed on
     * result.type and result.strings.
     */
    function templateFactory(result) {
        let templateCache = templateCaches.get(result.type);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(result.type, templateCache);
        }
        let template = templateCache.stringsArray.get(result.strings);
        if (template !== undefined) {
            return template;
        }
        // If the TemplateStringsArray is new, generate a key from the strings
        // This key is shared between all templates with identical content
        const key = result.strings.join(marker);
        // Check if we already have a Template for this key
        template = templateCache.keyString.get(key);
        if (template === undefined) {
            // If we have not seen this key before, create a new Template
            template = new Template(result, result.getTemplateElement());
            // Cache the Template for this key
            templateCache.keyString.set(key, template);
        }
        // Cache all future queries for this TemplateStringsArray
        templateCache.stringsArray.set(result.strings, template);
        return template;
    }
    const templateCaches = new Map();

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const parts = new WeakMap();
    /**
     * Renders a template result or other value to a container.
     *
     * To update a container with new values, reevaluate the template literal and
     * call `render` with the new result.
     *
     * @param result Any value renderable by NodePart - typically a TemplateResult
     *     created by evaluating a template tag like `html` or `svg`.
     * @param container A DOM parent to render to. The entire contents are either
     *     replaced, or efficiently updated if the same result type was previous
     *     rendered there.
     * @param options RenderOptions for the entire render tree rendered to this
     *     container. Render options must *not* change between renders to the same
     *     container, as those changes will not effect previously rendered DOM.
     */
    const render = (result, container, options) => {
        let part = parts.get(container);
        if (part === undefined) {
            removeNodes(container, container.firstChild);
            parts.set(container, part = new NodePart(Object.assign({ templateFactory }, options)));
            part.appendInto(container);
        }
        part.setValue(result);
        part.commit();
    };

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * Creates Parts when a template is instantiated.
     */
    class DefaultTemplateProcessor {
        /**
         * Create parts for an attribute-position binding, given the event, attribute
         * name, and string literals.
         *
         * @param element The element containing the binding
         * @param name  The attribute name
         * @param strings The string literals. There are always at least two strings,
         *   event for fully-controlled bindings with a single expression.
         */
        handleAttributeExpressions(element, name, strings, options) {
            const prefix = name[0];
            if (prefix === '.') {
                const committer = new PropertyCommitter(element, name.slice(1), strings);
                return committer.parts;
            }
            if (prefix === '@') {
                return [new EventPart(element, name.slice(1), options.eventContext)];
            }
            if (prefix === '?') {
                return [new BooleanAttributePart(element, name.slice(1), strings)];
            }
            const committer = new AttributeCommitter(element, name, strings);
            return committer.parts;
        }
        /**
         * Create parts for a text-position binding.
         * @param templateFactory
         */
        handleTextExpression(options) {
            return new NodePart(options);
        }
    }
    const defaultTemplateProcessor = new DefaultTemplateProcessor();

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // IMPORTANT: do not change the property name or the assignment expression.
    // This line will be used in regexes to search for lit-html usage.
    // TODO(justinfagnani): inject version number at build time
    if (typeof window !== 'undefined') {
        (window['litHtmlVersions'] || (window['litHtmlVersions'] = [])).push('1.3.0');
    }
    /**
     * Interprets a template literal as an HTML template that can efficiently
     * render to and update a container.
     */
    const html = (strings, ...values) => new TemplateResult(strings, values, 'html', defaultTemplateProcessor);

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // Get a key to lookup in `templateCaches`.
    const getTemplateCacheKey = (type, scopeName) => `${type}--${scopeName}`;
    let compatibleShadyCSSVersion = true;
    if (typeof window.ShadyCSS === 'undefined') {
        compatibleShadyCSSVersion = false;
    }
    else if (typeof window.ShadyCSS.prepareTemplateDom === 'undefined') {
        console.warn(`Incompatible ShadyCSS version detected. ` +
            `Please update to at least @webcomponents/webcomponentsjs@2.0.2 and ` +
            `@webcomponents/shadycss@1.3.1.`);
        compatibleShadyCSSVersion = false;
    }
    /**
     * Template factory which scopes template DOM using ShadyCSS.
     * @param scopeName {string}
     */
    const shadyTemplateFactory = (scopeName) => (result) => {
        const cacheKey = getTemplateCacheKey(result.type, scopeName);
        let templateCache = templateCaches.get(cacheKey);
        if (templateCache === undefined) {
            templateCache = {
                stringsArray: new WeakMap(),
                keyString: new Map()
            };
            templateCaches.set(cacheKey, templateCache);
        }
        let template = templateCache.stringsArray.get(result.strings);
        if (template !== undefined) {
            return template;
        }
        const key = result.strings.join(marker);
        template = templateCache.keyString.get(key);
        if (template === undefined) {
            const element = result.getTemplateElement();
            if (compatibleShadyCSSVersion) {
                window.ShadyCSS.prepareTemplateDom(element, scopeName);
            }
            template = new Template(result, element);
            templateCache.keyString.set(key, template);
        }
        templateCache.stringsArray.set(result.strings, template);
        return template;
    };
    const TEMPLATE_TYPES = ['html', 'svg'];
    /**
     * Removes all style elements from Templates for the given scopeName.
     */
    const removeStylesFromLitTemplates = (scopeName) => {
        TEMPLATE_TYPES.forEach((type) => {
            const templates = templateCaches.get(getTemplateCacheKey(type, scopeName));
            if (templates !== undefined) {
                templates.keyString.forEach((template) => {
                    const { element: { content } } = template;
                    // IE 11 doesn't support the iterable param Set constructor
                    const styles = new Set();
                    Array.from(content.querySelectorAll('style')).forEach((s) => {
                        styles.add(s);
                    });
                    removeNodesFromTemplate(template, styles);
                });
            }
        });
    };
    const shadyRenderSet = new Set();
    /**
     * For the given scope name, ensures that ShadyCSS style scoping is performed.
     * This is done just once per scope name so the fragment and template cannot
     * be modified.
     * (1) extracts styles from the rendered fragment and hands them to ShadyCSS
     * to be scoped and appended to the document
     * (2) removes style elements from all lit-html Templates for this scope name.
     *
     * Note, <style> elements can only be placed into templates for the
     * initial rendering of the scope. If <style> elements are included in templates
     * dynamically rendered to the scope (after the first scope render), they will
     * not be scoped and the <style> will be left in the template and rendered
     * output.
     */
    const prepareTemplateStyles = (scopeName, renderedDOM, template) => {
        shadyRenderSet.add(scopeName);
        // If `renderedDOM` is stamped from a Template, then we need to edit that
        // Template's underlying template element. Otherwise, we create one here
        // to give to ShadyCSS, which still requires one while scoping.
        const templateElement = !!template ? template.element : document.createElement('template');
        // Move styles out of rendered DOM and store.
        const styles = renderedDOM.querySelectorAll('style');
        const { length } = styles;
        // If there are no styles, skip unnecessary work
        if (length === 0) {
            // Ensure prepareTemplateStyles is called to support adding
            // styles via `prepareAdoptedCssText` since that requires that
            // `prepareTemplateStyles` is called.
            //
            // ShadyCSS will only update styles containing @apply in the template
            // given to `prepareTemplateStyles`. If no lit Template was given,
            // ShadyCSS will not be able to update uses of @apply in any relevant
            // template. However, this is not a problem because we only create the
            // template for the purpose of supporting `prepareAdoptedCssText`,
            // which doesn't support @apply at all.
            window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
            return;
        }
        const condensedStyle = document.createElement('style');
        // Collect styles into a single style. This helps us make sure ShadyCSS
        // manipulations will not prevent us from being able to fix up template
        // part indices.
        // NOTE: collecting styles is inefficient for browsers but ShadyCSS
        // currently does this anyway. When it does not, this should be changed.
        for (let i = 0; i < length; i++) {
            const style = styles[i];
            style.parentNode.removeChild(style);
            condensedStyle.textContent += style.textContent;
        }
        // Remove styles from nested templates in this scope.
        removeStylesFromLitTemplates(scopeName);
        // And then put the condensed style into the "root" template passed in as
        // `template`.
        const content = templateElement.content;
        if (!!template) {
            insertNodeIntoTemplate(template, condensedStyle, content.firstChild);
        }
        else {
            content.insertBefore(condensedStyle, content.firstChild);
        }
        // Note, it's important that ShadyCSS gets the template that `lit-html`
        // will actually render so that it can update the style inside when
        // needed (e.g. @apply native Shadow DOM case).
        window.ShadyCSS.prepareTemplateStyles(templateElement, scopeName);
        const style = content.querySelector('style');
        if (window.ShadyCSS.nativeShadow && style !== null) {
            // When in native Shadow DOM, ensure the style created by ShadyCSS is
            // included in initially rendered output (`renderedDOM`).
            renderedDOM.insertBefore(style.cloneNode(true), renderedDOM.firstChild);
        }
        else if (!!template) {
            // When no style is left in the template, parts will be broken as a
            // result. To fix this, we put back the style node ShadyCSS removed
            // and then tell lit to remove that node from the template.
            // There can be no style in the template in 2 cases (1) when Shady DOM
            // is in use, ShadyCSS removes all styles, (2) when native Shadow DOM
            // is in use ShadyCSS removes the style if it contains no content.
            // NOTE, ShadyCSS creates its own style so we can safely add/remove
            // `condensedStyle` here.
            content.insertBefore(condensedStyle, content.firstChild);
            const removes = new Set();
            removes.add(condensedStyle);
            removeNodesFromTemplate(template, removes);
        }
    };
    /**
     * Extension to the standard `render` method which supports rendering
     * to ShadowRoots when the ShadyDOM (https://github.com/webcomponents/shadydom)
     * and ShadyCSS (https://github.com/webcomponents/shadycss) polyfills are used
     * or when the webcomponentsjs
     * (https://github.com/webcomponents/webcomponentsjs) polyfill is used.
     *
     * Adds a `scopeName` option which is used to scope element DOM and stylesheets
     * when native ShadowDOM is unavailable. The `scopeName` will be added to
     * the class attribute of all rendered DOM. In addition, any style elements will
     * be automatically re-written with this `scopeName` selector and moved out
     * of the rendered DOM and into the document `<head>`.
     *
     * It is common to use this render method in conjunction with a custom element
     * which renders a shadowRoot. When this is done, typically the element's
     * `localName` should be used as the `scopeName`.
     *
     * In addition to DOM scoping, ShadyCSS also supports a basic shim for css
     * custom properties (needed only on older browsers like IE11) and a shim for
     * a deprecated feature called `@apply` that supports applying a set of css
     * custom properties to a given location.
     *
     * Usage considerations:
     *
     * * Part values in `<style>` elements are only applied the first time a given
     * `scopeName` renders. Subsequent changes to parts in style elements will have
     * no effect. Because of this, parts in style elements should only be used for
     * values that will never change, for example parts that set scope-wide theme
     * values or parts which render shared style elements.
     *
     * * Note, due to a limitation of the ShadyDOM polyfill, rendering in a
     * custom element's `constructor` is not supported. Instead rendering should
     * either done asynchronously, for example at microtask timing (for example
     * `Promise.resolve()`), or be deferred until the first time the element's
     * `connectedCallback` runs.
     *
     * Usage considerations when using shimmed custom properties or `@apply`:
     *
     * * Whenever any dynamic changes are made which affect
     * css custom properties, `ShadyCSS.styleElement(element)` must be called
     * to update the element. There are two cases when this is needed:
     * (1) the element is connected to a new parent, (2) a class is added to the
     * element that causes it to match different custom properties.
     * To address the first case when rendering a custom element, `styleElement`
     * should be called in the element's `connectedCallback`.
     *
     * * Shimmed custom properties may only be defined either for an entire
     * shadowRoot (for example, in a `:host` rule) or via a rule that directly
     * matches an element with a shadowRoot. In other words, instead of flowing from
     * parent to child as do native css custom properties, shimmed custom properties
     * flow only from shadowRoots to nested shadowRoots.
     *
     * * When using `@apply` mixing css shorthand property names with
     * non-shorthand names (for example `border` and `border-width`) is not
     * supported.
     */
    const render$1 = (result, container, options) => {
        if (!options || typeof options !== 'object' || !options.scopeName) {
            throw new Error('The `scopeName` option is required.');
        }
        const scopeName = options.scopeName;
        const hasRendered = parts.has(container);
        const needsScoping = compatibleShadyCSSVersion &&
            container.nodeType === 11 /* Node.DOCUMENT_FRAGMENT_NODE */ &&
            !!container.host;
        // Handle first render to a scope specially...
        const firstScopeRender = needsScoping && !shadyRenderSet.has(scopeName);
        // On first scope render, render into a fragment; this cannot be a single
        // fragment that is reused since nested renders can occur synchronously.
        const renderContainer = firstScopeRender ? document.createDocumentFragment() : container;
        render(result, renderContainer, Object.assign({ templateFactory: shadyTemplateFactory(scopeName) }, options));
        // When performing first scope render,
        // (1) We've rendered into a fragment so that there's a chance to
        // `prepareTemplateStyles` before sub-elements hit the DOM
        // (which might cause them to render based on a common pattern of
        // rendering in a custom element's `connectedCallback`);
        // (2) Scope the template with ShadyCSS one time only for this scope.
        // (3) Render the fragment into the container and make sure the
        // container knows its `part` is the one we just rendered. This ensures
        // DOM will be re-used on subsequent renders.
        if (firstScopeRender) {
            const part = parts.get(renderContainer);
            parts.delete(renderContainer);
            // ShadyCSS might have style sheets (e.g. from `prepareAdoptedCssText`)
            // that should apply to `renderContainer` even if the rendered value is
            // not a TemplateInstance. However, it will only insert scoped styles
            // into the document if `prepareTemplateStyles` has already been called
            // for the given scope name.
            const template = part.value instanceof TemplateInstance ?
                part.value.template :
                undefined;
            prepareTemplateStyles(scopeName, renderContainer, template);
            removeNodes(container, container.firstChild);
            container.appendChild(renderContainer);
            parts.set(container, part);
        }
        // After elements have hit the DOM, update styling if this is the
        // initial render to this container.
        // This is needed whenever dynamic changes are made so it would be
        // safest to do every render; however, this would regress performance
        // so we leave it up to the user to call `ShadyCSS.styleElement`
        // for dynamic changes.
        if (!hasRendered && needsScoping) {
            window.ShadyCSS.styleElement(container.host);
        }
    };

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    var _a;
    /**
     * Use this module if you want to create your own base class extending
     * [[UpdatingElement]].
     * @packageDocumentation
     */
    /*
     * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
     * replaced at compile time by the munged name for object[property]. We cannot
     * alias this function, so we have to use a small shim that has the same
     * behavior when not compiling.
     */
    window.JSCompiler_renameProperty =
        (prop, _obj) => prop;
    const defaultConverter = {
        toAttribute(value, type) {
            switch (type) {
                case Boolean:
                    return value ? '' : null;
                case Object:
                case Array:
                    // if the value is `null` or `undefined` pass this through
                    // to allow removing/no change behavior.
                    return value == null ? value : JSON.stringify(value);
            }
            return value;
        },
        fromAttribute(value, type) {
            switch (type) {
                case Boolean:
                    return value !== null;
                case Number:
                    return value === null ? null : Number(value);
                case Object:
                case Array:
                    return JSON.parse(value);
            }
            return value;
        }
    };
    /**
     * Change function that returns true if `value` is different from `oldValue`.
     * This method is used as the default for a property's `hasChanged` function.
     */
    const notEqual = (value, old) => {
        // This ensures (old==NaN, value==NaN) always returns false
        return old !== value && (old === old || value === value);
    };
    const defaultPropertyDeclaration = {
        attribute: true,
        type: String,
        converter: defaultConverter,
        reflect: false,
        hasChanged: notEqual
    };
    const STATE_HAS_UPDATED = 1;
    const STATE_UPDATE_REQUESTED = 1 << 2;
    const STATE_IS_REFLECTING_TO_ATTRIBUTE = 1 << 3;
    const STATE_IS_REFLECTING_TO_PROPERTY = 1 << 4;
    /**
     * The Closure JS Compiler doesn't currently have good support for static
     * property semantics where "this" is dynamic (e.g.
     * https://github.com/google/closure-compiler/issues/3177 and others) so we use
     * this hack to bypass any rewriting by the compiler.
     */
    const finalized = 'finalized';
    /**
     * Base element class which manages element properties and attributes. When
     * properties change, the `update` method is asynchronously called. This method
     * should be supplied by subclassers to render updates as desired.
     * @noInheritDoc
     */
    class UpdatingElement extends HTMLElement {
        constructor() {
            super();
            this.initialize();
        }
        /**
         * Returns a list of attributes corresponding to the registered properties.
         * @nocollapse
         */
        static get observedAttributes() {
            // note: piggy backing on this to ensure we're finalized.
            this.finalize();
            const attributes = [];
            // Use forEach so this works even if for/of loops are compiled to for loops
            // expecting arrays
            this._classProperties.forEach((v, p) => {
                const attr = this._attributeNameForProperty(p, v);
                if (attr !== undefined) {
                    this._attributeToPropertyMap.set(attr, p);
                    attributes.push(attr);
                }
            });
            return attributes;
        }
        /**
         * Ensures the private `_classProperties` property metadata is created.
         * In addition to `finalize` this is also called in `createProperty` to
         * ensure the `@property` decorator can add property metadata.
         */
        /** @nocollapse */
        static _ensureClassProperties() {
            // ensure private storage for property declarations.
            if (!this.hasOwnProperty(JSCompiler_renameProperty('_classProperties', this))) {
                this._classProperties = new Map();
                // NOTE: Workaround IE11 not supporting Map constructor argument.
                const superProperties = Object.getPrototypeOf(this)._classProperties;
                if (superProperties !== undefined) {
                    superProperties.forEach((v, k) => this._classProperties.set(k, v));
                }
            }
        }
        /**
         * Creates a property accessor on the element prototype if one does not exist
         * and stores a PropertyDeclaration for the property with the given options.
         * The property setter calls the property's `hasChanged` property option
         * or uses a strict identity check to determine whether or not to request
         * an update.
         *
         * This method may be overridden to customize properties; however,
         * when doing so, it's important to call `super.createProperty` to ensure
         * the property is setup correctly. This method calls
         * `getPropertyDescriptor` internally to get a descriptor to install.
         * To customize what properties do when they are get or set, override
         * `getPropertyDescriptor`. To customize the options for a property,
         * implement `createProperty` like this:
         *
         * static createProperty(name, options) {
         *   options = Object.assign(options, {myOption: true});
         *   super.createProperty(name, options);
         * }
         *
         * @nocollapse
         */
        static createProperty(name, options = defaultPropertyDeclaration) {
            // Note, since this can be called by the `@property` decorator which
            // is called before `finalize`, we ensure storage exists for property
            // metadata.
            this._ensureClassProperties();
            this._classProperties.set(name, options);
            // Do not generate an accessor if the prototype already has one, since
            // it would be lost otherwise and that would never be the user's intention;
            // Instead, we expect users to call `requestUpdate` themselves from
            // user-defined accessors. Note that if the super has an accessor we will
            // still overwrite it
            if (options.noAccessor || this.prototype.hasOwnProperty(name)) {
                return;
            }
            const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
            const descriptor = this.getPropertyDescriptor(name, key, options);
            if (descriptor !== undefined) {
                Object.defineProperty(this.prototype, name, descriptor);
            }
        }
        /**
         * Returns a property descriptor to be defined on the given named property.
         * If no descriptor is returned, the property will not become an accessor.
         * For example,
         *
         *   class MyElement extends LitElement {
         *     static getPropertyDescriptor(name, key, options) {
         *       const defaultDescriptor =
         *           super.getPropertyDescriptor(name, key, options);
         *       const setter = defaultDescriptor.set;
         *       return {
         *         get: defaultDescriptor.get,
         *         set(value) {
         *           setter.call(this, value);
         *           // custom action.
         *         },
         *         configurable: true,
         *         enumerable: true
         *       }
         *     }
         *   }
         *
         * @nocollapse
         */
        static getPropertyDescriptor(name, key, options) {
            return {
                // tslint:disable-next-line:no-any no symbol in index
                get() {
                    return this[key];
                },
                set(value) {
                    const oldValue = this[name];
                    this[key] = value;
                    this
                        .requestUpdateInternal(name, oldValue, options);
                },
                configurable: true,
                enumerable: true
            };
        }
        /**
         * Returns the property options associated with the given property.
         * These options are defined with a PropertyDeclaration via the `properties`
         * object or the `@property` decorator and are registered in
         * `createProperty(...)`.
         *
         * Note, this method should be considered "final" and not overridden. To
         * customize the options for a given property, override `createProperty`.
         *
         * @nocollapse
         * @final
         */
        static getPropertyOptions(name) {
            return this._classProperties && this._classProperties.get(name) ||
                defaultPropertyDeclaration;
        }
        /**
         * Creates property accessors for registered properties and ensures
         * any superclasses are also finalized.
         * @nocollapse
         */
        static finalize() {
            // finalize any superclasses
            const superCtor = Object.getPrototypeOf(this);
            if (!superCtor.hasOwnProperty(finalized)) {
                superCtor.finalize();
            }
            this[finalized] = true;
            this._ensureClassProperties();
            // initialize Map populated in observedAttributes
            this._attributeToPropertyMap = new Map();
            // make any properties
            // Note, only process "own" properties since this element will inherit
            // any properties defined on the superClass, and finalization ensures
            // the entire prototype chain is finalized.
            if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
                const props = this.properties;
                // support symbols in properties (IE11 does not support this)
                const propKeys = [
                    ...Object.getOwnPropertyNames(props),
                    ...(typeof Object.getOwnPropertySymbols === 'function') ?
                        Object.getOwnPropertySymbols(props) :
                        []
                ];
                // This for/of is ok because propKeys is an array
                for (const p of propKeys) {
                    // note, use of `any` is due to TypeSript lack of support for symbol in
                    // index types
                    // tslint:disable-next-line:no-any no symbol in index
                    this.createProperty(p, props[p]);
                }
            }
        }
        /**
         * Returns the property name for the given attribute `name`.
         * @nocollapse
         */
        static _attributeNameForProperty(name, options) {
            const attribute = options.attribute;
            return attribute === false ?
                undefined :
                (typeof attribute === 'string' ?
                    attribute :
                    (typeof name === 'string' ? name.toLowerCase() : undefined));
        }
        /**
         * Returns true if a property should request an update.
         * Called when a property value is set and uses the `hasChanged`
         * option for the property if present or a strict identity check.
         * @nocollapse
         */
        static _valueHasChanged(value, old, hasChanged = notEqual) {
            return hasChanged(value, old);
        }
        /**
         * Returns the property value for the given attribute value.
         * Called via the `attributeChangedCallback` and uses the property's
         * `converter` or `converter.fromAttribute` property option.
         * @nocollapse
         */
        static _propertyValueFromAttribute(value, options) {
            const type = options.type;
            const converter = options.converter || defaultConverter;
            const fromAttribute = (typeof converter === 'function' ? converter : converter.fromAttribute);
            return fromAttribute ? fromAttribute(value, type) : value;
        }
        /**
         * Returns the attribute value for the given property value. If this
         * returns undefined, the property will *not* be reflected to an attribute.
         * If this returns null, the attribute will be removed, otherwise the
         * attribute will be set to the value.
         * This uses the property's `reflect` and `type.toAttribute` property options.
         * @nocollapse
         */
        static _propertyValueToAttribute(value, options) {
            if (options.reflect === undefined) {
                return;
            }
            const type = options.type;
            const converter = options.converter;
            const toAttribute = converter && converter.toAttribute ||
                defaultConverter.toAttribute;
            return toAttribute(value, type);
        }
        /**
         * Performs element initialization. By default captures any pre-set values for
         * registered properties.
         */
        initialize() {
            this._updateState = 0;
            this._updatePromise =
                new Promise((res) => this._enableUpdatingResolver = res);
            this._changedProperties = new Map();
            this._saveInstanceProperties();
            // ensures first update will be caught by an early access of
            // `updateComplete`
            this.requestUpdateInternal();
        }
        /**
         * Fixes any properties set on the instance before upgrade time.
         * Otherwise these would shadow the accessor and break these properties.
         * The properties are stored in a Map which is played back after the
         * constructor runs. Note, on very old versions of Safari (<=9) or Chrome
         * (<=41), properties created for native platform properties like (`id` or
         * `name`) may not have default values set in the element constructor. On
         * these browsers native properties appear on instances and therefore their
         * default value will overwrite any element default (e.g. if the element sets
         * this.id = 'id' in the constructor, the 'id' will become '' since this is
         * the native platform default).
         */
        _saveInstanceProperties() {
            // Use forEach so this works even if for/of loops are compiled to for loops
            // expecting arrays
            this.constructor
                ._classProperties.forEach((_v, p) => {
                if (this.hasOwnProperty(p)) {
                    const value = this[p];
                    delete this[p];
                    if (!this._instanceProperties) {
                        this._instanceProperties = new Map();
                    }
                    this._instanceProperties.set(p, value);
                }
            });
        }
        /**
         * Applies previously saved instance properties.
         */
        _applyInstanceProperties() {
            // Use forEach so this works even if for/of loops are compiled to for loops
            // expecting arrays
            // tslint:disable-next-line:no-any
            this._instanceProperties.forEach((v, p) => this[p] = v);
            this._instanceProperties = undefined;
        }
        connectedCallback() {
            // Ensure first connection completes an update. Updates cannot complete
            // before connection.
            this.enableUpdating();
        }
        enableUpdating() {
            if (this._enableUpdatingResolver !== undefined) {
                this._enableUpdatingResolver();
                this._enableUpdatingResolver = undefined;
            }
        }
        /**
         * Allows for `super.disconnectedCallback()` in extensions while
         * reserving the possibility of making non-breaking feature additions
         * when disconnecting at some point in the future.
         */
        disconnectedCallback() {
        }
        /**
         * Synchronizes property values when attributes change.
         */
        attributeChangedCallback(name, old, value) {
            if (old !== value) {
                this._attributeToProperty(name, value);
            }
        }
        _propertyToAttribute(name, value, options = defaultPropertyDeclaration) {
            const ctor = this.constructor;
            const attr = ctor._attributeNameForProperty(name, options);
            if (attr !== undefined) {
                const attrValue = ctor._propertyValueToAttribute(value, options);
                // an undefined value does not change the attribute.
                if (attrValue === undefined) {
                    return;
                }
                // Track if the property is being reflected to avoid
                // setting the property again via `attributeChangedCallback`. Note:
                // 1. this takes advantage of the fact that the callback is synchronous.
                // 2. will behave incorrectly if multiple attributes are in the reaction
                // stack at time of calling. However, since we process attributes
                // in `update` this should not be possible (or an extreme corner case
                // that we'd like to discover).
                // mark state reflecting
                this._updateState = this._updateState | STATE_IS_REFLECTING_TO_ATTRIBUTE;
                if (attrValue == null) {
                    this.removeAttribute(attr);
                }
                else {
                    this.setAttribute(attr, attrValue);
                }
                // mark state not reflecting
                this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_ATTRIBUTE;
            }
        }
        _attributeToProperty(name, value) {
            // Use tracking info to avoid deserializing attribute value if it was
            // just set from a property setter.
            if (this._updateState & STATE_IS_REFLECTING_TO_ATTRIBUTE) {
                return;
            }
            const ctor = this.constructor;
            // Note, hint this as an `AttributeMap` so closure clearly understands
            // the type; it has issues with tracking types through statics
            // tslint:disable-next-line:no-unnecessary-type-assertion
            const propName = ctor._attributeToPropertyMap.get(name);
            if (propName !== undefined) {
                const options = ctor.getPropertyOptions(propName);
                // mark state reflecting
                this._updateState = this._updateState | STATE_IS_REFLECTING_TO_PROPERTY;
                this[propName] =
                    // tslint:disable-next-line:no-any
                    ctor._propertyValueFromAttribute(value, options);
                // mark state not reflecting
                this._updateState = this._updateState & ~STATE_IS_REFLECTING_TO_PROPERTY;
            }
        }
        /**
         * This protected version of `requestUpdate` does not access or return the
         * `updateComplete` promise. This promise can be overridden and is therefore
         * not free to access.
         */
        requestUpdateInternal(name, oldValue, options) {
            let shouldRequestUpdate = true;
            // If we have a property key, perform property update steps.
            if (name !== undefined) {
                const ctor = this.constructor;
                options = options || ctor.getPropertyOptions(name);
                if (ctor._valueHasChanged(this[name], oldValue, options.hasChanged)) {
                    if (!this._changedProperties.has(name)) {
                        this._changedProperties.set(name, oldValue);
                    }
                    // Add to reflecting properties set.
                    // Note, it's important that every change has a chance to add the
                    // property to `_reflectingProperties`. This ensures setting
                    // attribute + property reflects correctly.
                    if (options.reflect === true &&
                        !(this._updateState & STATE_IS_REFLECTING_TO_PROPERTY)) {
                        if (this._reflectingProperties === undefined) {
                            this._reflectingProperties = new Map();
                        }
                        this._reflectingProperties.set(name, options);
                    }
                }
                else {
                    // Abort the request if the property should not be considered changed.
                    shouldRequestUpdate = false;
                }
            }
            if (!this._hasRequestedUpdate && shouldRequestUpdate) {
                this._updatePromise = this._enqueueUpdate();
            }
        }
        /**
         * Requests an update which is processed asynchronously. This should
         * be called when an element should update based on some state not triggered
         * by setting a property. In this case, pass no arguments. It should also be
         * called when manually implementing a property setter. In this case, pass the
         * property `name` and `oldValue` to ensure that any configured property
         * options are honored. Returns the `updateComplete` Promise which is resolved
         * when the update completes.
         *
         * @param name {PropertyKey} (optional) name of requesting property
         * @param oldValue {any} (optional) old value of requesting property
         * @returns {Promise} A Promise that is resolved when the update completes.
         */
        requestUpdate(name, oldValue) {
            this.requestUpdateInternal(name, oldValue);
            return this.updateComplete;
        }
        /**
         * Sets up the element to asynchronously update.
         */
        async _enqueueUpdate() {
            this._updateState = this._updateState | STATE_UPDATE_REQUESTED;
            try {
                // Ensure any previous update has resolved before updating.
                // This `await` also ensures that property changes are batched.
                await this._updatePromise;
            }
            catch (e) {
                // Ignore any previous errors. We only care that the previous cycle is
                // done. Any error should have been handled in the previous update.
            }
            const result = this.performUpdate();
            // If `performUpdate` returns a Promise, we await it. This is done to
            // enable coordinating updates with a scheduler. Note, the result is
            // checked to avoid delaying an additional microtask unless we need to.
            if (result != null) {
                await result;
            }
            return !this._hasRequestedUpdate;
        }
        get _hasRequestedUpdate() {
            return (this._updateState & STATE_UPDATE_REQUESTED);
        }
        get hasUpdated() {
            return (this._updateState & STATE_HAS_UPDATED);
        }
        /**
         * Performs an element update. Note, if an exception is thrown during the
         * update, `firstUpdated` and `updated` will not be called.
         *
         * You can override this method to change the timing of updates. If this
         * method is overridden, `super.performUpdate()` must be called.
         *
         * For instance, to schedule updates to occur just before the next frame:
         *
         * ```
         * protected async performUpdate(): Promise<unknown> {
         *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
         *   super.performUpdate();
         * }
         * ```
         */
        performUpdate() {
            // Abort any update if one is not pending when this is called.
            // This can happen if `performUpdate` is called early to "flush"
            // the update.
            if (!this._hasRequestedUpdate) {
                return;
            }
            // Mixin instance properties once, if they exist.
            if (this._instanceProperties) {
                this._applyInstanceProperties();
            }
            let shouldUpdate = false;
            const changedProperties = this._changedProperties;
            try {
                shouldUpdate = this.shouldUpdate(changedProperties);
                if (shouldUpdate) {
                    this.update(changedProperties);
                }
                else {
                    this._markUpdated();
                }
            }
            catch (e) {
                // Prevent `firstUpdated` and `updated` from running when there's an
                // update exception.
                shouldUpdate = false;
                // Ensure element can accept additional updates after an exception.
                this._markUpdated();
                throw e;
            }
            if (shouldUpdate) {
                if (!(this._updateState & STATE_HAS_UPDATED)) {
                    this._updateState = this._updateState | STATE_HAS_UPDATED;
                    this.firstUpdated(changedProperties);
                }
                this.updated(changedProperties);
            }
        }
        _markUpdated() {
            this._changedProperties = new Map();
            this._updateState = this._updateState & ~STATE_UPDATE_REQUESTED;
        }
        /**
         * Returns a Promise that resolves when the element has completed updating.
         * The Promise value is a boolean that is `true` if the element completed the
         * update without triggering another update. The Promise result is `false` if
         * a property was set inside `updated()`. If the Promise is rejected, an
         * exception was thrown during the update.
         *
         * To await additional asynchronous work, override the `_getUpdateComplete`
         * method. For example, it is sometimes useful to await a rendered element
         * before fulfilling this Promise. To do this, first await
         * `super._getUpdateComplete()`, then any subsequent state.
         *
         * @returns {Promise} The Promise returns a boolean that indicates if the
         * update resolved without triggering another update.
         */
        get updateComplete() {
            return this._getUpdateComplete();
        }
        /**
         * Override point for the `updateComplete` promise.
         *
         * It is not safe to override the `updateComplete` getter directly due to a
         * limitation in TypeScript which means it is not possible to call a
         * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
         * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
         * This method should be overridden instead. For example:
         *
         *   class MyElement extends LitElement {
         *     async _getUpdateComplete() {
         *       await super._getUpdateComplete();
         *       await this._myChild.updateComplete;
         *     }
         *   }
         */
        _getUpdateComplete() {
            return this._updatePromise;
        }
        /**
         * Controls whether or not `update` should be called when the element requests
         * an update. By default, this method always returns `true`, but this can be
         * customized to control when to update.
         *
         * @param _changedProperties Map of changed properties with old values
         */
        shouldUpdate(_changedProperties) {
            return true;
        }
        /**
         * Updates the element. This method reflects property values to attributes.
         * It can be overridden to render and keep updated element DOM.
         * Setting properties inside this method will *not* trigger
         * another update.
         *
         * @param _changedProperties Map of changed properties with old values
         */
        update(_changedProperties) {
            if (this._reflectingProperties !== undefined &&
                this._reflectingProperties.size > 0) {
                // Use forEach so this works even if for/of loops are compiled to for
                // loops expecting arrays
                this._reflectingProperties.forEach((v, k) => this._propertyToAttribute(k, this[k], v));
                this._reflectingProperties = undefined;
            }
            this._markUpdated();
        }
        /**
         * Invoked whenever the element is updated. Implement to perform
         * post-updating tasks via DOM APIs, for example, focusing an element.
         *
         * Setting properties inside this method will trigger the element to update
         * again after this update cycle completes.
         *
         * @param _changedProperties Map of changed properties with old values
         */
        updated(_changedProperties) {
        }
        /**
         * Invoked when the element is first updated. Implement to perform one time
         * work on the element after update.
         *
         * Setting properties inside this method will trigger the element to update
         * again after this update cycle completes.
         *
         * @param _changedProperties Map of changed properties with old values
         */
        firstUpdated(_changedProperties) {
        }
    }
    _a = finalized;
    /**
     * Marks class as having finished creating properties.
     */
    UpdatingElement[_a] = true;

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const legacyCustomElement = (tagName, clazz) => {
        window.customElements.define(tagName, clazz);
        // Cast as any because TS doesn't recognize the return type as being a
        // subtype of the decorated class when clazz is typed as
        // `Constructor<HTMLElement>` for some reason.
        // `Constructor<HTMLElement>` is helpful to make sure the decorator is
        // applied to elements however.
        // tslint:disable-next-line:no-any
        return clazz;
    };
    const standardCustomElement = (tagName, descriptor) => {
        const { kind, elements } = descriptor;
        return {
            kind,
            elements,
            // This callback is called once the class is otherwise fully defined
            finisher(clazz) {
                window.customElements.define(tagName, clazz);
            }
        };
    };
    /**
     * Class decorator factory that defines the decorated class as a custom element.
     *
     * ```
     * @customElement('my-element')
     * class MyElement {
     *   render() {
     *     return html``;
     *   }
     * }
     * ```
     * @category Decorator
     * @param tagName The name of the custom element to define.
     */
    const customElement = (tagName) => (classOrDescriptor) => (typeof classOrDescriptor === 'function') ?
        legacyCustomElement(tagName, classOrDescriptor) :
        standardCustomElement(tagName, classOrDescriptor);
    const standardProperty = (options, element) => {
        // When decorating an accessor, pass it through and add property metadata.
        // Note, the `hasOwnProperty` check in `createProperty` ensures we don't
        // stomp over the user's accessor.
        if (element.kind === 'method' && element.descriptor &&
            !('value' in element.descriptor)) {
            return Object.assign(Object.assign({}, element), { finisher(clazz) {
                    clazz.createProperty(element.key, options);
                } });
        }
        else {
            // createProperty() takes care of defining the property, but we still
            // must return some kind of descriptor, so return a descriptor for an
            // unused prototype field. The finisher calls createProperty().
            return {
                kind: 'field',
                key: Symbol(),
                placement: 'own',
                descriptor: {},
                // When @babel/plugin-proposal-decorators implements initializers,
                // do this instead of the initializer below. See:
                // https://github.com/babel/babel/issues/9260 extras: [
                //   {
                //     kind: 'initializer',
                //     placement: 'own',
                //     initializer: descriptor.initializer,
                //   }
                // ],
                initializer() {
                    if (typeof element.initializer === 'function') {
                        this[element.key] = element.initializer.call(this);
                    }
                },
                finisher(clazz) {
                    clazz.createProperty(element.key, options);
                }
            };
        }
    };
    const legacyProperty = (options, proto, name) => {
        proto.constructor
            .createProperty(name, options);
    };
    /**
     * A property decorator which creates a LitElement property which reflects a
     * corresponding attribute value. A [[`PropertyDeclaration`]] may optionally be
     * supplied to configure property features.
     *
     * This decorator should only be used for public fields. Private or protected
     * fields should use the [[`internalProperty`]] decorator.
     *
     * @example
     * ```ts
     * class MyElement {
     *   @property({ type: Boolean })
     *   clicked = false;
     * }
     * ```
     * @category Decorator
     * @ExportDecoratedItems
     */
    function property(options) {
        // tslint:disable-next-line:no-any decorator
        return (protoOrDescriptor, name) => (name !== undefined) ?
            legacyProperty(options, protoOrDescriptor, name) :
            standardProperty(options, protoOrDescriptor);
    }
    /**
     * Declares a private or protected property that still triggers updates to the
     * element when it changes.
     *
     * Properties declared this way must not be used from HTML or HTML templating
     * systems, they're solely for properties internal to the element. These
     * properties may be renamed by optimization tools like closure compiler.
     * @category Decorator
     */
    function internalProperty(options) {
        return property({ attribute: false, hasChanged: options === null || options === void 0 ? void 0 : options.hasChanged });
    }
    /**
     * A property decorator that converts a class property into a getter that
     * executes a querySelector on the element's renderRoot.
     *
     * @param selector A DOMString containing one or more selectors to match.
     * @param cache An optional boolean which when true performs the DOM query only
     * once and caches the result.
     *
     * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
     *
     * @example
     *
     * ```ts
     * class MyElement {
     *   @query('#first')
     *   first;
     *
     *   render() {
     *     return html`
     *       <div id="first"></div>
     *       <div id="second"></div>
     *     `;
     *   }
     * }
     * ```
     * @category Decorator
     */
    function query(selector, cache) {
        return (protoOrDescriptor, 
        // tslint:disable-next-line:no-any decorator
        name) => {
            const descriptor = {
                get() {
                    return this.renderRoot.querySelector(selector);
                },
                enumerable: true,
                configurable: true,
            };
            if (cache) {
                const key = typeof name === 'symbol' ? Symbol() : `__${name}`;
                descriptor.get = function () {
                    if (this[key] === undefined) {
                        (this[key] =
                            this.renderRoot.querySelector(selector));
                    }
                    return this[key];
                };
            }
            return (name !== undefined) ?
                legacyQuery(descriptor, protoOrDescriptor, name) :
                standardQuery(descriptor, protoOrDescriptor);
        };
    }
    // Note, in the future, we may extend this decorator to support the use case
    // where the queried element may need to do work to become ready to interact
    // with (e.g. load some implementation code). If so, we might elect to
    // add a second argument defining a function that can be run to make the
    // queried element loaded/updated/ready.
    /**
     * A property decorator that converts a class property into a getter that
     * returns a promise that resolves to the result of a querySelector on the
     * element's renderRoot done after the element's `updateComplete` promise
     * resolves. When the queried property may change with element state, this
     * decorator can be used instead of requiring users to await the
     * `updateComplete` before accessing the property.
     *
     * @param selector A DOMString containing one or more selectors to match.
     *
     * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
     *
     * @example
     * ```ts
     * class MyElement {
     *   @queryAsync('#first')
     *   first;
     *
     *   render() {
     *     return html`
     *       <div id="first"></div>
     *       <div id="second"></div>
     *     `;
     *   }
     * }
     *
     * // external usage
     * async doSomethingWithFirst() {
     *  (await aMyElement.first).doSomething();
     * }
     * ```
     * @category Decorator
     */
    function queryAsync(selector) {
        return (protoOrDescriptor, 
        // tslint:disable-next-line:no-any decorator
        name) => {
            const descriptor = {
                async get() {
                    await this.updateComplete;
                    return this.renderRoot.querySelector(selector);
                },
                enumerable: true,
                configurable: true,
            };
            return (name !== undefined) ?
                legacyQuery(descriptor, protoOrDescriptor, name) :
                standardQuery(descriptor, protoOrDescriptor);
        };
    }
    const legacyQuery = (descriptor, proto, name) => {
        Object.defineProperty(proto, name, descriptor);
    };
    const standardQuery = (descriptor, element) => ({
        kind: 'method',
        placement: 'prototype',
        key: element.key,
        descriptor,
    });
    const standardEventOptions = (options, element) => {
        return Object.assign(Object.assign({}, element), { finisher(clazz) {
                Object.assign(clazz.prototype[element.key], options);
            } });
    };
    const legacyEventOptions = 
    // tslint:disable-next-line:no-any legacy decorator
    (options, proto, name) => {
        Object.assign(proto[name], options);
    };
    /**
     * Adds event listener options to a method used as an event listener in a
     * lit-html template.
     *
     * @param options An object that specifies event listener options as accepted by
     * `EventTarget#addEventListener` and `EventTarget#removeEventListener`.
     *
     * Current browsers support the `capture`, `passive`, and `once` options. See:
     * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters
     *
     * @example
     * ```ts
     * class MyElement {
     *   clicked = false;
     *
     *   render() {
     *     return html`
     *       <div @click=${this._onClick}`>
     *         <button></button>
     *       </div>
     *     `;
     *   }
     *
     *   @eventOptions({capture: true})
     *   _onClick(e) {
     *     this.clicked = true;
     *   }
     * }
     * ```
     * @category Decorator
     */
    function eventOptions(options) {
        // Return value typed as any to prevent TypeScript from complaining that
        // standard decorator function signature does not match TypeScript decorator
        // signature
        // TODO(kschaaf): unclear why it was only failing on this decorator and not
        // the others
        return ((protoOrDescriptor, name) => (name !== undefined) ?
            legacyEventOptions(options, protoOrDescriptor, name) :
            standardEventOptions(options, protoOrDescriptor));
    }

    /**
    @license
    Copyright (c) 2019 The Polymer Project Authors. All rights reserved.
    This code may only be used under the BSD style license found at
    http://polymer.github.io/LICENSE.txt The complete set of authors may be found at
    http://polymer.github.io/AUTHORS.txt The complete set of contributors may be
    found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by Google as
    part of the polymer project is also subject to an additional IP rights grant
    found at http://polymer.github.io/PATENTS.txt
    */
    /**
     * Whether the current browser supports `adoptedStyleSheets`.
     */
    const supportsAdoptingStyleSheets = (window.ShadowRoot) &&
        (window.ShadyCSS === undefined || window.ShadyCSS.nativeShadow) &&
        ('adoptedStyleSheets' in Document.prototype) &&
        ('replace' in CSSStyleSheet.prototype);
    const constructionToken = Symbol();
    class CSSResult {
        constructor(cssText, safeToken) {
            if (safeToken !== constructionToken) {
                throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
            }
            this.cssText = cssText;
        }
        // Note, this is a getter so that it's lazy. In practice, this means
        // stylesheets are not created until the first element instance is made.
        get styleSheet() {
            if (this._styleSheet === undefined) {
                // Note, if `supportsAdoptingStyleSheets` is true then we assume
                // CSSStyleSheet is constructable.
                if (supportsAdoptingStyleSheets) {
                    this._styleSheet = new CSSStyleSheet();
                    this._styleSheet.replaceSync(this.cssText);
                }
                else {
                    this._styleSheet = null;
                }
            }
            return this._styleSheet;
        }
        toString() {
            return this.cssText;
        }
    }
    /**
     * Wrap a value for interpolation in a [[`css`]] tagged template literal.
     *
     * This is unsafe because untrusted CSS text can be used to phone home
     * or exfiltrate data to an attacker controlled site. Take care to only use
     * this with trusted input.
     */
    const unsafeCSS = (value) => {
        return new CSSResult(String(value), constructionToken);
    };
    const textFromCSSResult = (value) => {
        if (value instanceof CSSResult) {
            return value.cssText;
        }
        else if (typeof value === 'number') {
            return value;
        }
        else {
            throw new Error(`Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but
            take care to ensure page security.`);
        }
    };
    /**
     * Template tag which which can be used with LitElement's [[LitElement.styles |
     * `styles`]] property to set element styles. For security reasons, only literal
     * string values may be used. To incorporate non-literal values [[`unsafeCSS`]]
     * may be used inside a template string part.
     */
    const css = (strings, ...values) => {
        const cssText = values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
        return new CSSResult(cssText, constructionToken);
    };

    /**
     * @license
     * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // IMPORTANT: do not change the property name or the assignment expression.
    // This line will be used in regexes to search for LitElement usage.
    // TODO(justinfagnani): inject version number at build time
    (window['litElementVersions'] || (window['litElementVersions'] = []))
        .push('2.4.0');
    /**
     * Sentinal value used to avoid calling lit-html's render function when
     * subclasses do not implement `render`
     */
    const renderNotImplemented = {};
    /**
     * Base element class that manages element properties and attributes, and
     * renders a lit-html template.
     *
     * To define a component, subclass `LitElement` and implement a
     * `render` method to provide the component's template. Define properties
     * using the [[`properties`]] property or the [[`property`]] decorator.
     */
    class LitElement extends UpdatingElement {
        /**
         * Return the array of styles to apply to the element.
         * Override this method to integrate into a style management system.
         *
         * @nocollapse
         */
        static getStyles() {
            return this.styles;
        }
        /** @nocollapse */
        static _getUniqueStyles() {
            // Only gather styles once per class
            if (this.hasOwnProperty(JSCompiler_renameProperty('_styles', this))) {
                return;
            }
            // Take care not to call `this.getStyles()` multiple times since this
            // generates new CSSResults each time.
            // TODO(sorvell): Since we do not cache CSSResults by input, any
            // shared styles will generate new stylesheet objects, which is wasteful.
            // This should be addressed when a browser ships constructable
            // stylesheets.
            const userStyles = this.getStyles();
            if (Array.isArray(userStyles)) {
                // De-duplicate styles preserving the _last_ instance in the set.
                // This is a performance optimization to avoid duplicated styles that can
                // occur especially when composing via subclassing.
                // The last item is kept to try to preserve the cascade order with the
                // assumption that it's most important that last added styles override
                // previous styles.
                const addStyles = (styles, set) => styles.reduceRight((set, s) => 
                // Note: On IE set.add() does not return the set
                Array.isArray(s) ? addStyles(s, set) : (set.add(s), set), set);
                // Array.from does not work on Set in IE, otherwise return
                // Array.from(addStyles(userStyles, new Set<CSSResult>())).reverse()
                const set = addStyles(userStyles, new Set());
                const styles = [];
                set.forEach((v) => styles.unshift(v));
                this._styles = styles;
            }
            else {
                this._styles = userStyles === undefined ? [] : [userStyles];
            }
            // Ensure that there are no invalid CSSStyleSheet instances here. They are
            // invalid in two conditions.
            // (1) the sheet is non-constructible (`sheet` of a HTMLStyleElement), but
            //     this is impossible to check except via .replaceSync or use
            // (2) the ShadyCSS polyfill is enabled (:. supportsAdoptingStyleSheets is
            //     false)
            this._styles = this._styles.map((s) => {
                if (s instanceof CSSStyleSheet && !supportsAdoptingStyleSheets) {
                    // Flatten the cssText from the passed constructible stylesheet (or
                    // undetectable non-constructible stylesheet). The user might have
                    // expected to update their stylesheets over time, but the alternative
                    // is a crash.
                    const cssText = Array.prototype.slice.call(s.cssRules)
                        .reduce((css, rule) => css + rule.cssText, '');
                    return unsafeCSS(cssText);
                }
                return s;
            });
        }
        /**
         * Performs element initialization. By default this calls
         * [[`createRenderRoot`]] to create the element [[`renderRoot`]] node and
         * captures any pre-set values for registered properties.
         */
        initialize() {
            super.initialize();
            this.constructor._getUniqueStyles();
            this.renderRoot = this.createRenderRoot();
            // Note, if renderRoot is not a shadowRoot, styles would/could apply to the
            // element's getRootNode(). While this could be done, we're choosing not to
            // support this now since it would require different logic around de-duping.
            if (window.ShadowRoot && this.renderRoot instanceof window.ShadowRoot) {
                this.adoptStyles();
            }
        }
        /**
         * Returns the node into which the element should render and by default
         * creates and returns an open shadowRoot. Implement to customize where the
         * element's DOM is rendered. For example, to render into the element's
         * childNodes, return `this`.
         * @returns {Element|DocumentFragment} Returns a node into which to render.
         */
        createRenderRoot() {
            return this.attachShadow({ mode: 'open' });
        }
        /**
         * Applies styling to the element shadowRoot using the [[`styles`]]
         * property. Styling will apply using `shadowRoot.adoptedStyleSheets` where
         * available and will fallback otherwise. When Shadow DOM is polyfilled,
         * ShadyCSS scopes styles and adds them to the document. When Shadow DOM
         * is available but `adoptedStyleSheets` is not, styles are appended to the
         * end of the `shadowRoot` to [mimic spec
         * behavior](https://wicg.github.io/construct-stylesheets/#using-constructed-stylesheets).
         */
        adoptStyles() {
            const styles = this.constructor._styles;
            if (styles.length === 0) {
                return;
            }
            // There are three separate cases here based on Shadow DOM support.
            // (1) shadowRoot polyfilled: use ShadyCSS
            // (2) shadowRoot.adoptedStyleSheets available: use it
            // (3) shadowRoot.adoptedStyleSheets polyfilled: append styles after
            // rendering
            if (window.ShadyCSS !== undefined && !window.ShadyCSS.nativeShadow) {
                window.ShadyCSS.ScopingShim.prepareAdoptedCssText(styles.map((s) => s.cssText), this.localName);
            }
            else if (supportsAdoptingStyleSheets) {
                this.renderRoot.adoptedStyleSheets =
                    styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
            }
            else {
                // This must be done after rendering so the actual style insertion is done
                // in `update`.
                this._needsShimAdoptedStyleSheets = true;
            }
        }
        connectedCallback() {
            super.connectedCallback();
            // Note, first update/render handles styleElement so we only call this if
            // connected after first update.
            if (this.hasUpdated && window.ShadyCSS !== undefined) {
                window.ShadyCSS.styleElement(this);
            }
        }
        /**
         * Updates the element. This method reflects property values to attributes
         * and calls `render` to render DOM via lit-html. Setting properties inside
         * this method will *not* trigger another update.
         * @param _changedProperties Map of changed properties with old values
         */
        update(changedProperties) {
            // Setting properties in `render` should not trigger an update. Since
            // updates are allowed after super.update, it's important to call `render`
            // before that.
            const templateResult = this.render();
            super.update(changedProperties);
            // If render is not implemented by the component, don't call lit-html render
            if (templateResult !== renderNotImplemented) {
                this.constructor
                    .render(templateResult, this.renderRoot, { scopeName: this.localName, eventContext: this });
            }
            // When native Shadow DOM is used but adoptedStyles are not supported,
            // insert styling after rendering to ensure adoptedStyles have highest
            // priority.
            if (this._needsShimAdoptedStyleSheets) {
                this._needsShimAdoptedStyleSheets = false;
                this.constructor._styles.forEach((s) => {
                    const style = document.createElement('style');
                    style.textContent = s.cssText;
                    this.renderRoot.appendChild(style);
                });
            }
        }
        /**
         * Invoked on each update to perform rendering tasks. This method may return
         * any value renderable by lit-html's `NodePart` - typically a
         * `TemplateResult`. Setting properties inside this method will *not* trigger
         * the element to update.
         */
        render() {
            return renderNotImplemented;
        }
    }
    /**
     * Ensure this class is marked as `finalized` as an optimization ensuring
     * it will not needlessly try to `finalize`.
     *
     * Note this property name is a string to prevent breaking Closure JS Compiler
     * optimizations. See updating-element.ts for more information.
     */
    LitElement['finalized'] = true;
    /**
     * Reference to the underlying library method used to render the element's
     * DOM. By default, points to the `render` method from lit-html's shady-render
     * module.
     *
     * **Most users will never need to touch this property.**
     *
     * This  property should not be confused with the `render` instance method,
     * which should be overridden to define a template for the element.
     *
     * Advanced users creating a new base class based on LitElement can override
     * this property to point to a custom render method with a signature that
     * matches [shady-render's `render`
     * method](https://lit-html.polymer-project.org/api/modules/shady_render.html#render).
     *
     * @nocollapse
     */
    LitElement.render = render$1;

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style = css `.mdc-top-app-bar{background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee);color:#fff;display:flex;position:fixed;flex-direction:column;justify-content:space-between;box-sizing:border-box;width:100%;z-index:4}.mdc-top-app-bar .mdc-top-app-bar__action-item,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon{color:#fff;color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item::before,.mdc-top-app-bar .mdc-top-app-bar__action-item::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon::after{background-color:#fff;background-color:var(--mdc-theme-on-primary, #fff)}.mdc-top-app-bar .mdc-top-app-bar__action-item:hover::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:hover::before{opacity:.08}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):focus::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded--background-focused::before,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.24}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded)::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-top-app-bar .mdc-top-app-bar__action-item:not(.mdc-ripple-upgraded):active::after,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.24}.mdc-top-app-bar .mdc-top-app-bar__action-item.mdc-ripple-upgraded,.mdc-top-app-bar .mdc-top-app-bar__navigation-icon.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.24}.mdc-top-app-bar__row{display:flex;position:relative;box-sizing:border-box;width:100%;height:64px}.mdc-top-app-bar__section{display:inline-flex;flex:1 1 auto;align-items:center;min-width:0;padding:8px 12px;z-index:1}.mdc-top-app-bar__section--align-start{justify-content:flex-start;order:-1}.mdc-top-app-bar__section--align-end{justify-content:flex-end;order:1}.mdc-top-app-bar__title{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-headline6-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1.25rem;font-size:var(--mdc-typography-headline6-font-size, 1.25rem);line-height:2rem;line-height:var(--mdc-typography-headline6-line-height, 2rem);font-weight:500;font-weight:var(--mdc-typography-headline6-font-weight, 500);letter-spacing:0.0125em;letter-spacing:var(--mdc-typography-headline6-letter-spacing, 0.0125em);text-decoration:inherit;text-decoration:var(--mdc-typography-headline6-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-headline6-text-transform, inherit);padding-left:20px;padding-right:0;text-overflow:ellipsis;white-space:nowrap;overflow:hidden;z-index:1}[dir=rtl] .mdc-top-app-bar__title,.mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--short-collapsed{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:24px;border-bottom-left-radius:0}[dir=rtl] .mdc-top-app-bar--short-collapsed,.mdc-top-app-bar--short-collapsed[dir=rtl]{border-top-left-radius:0;border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:24px}.mdc-top-app-bar--short{top:0;right:auto;left:0;width:100%;transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}[dir=rtl] .mdc-top-app-bar--short,.mdc-top-app-bar--short[dir=rtl]{right:0;left:auto}.mdc-top-app-bar--short .mdc-top-app-bar__row{height:56px}.mdc-top-app-bar--short .mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short .mdc-top-app-bar__title{transition:opacity 200ms cubic-bezier(0.4, 0, 0.2, 1);opacity:1}.mdc-top-app-bar--short-collapsed{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);width:56px;transition:width 300ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__title{display:none}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__action-item{transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item{width:112px}.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed.mdc-top-app-bar--short-has-action-item .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--dense .mdc-top-app-bar__row{height:48px}.mdc-top-app-bar--dense .mdc-top-app-bar__section{padding:0 4px}.mdc-top-app-bar--dense .mdc-top-app-bar__title{padding-left:12px;padding-right:0}[dir=rtl] .mdc-top-app-bar--dense .mdc-top-app-bar__title,.mdc-top-app-bar--dense .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:12px}.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:128px}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{align-self:flex-end;padding-bottom:2px}.mdc-top-app-bar--prominent .mdc-top-app-bar__action-item,.mdc-top-app-bar--prominent .mdc-top-app-bar__navigation-icon{align-self:flex-start}.mdc-top-app-bar--fixed{transition:box-shadow 200ms linear}.mdc-top-app-bar--fixed-scrolled{box-shadow:0px 2px 4px -1px rgba(0, 0, 0, 0.2),0px 4px 5px 0px rgba(0, 0, 0, 0.14),0px 1px 10px 0px rgba(0,0,0,.12);transition:box-shadow 200ms linear}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__row{height:96px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section{padding:0 12px}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-left:20px;padding-right:0;padding-bottom:9px}[dir=rtl] .mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title,.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__title[dir=rtl]{padding-left:0;padding-right:20px}.mdc-top-app-bar--fixed-adjust{padding-top:64px}.mdc-top-app-bar--dense-fixed-adjust{padding-top:48px}.mdc-top-app-bar--short-fixed-adjust{padding-top:56px}.mdc-top-app-bar--prominent-fixed-adjust{padding-top:128px}.mdc-top-app-bar--dense-prominent-fixed-adjust{padding-top:96px}@media(max-width: 599px){.mdc-top-app-bar__row{height:56px}.mdc-top-app-bar__section{padding:4px}.mdc-top-app-bar--short{transition:width 200ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed{transition:width 250ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end{padding-left:0;padding-right:12px}[dir=rtl] .mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end,.mdc-top-app-bar--short-collapsed .mdc-top-app-bar__section--align-end[dir=rtl]{padding-left:12px;padding-right:0}.mdc-top-app-bar--prominent .mdc-top-app-bar__title{padding-bottom:6px}.mdc-top-app-bar--fixed-adjust{padding-top:56px}}:host{display:block}.mdc-top-app-bar{color:#fff;color:var(--mdc-theme-on-primary, #fff);width:100%;width:var(--mdc-top-app-bar-width, 100%)}.mdc-top-app-bar--prominent #navigation ::slotted(*),.mdc-top-app-bar--prominent #actions ::slotted(*){align-self:flex-start}#navigation ::slotted(*),#actions ::slotted(*){--mdc-icon-button-ripple-opacity: 0.24}.mdc-top-app-bar--short-collapsed #actions ::slotted(*){transition:padding 150ms cubic-bezier(0.4, 0, 0.2, 1)}.mdc-top-app-bar__section--align-center{justify-content:center}.mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.center-title .mdc-top-app-bar__section--align-start,.center-title .mdc-top-app-bar__section--align-end{flex-basis:0}.mdc-top-app-bar--dense.mdc-top-app-bar--prominent .mdc-top-app-bar__section--align-center .mdc-top-app-bar__title{padding-left:0;padding-right:0}.mdc-top-app-bar--fixed-scrolled{box-shadow:var(--mdc-top-app-bar-fixed-box-shadow, 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12))}`;

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses = {
        FIXED_CLASS: 'mdc-top-app-bar--fixed',
        FIXED_SCROLLED_CLASS: 'mdc-top-app-bar--fixed-scrolled',
        SHORT_CLASS: 'mdc-top-app-bar--short',
        SHORT_COLLAPSED_CLASS: 'mdc-top-app-bar--short-collapsed',
        SHORT_HAS_ACTION_ITEM_CLASS: 'mdc-top-app-bar--short-has-action-item',
    };
    var numbers = {
        DEBOUNCE_THROTTLE_RESIZE_TIME_MS: 100,
        MAX_TOP_APP_BAR_HEIGHT: 128,
    };
    var strings = {
        ACTION_ITEM_SELECTOR: '.mdc-top-app-bar__action-item',
        NAVIGATION_EVENT: 'MDCTopAppBar:nav',
        NAVIGATION_ICON_SELECTOR: '.mdc-top-app-bar__navigation-icon',
        ROOT_SELECTOR: '.mdc-top-app-bar',
        TITLE_SELECTOR: '.mdc-top-app-bar__title',
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFoundation = /** @class */ (function () {
        function MDCFoundation(adapter) {
            if (adapter === void 0) { adapter = {}; }
            this.adapter = adapter;
        }
        Object.defineProperty(MDCFoundation, "cssClasses", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports every
                // CSS class the foundation class needs as a property. e.g. {ACTIVE: 'mdc-component--active'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "strings", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // semantic strings as constants. e.g. {ARIA_ROLE: 'tablist'}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "numbers", {
            get: function () {
                // Classes extending MDCFoundation should implement this method to return an object which exports all
                // of its semantic numbers as constants. e.g. {ANIMATION_DELAY_MS: 350}
                return {};
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCFoundation, "defaultAdapter", {
            get: function () {
                // Classes extending MDCFoundation may choose to implement this getter in order to provide a convenient
                // way of viewing the necessary methods of an adapter. In the future, this could also be used for adapter
                // validation.
                return {};
            },
            enumerable: true,
            configurable: true
        });
        MDCFoundation.prototype.init = function () {
            // Subclasses should override this method to perform initialization routines (registering events, etc.)
        };
        MDCFoundation.prototype.destroy = function () {
            // Subclasses should override this method to perform de-initialization routines (de-registering events, etc.)
        };
        return MDCFoundation;
    }());

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTopAppBarBaseFoundation = /** @class */ (function (_super) {
        __extends(MDCTopAppBarBaseFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCTopAppBarBaseFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCTopAppBarBaseFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCTopAppBarBaseFoundation, "strings", {
            get: function () {
                return strings;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "cssClasses", {
            get: function () {
                return cssClasses;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "numbers", {
            get: function () {
                return numbers;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTopAppBarBaseFoundation, "defaultAdapter", {
            /**
             * See {@link MDCTopAppBarAdapter} for typing information on parameters and return types.
             */
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setStyle: function () { return undefined; },
                    getTopAppBarHeight: function () { return 0; },
                    notifyNavigationIconClicked: function () { return undefined; },
                    getViewportScrollY: function () { return 0; },
                    getTotalActionItems: function () { return 0; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        /** Other variants of TopAppBar foundation overrides this method */
        MDCTopAppBarBaseFoundation.prototype.handleTargetScroll = function () { }; // tslint:disable-line:no-empty
        /** Other variants of TopAppBar foundation overrides this method */
        MDCTopAppBarBaseFoundation.prototype.handleWindowResize = function () { }; // tslint:disable-line:no-empty
        MDCTopAppBarBaseFoundation.prototype.handleNavigationClick = function () {
            this.adapter.notifyNavigationIconClicked();
        };
        return MDCTopAppBarBaseFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var INITIAL_VALUE = 0;
    var MDCTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCTopAppBarFoundation, _super);
        /* istanbul ignore next: optional argument is not a branch statement */
        function MDCTopAppBarFoundation(adapter) {
            var _this = _super.call(this, adapter) || this;
            /**
             * Indicates if the top app bar was docked in the previous scroll handler iteration.
             */
            _this.wasDocked_ = true;
            /**
             * Indicates if the top app bar is docked in the fully shown position.
             */
            _this.isDockedShowing_ = true;
            /**
             * Variable for current scroll position of the top app bar
             */
            _this.currentAppBarOffsetTop_ = 0;
            /**
             * Used to prevent the top app bar from being scrolled out of view during resize events
             */
            _this.isCurrentlyBeingResized_ = false;
            /**
             * The timeout that's used to throttle the resize events
             */
            _this.resizeThrottleId_ = INITIAL_VALUE;
            /**
             * The timeout that's used to debounce toggling the isCurrentlyBeingResized_ variable after a resize
             */
            _this.resizeDebounceId_ = INITIAL_VALUE;
            _this.lastScrollPosition_ = _this.adapter.getViewportScrollY();
            _this.topAppBarHeight_ = _this.adapter.getTopAppBarHeight();
            return _this;
        }
        MDCTopAppBarFoundation.prototype.destroy = function () {
            _super.prototype.destroy.call(this);
            this.adapter.setStyle('top', '');
        };
        /**
         * Scroll handler for the default scroll behavior of the top app bar.
         * @override
         */
        MDCTopAppBarFoundation.prototype.handleTargetScroll = function () {
            var currentScrollPosition = Math.max(this.adapter.getViewportScrollY(), 0);
            var diff = currentScrollPosition - this.lastScrollPosition_;
            this.lastScrollPosition_ = currentScrollPosition;
            // If the window is being resized the lastScrollPosition_ needs to be updated but the
            // current scroll of the top app bar should stay in the same position.
            if (!this.isCurrentlyBeingResized_) {
                this.currentAppBarOffsetTop_ -= diff;
                if (this.currentAppBarOffsetTop_ > 0) {
                    this.currentAppBarOffsetTop_ = 0;
                }
                else if (Math.abs(this.currentAppBarOffsetTop_) > this.topAppBarHeight_) {
                    this.currentAppBarOffsetTop_ = -this.topAppBarHeight_;
                }
                this.moveTopAppBar_();
            }
        };
        /**
         * Top app bar resize handler that throttle/debounce functions that execute updates.
         * @override
         */
        MDCTopAppBarFoundation.prototype.handleWindowResize = function () {
            var _this = this;
            // Throttle resize events 10 p/s
            if (!this.resizeThrottleId_) {
                this.resizeThrottleId_ = setTimeout(function () {
                    _this.resizeThrottleId_ = INITIAL_VALUE;
                    _this.throttledResizeHandler_();
                }, numbers.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
            }
            this.isCurrentlyBeingResized_ = true;
            if (this.resizeDebounceId_) {
                clearTimeout(this.resizeDebounceId_);
            }
            this.resizeDebounceId_ = setTimeout(function () {
                _this.handleTargetScroll();
                _this.isCurrentlyBeingResized_ = false;
                _this.resizeDebounceId_ = INITIAL_VALUE;
            }, numbers.DEBOUNCE_THROTTLE_RESIZE_TIME_MS);
        };
        /**
         * Function to determine if the DOM needs to update.
         */
        MDCTopAppBarFoundation.prototype.checkForUpdate_ = function () {
            var offscreenBoundaryTop = -this.topAppBarHeight_;
            var hasAnyPixelsOffscreen = this.currentAppBarOffsetTop_ < 0;
            var hasAnyPixelsOnscreen = this.currentAppBarOffsetTop_ > offscreenBoundaryTop;
            var partiallyShowing = hasAnyPixelsOffscreen && hasAnyPixelsOnscreen;
            // If it's partially showing, it can't be docked.
            if (partiallyShowing) {
                this.wasDocked_ = false;
            }
            else {
                // Not previously docked and not partially showing, it's now docked.
                if (!this.wasDocked_) {
                    this.wasDocked_ = true;
                    return true;
                }
                else if (this.isDockedShowing_ !== hasAnyPixelsOnscreen) {
                    this.isDockedShowing_ = hasAnyPixelsOnscreen;
                    return true;
                }
            }
            return partiallyShowing;
        };
        /**
         * Function to move the top app bar if needed.
         */
        MDCTopAppBarFoundation.prototype.moveTopAppBar_ = function () {
            if (this.checkForUpdate_()) {
                // Once the top app bar is fully hidden we use the max potential top app bar height as our offset
                // so the top app bar doesn't show if the window resizes and the new height > the old height.
                var offset = this.currentAppBarOffsetTop_;
                if (Math.abs(offset) >= this.topAppBarHeight_) {
                    offset = -numbers.MAX_TOP_APP_BAR_HEIGHT;
                }
                this.adapter.setStyle('top', offset + 'px');
            }
        };
        /**
         * Throttled function that updates the top app bar scrolled values if the
         * top app bar height changes.
         */
        MDCTopAppBarFoundation.prototype.throttledResizeHandler_ = function () {
            var currentHeight = this.adapter.getTopAppBarHeight();
            if (this.topAppBarHeight_ !== currentHeight) {
                this.wasDocked_ = false;
                // Since the top app bar has a different height depending on the screen width, this
                // will ensure that the top app bar remains in the correct location if
                // completely hidden and a resize makes the top app bar a different height.
                this.currentAppBarOffsetTop_ -= this.topAppBarHeight_ - currentHeight;
                this.topAppBarHeight_ = currentHeight;
            }
            this.handleTargetScroll();
        };
        return MDCTopAppBarFoundation;
    }(MDCTopAppBarBaseFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    function matches(element, selector) {
        var nativeMatches = element.matches
            || element.webkitMatchesSelector
            || element.msMatchesSelector;
        return nativeMatches.call(element, selector);
    }

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    /**
     * Determines whether a node is an element.
     *
     * @param node Node to check
     */
    const isNodeElement = (node) => {
        return node.nodeType === Node.ELEMENT_NODE;
    };
    function findAssignedElement(slot, selector) {
        for (const node of slot.assignedNodes({ flatten: true })) {
            if (isNodeElement(node)) {
                const el = node;
                if (matches(el, selector)) {
                    return el;
                }
            }
        }
        return null;
    }
    function addHasRemoveClass(element) {
        return {
            addClass: (className) => {
                element.classList.add(className);
            },
            removeClass: (className) => {
                element.classList.remove(className);
            },
            hasClass: (className) => element.classList.contains(className),
        };
    }
    let supportsPassive = false;
    const fn = () => { };
    const optionsBlock = {
        get passive() {
            supportsPassive = true;
            return false;
        }
    };
    document.addEventListener('x', fn, optionsBlock);
    document.removeEventListener('x', fn);
    /**
     * Do event listeners suport the `passive` option?
     */
    const supportsPassiveEventListener = supportsPassive;
    const deepActiveElementPath = (doc = window.document) => {
        let activeElement = doc.activeElement;
        const path = [];
        if (!activeElement) {
            return path;
        }
        while (activeElement) {
            path.push(activeElement);
            if (activeElement.shadowRoot) {
                activeElement = activeElement.shadowRoot.activeElement;
            }
            else {
                break;
            }
        }
        return path;
    };
    const doesElementContainFocus = (element) => {
        const activePath = deepActiveElementPath();
        if (!activePath.length) {
            return false;
        }
        const deepActiveElement = activePath[activePath.length - 1];
        const focusEv = new Event('check-if-focused', { bubbles: true, composed: true });
        let composedPath = [];
        const listener = (ev) => {
            composedPath = ev.composedPath();
        };
        document.body.addEventListener('check-if-focused', listener);
        deepActiveElement.dispatchEvent(focusEv);
        document.body.removeEventListener('check-if-focused', listener);
        return composedPath.indexOf(element) !== -1;
    };

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    /** @soyCompatible */
    class BaseElement extends LitElement {
        /**
         * Create and attach the MDC Foundation to the instance
         */
        createFoundation() {
            if (this.mdcFoundation !== undefined) {
                this.mdcFoundation.destroy();
            }
            if (this.mdcFoundationClass) {
                this.mdcFoundation = new this.mdcFoundationClass(this.createAdapter());
                this.mdcFoundation.init();
            }
        }
        firstUpdated() {
            this.createFoundation();
        }
    }

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    // IE11 doesn't support classList on SVG elements, so we emulate it with a Set
    class ClassList {
        constructor(element) {
            this.classes = new Set();
            this.changed = false;
            this.element = element;
            const classList = (element.getAttribute('class') || '').split(/\s+/);
            for (const cls of classList) {
                this.classes.add(cls);
            }
        }
        add(cls) {
            this.classes.add(cls);
            this.changed = true;
        }
        remove(cls) {
            this.classes.delete(cls);
            this.changed = true;
        }
        commit() {
            if (this.changed) {
                let classString = '';
                this.classes.forEach((cls) => classString += cls + ' ');
                this.element.setAttribute('class', classString);
            }
        }
    }
    /**
     * Stores the ClassInfo object applied to a given AttributePart.
     * Used to unset existing values when a new ClassInfo object is applied.
     */
    const previousClassesCache = new WeakMap();
    /**
     * A directive that applies CSS classes. This must be used in the `class`
     * attribute and must be the only part used in the attribute. It takes each
     * property in the `classInfo` argument and adds the property name to the
     * element's `class` if the property value is truthy; if the property value is
     * falsey, the property name is removed from the element's `class`. For example
     * `{foo: bar}` applies the class `foo` if the value of `bar` is truthy.
     * @param classInfo {ClassInfo}
     */
    const classMap = directive((classInfo) => (part) => {
        if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
            part.committer.name !== 'class' || part.committer.parts.length > 1) {
            throw new Error('The `classMap` directive must be used in the `class` attribute ' +
                'and must be the only part in the attribute.');
        }
        const { committer } = part;
        const { element } = committer;
        let previousClasses = previousClassesCache.get(part);
        if (previousClasses === undefined) {
            // Write static classes once
            // Use setAttribute() because className isn't a string on SVG elements
            element.setAttribute('class', committer.strings.join(' '));
            previousClassesCache.set(part, previousClasses = new Set());
        }
        const classList = (element.classList || new ClassList(element));
        // Remove old classes that no longer apply
        // We use forEach() instead of for-of so that re don't require down-level
        // iteration.
        previousClasses.forEach((name) => {
            if (!(name in classInfo)) {
                classList.remove(name);
                previousClasses.delete(name);
            }
        });
        // Add or remove classes based on their classMap value
        for (const name in classInfo) {
            const value = classInfo[name];
            if (value != previousClasses.has(name)) {
                // We explicitly want a loose truthy check of `value` because it seems
                // more convenient that '' and 0 are skipped.
                if (value) {
                    classList.add(name);
                    previousClasses.add(name);
                }
                else {
                    classList.remove(name);
                    previousClasses.delete(name);
                }
            }
        }
        if (typeof classList.commit === 'function') {
            classList.commit();
        }
    });

    const passiveEventOptionsIfSupported = supportsPassiveEventListener ? { passive: true } : undefined;
    class TopAppBarBaseBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCTopAppBarBaseFoundation;
            this.centerTitle = false;
            this.handleTargetScroll = () => {
                this.mdcFoundation.handleTargetScroll();
            };
            this.handleNavigationClick = () => {
                this.mdcFoundation.handleNavigationClick();
            };
        }
        get scrollTarget() {
            return this._scrollTarget || window;
        }
        set scrollTarget(value) {
            this.unregisterScrollListener();
            const old = this.scrollTarget;
            this._scrollTarget = value;
            this.updateRootPosition();
            this.requestUpdate('scrollTarget', old);
            this.registerScrollListener();
        }
        updateRootPosition() {
            if (this.mdcRoot) {
                const windowScroller = this.scrollTarget === window;
                // we add support for top-app-bar's tied to an element scroller.
                this.mdcRoot.style.position = windowScroller ? '' : 'absolute';
            }
        }
        render() {
            // clang-format off
            let title = html `<span class="mdc-top-app-bar__title"><slot name="title"></slot></span>`;
            if (this.centerTitle) {
                title = html `<section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-center">${title}</section>`;
            }
            // clang-format on
            return html `
      <header class="mdc-top-app-bar ${classMap(this.barClasses())}">
      <div class="mdc-top-app-bar__row">
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-start" id="navigation">
          <slot name="navigationIcon"
            @click=${this.handleNavigationClick}></slot>
          ${this.centerTitle ? null : title}
        </section>
        ${this.centerTitle ? title : null}
        <section class="mdc-top-app-bar__section mdc-top-app-bar__section--align-end" id="actions" role="toolbar">
          <slot name="actionItems"></slot>
        </section>
      </div>
    </header>
    <div class="${classMap(this.contentClasses())}">
      <slot></slot>
    </div>
    `;
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setStyle: (property, value) => this.mdcRoot.style.setProperty(property, value), getTopAppBarHeight: () => this.mdcRoot.clientHeight, notifyNavigationIconClicked: () => {
                    this.dispatchEvent(new Event(strings.NAVIGATION_EVENT, { bubbles: true, cancelable: true }));
                }, getViewportScrollY: () => this.scrollTarget instanceof Window ?
                    this.scrollTarget.pageYOffset :
                    this.scrollTarget.scrollTop, getTotalActionItems: () => this._actionItemsSlot
                    .assignedNodes({ flatten: true })
                    .length });
        }
        registerListeners() {
            this.registerScrollListener();
        }
        unregisterListeners() {
            this.unregisterScrollListener();
        }
        registerScrollListener() {
            this.scrollTarget.addEventListener('scroll', this.handleTargetScroll, passiveEventOptionsIfSupported);
        }
        unregisterScrollListener() {
            this.scrollTarget.removeEventListener('scroll', this.handleTargetScroll);
        }
        firstUpdated() {
            super.firstUpdated();
            this.updateRootPosition();
            this.registerListeners();
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            this.unregisterListeners();
        }
    }
    __decorate([
        query('.mdc-top-app-bar')
    ], TopAppBarBaseBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('slot[name="actionItems"]')
    ], TopAppBarBaseBase.prototype, "_actionItemsSlot", void 0);
    __decorate([
        property({ type: Boolean })
    ], TopAppBarBaseBase.prototype, "centerTitle", void 0);
    __decorate([
        property()
    ], TopAppBarBaseBase.prototype, "scrollTarget", null);

    class TopAppBarBase extends TopAppBarBaseBase {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCTopAppBarFoundation;
            this.prominent = false;
            this.dense = false;
            this.handleResize = () => {
                this.mdcFoundation.handleWindowResize();
            };
        }
        barClasses() {
            return {
                'mdc-top-app-bar--dense': this.dense,
                'mdc-top-app-bar--prominent': this.prominent,
                'center-title': this.centerTitle,
            };
        }
        contentClasses() {
            return {
                'mdc-top-app-bar--fixed-adjust': !this.dense && !this.prominent,
                'mdc-top-app-bar--dense-fixed-adjust': this.dense && !this.prominent,
                'mdc-top-app-bar--prominent-fixed-adjust': !this.dense && this.prominent,
                'mdc-top-app-bar--dense-prominent-fixed-adjust': this.dense && this.prominent,
            };
        }
        registerListeners() {
            super.registerListeners();
            window.addEventListener('resize', this.handleResize, passiveEventOptionsIfSupported);
        }
        unregisterListeners() {
            super.unregisterListeners();
            window.removeEventListener('resize', this.handleResize);
        }
    }
    __decorate([
        property({ type: Boolean, reflect: true })
    ], TopAppBarBase.prototype, "prominent", void 0);
    __decorate([
        property({ type: Boolean, reflect: true })
    ], TopAppBarBase.prototype, "dense", void 0);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCFixedTopAppBarFoundation = /** @class */ (function (_super) {
        __extends(MDCFixedTopAppBarFoundation, _super);
        function MDCFixedTopAppBarFoundation() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            /**
             * State variable for the previous scroll iteration top app bar state
             */
            _this.wasScrolled_ = false;
            return _this;
        }
        /**
         * Scroll handler for applying/removing the modifier class on the fixed top app bar.
         * @override
         */
        MDCFixedTopAppBarFoundation.prototype.handleTargetScroll = function () {
            var currentScroll = this.adapter.getViewportScrollY();
            if (currentScroll <= 0) {
                if (this.wasScrolled_) {
                    this.adapter.removeClass(cssClasses.FIXED_SCROLLED_CLASS);
                    this.wasScrolled_ = false;
                }
            }
            else {
                if (!this.wasScrolled_) {
                    this.adapter.addClass(cssClasses.FIXED_SCROLLED_CLASS);
                    this.wasScrolled_ = true;
                }
            }
        };
        return MDCFixedTopAppBarFoundation;
    }(MDCTopAppBarFoundation));

    /**
    @license
    Copyright 2019 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    class TopAppBarFixedBase extends TopAppBarBase {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCFixedTopAppBarFoundation;
        }
        barClasses() {
            return Object.assign(Object.assign({}, super.barClasses()), { 'mdc-top-app-bar--fixed': true });
        }
        registerListeners() {
            this.scrollTarget.addEventListener('scroll', this.handleTargetScroll, passiveEventOptionsIfSupported);
        }
        unregisterListeners() {
            this.scrollTarget.removeEventListener('scroll', this.handleTargetScroll);
        }
    }

    let TopAppBarFixed = class TopAppBarFixed extends TopAppBarFixedBase {
    };
    TopAppBarFixed.styles = style;
    TopAppBarFixed = __decorate([
        customElement('mwc-top-app-bar-fixed')
    ], TopAppBarFixed);

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$1 = {
        // Ripple is a special case where the "root" component is really a "mixin" of sorts,
        // given that it's an 'upgrade' to an existing component. That being said it is the root
        // CSS class that all other CSS classes derive from.
        BG_FOCUSED: 'mdc-ripple-upgraded--background-focused',
        FG_ACTIVATION: 'mdc-ripple-upgraded--foreground-activation',
        FG_DEACTIVATION: 'mdc-ripple-upgraded--foreground-deactivation',
        ROOT: 'mdc-ripple-upgraded',
        UNBOUNDED: 'mdc-ripple-upgraded--unbounded',
    };
    var strings$1 = {
        VAR_FG_SCALE: '--mdc-ripple-fg-scale',
        VAR_FG_SIZE: '--mdc-ripple-fg-size',
        VAR_FG_TRANSLATE_END: '--mdc-ripple-fg-translate-end',
        VAR_FG_TRANSLATE_START: '--mdc-ripple-fg-translate-start',
        VAR_LEFT: '--mdc-ripple-left',
        VAR_TOP: '--mdc-ripple-top',
    };
    var numbers$1 = {
        DEACTIVATION_TIMEOUT_MS: 225,
        FG_DEACTIVATION_MS: 150,
        INITIAL_ORIGIN_SCALE: 0.6,
        PADDING: 10,
        TAP_DELAY_MS: 300,
    };

    /**
     * Stores result from supportsCssVariables to avoid redundant processing to
     * detect CSS custom variable support.
     */
    var supportsCssVariables_;
    function supportsCssVariables(windowObj, forceRefresh) {
        if (forceRefresh === void 0) { forceRefresh = false; }
        var CSS = windowObj.CSS;
        var supportsCssVars = supportsCssVariables_;
        if (typeof supportsCssVariables_ === 'boolean' && !forceRefresh) {
            return supportsCssVariables_;
        }
        var supportsFunctionPresent = CSS && typeof CSS.supports === 'function';
        if (!supportsFunctionPresent) {
            return false;
        }
        var explicitlySupportsCssVars = CSS.supports('--css-vars', 'yes');
        // See: https://bugs.webkit.org/show_bug.cgi?id=154669
        // See: README section on Safari
        var weAreFeatureDetectingSafari10plus = (CSS.supports('(--css-vars: yes)') &&
            CSS.supports('color', '#00000000'));
        supportsCssVars =
            explicitlySupportsCssVars || weAreFeatureDetectingSafari10plus;
        if (!forceRefresh) {
            supportsCssVariables_ = supportsCssVars;
        }
        return supportsCssVars;
    }
    function getNormalizedEventCoords(evt, pageOffset, clientRect) {
        if (!evt) {
            return { x: 0, y: 0 };
        }
        var x = pageOffset.x, y = pageOffset.y;
        var documentX = x + clientRect.left;
        var documentY = y + clientRect.top;
        var normalizedX;
        var normalizedY;
        // Determine touch point relative to the ripple container.
        if (evt.type === 'touchstart') {
            var touchEvent = evt;
            normalizedX = touchEvent.changedTouches[0].pageX - documentX;
            normalizedY = touchEvent.changedTouches[0].pageY - documentY;
        }
        else {
            var mouseEvent = evt;
            normalizedX = mouseEvent.pageX - documentX;
            normalizedY = mouseEvent.pageY - documentY;
        }
        return { x: normalizedX, y: normalizedY };
    }

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    // Activation events registered on the root element of each instance for activation
    var ACTIVATION_EVENT_TYPES = [
        'touchstart', 'pointerdown', 'mousedown', 'keydown',
    ];
    // Deactivation events registered on documentElement when a pointer-related down event occurs
    var POINTER_DEACTIVATION_EVENT_TYPES = [
        'touchend', 'pointerup', 'mouseup', 'contextmenu',
    ];
    // simultaneous nested activations
    var activatedTargets = [];
    var MDCRippleFoundation = /** @class */ (function (_super) {
        __extends(MDCRippleFoundation, _super);
        function MDCRippleFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCRippleFoundation.defaultAdapter), adapter)) || this;
            _this.activationAnimationHasEnded_ = false;
            _this.activationTimer_ = 0;
            _this.fgDeactivationRemovalTimer_ = 0;
            _this.fgScale_ = '0';
            _this.frame_ = { width: 0, height: 0 };
            _this.initialSize_ = 0;
            _this.layoutFrame_ = 0;
            _this.maxRadius_ = 0;
            _this.unboundedCoords_ = { left: 0, top: 0 };
            _this.activationState_ = _this.defaultActivationState_();
            _this.activationTimerCallback_ = function () {
                _this.activationAnimationHasEnded_ = true;
                _this.runDeactivationUXLogicIfReady_();
            };
            _this.activateHandler_ = function (e) { return _this.activate_(e); };
            _this.deactivateHandler_ = function () { return _this.deactivate_(); };
            _this.focusHandler_ = function () { return _this.handleFocus(); };
            _this.blurHandler_ = function () { return _this.handleBlur(); };
            _this.resizeHandler_ = function () { return _this.layout(); };
            return _this;
        }
        Object.defineProperty(MDCRippleFoundation, "cssClasses", {
            get: function () {
                return cssClasses$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "strings", {
            get: function () {
                return strings$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "numbers", {
            get: function () {
                return numbers$1;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRippleFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    browserSupportsCssVars: function () { return true; },
                    computeBoundingRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    containsEventTarget: function () { return true; },
                    deregisterDocumentInteractionHandler: function () { return undefined; },
                    deregisterInteractionHandler: function () { return undefined; },
                    deregisterResizeHandler: function () { return undefined; },
                    getWindowPageOffset: function () { return ({ x: 0, y: 0 }); },
                    isSurfaceActive: function () { return true; },
                    isSurfaceDisabled: function () { return true; },
                    isUnbounded: function () { return true; },
                    registerDocumentInteractionHandler: function () { return undefined; },
                    registerInteractionHandler: function () { return undefined; },
                    registerResizeHandler: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    updateCssVariable: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRippleFoundation.prototype.init = function () {
            var _this = this;
            var supportsPressRipple = this.supportsPressRipple_();
            this.registerRootHandlers_(supportsPressRipple);
            if (supportsPressRipple) {
                var _a = MDCRippleFoundation.cssClasses, ROOT_1 = _a.ROOT, UNBOUNDED_1 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter.addClass(ROOT_1);
                    if (_this.adapter.isUnbounded()) {
                        _this.adapter.addClass(UNBOUNDED_1);
                        // Unbounded ripples need layout logic applied immediately to set coordinates for both shade and ripple
                        _this.layoutInternal_();
                    }
                });
            }
        };
        MDCRippleFoundation.prototype.destroy = function () {
            var _this = this;
            if (this.supportsPressRipple_()) {
                if (this.activationTimer_) {
                    clearTimeout(this.activationTimer_);
                    this.activationTimer_ = 0;
                    this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_ACTIVATION);
                }
                if (this.fgDeactivationRemovalTimer_) {
                    clearTimeout(this.fgDeactivationRemovalTimer_);
                    this.fgDeactivationRemovalTimer_ = 0;
                    this.adapter.removeClass(MDCRippleFoundation.cssClasses.FG_DEACTIVATION);
                }
                var _a = MDCRippleFoundation.cssClasses, ROOT_2 = _a.ROOT, UNBOUNDED_2 = _a.UNBOUNDED;
                requestAnimationFrame(function () {
                    _this.adapter.removeClass(ROOT_2);
                    _this.adapter.removeClass(UNBOUNDED_2);
                    _this.removeCssVars_();
                });
            }
            this.deregisterRootHandlers_();
            this.deregisterDeactivationHandlers_();
        };
        /**
         * @param evt Optional event containing position information.
         */
        MDCRippleFoundation.prototype.activate = function (evt) {
            this.activate_(evt);
        };
        MDCRippleFoundation.prototype.deactivate = function () {
            this.deactivate_();
        };
        MDCRippleFoundation.prototype.layout = function () {
            var _this = this;
            if (this.layoutFrame_) {
                cancelAnimationFrame(this.layoutFrame_);
            }
            this.layoutFrame_ = requestAnimationFrame(function () {
                _this.layoutInternal_();
                _this.layoutFrame_ = 0;
            });
        };
        MDCRippleFoundation.prototype.setUnbounded = function (unbounded) {
            var UNBOUNDED = MDCRippleFoundation.cssClasses.UNBOUNDED;
            if (unbounded) {
                this.adapter.addClass(UNBOUNDED);
            }
            else {
                this.adapter.removeClass(UNBOUNDED);
            }
        };
        MDCRippleFoundation.prototype.handleFocus = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.adapter.addClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
        };
        MDCRippleFoundation.prototype.handleBlur = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.adapter.removeClass(MDCRippleFoundation.cssClasses.BG_FOCUSED); });
        };
        /**
         * We compute this property so that we are not querying information about the client
         * until the point in time where the foundation requests it. This prevents scenarios where
         * client-side feature-detection may happen too early, such as when components are rendered on the server
         * and then initialized at mount time on the client.
         */
        MDCRippleFoundation.prototype.supportsPressRipple_ = function () {
            return this.adapter.browserSupportsCssVars();
        };
        MDCRippleFoundation.prototype.defaultActivationState_ = function () {
            return {
                activationEvent: undefined,
                hasDeactivationUXRun: false,
                isActivated: false,
                isProgrammatic: false,
                wasActivatedByPointer: false,
                wasElementMadeActive: false,
            };
        };
        /**
         * supportsPressRipple Passed from init to save a redundant function call
         */
        MDCRippleFoundation.prototype.registerRootHandlers_ = function (supportsPressRipple) {
            var _this = this;
            if (supportsPressRipple) {
                ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter.registerInteractionHandler(evtType, _this.activateHandler_);
                });
                if (this.adapter.isUnbounded()) {
                    this.adapter.registerResizeHandler(this.resizeHandler_);
                }
            }
            this.adapter.registerInteractionHandler('focus', this.focusHandler_);
            this.adapter.registerInteractionHandler('blur', this.blurHandler_);
        };
        MDCRippleFoundation.prototype.registerDeactivationHandlers_ = function (evt) {
            var _this = this;
            if (evt.type === 'keydown') {
                this.adapter.registerInteractionHandler('keyup', this.deactivateHandler_);
            }
            else {
                POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                    _this.adapter.registerDocumentInteractionHandler(evtType, _this.deactivateHandler_);
                });
            }
        };
        MDCRippleFoundation.prototype.deregisterRootHandlers_ = function () {
            var _this = this;
            ACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter.deregisterInteractionHandler(evtType, _this.activateHandler_);
            });
            this.adapter.deregisterInteractionHandler('focus', this.focusHandler_);
            this.adapter.deregisterInteractionHandler('blur', this.blurHandler_);
            if (this.adapter.isUnbounded()) {
                this.adapter.deregisterResizeHandler(this.resizeHandler_);
            }
        };
        MDCRippleFoundation.prototype.deregisterDeactivationHandlers_ = function () {
            var _this = this;
            this.adapter.deregisterInteractionHandler('keyup', this.deactivateHandler_);
            POINTER_DEACTIVATION_EVENT_TYPES.forEach(function (evtType) {
                _this.adapter.deregisterDocumentInteractionHandler(evtType, _this.deactivateHandler_);
            });
        };
        MDCRippleFoundation.prototype.removeCssVars_ = function () {
            var _this = this;
            var rippleStrings = MDCRippleFoundation.strings;
            var keys = Object.keys(rippleStrings);
            keys.forEach(function (key) {
                if (key.indexOf('VAR_') === 0) {
                    _this.adapter.updateCssVariable(rippleStrings[key], null);
                }
            });
        };
        MDCRippleFoundation.prototype.activate_ = function (evt) {
            var _this = this;
            if (this.adapter.isSurfaceDisabled()) {
                return;
            }
            var activationState = this.activationState_;
            if (activationState.isActivated) {
                return;
            }
            // Avoid reacting to follow-on events fired by touch device after an already-processed user interaction
            var previousActivationEvent = this.previousActivationEvent_;
            var isSameInteraction = previousActivationEvent && evt !== undefined && previousActivationEvent.type !== evt.type;
            if (isSameInteraction) {
                return;
            }
            activationState.isActivated = true;
            activationState.isProgrammatic = evt === undefined;
            activationState.activationEvent = evt;
            activationState.wasActivatedByPointer = activationState.isProgrammatic ? false : evt !== undefined && (evt.type === 'mousedown' || evt.type === 'touchstart' || evt.type === 'pointerdown');
            var hasActivatedChild = evt !== undefined &&
                activatedTargets.length > 0 &&
                activatedTargets.some(function (target) { return _this.adapter.containsEventTarget(target); });
            if (hasActivatedChild) {
                // Immediately reset activation state, while preserving logic that prevents touch follow-on events
                this.resetActivationState_();
                return;
            }
            if (evt !== undefined) {
                activatedTargets.push(evt.target);
                this.registerDeactivationHandlers_(evt);
            }
            activationState.wasElementMadeActive = this.checkElementMadeActive_(evt);
            if (activationState.wasElementMadeActive) {
                this.animateActivation_();
            }
            requestAnimationFrame(function () {
                // Reset array on next frame after the current event has had a chance to bubble to prevent ancestor ripples
                activatedTargets = [];
                if (!activationState.wasElementMadeActive
                    && evt !== undefined
                    && (evt.key === ' ' || evt.keyCode === 32)) {
                    // If space was pressed, try again within an rAF call to detect :active, because different UAs report
                    // active states inconsistently when they're called within event handling code:
                    // - https://bugs.chromium.org/p/chromium/issues/detail?id=635971
                    // - https://bugzilla.mozilla.org/show_bug.cgi?id=1293741
                    // We try first outside rAF to support Edge, which does not exhibit this problem, but will crash if a CSS
                    // variable is set within a rAF callback for a submit button interaction (#2241).
                    activationState.wasElementMadeActive = _this.checkElementMadeActive_(evt);
                    if (activationState.wasElementMadeActive) {
                        _this.animateActivation_();
                    }
                }
                if (!activationState.wasElementMadeActive) {
                    // Reset activation state immediately if element was not made active.
                    _this.activationState_ = _this.defaultActivationState_();
                }
            });
        };
        MDCRippleFoundation.prototype.checkElementMadeActive_ = function (evt) {
            return (evt !== undefined && evt.type === 'keydown') ?
                this.adapter.isSurfaceActive() :
                true;
        };
        MDCRippleFoundation.prototype.animateActivation_ = function () {
            var _this = this;
            var _a = MDCRippleFoundation.strings, VAR_FG_TRANSLATE_START = _a.VAR_FG_TRANSLATE_START, VAR_FG_TRANSLATE_END = _a.VAR_FG_TRANSLATE_END;
            var _b = MDCRippleFoundation.cssClasses, FG_DEACTIVATION = _b.FG_DEACTIVATION, FG_ACTIVATION = _b.FG_ACTIVATION;
            var DEACTIVATION_TIMEOUT_MS = MDCRippleFoundation.numbers.DEACTIVATION_TIMEOUT_MS;
            this.layoutInternal_();
            var translateStart = '';
            var translateEnd = '';
            if (!this.adapter.isUnbounded()) {
                var _c = this.getFgTranslationCoordinates_(), startPoint = _c.startPoint, endPoint = _c.endPoint;
                translateStart = startPoint.x + "px, " + startPoint.y + "px";
                translateEnd = endPoint.x + "px, " + endPoint.y + "px";
            }
            this.adapter.updateCssVariable(VAR_FG_TRANSLATE_START, translateStart);
            this.adapter.updateCssVariable(VAR_FG_TRANSLATE_END, translateEnd);
            // Cancel any ongoing activation/deactivation animations
            clearTimeout(this.activationTimer_);
            clearTimeout(this.fgDeactivationRemovalTimer_);
            this.rmBoundedActivationClasses_();
            this.adapter.removeClass(FG_DEACTIVATION);
            // Force layout in order to re-trigger the animation.
            this.adapter.computeBoundingRect();
            this.adapter.addClass(FG_ACTIVATION);
            this.activationTimer_ = setTimeout(function () { return _this.activationTimerCallback_(); }, DEACTIVATION_TIMEOUT_MS);
        };
        MDCRippleFoundation.prototype.getFgTranslationCoordinates_ = function () {
            var _a = this.activationState_, activationEvent = _a.activationEvent, wasActivatedByPointer = _a.wasActivatedByPointer;
            var startPoint;
            if (wasActivatedByPointer) {
                startPoint = getNormalizedEventCoords(activationEvent, this.adapter.getWindowPageOffset(), this.adapter.computeBoundingRect());
            }
            else {
                startPoint = {
                    x: this.frame_.width / 2,
                    y: this.frame_.height / 2,
                };
            }
            // Center the element around the start point.
            startPoint = {
                x: startPoint.x - (this.initialSize_ / 2),
                y: startPoint.y - (this.initialSize_ / 2),
            };
            var endPoint = {
                x: (this.frame_.width / 2) - (this.initialSize_ / 2),
                y: (this.frame_.height / 2) - (this.initialSize_ / 2),
            };
            return { startPoint: startPoint, endPoint: endPoint };
        };
        MDCRippleFoundation.prototype.runDeactivationUXLogicIfReady_ = function () {
            var _this = this;
            // This method is called both when a pointing device is released, and when the activation animation ends.
            // The deactivation animation should only run after both of those occur.
            var FG_DEACTIVATION = MDCRippleFoundation.cssClasses.FG_DEACTIVATION;
            var _a = this.activationState_, hasDeactivationUXRun = _a.hasDeactivationUXRun, isActivated = _a.isActivated;
            var activationHasEnded = hasDeactivationUXRun || !isActivated;
            if (activationHasEnded && this.activationAnimationHasEnded_) {
                this.rmBoundedActivationClasses_();
                this.adapter.addClass(FG_DEACTIVATION);
                this.fgDeactivationRemovalTimer_ = setTimeout(function () {
                    _this.adapter.removeClass(FG_DEACTIVATION);
                }, numbers$1.FG_DEACTIVATION_MS);
            }
        };
        MDCRippleFoundation.prototype.rmBoundedActivationClasses_ = function () {
            var FG_ACTIVATION = MDCRippleFoundation.cssClasses.FG_ACTIVATION;
            this.adapter.removeClass(FG_ACTIVATION);
            this.activationAnimationHasEnded_ = false;
            this.adapter.computeBoundingRect();
        };
        MDCRippleFoundation.prototype.resetActivationState_ = function () {
            var _this = this;
            this.previousActivationEvent_ = this.activationState_.activationEvent;
            this.activationState_ = this.defaultActivationState_();
            // Touch devices may fire additional events for the same interaction within a short time.
            // Store the previous event until it's safe to assume that subsequent events are for new interactions.
            setTimeout(function () { return _this.previousActivationEvent_ = undefined; }, MDCRippleFoundation.numbers.TAP_DELAY_MS);
        };
        MDCRippleFoundation.prototype.deactivate_ = function () {
            var _this = this;
            var activationState = this.activationState_;
            // This can happen in scenarios such as when you have a keyup event that blurs the element.
            if (!activationState.isActivated) {
                return;
            }
            var state = __assign({}, activationState);
            if (activationState.isProgrammatic) {
                requestAnimationFrame(function () { return _this.animateDeactivation_(state); });
                this.resetActivationState_();
            }
            else {
                this.deregisterDeactivationHandlers_();
                requestAnimationFrame(function () {
                    _this.activationState_.hasDeactivationUXRun = true;
                    _this.animateDeactivation_(state);
                    _this.resetActivationState_();
                });
            }
        };
        MDCRippleFoundation.prototype.animateDeactivation_ = function (_a) {
            var wasActivatedByPointer = _a.wasActivatedByPointer, wasElementMadeActive = _a.wasElementMadeActive;
            if (wasActivatedByPointer || wasElementMadeActive) {
                this.runDeactivationUXLogicIfReady_();
            }
        };
        MDCRippleFoundation.prototype.layoutInternal_ = function () {
            var _this = this;
            this.frame_ = this.adapter.computeBoundingRect();
            var maxDim = Math.max(this.frame_.height, this.frame_.width);
            // Surface diameter is treated differently for unbounded vs. bounded ripples.
            // Unbounded ripple diameter is calculated smaller since the surface is expected to already be padded appropriately
            // to extend the hitbox, and the ripple is expected to meet the edges of the padded hitbox (which is typically
            // square). Bounded ripples, on the other hand, are fully expected to expand beyond the surface's longest diameter
            // (calculated based on the diagonal plus a constant padding), and are clipped at the surface's border via
            // `overflow: hidden`.
            var getBoundedRadius = function () {
                var hypotenuse = Math.sqrt(Math.pow(_this.frame_.width, 2) + Math.pow(_this.frame_.height, 2));
                return hypotenuse + MDCRippleFoundation.numbers.PADDING;
            };
            this.maxRadius_ = this.adapter.isUnbounded() ? maxDim : getBoundedRadius();
            // Ripple is sized as a fraction of the largest dimension of the surface, then scales up using a CSS scale transform
            var initialSize = Math.floor(maxDim * MDCRippleFoundation.numbers.INITIAL_ORIGIN_SCALE);
            // Unbounded ripple size should always be even number to equally center align.
            if (this.adapter.isUnbounded() && initialSize % 2 !== 0) {
                this.initialSize_ = initialSize - 1;
            }
            else {
                this.initialSize_ = initialSize;
            }
            this.fgScale_ = "" + this.maxRadius_ / this.initialSize_;
            this.updateLayoutCssVars_();
        };
        MDCRippleFoundation.prototype.updateLayoutCssVars_ = function () {
            var _a = MDCRippleFoundation.strings, VAR_FG_SIZE = _a.VAR_FG_SIZE, VAR_LEFT = _a.VAR_LEFT, VAR_TOP = _a.VAR_TOP, VAR_FG_SCALE = _a.VAR_FG_SCALE;
            this.adapter.updateCssVariable(VAR_FG_SIZE, this.initialSize_ + "px");
            this.adapter.updateCssVariable(VAR_FG_SCALE, this.fgScale_);
            if (this.adapter.isUnbounded()) {
                this.unboundedCoords_ = {
                    left: Math.round((this.frame_.width / 2) - (this.initialSize_ / 2)),
                    top: Math.round((this.frame_.height / 2) - (this.initialSize_ / 2)),
                };
                this.adapter.updateCssVariable(VAR_LEFT, this.unboundedCoords_.left + "px");
                this.adapter.updateCssVariable(VAR_TOP, this.unboundedCoords_.top + "px");
            }
        };
        return MDCRippleFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    /**
     * Stores the StyleInfo object applied to a given AttributePart.
     * Used to unset existing values when a new StyleInfo object is applied.
     */
    const previousStylePropertyCache = new WeakMap();
    /**
     * A directive that applies CSS properties to an element.
     *
     * `styleMap` can only be used in the `style` attribute and must be the only
     * expression in the attribute. It takes the property names in the `styleInfo`
     * object and adds the property values as CSS properties. Property names with
     * dashes (`-`) are assumed to be valid CSS property names and set on the
     * element's style object using `setProperty()`. Names without dashes are
     * assumed to be camelCased JavaScript property names and set on the element's
     * style object using property assignment, allowing the style object to
     * translate JavaScript-style names to CSS property names.
     *
     * For example `styleMap({backgroundColor: 'red', 'border-top': '5px', '--size':
     * '0'})` sets the `background-color`, `border-top` and `--size` properties.
     *
     * @param styleInfo {StyleInfo}
     */
    const styleMap = directive((styleInfo) => (part) => {
        if (!(part instanceof AttributePart) || (part instanceof PropertyPart) ||
            part.committer.name !== 'style' || part.committer.parts.length > 1) {
            throw new Error('The `styleMap` directive must be used in the style attribute ' +
                'and must be the only part in the attribute.');
        }
        const { committer } = part;
        const { style } = committer.element;
        let previousStyleProperties = previousStylePropertyCache.get(part);
        if (previousStyleProperties === undefined) {
            // Write static styles once
            style.cssText = committer.strings.join(' ');
            previousStylePropertyCache.set(part, previousStyleProperties = new Set());
        }
        // Remove old properties that no longer exist in styleInfo
        // We use forEach() instead of for-of so that re don't require down-level
        // iteration.
        previousStyleProperties.forEach((name) => {
            if (!(name in styleInfo)) {
                previousStyleProperties.delete(name);
                if (name.indexOf('-') === -1) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    style[name] = null;
                }
                else {
                    style.removeProperty(name);
                }
            }
        });
        // Add or update properties
        for (const name in styleInfo) {
            previousStyleProperties.add(name);
            if (name.indexOf('-') === -1) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                style[name] = styleInfo[name];
            }
            else {
                style.setProperty(name, styleInfo[name]);
            }
        }
    });

    /** @soyCompatible */
    class RippleBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.primary = false;
            this.accent = false;
            this.unbounded = false;
            this.disabled = false;
            this.activated = false;
            this.selected = false;
            this.hovering = false;
            this.bgFocused = false;
            this.fgActivation = false;
            this.fgDeactivation = false;
            this.fgScale = '';
            this.fgSize = '';
            this.translateStart = '';
            this.translateEnd = '';
            this.leftPos = '';
            this.topPos = '';
            this.mdcFoundationClass = MDCRippleFoundation;
        }
        get isActive() {
            return (this.parentElement || this).matches(':active');
        }
        createAdapter() {
            return {
                browserSupportsCssVars: () => true,
                isUnbounded: () => this.unbounded,
                isSurfaceActive: () => this.isActive,
                isSurfaceDisabled: () => this.disabled,
                addClass: (className) => {
                    switch (className) {
                        case 'mdc-ripple-upgraded--background-focused':
                            this.bgFocused = true;
                            break;
                        case 'mdc-ripple-upgraded--foreground-activation':
                            this.fgActivation = true;
                            break;
                        case 'mdc-ripple-upgraded--foreground-deactivation':
                            this.fgDeactivation = true;
                            break;
                    }
                },
                removeClass: (className) => {
                    switch (className) {
                        case 'mdc-ripple-upgraded--background-focused':
                            this.bgFocused = false;
                            break;
                        case 'mdc-ripple-upgraded--foreground-activation':
                            this.fgActivation = false;
                            break;
                        case 'mdc-ripple-upgraded--foreground-deactivation':
                            this.fgDeactivation = false;
                            break;
                    }
                },
                containsEventTarget: () => true,
                registerInteractionHandler: () => undefined,
                deregisterInteractionHandler: () => undefined,
                registerDocumentInteractionHandler: () => undefined,
                deregisterDocumentInteractionHandler: () => undefined,
                registerResizeHandler: () => undefined,
                deregisterResizeHandler: () => undefined,
                updateCssVariable: (varName, value) => {
                    switch (varName) {
                        case '--mdc-ripple-fg-scale':
                            this.fgScale = value;
                            break;
                        case '--mdc-ripple-fg-size':
                            this.fgSize = value;
                            break;
                        case '--mdc-ripple-fg-translate-end':
                            this.translateEnd = value;
                            break;
                        case '--mdc-ripple-fg-translate-start':
                            this.translateStart = value;
                            break;
                        case '--mdc-ripple-left':
                            this.leftPos = value;
                            break;
                        case '--mdc-ripple-top':
                            this.topPos = value;
                            break;
                    }
                },
                computeBoundingRect: () => (this.parentElement || this).getBoundingClientRect(),
                getWindowPageOffset: () => ({ x: window.pageXOffset, y: window.pageYOffset }),
            };
        }
        startPress(ev) {
            this.waitForFoundation(() => {
                this.mdcFoundation.activate(ev);
            });
        }
        endPress() {
            this.waitForFoundation(() => {
                this.mdcFoundation.deactivate();
            });
        }
        startFocus() {
            this.waitForFoundation(() => {
                this.mdcFoundation.handleFocus();
            });
        }
        endFocus() {
            this.waitForFoundation(() => {
                this.mdcFoundation.handleBlur();
            });
        }
        startHover() {
            this.hovering = true;
        }
        endHover() {
            this.hovering = false;
        }
        /**
         * Wait for the MDCFoundation to be created by `firstUpdated`
         */
        waitForFoundation(fn) {
            if (this.mdcFoundation) {
                fn();
            }
            else {
                this.updateComplete.then(fn);
            }
        }
        /** @soyCompatible */
        render() {
            /** @classMap */
            const classes = {
                'mdc-ripple-upgraded--unbounded': this.unbounded,
                'mdc-ripple-upgraded--background-focused': this.bgFocused,
                'mdc-ripple-upgraded--foreground-activation': this.fgActivation,
                'mdc-ripple-upgraded--foreground-deactivation': this.fgDeactivation,
                'hover': this.hovering,
                'primary': this.primary,
                'accent': this.accent,
                'disabled': this.disabled,
                'activated': this.activated,
                'selected': this.selected,
            };
            return html `
        <div class="mdc-ripple-surface mdc-ripple-upgraded ${classMap(classes)}"
          style="${styleMap({
            '--mdc-ripple-fg-scale': this.fgScale,
            '--mdc-ripple-fg-size': this.fgSize,
            '--mdc-ripple-fg-translate-end': this.translateEnd,
            '--mdc-ripple-fg-translate-start': this.translateStart,
            '--mdc-ripple-left': this.leftPos,
            '--mdc-ripple-top': this.topPos,
        })}"></div>`;
        }
    }
    __decorate([
        query('.mdc-ripple-surface')
    ], RippleBase.prototype, "mdcRoot", void 0);
    __decorate([
        property({ type: Boolean })
    ], RippleBase.prototype, "primary", void 0);
    __decorate([
        property({ type: Boolean })
    ], RippleBase.prototype, "accent", void 0);
    __decorate([
        property({ type: Boolean })
    ], RippleBase.prototype, "unbounded", void 0);
    __decorate([
        property({ type: Boolean })
    ], RippleBase.prototype, "disabled", void 0);
    __decorate([
        property({ type: Boolean })
    ], RippleBase.prototype, "activated", void 0);
    __decorate([
        property({ type: Boolean })
    ], RippleBase.prototype, "selected", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "hovering", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "bgFocused", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "fgActivation", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "fgDeactivation", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "fgScale", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "fgSize", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "translateStart", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "translateEnd", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "leftPos", void 0);
    __decorate([
        internalProperty()
    ], RippleBase.prototype, "topPos", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$1 = css `:host{display:block;position:absolute;top:0;bottom:0;left:0;right:0;width:100%;height:100%;pointer-events:none}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}:host .primary{--mdc-ripple-color: var(--mdc-theme-primary, #6200ee)}:host .accent{--mdc-ripple-color: var( --mdc-theme-secondary, #018786 )}:host .mdc-ripple-surface{top:0;bottom:0;left:0;right:0;width:100%;height:100%;pointer-events:none;--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:relative;outline:none;overflow:hidden;--mdc-ripple-fg-opacity: var( --mdc-ripple-press-opacity, 0.12 )}:host .mdc-ripple-surface::before,:host .mdc-ripple-surface::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}:host .mdc-ripple-surface::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}:host .mdc-ripple-surface.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}:host .mdc-ripple-surface.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}:host .mdc-ripple-surface.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}:host .mdc-ripple-surface.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}:host .mdc-ripple-surface::before,:host .mdc-ripple-surface::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}:host .mdc-ripple-surface.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded{overflow:visible}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded::before,:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::before,:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{top:var(--mdc-ripple-top, calc(50% - 50%));left:var(--mdc-ripple-left, calc(50% - 50%));width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:host .mdc-ripple-surface.mdc-ripple-upgraded--unbounded.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}:host .mdc-ripple-surface.hover::before{opacity:0.04;opacity:var(--mdc-ripple-hover-opacity, 0.04)}:host .mdc-ripple-surface.mdc-ripple-upgraded--background-focused::before{opacity:0.12;opacity:var(--mdc-ripple-focus-opacity, 0.12)}:host .mdc-ripple-surface::before,:host .mdc-ripple-surface::after{background-color:#000;background-color:var(--mdc-ripple-color, #000)}:host .mdc-ripple-surface.activated{--mdc-ripple-press-opacity: calc( var(--mdc-ripple-press-opacity, 0.12) + 0.12 )}:host .mdc-ripple-surface.activated::before{opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12)}:host .mdc-ripple-surface.activated.hover::before{opacity:.16;opacity:calc( var(--mdc-ripple-hover-opacity, 0.04) + var(--mdc-ripple-activated-opacity, 0.12) )}:host .mdc-ripple-surface.activated.mdc-ripple-upgraded--background-focused::before{opacity:.24;opacity:calc( var(--mdc-ripple-focus-opacity, 0.12) + var(--mdc-ripple-activated-opacity, 0.12) )}:host .mdc-ripple-surface.selected{--mdc-ripple-press-opacity: calc( var(--mdc-ripple-press-opacity, 0.12) + 0.08 )}:host .mdc-ripple-surface.selected::before{opacity:0.08;opacity:var(--mdc-ripple-selected-opacity, 0.08)}:host .mdc-ripple-surface.selected.hover::before{opacity:.12;opacity:calc( var(--mdc-ripple-hover-opacity, 0.04) + var(--mdc-ripple-selected-opacity, 0.08) )}:host .mdc-ripple-surface.selected.mdc-ripple-upgraded--background-focused::before{opacity:.2;opacity:calc( var(--mdc-ripple-focus-opacity, 0.12) + var(--mdc-ripple-selected-opacity, 0.08) )}:host .mdc-ripple-surface.disabled{--mdc-ripple-color: transparent}:host .mdc-ripple-surface::before{z-index:1;z-index:var(--m-ripple-z-index, 1)}:host .mdc-ripple-surface::after{z-index:0;z-index:var(--m-ripple-z-index, 0)}`;

    /** @soyCompatible */
    let Ripple = class Ripple extends RippleBase {
    };
    Ripple.styles = style$1;
    Ripple = __decorate([
        customElement('mwc-ripple')
    ], Ripple);

    /**
    @license
    Copyright 2020 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    /**
     * Class that encapsulates the events handlers for `mwc-ripple`
     *
     *
     * Example:
     * ```
     * class XFoo extends LitElement {
     *   async getRipple() {
     *     this.renderRipple = true;
     *     await this.updateComplete;
     *     return this.renderRoot.querySelector('mwc-ripple');
     *   }
     *   rippleHandlers = new RippleHandlers(() => this.getRipple());
     *
     *   render() {
     *     return html`
     *       <div @mousedown=${this.rippleHandlers.startPress}></div>
     *       ${this.renderRipple ? html`<mwc-ripple></mwc-ripple>` : ''}
     *     `;
     *   }
     * }
     * ```
     */
    class RippleHandlers {
        constructor(
        /** Function that returns a `mwc-ripple` */
        rippleFn) {
            this.startPress = (ev) => {
                rippleFn().then((r) => {
                    r && r.startPress(ev);
                });
            };
            this.endPress = () => {
                rippleFn().then((r) => {
                    r && r.endPress();
                });
            };
            this.startFocus = () => {
                rippleFn().then((r) => {
                    r && r.startFocus();
                });
            };
            this.endFocus = () => {
                rippleFn().then((r) => {
                    r && r.endFocus();
                });
            };
            this.startHover = () => {
                rippleFn().then((r) => {
                    r && r.startHover();
                });
            };
            this.endHover = () => {
                rippleFn().then((r) => {
                    r && r.endHover();
                });
            };
        }
    }

    /** @soyCompatible */
    class IconButtonBase extends LitElement {
        constructor() {
            super(...arguments);
            this.disabled = false;
            this.icon = '';
            this.label = '';
            this.shouldRenderRipple = false;
            this.rippleHandlers = new RippleHandlers(() => {
                this.shouldRenderRipple = true;
                return this.ripple;
            });
        }
        /** @soyCompatible */
        renderRipple() {
            return html `${this.shouldRenderRipple ? html `
            <mwc-ripple
                .disabled="${this.disabled}"
                unbounded>
            </mwc-ripple>` :
            ''}`;
        }
        focus() {
            const buttonElement = this.buttonElement;
            if (buttonElement) {
                this.rippleHandlers.startFocus();
                buttonElement.focus();
            }
        }
        blur() {
            const buttonElement = this.buttonElement;
            if (buttonElement) {
                this.rippleHandlers.endFocus();
                buttonElement.blur();
            }
        }
        /** @soyCompatible */
        render() {
            return html `<button
        class="mdc-icon-button"
        aria-label="${this.label || this.icon}"
        ?disabled="${this.disabled}"
        @focus="${this.handleRippleFocus}"
        @blur="${this.handleRippleBlur}"
        @mousedown="${this.handleRippleMouseDown}"
        @mouseenter="${this.handleRippleMouseEnter}"
        @mouseleave="${this.handleRippleMouseLeave}"
        @touchstart="${this.handleRippleTouchStart}"
        @touchend="${this.handleRippleDeactivate}"
        @touchcancel="${this.handleRippleDeactivate}">
      ${this.renderRipple()}
    <i class="material-icons">${this.icon}</i>
    <slot></slot>
  </button>`;
        }
        handleRippleMouseDown(event) {
            const onUp = () => {
                window.removeEventListener('mouseup', onUp);
                this.handleRippleDeactivate();
            };
            window.addEventListener('mouseup', onUp);
            this.rippleHandlers.startPress(event);
        }
        handleRippleTouchStart(event) {
            this.rippleHandlers.startPress(event);
        }
        handleRippleDeactivate() {
            this.rippleHandlers.endPress();
        }
        handleRippleMouseEnter() {
            this.rippleHandlers.startHover();
        }
        handleRippleMouseLeave() {
            this.rippleHandlers.endHover();
        }
        handleRippleFocus() {
            this.rippleHandlers.startFocus();
        }
        handleRippleBlur() {
            this.rippleHandlers.endFocus();
        }
    }
    __decorate([
        property({ type: Boolean, reflect: true })
    ], IconButtonBase.prototype, "disabled", void 0);
    __decorate([
        property({ type: String })
    ], IconButtonBase.prototype, "icon", void 0);
    __decorate([
        property({ type: String })
    ], IconButtonBase.prototype, "label", void 0);
    __decorate([
        query('button')
    ], IconButtonBase.prototype, "buttonElement", void 0);
    __decorate([
        queryAsync('mwc-ripple')
    ], IconButtonBase.prototype, "ripple", void 0);
    __decorate([
        internalProperty()
    ], IconButtonBase.prototype, "shouldRenderRipple", void 0);
    __decorate([
        eventOptions({ passive: true })
    ], IconButtonBase.prototype, "handleRippleMouseDown", null);
    __decorate([
        eventOptions({ passive: true })
    ], IconButtonBase.prototype, "handleRippleTouchStart", null);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$2 = css `.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}.mdc-icon-button{display:inline-block;position:relative;box-sizing:border-box;border:none;outline:none;background-color:transparent;fill:currentColor;color:inherit;font-size:24px;text-decoration:none;cursor:pointer;user-select:none;width:48px;height:48px;padding:12px}.mdc-icon-button svg,.mdc-icon-button img{width:24px;height:24px}.mdc-icon-button:disabled{color:rgba(0,0,0,.38);color:var(--mdc-theme-text-disabled-on-light, rgba(0, 0, 0, 0.38))}.mdc-icon-button:disabled{cursor:default;pointer-events:none}.mdc-icon-button__icon{display:inline-block}.mdc-icon-button__icon.mdc-icon-button__icon--on{display:none}.mdc-icon-button--on .mdc-icon-button__icon{display:none}.mdc-icon-button--on .mdc-icon-button__icon.mdc-icon-button__icon--on{display:inline-block}:host{display:inline-block;outline:none;--mdc-ripple-color: currentcolor}:host([disabled]){pointer-events:none}:host,.mdc-icon-button{vertical-align:top}.mdc-icon-button{width:var(--mdc-icon-button-size, 48px);height:var(--mdc-icon-button-size, 48px);padding:calc((var(--mdc-icon-button-size, 48px) - var(--mdc-icon-size, 24px)) / 2)}.mdc-icon-button>i{position:absolute;top:0;padding-top:inherit}.mdc-icon-button i,.mdc-icon-button svg,.mdc-icon-button img,.mdc-icon-button ::slotted(*){display:block;width:var(--mdc-icon-size, 24px);height:var(--mdc-icon-size, 24px)}`;

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    /** @soyCompatible */
    let IconButton = class IconButton extends IconButtonBase {
    };
    IconButton.styles = style$2;
    IconButton = __decorate([
        customElement('mwc-icon-button')
    ], IconButton);

    /**
     * @license
     * Copyright 2016 Google Inc. All rights reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     *     http://www.apache.org/licenses/LICENSE-2.0
     *
     * Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    (() => {
        var _a, _b, _c;
        /* Symbols for private properties */
        const _blockingElements = Symbol();
        const _alreadyInertElements = Symbol();
        const _topElParents = Symbol();
        const _siblingsToRestore = Symbol();
        const _parentMO = Symbol();
        /* Symbols for private static methods */
        const _topChanged = Symbol();
        const _swapInertedSibling = Symbol();
        const _inertSiblings = Symbol();
        const _restoreInertedSiblings = Symbol();
        const _getParents = Symbol();
        const _getDistributedChildren = Symbol();
        const _isInertable = Symbol();
        const _handleMutations = Symbol();
        class BlockingElementsImpl {
            constructor() {
                /**
                 * The blocking elements.
                 */
                this[_a] = [];
                /**
                 * Used to keep track of the parents of the top element, from the element
                 * itself up to body. When top changes, the old top might have been removed
                 * from the document, so we need to memoize the inerted parents' siblings
                 * in order to restore their inerteness when top changes.
                 */
                this[_b] = [];
                /**
                 * Elements that are already inert before the first blocking element is
                 * pushed.
                 */
                this[_c] = new Set();
            }
            destructor() {
                // Restore original inertness.
                this[_restoreInertedSiblings](this[_topElParents]);
                // Note we don't want to make these properties nullable on the class,
                // since then we'd need non-null casts in many places. Calling a method on
                // a BlockingElements instance after calling destructor will result in an
                // exception.
                const nullable = this;
                nullable[_blockingElements] = null;
                nullable[_topElParents] = null;
                nullable[_alreadyInertElements] = null;
            }
            get top() {
                const elems = this[_blockingElements];
                return elems[elems.length - 1] || null;
            }
            push(element) {
                if (!element || element === this.top) {
                    return;
                }
                // Remove it from the stack, we'll bring it to the top.
                this.remove(element);
                this[_topChanged](element);
                this[_blockingElements].push(element);
            }
            remove(element) {
                const i = this[_blockingElements].indexOf(element);
                if (i === -1) {
                    return false;
                }
                this[_blockingElements].splice(i, 1);
                // Top changed only if the removed element was the top element.
                if (i === this[_blockingElements].length) {
                    this[_topChanged](this.top);
                }
                return true;
            }
            pop() {
                const top = this.top;
                top && this.remove(top);
                return top;
            }
            has(element) {
                return this[_blockingElements].indexOf(element) !== -1;
            }
            /**
             * Sets `inert` to all document elements except the new top element, its
             * parents, and its distributed content.
             */
            [(_a = _blockingElements, _b = _topElParents, _c = _alreadyInertElements, _topChanged)](newTop) {
                const toKeepInert = this[_alreadyInertElements];
                const oldParents = this[_topElParents];
                // No new top, reset old top if any.
                if (!newTop) {
                    this[_restoreInertedSiblings](oldParents);
                    toKeepInert.clear();
                    this[_topElParents] = [];
                    return;
                }
                const newParents = this[_getParents](newTop);
                // New top is not contained in the main document!
                if (newParents[newParents.length - 1].parentNode !== document.body) {
                    throw Error('Non-connected element cannot be a blocking element');
                }
                // Cast here because we know we'll call _inertSiblings on newParents
                // below.
                this[_topElParents] = newParents;
                const toSkip = this[_getDistributedChildren](newTop);
                // No previous top element.
                if (!oldParents.length) {
                    this[_inertSiblings](newParents, toSkip, toKeepInert);
                    return;
                }
                let i = oldParents.length - 1;
                let j = newParents.length - 1;
                // Find common parent. Index 0 is the element itself (so stop before it).
                while (i > 0 && j > 0 && oldParents[i] === newParents[j]) {
                    i--;
                    j--;
                }
                // If up the parents tree there are 2 elements that are siblings, swap
                // the inerted sibling.
                if (oldParents[i] !== newParents[j]) {
                    this[_swapInertedSibling](oldParents[i], newParents[j]);
                }
                // Restore old parents siblings inertness.
                i > 0 && this[_restoreInertedSiblings](oldParents.slice(0, i));
                // Make new parents siblings inert.
                j > 0 && this[_inertSiblings](newParents.slice(0, j), toSkip, null);
            }
            /**
             * Swaps inertness between two sibling elements.
             * Sets the property `inert` over the attribute since the inert spec
             * doesn't specify if it should be reflected.
             * https://html.spec.whatwg.org/multipage/interaction.html#inert
             */
            [_swapInertedSibling](oldInert, newInert) {
                const siblingsToRestore = oldInert[_siblingsToRestore];
                // oldInert is not contained in siblings to restore, so we have to check
                // if it's inertable and if already inert.
                if (this[_isInertable](oldInert) && !oldInert.inert) {
                    oldInert.inert = true;
                    siblingsToRestore.add(oldInert);
                }
                // If newInert was already between the siblings to restore, it means it is
                // inertable and must be restored.
                if (siblingsToRestore.has(newInert)) {
                    newInert.inert = false;
                    siblingsToRestore.delete(newInert);
                }
                newInert[_parentMO] = oldInert[_parentMO];
                newInert[_siblingsToRestore] = siblingsToRestore;
                oldInert[_parentMO] = undefined;
                oldInert[_siblingsToRestore] = undefined;
            }
            /**
             * Restores original inertness to the siblings of the elements.
             * Sets the property `inert` over the attribute since the inert spec
             * doesn't specify if it should be reflected.
             * https://html.spec.whatwg.org/multipage/interaction.html#inert
             */
            [_restoreInertedSiblings](elements) {
                for (const element of elements) {
                    const mo = element[_parentMO];
                    mo.disconnect();
                    element[_parentMO] = undefined;
                    const siblings = element[_siblingsToRestore];
                    for (const sibling of siblings) {
                        sibling.inert = false;
                    }
                    element[_siblingsToRestore] = undefined;
                }
            }
            /**
             * Inerts the siblings of the elements except the elements to skip. Stores
             * the inerted siblings into the element's symbol `_siblingsToRestore`.
             * Pass `toKeepInert` to collect the already inert elements.
             * Sets the property `inert` over the attribute since the inert spec
             * doesn't specify if it should be reflected.
             * https://html.spec.whatwg.org/multipage/interaction.html#inert
             */
            [_inertSiblings](elements, toSkip, toKeepInert) {
                for (const element of elements) {
                    // Assume element is not a Document, so it must have a parentNode.
                    const parent = element.parentNode;
                    const children = parent.children;
                    const inertedSiblings = new Set();
                    for (let j = 0; j < children.length; j++) {
                        const sibling = children[j];
                        // Skip the input element, if not inertable or to be skipped.
                        if (sibling === element || !this[_isInertable](sibling) ||
                            (toSkip && toSkip.has(sibling))) {
                            continue;
                        }
                        // Should be collected since already inerted.
                        if (toKeepInert && sibling.inert) {
                            toKeepInert.add(sibling);
                        }
                        else {
                            sibling.inert = true;
                            inertedSiblings.add(sibling);
                        }
                    }
                    // Store the siblings that were inerted.
                    element[_siblingsToRestore] = inertedSiblings;
                    // Observe only immediate children mutations on the parent.
                    const mo = new MutationObserver(this[_handleMutations].bind(this));
                    element[_parentMO] = mo;
                    let parentToObserve = parent;
                    // If we're using the ShadyDOM polyfill, then our parent could be a
                    // shady root, which is an object that acts like a ShadowRoot, but isn't
                    // actually a node in the real DOM. Observe the real DOM parent instead.
                    const maybeShadyRoot = parentToObserve;
                    if (maybeShadyRoot.__shady && maybeShadyRoot.host) {
                        parentToObserve = maybeShadyRoot.host;
                    }
                    mo.observe(parentToObserve, {
                        childList: true,
                    });
                }
            }
            /**
             * Handles newly added/removed nodes by toggling their inertness.
             * It also checks if the current top Blocking Element has been removed,
             * notifying and removing it.
             */
            [_handleMutations](mutations) {
                const parents = this[_topElParents];
                const toKeepInert = this[_alreadyInertElements];
                for (const mutation of mutations) {
                    // If the target is a shadowRoot, get its host as we skip shadowRoots when
                    // computing _topElParents.
                    const target = mutation.target.host || mutation.target;
                    const idx = target === document.body ?
                        parents.length :
                        parents.indexOf(target);
                    const inertedChild = parents[idx - 1];
                    const inertedSiblings = inertedChild[_siblingsToRestore];
                    // To restore.
                    for (let i = 0; i < mutation.removedNodes.length; i++) {
                        const sibling = mutation.removedNodes[i];
                        if (sibling === inertedChild) {
                            console.info('Detected removal of the top Blocking Element.');
                            this.pop();
                            return;
                        }
                        if (inertedSiblings.has(sibling)) {
                            sibling.inert = false;
                            inertedSiblings.delete(sibling);
                        }
                    }
                    // To inert.
                    for (let i = 0; i < mutation.addedNodes.length; i++) {
                        const sibling = mutation.addedNodes[i];
                        if (!this[_isInertable](sibling)) {
                            continue;
                        }
                        if (toKeepInert && sibling.inert) {
                            toKeepInert.add(sibling);
                        }
                        else {
                            sibling.inert = true;
                            inertedSiblings.add(sibling);
                        }
                    }
                }
            }
            /**
             * Returns if the element is inertable.
             */
            [_isInertable](element) {
                return false === /^(style|template|script)$/.test(element.localName);
            }
            /**
             * Returns the list of newParents of an element, starting from element
             * (included) up to `document.body` (excluded).
             */
            [_getParents](element) {
                const parents = [];
                let current = element;
                // Stop to body.
                while (current && current !== document.body) {
                    // Skip shadow roots.
                    if (current.nodeType === Node.ELEMENT_NODE) {
                        parents.push(current);
                    }
                    // ShadowDom v1
                    if (current.assignedSlot) {
                        // Collect slots from deepest slot to top.
                        while (current = current.assignedSlot) {
                            parents.push(current);
                        }
                        // Continue the search on the top slot.
                        current = parents.pop();
                        continue;
                    }
                    current = current.parentNode ||
                        current.host;
                }
                return parents;
            }
            /**
             * Returns the distributed children of the element's shadow root.
             * Returns null if the element doesn't have a shadow root.
             */
            [_getDistributedChildren](element) {
                const shadowRoot = element.shadowRoot;
                if (!shadowRoot) {
                    return null;
                }
                const result = new Set();
                let i;
                let j;
                let nodes;
                const slots = shadowRoot.querySelectorAll('slot');
                if (slots.length && slots[0].assignedNodes) {
                    for (i = 0; i < slots.length; i++) {
                        nodes = slots[i].assignedNodes({
                            flatten: true,
                        });
                        for (j = 0; j < nodes.length; j++) {
                            if (nodes[j].nodeType === Node.ELEMENT_NODE) {
                                result.add(nodes[j]);
                            }
                        }
                    }
                    // No need to search for <content>.
                }
                return result;
            }
        }
        document.$blockingElements =
            new BlockingElementsImpl();
    })();

    /**
     * This work is licensed under the W3C Software and Document License
     * (http://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
     */

    (function() {
      // Return early if we're not running inside of the browser.
      if (typeof window === 'undefined') {
        return;
      }

      // Convenience function for converting NodeLists.
      /** @type {typeof Array.prototype.slice} */
      const slice = Array.prototype.slice;

      /**
       * IE has a non-standard name for "matches".
       * @type {typeof Element.prototype.matches}
       */
      const matches =
          Element.prototype.matches || Element.prototype.msMatchesSelector;

      /** @type {string} */
      const _focusableElementsString = ['a[href]',
                                        'area[href]',
                                        'input:not([disabled])',
                                        'select:not([disabled])',
                                        'textarea:not([disabled])',
                                        'button:not([disabled])',
                                        'details',
                                        'summary',
                                        'iframe',
                                        'object',
                                        'embed',
                                        '[contenteditable]'].join(',');

      /**
       * `InertRoot` manages a single inert subtree, i.e. a DOM subtree whose root element has an `inert`
       * attribute.
       *
       * Its main functions are:
       *
       * - to create and maintain a set of managed `InertNode`s, including when mutations occur in the
       *   subtree. The `makeSubtreeUnfocusable()` method handles collecting `InertNode`s via registering
       *   each focusable node in the subtree with the singleton `InertManager` which manages all known
       *   focusable nodes within inert subtrees. `InertManager` ensures that a single `InertNode`
       *   instance exists for each focusable node which has at least one inert root as an ancestor.
       *
       * - to notify all managed `InertNode`s when this subtree stops being inert (i.e. when the `inert`
       *   attribute is removed from the root node). This is handled in the destructor, which calls the
       *   `deregister` method on `InertManager` for each managed inert node.
       */
      class InertRoot {
        /**
         * @param {!Element} rootElement The Element at the root of the inert subtree.
         * @param {!InertManager} inertManager The global singleton InertManager object.
         */
        constructor(rootElement, inertManager) {
          /** @type {!InertManager} */
          this._inertManager = inertManager;

          /** @type {!Element} */
          this._rootElement = rootElement;

          /**
           * @type {!Set<!InertNode>}
           * All managed focusable nodes in this InertRoot's subtree.
           */
          this._managedNodes = new Set();

          // Make the subtree hidden from assistive technology
          if (this._rootElement.hasAttribute('aria-hidden')) {
            /** @type {?string} */
            this._savedAriaHidden = this._rootElement.getAttribute('aria-hidden');
          } else {
            this._savedAriaHidden = null;
          }
          this._rootElement.setAttribute('aria-hidden', 'true');

          // Make all focusable elements in the subtree unfocusable and add them to _managedNodes
          this._makeSubtreeUnfocusable(this._rootElement);

          // Watch for:
          // - any additions in the subtree: make them unfocusable too
          // - any removals from the subtree: remove them from this inert root's managed nodes
          // - attribute changes: if `tabindex` is added, or removed from an intrinsically focusable
          //   element, make that node a managed node.
          this._observer = new MutationObserver(this._onMutation.bind(this));
          this._observer.observe(this._rootElement, {attributes: true, childList: true, subtree: true});
        }

        /**
         * Call this whenever this object is about to become obsolete.  This unwinds all of the state
         * stored in this object and updates the state of all of the managed nodes.
         */
        destructor() {
          this._observer.disconnect();

          if (this._rootElement) {
            if (this._savedAriaHidden !== null) {
              this._rootElement.setAttribute('aria-hidden', this._savedAriaHidden);
            } else {
              this._rootElement.removeAttribute('aria-hidden');
            }
          }

          this._managedNodes.forEach(function(inertNode) {
            this._unmanageNode(inertNode.node);
          }, this);

          // Note we cast the nulls to the ANY type here because:
          // 1) We want the class properties to be declared as non-null, or else we
          //    need even more casts throughout this code. All bets are off if an
          //    instance has been destroyed and a method is called.
          // 2) We don't want to cast "this", because we want type-aware optimizations
          //    to know which properties we're setting.
          this._observer = /** @type {?} */ (null);
          this._rootElement = /** @type {?} */ (null);
          this._managedNodes = /** @type {?} */ (null);
          this._inertManager = /** @type {?} */ (null);
        }

        /**
         * @return {!Set<!InertNode>} A copy of this InertRoot's managed nodes set.
         */
        get managedNodes() {
          return new Set(this._managedNodes);
        }

        /** @return {boolean} */
        get hasSavedAriaHidden() {
          return this._savedAriaHidden !== null;
        }

        /** @param {?string} ariaHidden */
        set savedAriaHidden(ariaHidden) {
          this._savedAriaHidden = ariaHidden;
        }

        /** @return {?string} */
        get savedAriaHidden() {
          return this._savedAriaHidden;
        }

        /**
         * @param {!Node} startNode
         */
        _makeSubtreeUnfocusable(startNode) {
          composedTreeWalk(startNode, (node) => this._visitNode(node));

          let activeElement = document.activeElement;

          if (!document.body.contains(startNode)) {
            // startNode may be in shadow DOM, so find its nearest shadowRoot to get the activeElement.
            let node = startNode;
            /** @type {!ShadowRoot|undefined} */
            let root = undefined;
            while (node) {
              if (node.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                root = /** @type {!ShadowRoot} */ (node);
                break;
              }
              node = node.parentNode;
            }
            if (root) {
              activeElement = root.activeElement;
            }
          }
          if (startNode.contains(activeElement)) {
            activeElement.blur();
            // In IE11, if an element is already focused, and then set to tabindex=-1
            // calling blur() will not actually move the focus.
            // To work around this we call focus() on the body instead.
            if (activeElement === document.activeElement) {
              document.body.focus();
            }
          }
        }

        /**
         * @param {!Node} node
         */
        _visitNode(node) {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          const element = /** @type {!Element} */ (node);

          // If a descendant inert root becomes un-inert, its descendants will still be inert because of
          // this inert root, so all of its managed nodes need to be adopted by this InertRoot.
          if (element !== this._rootElement && element.hasAttribute('inert')) {
            this._adoptInertRoot(element);
          }

          if (matches.call(element, _focusableElementsString) || element.hasAttribute('tabindex')) {
            this._manageNode(element);
          }
        }

        /**
         * Register the given node with this InertRoot and with InertManager.
         * @param {!Node} node
         */
        _manageNode(node) {
          const inertNode = this._inertManager.register(node, this);
          this._managedNodes.add(inertNode);
        }

        /**
         * Unregister the given node with this InertRoot and with InertManager.
         * @param {!Node} node
         */
        _unmanageNode(node) {
          const inertNode = this._inertManager.deregister(node, this);
          if (inertNode) {
            this._managedNodes.delete(inertNode);
          }
        }

        /**
         * Unregister the entire subtree starting at `startNode`.
         * @param {!Node} startNode
         */
        _unmanageSubtree(startNode) {
          composedTreeWalk(startNode, (node) => this._unmanageNode(node));
        }

        /**
         * If a descendant node is found with an `inert` attribute, adopt its managed nodes.
         * @param {!Element} node
         */
        _adoptInertRoot(node) {
          let inertSubroot = this._inertManager.getInertRoot(node);

          // During initialisation this inert root may not have been registered yet,
          // so register it now if need be.
          if (!inertSubroot) {
            this._inertManager.setInert(node, true);
            inertSubroot = this._inertManager.getInertRoot(node);
          }

          inertSubroot.managedNodes.forEach(function(savedInertNode) {
            this._manageNode(savedInertNode.node);
          }, this);
        }

        /**
         * Callback used when mutation observer detects subtree additions, removals, or attribute changes.
         * @param {!Array<!MutationRecord>} records
         * @param {!MutationObserver} self
         */
        _onMutation(records, self) {
          records.forEach(function(record) {
            const target = /** @type {!Element} */ (record.target);
            if (record.type === 'childList') {
              // Manage added nodes
              slice.call(record.addedNodes).forEach(function(node) {
                this._makeSubtreeUnfocusable(node);
              }, this);

              // Un-manage removed nodes
              slice.call(record.removedNodes).forEach(function(node) {
                this._unmanageSubtree(node);
              }, this);
            } else if (record.type === 'attributes') {
              if (record.attributeName === 'tabindex') {
                // Re-initialise inert node if tabindex changes
                this._manageNode(target);
              } else if (target !== this._rootElement &&
                        record.attributeName === 'inert' &&
                        target.hasAttribute('inert')) {
                // If a new inert root is added, adopt its managed nodes and make sure it knows about the
                // already managed nodes from this inert subroot.
                this._adoptInertRoot(target);
                const inertSubroot = this._inertManager.getInertRoot(target);
                this._managedNodes.forEach(function(managedNode) {
                  if (target.contains(managedNode.node)) {
                    inertSubroot._manageNode(managedNode.node);
                  }
                });
              }
            }
          }, this);
        }
      }

      /**
       * `InertNode` initialises and manages a single inert node.
       * A node is inert if it is a descendant of one or more inert root elements.
       *
       * On construction, `InertNode` saves the existing `tabindex` value for the node, if any, and
       * either removes the `tabindex` attribute or sets it to `-1`, depending on whether the element
       * is intrinsically focusable or not.
       *
       * `InertNode` maintains a set of `InertRoot`s which are descendants of this `InertNode`. When an
       * `InertRoot` is destroyed, and calls `InertManager.deregister()`, the `InertManager` notifies the
       * `InertNode` via `removeInertRoot()`, which in turn destroys the `InertNode` if no `InertRoot`s
       * remain in the set. On destruction, `InertNode` reinstates the stored `tabindex` if one exists,
       * or removes the `tabindex` attribute if the element is intrinsically focusable.
       */
      class InertNode {
        /**
         * @param {!Node} node A focusable element to be made inert.
         * @param {!InertRoot} inertRoot The inert root element associated with this inert node.
         */
        constructor(node, inertRoot) {
          /** @type {!Node} */
          this._node = node;

          /** @type {boolean} */
          this._overrodeFocusMethod = false;

          /**
           * @type {!Set<!InertRoot>} The set of descendant inert roots.
           *    If and only if this set becomes empty, this node is no longer inert.
           */
          this._inertRoots = new Set([inertRoot]);

          /** @type {?number} */
          this._savedTabIndex = null;

          /** @type {boolean} */
          this._destroyed = false;

          // Save any prior tabindex info and make this node untabbable
          this.ensureUntabbable();
        }

        /**
         * Call this whenever this object is about to become obsolete.
         * This makes the managed node focusable again and deletes all of the previously stored state.
         */
        destructor() {
          this._throwIfDestroyed();

          if (this._node && this._node.nodeType === Node.ELEMENT_NODE) {
            const element = /** @type {!Element} */ (this._node);
            if (this._savedTabIndex !== null) {
              element.setAttribute('tabindex', this._savedTabIndex);
            } else {
              element.removeAttribute('tabindex');
            }

            // Use `delete` to restore native focus method.
            if (this._overrodeFocusMethod) {
              delete element.focus;
            }
          }

          // See note in InertRoot.destructor for why we cast these nulls to ANY.
          this._node = /** @type {?} */ (null);
          this._inertRoots = /** @type {?} */ (null);
          this._destroyed = true;
        }

        /**
         * @type {boolean} Whether this object is obsolete because the managed node is no longer inert.
         * If the object has been destroyed, any attempt to access it will cause an exception.
         */
        get destroyed() {
          return /** @type {!InertNode} */ (this)._destroyed;
        }

        /**
         * Throw if user tries to access destroyed InertNode.
         */
        _throwIfDestroyed() {
          if (this.destroyed) {
            throw new Error('Trying to access destroyed InertNode');
          }
        }

        /** @return {boolean} */
        get hasSavedTabIndex() {
          return this._savedTabIndex !== null;
        }

        /** @return {!Node} */
        get node() {
          this._throwIfDestroyed();
          return this._node;
        }

        /** @param {?number} tabIndex */
        set savedTabIndex(tabIndex) {
          this._throwIfDestroyed();
          this._savedTabIndex = tabIndex;
        }

        /** @return {?number} */
        get savedTabIndex() {
          this._throwIfDestroyed();
          return this._savedTabIndex;
        }

        /** Save the existing tabindex value and make the node untabbable and unfocusable */
        ensureUntabbable() {
          if (this.node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          const element = /** @type {!Element} */ (this.node);
          if (matches.call(element, _focusableElementsString)) {
            if (/** @type {!HTMLElement} */ (element).tabIndex === -1 &&
                this.hasSavedTabIndex) {
              return;
            }

            if (element.hasAttribute('tabindex')) {
              this._savedTabIndex = /** @type {!HTMLElement} */ (element).tabIndex;
            }
            element.setAttribute('tabindex', '-1');
            if (element.nodeType === Node.ELEMENT_NODE) {
              element.focus = function() {};
              this._overrodeFocusMethod = true;
            }
          } else if (element.hasAttribute('tabindex')) {
            this._savedTabIndex = /** @type {!HTMLElement} */ (element).tabIndex;
            element.removeAttribute('tabindex');
          }
        }

        /**
         * Add another inert root to this inert node's set of managing inert roots.
         * @param {!InertRoot} inertRoot
         */
        addInertRoot(inertRoot) {
          this._throwIfDestroyed();
          this._inertRoots.add(inertRoot);
        }

        /**
         * Remove the given inert root from this inert node's set of managing inert roots.
         * If the set of managing inert roots becomes empty, this node is no longer inert,
         * so the object should be destroyed.
         * @param {!InertRoot} inertRoot
         */
        removeInertRoot(inertRoot) {
          this._throwIfDestroyed();
          this._inertRoots.delete(inertRoot);
          if (this._inertRoots.size === 0) {
            this.destructor();
          }
        }
      }

      /**
       * InertManager is a per-document singleton object which manages all inert roots and nodes.
       *
       * When an element becomes an inert root by having an `inert` attribute set and/or its `inert`
       * property set to `true`, the `setInert` method creates an `InertRoot` object for the element.
       * The `InertRoot` in turn registers itself as managing all of the element's focusable descendant
       * nodes via the `register()` method. The `InertManager` ensures that a single `InertNode` instance
       * is created for each such node, via the `_managedNodes` map.
       */
      class InertManager {
        /**
         * @param {!Document} document
         */
        constructor(document) {
          if (!document) {
            throw new Error('Missing required argument; InertManager needs to wrap a document.');
          }

          /** @type {!Document} */
          this._document = document;

          /**
           * All managed nodes known to this InertManager. In a map to allow looking up by Node.
           * @type {!Map<!Node, !InertNode>}
           */
          this._managedNodes = new Map();

          /**
           * All inert roots known to this InertManager. In a map to allow looking up by Node.
           * @type {!Map<!Node, !InertRoot>}
           */
          this._inertRoots = new Map();

          /**
           * Observer for mutations on `document.body`.
           * @type {!MutationObserver}
           */
          this._observer = new MutationObserver(this._watchForInert.bind(this));

          // Add inert style.
          addInertStyle(document.head || document.body || document.documentElement);

          // Wait for document to be loaded.
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', this._onDocumentLoaded.bind(this));
          } else {
            this._onDocumentLoaded();
          }
        }

        /**
         * Set whether the given element should be an inert root or not.
         * @param {!Element} root
         * @param {boolean} inert
         */
        setInert(root, inert) {
          if (inert) {
            if (this._inertRoots.has(root)) { // element is already inert
              return;
            }

            const inertRoot = new InertRoot(root, this);
            root.setAttribute('inert', '');
            this._inertRoots.set(root, inertRoot);
            // If not contained in the document, it must be in a shadowRoot.
            // Ensure inert styles are added there.
            if (!this._document.body.contains(root)) {
              let parent = root.parentNode;
              while (parent) {
                if (parent.nodeType === 11) {
                  addInertStyle(parent);
                }
                parent = parent.parentNode;
              }
            }
          } else {
            if (!this._inertRoots.has(root)) { // element is already non-inert
              return;
            }

            const inertRoot = this._inertRoots.get(root);
            inertRoot.destructor();
            this._inertRoots.delete(root);
            root.removeAttribute('inert');
          }
        }

        /**
         * Get the InertRoot object corresponding to the given inert root element, if any.
         * @param {!Node} element
         * @return {!InertRoot|undefined}
         */
        getInertRoot(element) {
          return this._inertRoots.get(element);
        }

        /**
         * Register the given InertRoot as managing the given node.
         * In the case where the node has a previously existing inert root, this inert root will
         * be added to its set of inert roots.
         * @param {!Node} node
         * @param {!InertRoot} inertRoot
         * @return {!InertNode} inertNode
         */
        register(node, inertRoot) {
          let inertNode = this._managedNodes.get(node);
          if (inertNode !== undefined) { // node was already in an inert subtree
            inertNode.addInertRoot(inertRoot);
          } else {
            inertNode = new InertNode(node, inertRoot);
          }

          this._managedNodes.set(node, inertNode);

          return inertNode;
        }

        /**
         * De-register the given InertRoot as managing the given inert node.
         * Removes the inert root from the InertNode's set of managing inert roots, and remove the inert
         * node from the InertManager's set of managed nodes if it is destroyed.
         * If the node is not currently managed, this is essentially a no-op.
         * @param {!Node} node
         * @param {!InertRoot} inertRoot
         * @return {?InertNode} The potentially destroyed InertNode associated with this node, if any.
         */
        deregister(node, inertRoot) {
          const inertNode = this._managedNodes.get(node);
          if (!inertNode) {
            return null;
          }

          inertNode.removeInertRoot(inertRoot);
          if (inertNode.destroyed) {
            this._managedNodes.delete(node);
          }

          return inertNode;
        }

        /**
         * Callback used when document has finished loading.
         */
        _onDocumentLoaded() {
          // Find all inert roots in document and make them actually inert.
          const inertElements = slice.call(this._document.querySelectorAll('[inert]'));
          inertElements.forEach(function(inertElement) {
            this.setInert(inertElement, true);
          }, this);

          // Comment this out to use programmatic API only.
          this._observer.observe(this._document.body || this._document.documentElement, {attributes: true, subtree: true, childList: true});
        }

        /**
         * Callback used when mutation observer detects attribute changes.
         * @param {!Array<!MutationRecord>} records
         * @param {!MutationObserver} self
         */
        _watchForInert(records, self) {
          const _this = this;
          records.forEach(function(record) {
            switch (record.type) {
            case 'childList':
              slice.call(record.addedNodes).forEach(function(node) {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                  return;
                }
                const inertElements = slice.call(node.querySelectorAll('[inert]'));
                if (matches.call(node, '[inert]')) {
                  inertElements.unshift(node);
                }
                inertElements.forEach(function(inertElement) {
                  this.setInert(inertElement, true);
                }, _this);
              }, _this);
              break;
            case 'attributes':
              if (record.attributeName !== 'inert') {
                return;
              }
              const target = /** @type {!Element} */ (record.target);
              const inert = target.hasAttribute('inert');
              _this.setInert(target, inert);
              break;
            }
          }, this);
        }
      }

      /**
       * Recursively walk the composed tree from |node|.
       * @param {!Node} node
       * @param {(function (!Element))=} callback Callback to be called for each element traversed,
       *     before descending into child nodes.
       * @param {?ShadowRoot=} shadowRootAncestor The nearest ShadowRoot ancestor, if any.
       */
      function composedTreeWalk(node, callback, shadowRootAncestor) {
        if (node.nodeType == Node.ELEMENT_NODE) {
          const element = /** @type {!Element} */ (node);
          if (callback) {
            callback(element);
          }

          // Descend into node:
          // If it has a ShadowRoot, ignore all child elements - these will be picked
          // up by the <content> or <shadow> elements. Descend straight into the
          // ShadowRoot.
          const shadowRoot = /** @type {!HTMLElement} */ (element).shadowRoot;
          if (shadowRoot) {
            composedTreeWalk(shadowRoot, callback);
            return;
          }

          // If it is a <content> element, descend into distributed elements - these
          // are elements from outside the shadow root which are rendered inside the
          // shadow DOM.
          if (element.localName == 'content') {
            const content = /** @type {!HTMLContentElement} */ (element);
            // Verifies if ShadowDom v0 is supported.
            const distributedNodes = content.getDistributedNodes ?
              content.getDistributedNodes() : [];
            for (let i = 0; i < distributedNodes.length; i++) {
              composedTreeWalk(distributedNodes[i], callback);
            }
            return;
          }

          // If it is a <slot> element, descend into assigned nodes - these
          // are elements from outside the shadow root which are rendered inside the
          // shadow DOM.
          if (element.localName == 'slot') {
            const slot = /** @type {!HTMLSlotElement} */ (element);
            // Verify if ShadowDom v1 is supported.
            const distributedNodes = slot.assignedNodes ?
              slot.assignedNodes({flatten: true}) : [];
            for (let i = 0; i < distributedNodes.length; i++) {
              composedTreeWalk(distributedNodes[i], callback);
            }
            return;
          }
        }

        // If it is neither the parent of a ShadowRoot, a <content> element, a <slot>
        // element, nor a <shadow> element recurse normally.
        let child = node.firstChild;
        while (child != null) {
          composedTreeWalk(child, callback);
          child = child.nextSibling;
        }
      }

      /**
       * Adds a style element to the node containing the inert specific styles
       * @param {!Node} node
       */
      function addInertStyle(node) {
        if (node.querySelector('style#inert-style, link#inert-style')) {
          return;
        }
        const style = document.createElement('style');
        style.setAttribute('id', 'inert-style');
        style.textContent = '\n'+
                            '[inert] {\n' +
                            '  pointer-events: none;\n' +
                            '  cursor: default;\n' +
                            '}\n' +
                            '\n' +
                            '[inert], [inert] * {\n' +
                            '  -webkit-user-select: none;\n' +
                            '  -moz-user-select: none;\n' +
                            '  -ms-user-select: none;\n' +
                            '  user-select: none;\n' +
                            '}\n';
        node.appendChild(style);
      }

      /** @type {!InertManager} */
      const inertManager = new InertManager(document);

      if (!Element.prototype.hasOwnProperty('inert')) {
        Object.defineProperty(Element.prototype, 'inert', {
          enumerable: true,
          /** @this {!Element} */
          get: function() {
            return this.hasAttribute('inert');
          },
          /** @this {!Element} */
          set: function(inert) {
            inertManager.setInert(this, inert);
          },
        });
      }
    })();

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$2 = {
        ANIMATE: 'mdc-drawer--animate',
        CLOSING: 'mdc-drawer--closing',
        DISMISSIBLE: 'mdc-drawer--dismissible',
        MODAL: 'mdc-drawer--modal',
        OPEN: 'mdc-drawer--open',
        OPENING: 'mdc-drawer--opening',
        ROOT: 'mdc-drawer',
    };
    var strings$2 = {
        APP_CONTENT_SELECTOR: '.mdc-drawer-app-content',
        CLOSE_EVENT: 'MDCDrawer:closed',
        OPEN_EVENT: 'MDCDrawer:opened',
        SCRIM_SELECTOR: '.mdc-drawer-scrim',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCDismissibleDrawerFoundation = /** @class */ (function (_super) {
        __extends(MDCDismissibleDrawerFoundation, _super);
        function MDCDismissibleDrawerFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCDismissibleDrawerFoundation.defaultAdapter), adapter)) || this;
            _this.animationFrame_ = 0;
            _this.animationTimer_ = 0;
            return _this;
        }
        Object.defineProperty(MDCDismissibleDrawerFoundation, "strings", {
            get: function () {
                return strings$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCDismissibleDrawerFoundation, "cssClasses", {
            get: function () {
                return cssClasses$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCDismissibleDrawerFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    elementHasClass: function () { return false; },
                    notifyClose: function () { return undefined; },
                    notifyOpen: function () { return undefined; },
                    saveFocus: function () { return undefined; },
                    restoreFocus: function () { return undefined; },
                    focusActiveNavigationItem: function () { return undefined; },
                    trapFocus: function () { return undefined; },
                    releaseFocus: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCDismissibleDrawerFoundation.prototype.destroy = function () {
            if (this.animationFrame_) {
                cancelAnimationFrame(this.animationFrame_);
            }
            if (this.animationTimer_) {
                clearTimeout(this.animationTimer_);
            }
        };
        /**
         * Opens the drawer from the closed state.
         */
        MDCDismissibleDrawerFoundation.prototype.open = function () {
            var _this = this;
            if (this.isOpen() || this.isOpening() || this.isClosing()) {
                return;
            }
            this.adapter.addClass(cssClasses$2.OPEN);
            this.adapter.addClass(cssClasses$2.ANIMATE);
            // Wait a frame once display is no longer "none", to establish basis for animation
            this.runNextAnimationFrame_(function () {
                _this.adapter.addClass(cssClasses$2.OPENING);
            });
            this.adapter.saveFocus();
        };
        /**
         * Closes the drawer from the open state.
         */
        MDCDismissibleDrawerFoundation.prototype.close = function () {
            if (!this.isOpen() || this.isOpening() || this.isClosing()) {
                return;
            }
            this.adapter.addClass(cssClasses$2.CLOSING);
        };
        /**
         * Returns true if the drawer is in the open position.
         * @return true if drawer is in open state.
         */
        MDCDismissibleDrawerFoundation.prototype.isOpen = function () {
            return this.adapter.hasClass(cssClasses$2.OPEN);
        };
        /**
         * Returns true if the drawer is animating open.
         * @return true if drawer is animating open.
         */
        MDCDismissibleDrawerFoundation.prototype.isOpening = function () {
            return this.adapter.hasClass(cssClasses$2.OPENING) ||
                this.adapter.hasClass(cssClasses$2.ANIMATE);
        };
        /**
         * Returns true if the drawer is animating closed.
         * @return true if drawer is animating closed.
         */
        MDCDismissibleDrawerFoundation.prototype.isClosing = function () {
            return this.adapter.hasClass(cssClasses$2.CLOSING);
        };
        /**
         * Keydown handler to close drawer when key is escape.
         */
        MDCDismissibleDrawerFoundation.prototype.handleKeydown = function (evt) {
            var keyCode = evt.keyCode, key = evt.key;
            var isEscape = key === 'Escape' || keyCode === 27;
            if (isEscape) {
                this.close();
            }
        };
        /**
         * Handles the `transitionend` event when the drawer finishes opening/closing.
         */
        MDCDismissibleDrawerFoundation.prototype.handleTransitionEnd = function (evt) {
            var OPENING = cssClasses$2.OPENING, CLOSING = cssClasses$2.CLOSING, OPEN = cssClasses$2.OPEN, ANIMATE = cssClasses$2.ANIMATE, ROOT = cssClasses$2.ROOT;
            // In Edge, transitionend on ripple pseudo-elements yields a target without classList, so check for Element first.
            var isRootElement = this.isElement_(evt.target) &&
                this.adapter.elementHasClass(evt.target, ROOT);
            if (!isRootElement) {
                return;
            }
            if (this.isClosing()) {
                this.adapter.removeClass(OPEN);
                this.closed_();
                this.adapter.restoreFocus();
                this.adapter.notifyClose();
            }
            else {
                this.adapter.focusActiveNavigationItem();
                this.opened_();
                this.adapter.notifyOpen();
            }
            this.adapter.removeClass(ANIMATE);
            this.adapter.removeClass(OPENING);
            this.adapter.removeClass(CLOSING);
        };
        /**
         * Extension point for when drawer finishes open animation.
         */
        MDCDismissibleDrawerFoundation.prototype.opened_ = function () { }; // tslint:disable-line:no-empty
        /**
         * Extension point for when drawer finishes close animation.
         */
        MDCDismissibleDrawerFoundation.prototype.closed_ = function () { }; // tslint:disable-line:no-empty
        /**
         * Runs the given logic on the next animation frame, using setTimeout to factor in Firefox reflow behavior.
         */
        MDCDismissibleDrawerFoundation.prototype.runNextAnimationFrame_ = function (callback) {
            var _this = this;
            cancelAnimationFrame(this.animationFrame_);
            this.animationFrame_ = requestAnimationFrame(function () {
                _this.animationFrame_ = 0;
                clearTimeout(_this.animationTimer_);
                _this.animationTimer_ = setTimeout(callback, 0);
            });
        };
        MDCDismissibleDrawerFoundation.prototype.isElement_ = function (element) {
            // In Edge, transitionend on ripple pseudo-elements yields a target without classList.
            return Boolean(element.classList);
        };
        return MDCDismissibleDrawerFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCModalDrawerFoundation = /** @class */ (function (_super) {
        __extends(MDCModalDrawerFoundation, _super);
        function MDCModalDrawerFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
         * Handles click event on scrim.
         */
        MDCModalDrawerFoundation.prototype.handleScrimClick = function () {
            this.close();
        };
        /**
         * Called when drawer finishes open animation.
         */
        MDCModalDrawerFoundation.prototype.opened_ = function () {
            this.adapter.trapFocus();
        };
        /**
         * Called when drawer finishes close animation.
         */
        MDCModalDrawerFoundation.prototype.closed_ = function () {
            this.adapter.releaseFocus();
        };
        return MDCModalDrawerFoundation;
    }(MDCDismissibleDrawerFoundation));

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */ // tslint:disable:no-any
    /**
     * Specifies an observer callback that is run when the decorated property
     * changes. The observer receives the current and old value as arguments.
     */
    const observer = (observer) => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (proto, propName) => {
        // if we haven't wrapped `updated` in this class, do so
        if (!proto.constructor
            ._observers) {
            proto.constructor._observers = new Map();
            const userUpdated = proto.updated;
            proto.updated = function (changedProperties) {
                userUpdated.call(this, changedProperties);
                changedProperties.forEach((v, k) => {
                    const observers = this.constructor
                        ._observers;
                    const observer = observers.get(k);
                    if (observer !== undefined) {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        observer.call(this, this[k], v);
                    }
                });
            };
            // clone any existing observers (superclasses)
        }
        else if (!proto.constructor.hasOwnProperty('_observers')) {
            const observers = proto.constructor._observers;
            proto.constructor._observers = new Map();
            observers.forEach(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (v, k) => proto.constructor._observers.set(k, v));
        }
        // set this method
        proto.constructor._observers.set(propName, observer);
    };

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const blockingElements = document.$blockingElements;
    class DrawerBase extends BaseElement {
        constructor() {
            super(...arguments);
            this._previousFocus = null;
            this.open = false;
            this.hasHeader = false;
            this.type = '';
        }
        get mdcFoundationClass() {
            return this.type === 'modal' ? MDCModalDrawerFoundation :
                MDCDismissibleDrawerFoundation;
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { elementHasClass: (element, className) => element.classList.contains(className), saveFocus: () => {
                    // Note, casting to avoid cumbersome runtime check.
                    this._previousFocus =
                        this.getRootNode().activeElement;
                }, restoreFocus: () => {
                    const previousFocus = this._previousFocus && this._previousFocus.focus;
                    if (previousFocus) {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        this._previousFocus.focus();
                    }
                }, notifyClose: () => {
                    this.open = false;
                    this.dispatchEvent(new Event(strings$2.CLOSE_EVENT, { bubbles: true, cancelable: true }));
                }, notifyOpen: () => {
                    this.open = true;
                    this.dispatchEvent(new Event(strings$2.OPEN_EVENT, { bubbles: true, cancelable: true }));
                }, focusActiveNavigationItem: () => { }, trapFocus: () => {
                    blockingElements.push(this);
                    this.appContent.inert = true;
                }, releaseFocus: () => {
                    blockingElements.remove(this);
                    this.appContent.inert = false;
                } });
        }
        _handleScrimClick() {
            if (this.mdcFoundation instanceof MDCModalDrawerFoundation) {
                this.mdcFoundation.handleScrimClick();
            }
        }
        render() {
            const dismissible = this.type === 'dismissible' || this.type === 'modal';
            const modal = this.type === 'modal';
            const header = this.hasHeader ? html `
      <div class="mdc-drawer__header">
        <h3 class="mdc-drawer__title"><slot name="title"></slot></h3>
        <h6 class="mdc-drawer__subtitle"><slot name="subtitle"></slot></h6>
        <slot name="header"></slot>
      </div>
      ` :
                '';
            const classes = {
                'mdc-drawer--dismissible': dismissible,
                'mdc-drawer--modal': modal,
            };
            return html `
      <aside class="mdc-drawer ${classMap(classes)}">
        ${header}
        <div class="mdc-drawer__content"><slot></slot></div>
      </aside>
      ${modal ? html `<div class="mdc-drawer-scrim"
                          @click="${this._handleScrimClick}"></div>` :
            ''}
      <div class="mdc-drawer-app-content">
        <slot name="appContent"></slot>
      </div>
      `;
        }
        // note, we avoid calling `super.firstUpdated()` to control when
        // `createFoundation()` is called.
        firstUpdated() {
            this.mdcRoot.addEventListener('keydown', (e) => this.mdcFoundation.handleKeydown(e));
            this.mdcRoot.addEventListener('transitionend', (e) => this.mdcFoundation.handleTransitionEnd(e));
        }
        updated(changedProperties) {
            if (changedProperties.has('type')) {
                this.createFoundation();
            }
        }
    }
    __decorate([
        query('.mdc-drawer')
    ], DrawerBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('.mdc-drawer-app-content')
    ], DrawerBase.prototype, "appContent", void 0);
    __decorate([
        observer(function (value) {
            if (this.type === '') {
                return;
            }
            if (value) {
                this.mdcFoundation.open();
            }
            else {
                this.mdcFoundation.close();
            }
        }),
        property({ type: Boolean, reflect: true })
    ], DrawerBase.prototype, "open", void 0);
    __decorate([
        property({ type: Boolean })
    ], DrawerBase.prototype, "hasHeader", void 0);
    __decorate([
        property({ reflect: true })
    ], DrawerBase.prototype, "type", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$3 = css `.mdc-drawer{border-color:rgba(0,0,0,.12);background-color:#fff;border-top-left-radius:0;border-top-right-radius:0;border-top-right-radius:var(--mdc-shape-large, 0);border-bottom-right-radius:0;border-bottom-right-radius:var(--mdc-shape-large, 0);border-bottom-left-radius:0;z-index:6;width:256px;display:flex;flex-direction:column;flex-shrink:0;box-sizing:border-box;height:100%;border-right-width:1px;border-right-style:solid;overflow:hidden;transition-property:transform;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.mdc-drawer .mdc-drawer__title{color:rgba(0,0,0,.87)}.mdc-drawer .mdc-list-group__subheader{color:rgba(0,0,0,.6)}.mdc-drawer .mdc-drawer__subtitle{color:rgba(0,0,0,.6)}.mdc-drawer .mdc-list-item__graphic{color:rgba(0,0,0,.6)}.mdc-drawer .mdc-list-item{color:rgba(0,0,0,.87)}.mdc-drawer .mdc-list-item--activated .mdc-list-item__graphic{color:#6200ee}.mdc-drawer .mdc-list-item--activated{color:rgba(98,0,238,.87)}[dir=rtl] .mdc-drawer,.mdc-drawer[dir=rtl]{border-top-left-radius:0;border-top-left-radius:var(--mdc-shape-large, 0);border-top-right-radius:0;border-bottom-right-radius:0;border-bottom-left-radius:0;border-bottom-left-radius:var(--mdc-shape-large, 0)}.mdc-drawer .mdc-list-item{border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content{margin-left:256px;margin-right:0}[dir=rtl] .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content,.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content[dir=rtl]{margin-left:0;margin-right:256px}[dir=rtl] .mdc-drawer,.mdc-drawer[dir=rtl]{border-right-width:0;border-left-width:1px;border-right-style:none;border-left-style:solid}.mdc-drawer .mdc-list-item{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-subtitle2-font-size, 0.875rem);line-height:1.375rem;line-height:var(--mdc-typography-subtitle2-line-height, 1.375rem);font-weight:500;font-weight:var(--mdc-typography-subtitle2-font-weight, 500);letter-spacing:0.0071428571em;letter-spacing:var(--mdc-typography-subtitle2-letter-spacing, 0.0071428571em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle2-text-transform, inherit);height:calc(48px - 2 * 4px);margin:8px 8px;padding:0 8px}.mdc-drawer .mdc-list-item:nth-child(1){margin-top:2px}.mdc-drawer .mdc-list-item:nth-last-child(1){margin-bottom:0}.mdc-drawer .mdc-list-group__subheader{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);display:block;margin-top:0;line-height:normal;margin:0;padding:0 16px}.mdc-drawer .mdc-list-group__subheader::before{display:inline-block;width:0;height:24px;content:"";vertical-align:0}.mdc-drawer .mdc-list-divider{margin:3px 0 4px}.mdc-drawer .mdc-list-item__text,.mdc-drawer .mdc-list-item__graphic{pointer-events:none}.mdc-drawer--animate{transform:translateX(-100%)}[dir=rtl] .mdc-drawer--animate,.mdc-drawer--animate[dir=rtl]{transform:translateX(100%)}.mdc-drawer--opening{transform:translateX(0);transition-duration:250ms}[dir=rtl] .mdc-drawer--opening,.mdc-drawer--opening[dir=rtl]{transform:translateX(0)}.mdc-drawer--closing{transform:translateX(-100%);transition-duration:200ms}[dir=rtl] .mdc-drawer--closing,.mdc-drawer--closing[dir=rtl]{transform:translateX(100%)}.mdc-drawer__header{flex-shrink:0;box-sizing:border-box;min-height:64px;padding:0 16px 4px}.mdc-drawer__title{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-headline6-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1.25rem;font-size:var(--mdc-typography-headline6-font-size, 1.25rem);line-height:2rem;line-height:var(--mdc-typography-headline6-line-height, 2rem);font-weight:500;font-weight:var(--mdc-typography-headline6-font-weight, 500);letter-spacing:0.0125em;letter-spacing:var(--mdc-typography-headline6-letter-spacing, 0.0125em);text-decoration:inherit;text-decoration:var(--mdc-typography-headline6-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-headline6-text-transform, inherit);display:block;margin-top:0;line-height:normal;margin-bottom:-20px}.mdc-drawer__title::before{display:inline-block;width:0;height:36px;content:"";vertical-align:0}.mdc-drawer__title::after{display:inline-block;width:0;height:20px;content:"";vertical-align:-20px}.mdc-drawer__subtitle{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);display:block;margin-top:0;line-height:normal;margin-bottom:0}.mdc-drawer__subtitle::before{display:inline-block;width:0;height:20px;content:"";vertical-align:0}.mdc-drawer__content{height:100%;overflow-y:auto;-webkit-overflow-scrolling:touch}.mdc-drawer--dismissible{left:0;right:initial;display:none;position:absolute}[dir=rtl] .mdc-drawer--dismissible,.mdc-drawer--dismissible[dir=rtl]{left:initial;right:0}.mdc-drawer--dismissible.mdc-drawer--open{display:flex}.mdc-drawer-app-content{margin-left:0;margin-right:0;position:relative}[dir=rtl] .mdc-drawer-app-content,.mdc-drawer-app-content[dir=rtl]{margin-left:0;margin-right:0}.mdc-drawer--modal{box-shadow:0px 8px 10px -5px rgba(0, 0, 0, 0.2),0px 16px 24px 2px rgba(0, 0, 0, 0.14),0px 6px 30px 5px rgba(0,0,0,.12);left:0;right:initial;display:none;position:fixed}.mdc-drawer--modal+.mdc-drawer-scrim{background-color:rgba(0,0,0,.32)}[dir=rtl] .mdc-drawer--modal,.mdc-drawer--modal[dir=rtl]{left:initial;right:0}.mdc-drawer--modal.mdc-drawer--open{display:flex}.mdc-drawer-scrim{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:5;transition-property:opacity;transition-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.mdc-drawer--open+.mdc-drawer-scrim{display:block}.mdc-drawer--animate+.mdc-drawer-scrim{opacity:0}.mdc-drawer--opening+.mdc-drawer-scrim{transition-duration:250ms;opacity:1}.mdc-drawer--closing+.mdc-drawer-scrim{transition-duration:200ms;opacity:0}.mdc-drawer-app-content{overflow:auto;flex:1}:host{display:flex;height:100%}.mdc-drawer{width:256px;width:var(--mdc-drawer-width, 256px)}.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content{margin-left:256px;margin-left:var(--mdc-drawer-width, 256px);margin-right:0}[dir=rtl] .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content,.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing)+.mdc-drawer-app-content[dir=rtl]{margin-left:0;margin-right:256px;margin-right:var(--mdc-drawer-width, 256px)}`;

    let Drawer = class Drawer extends DrawerBase {
    };
    Drawer.styles = style$3;
    Drawer = __decorate([
        customElement('mwc-drawer')
    ], Drawer);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$3 = {
        ACTIVE: 'mdc-tab-indicator--active',
        FADE: 'mdc-tab-indicator--fade',
        NO_TRANSITION: 'mdc-tab-indicator--no-transition',
    };
    var strings$3 = {
        CONTENT_SELECTOR: '.mdc-tab-indicator__content',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCTabIndicatorFoundation, _super);
        function MDCTabIndicatorFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCTabIndicatorFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCTabIndicatorFoundation, "cssClasses", {
            get: function () {
                return cssClasses$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabIndicatorFoundation, "strings", {
            get: function () {
                return strings$3;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabIndicatorFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    computeContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    setContentStyleProperty: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTabIndicatorFoundation.prototype.computeContentClientRect = function () {
            return this.adapter.computeContentClientRect();
        };
        return MDCTabIndicatorFoundation;
    }(MDCFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCFadingTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCFadingTabIndicatorFoundation, _super);
        function MDCFadingTabIndicatorFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCFadingTabIndicatorFoundation.prototype.activate = function () {
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        MDCFadingTabIndicatorFoundation.prototype.deactivate = function () {
            this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        return MDCFadingTabIndicatorFoundation;
    }(MDCTabIndicatorFoundation));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /* istanbul ignore next: subclass is not a branch statement */
    var MDCSlidingTabIndicatorFoundation = /** @class */ (function (_super) {
        __extends(MDCSlidingTabIndicatorFoundation, _super);
        function MDCSlidingTabIndicatorFoundation() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCSlidingTabIndicatorFoundation.prototype.activate = function (previousIndicatorClientRect) {
            // Early exit if no indicator is present to handle cases where an indicator
            // may be activated without a prior indicator state
            if (!previousIndicatorClientRect) {
                this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
                return;
            }
            // This animation uses the FLIP approach. You can read more about it at the link below:
            // https://aerotwist.com/blog/flip-your-animations/
            // Calculate the dimensions based on the dimensions of the previous indicator
            var currentClientRect = this.computeContentClientRect();
            var widthDelta = previousIndicatorClientRect.width / currentClientRect.width;
            var xPosition = previousIndicatorClientRect.left - currentClientRect.left;
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
            this.adapter.setContentStyleProperty('transform', "translateX(" + xPosition + "px) scaleX(" + widthDelta + ")");
            // Force repaint before updating classes and transform to ensure the transform properly takes effect
            this.computeContentClientRect();
            this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.NO_TRANSITION);
            this.adapter.addClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
            this.adapter.setContentStyleProperty('transform', '');
        };
        MDCSlidingTabIndicatorFoundation.prototype.deactivate = function () {
            this.adapter.removeClass(MDCTabIndicatorFoundation.cssClasses.ACTIVE);
        };
        return MDCSlidingTabIndicatorFoundation;
    }(MDCTabIndicatorFoundation));

    class TabIndicatorBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.icon = '';
            this.fade = false;
        }
        get mdcFoundationClass() {
            return this.fade ? MDCFadingTabIndicatorFoundation :
                MDCSlidingTabIndicatorFoundation;
        }
        render() {
            const contentClasses = {
                'mdc-tab-indicator__content--icon': this.icon,
                'material-icons': this.icon,
                'mdc-tab-indicator__content--underline': !this.icon,
            };
            return html `
      <span class="mdc-tab-indicator ${classMap({
            'mdc-tab-indicator--fade': this.fade
        })}">
        <span class="mdc-tab-indicator__content ${classMap(contentClasses)}">${this.icon}</span>
      </span>
      `;
        }
        updated(changedProperties) {
            if (changedProperties.has('fade')) {
                this.createFoundation();
            }
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { computeContentClientRect: () => this.contentElement.getBoundingClientRect(), setContentStyleProperty: (prop, value) => this.contentElement.style.setProperty(prop, value) });
        }
        computeContentClientRect() {
            return this.mdcFoundation.computeContentClientRect();
        }
        activate(previousIndicatorClientRect) {
            this.mdcFoundation.activate(previousIndicatorClientRect);
        }
        deactivate() {
            this.mdcFoundation.deactivate();
        }
    }
    __decorate([
        query('.mdc-tab-indicator')
    ], TabIndicatorBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('.mdc-tab-indicator__content')
    ], TabIndicatorBase.prototype, "contentElement", void 0);
    __decorate([
        property()
    ], TabIndicatorBase.prototype, "icon", void 0);
    __decorate([
        property({ type: Boolean })
    ], TabIndicatorBase.prototype, "fade", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$4 = css `.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}.mdc-tab-indicator{display:flex;position:absolute;top:0;left:0;justify-content:center;width:100%;height:100%;pointer-events:none;z-index:1}.mdc-tab-indicator .mdc-tab-indicator__content--underline{border-color:#6200ee;border-color:var(--mdc-theme-primary, #6200ee)}.mdc-tab-indicator .mdc-tab-indicator__content--icon{color:#018786;color:var(--mdc-theme-secondary, #018786)}.mdc-tab-indicator .mdc-tab-indicator__content--underline{border-top-width:2px}.mdc-tab-indicator .mdc-tab-indicator__content--icon{height:34px;font-size:34px}.mdc-tab-indicator__content{transform-origin:left;opacity:0}.mdc-tab-indicator__content--underline{align-self:flex-end;box-sizing:border-box;width:100%;border-top-style:solid}.mdc-tab-indicator__content--icon{align-self:center;margin:0 auto}.mdc-tab-indicator--active .mdc-tab-indicator__content{opacity:1}.mdc-tab-indicator .mdc-tab-indicator__content{transition:250ms transform cubic-bezier(0.4, 0, 0.2, 1)}.mdc-tab-indicator--no-transition .mdc-tab-indicator__content{transition:none}.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition:150ms opacity linear}.mdc-tab-indicator--active.mdc-tab-indicator--fade .mdc-tab-indicator__content{transition-delay:100ms}`;

    let TabIndicator = class TabIndicator extends TabIndicatorBase {
    };
    TabIndicator.styles = style$4;
    TabIndicator = __decorate([
        customElement('mwc-tab-indicator')
    ], TabIndicator);

    /**
     * @license
     * Copyright 2019 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * Determine whether the current browser supports passive event listeners, and
     * if so, use them.
     */
    function applyPassive(globalObj) {
        if (globalObj === void 0) { globalObj = window; }
        return supportsPassiveOption(globalObj) ?
            { passive: true } :
            false;
    }
    function supportsPassiveOption(globalObj) {
        if (globalObj === void 0) { globalObj = window; }
        // See
        // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
        var passiveSupported = false;
        try {
            var options = {
                // This function will be called when the browser
                // attempts to access the passive property.
                get passive() {
                    passiveSupported = true;
                    return false;
                }
            };
            var handler = function () { };
            globalObj.document.addEventListener('test', handler, options);
            globalObj.document.removeEventListener('test', handler, options);
        }
        catch (err) {
            passiveSupported = false;
        }
        return passiveSupported;
    }

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$5 = css `@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}`;

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const supportsCssVariablesWin = supportsCssVariables(window);
    /**
     * force the ripple directive to share API names with `mwc-ripple` after Closure
     * Compiler.
     */
    class RippleIntermediate {
        constructor(foundation) {
            this.foundation = foundation;
        }
        startPress() {
            this.foundation.activate();
        }
        endPress() {
            this.foundation.deactivate();
        }
        startFocus() {
            this.foundation.handleFocus();
        }
        endFocus() {
            this.foundation.handleBlur();
        }
        destroy() {
            this.foundation.destroy();
        }
        setUnbounded(value) {
            this.foundation.setUnbounded(value);
        }
    }
    // NOTE: This is a workaround for
    // https://bugs.webkit.org/show_bug.cgi?id=173027. Since keyframes on
    // pseudo-elements (:after) are not supported in Shadow DOM, we put the keyframe
    // style into the <head> element.
    const isSafari = navigator.userAgent.match(/Safari/);
    let didApplyRippleStyle = false;
    const applyRippleStyle = () => {
        didApplyRippleStyle = true;
        const styleElement = document.createElement('style');
        const part = new NodePart({ templateFactory });
        part.appendInto(styleElement);
        part.setValue(style$5);
        part.commit();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        document.head.appendChild(styleElement);
    };
    /**
     * Applied a ripple to the node specified by {surfaceNode}.
     * @param options {RippleNodeOptions}
     */
    const rippleNode = (options) => {
        if (isSafari && !didApplyRippleStyle) {
            applyRippleStyle();
        }
        // TODO(sorvell): This directive requires bringing css yourself. We probably
        // need to do this because of ShadyCSS, but on Safari, the keyframes styling
        // must be global. Perhaps this directive could fix that.
        const surfaceNode = options.surfaceNode;
        const interactionNode = options.interactionNode || surfaceNode;
        // only style interaction node if not in the same root
        if (interactionNode.getRootNode() !== surfaceNode.getRootNode()) {
            if (interactionNode.style.position === '') {
                interactionNode.style.position = 'relative';
            }
        }
        const adapter = {
            browserSupportsCssVars: () => supportsCssVariablesWin,
            isUnbounded: () => options.unbounded === undefined ? true : options.unbounded,
            isSurfaceActive: () => matches(interactionNode, ':active'),
            isSurfaceDisabled: () => Boolean(interactionNode.hasAttribute('disabled')),
            addClass: (className) => surfaceNode.classList.add(className),
            removeClass: (className) => surfaceNode.classList.remove(className),
            containsEventTarget: (target) => interactionNode.contains(target),
            registerInteractionHandler: (type, handler) => interactionNode.addEventListener(type, handler, applyPassive()),
            deregisterInteractionHandler: (type, handler) => interactionNode.removeEventListener(type, handler, applyPassive()),
            registerDocumentInteractionHandler: (evtType, handler) => 
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document.documentElement.addEventListener(evtType, handler, applyPassive()),
            deregisterDocumentInteractionHandler: (evtType, handler) => 
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            document.documentElement.removeEventListener(evtType, handler, applyPassive()),
            registerResizeHandler: (handler) => window.addEventListener('resize', handler),
            deregisterResizeHandler: (handler) => window.removeEventListener('resize', handler),
            updateCssVariable: (varName, value) => surfaceNode.style.setProperty(varName, value),
            computeBoundingRect: () => surfaceNode.getBoundingClientRect(),
            getWindowPageOffset: () => ({ x: window.pageXOffset, y: window.pageYOffset }),
        };
        const rippleFoundation = new MDCRippleFoundation(adapter);
        rippleFoundation.init();
        return new RippleIntermediate(rippleFoundation);
    };
    const rippleInteractionNodes = new WeakMap();
    /**
     * A directive that applies a Material ripple to a part node. The directive
     * should be applied to a PropertyPart.
     * @param options {RippleOptions}
     */
    const ripple = directive((options = {}) => (part) => {
        const surfaceNode = part.committer.element;
        const interactionNode = options.interactionNode || surfaceNode;
        let rippleFoundation = part.value;
        // if the interaction node changes, destroy and invalidate the foundation.
        const existingInteractionNode = rippleInteractionNodes.get(rippleFoundation);
        if (existingInteractionNode !== undefined &&
            existingInteractionNode !== interactionNode) {
            rippleFoundation.destroy();
            rippleFoundation = noChange;
        }
        // make the ripple, if needed
        if (rippleFoundation === noChange) {
            rippleFoundation =
                rippleNode(Object.assign({}, options, { surfaceNode }));
            rippleInteractionNodes.set(rippleFoundation, interactionNode);
            part.setValue(rippleFoundation);
            // otherwise update settings as needed.
        }
        else {
            if (options.unbounded !== undefined) {
                rippleFoundation
                    .setUnbounded(options.unbounded);
            }
            if (options.disabled !== undefined) {
                rippleFoundation
                    .setUnbounded(options.disabled);
            }
        }
        if (options.active === true) {
            rippleFoundation.startPress();
        }
        else if (options.active === false) {
            rippleFoundation.endPress();
        }
    });

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$4 = {
        ACTIVE: 'mdc-tab--active',
    };
    var strings$4 = {
        ARIA_SELECTED: 'aria-selected',
        CONTENT_SELECTOR: '.mdc-tab__content',
        INTERACTED_EVENT: 'MDCTab:interacted',
        RIPPLE_SELECTOR: '.mdc-tab__ripple',
        TABINDEX: 'tabIndex',
        TAB_INDICATOR_SELECTOR: '.mdc-tab-indicator',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabFoundation = /** @class */ (function (_super) {
        __extends(MDCTabFoundation, _super);
        function MDCTabFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCTabFoundation.defaultAdapter), adapter)) || this;
            _this.focusOnActivate_ = true;
            return _this;
        }
        Object.defineProperty(MDCTabFoundation, "cssClasses", {
            get: function () {
                return cssClasses$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabFoundation, "strings", {
            get: function () {
                return strings$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    hasClass: function () { return false; },
                    setAttr: function () { return undefined; },
                    activateIndicator: function () { return undefined; },
                    deactivateIndicator: function () { return undefined; },
                    notifyInteracted: function () { return undefined; },
                    getOffsetLeft: function () { return 0; },
                    getOffsetWidth: function () { return 0; },
                    getContentOffsetLeft: function () { return 0; },
                    getContentOffsetWidth: function () { return 0; },
                    focus: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTabFoundation.prototype.handleClick = function () {
            // It's up to the parent component to keep track of the active Tab and
            // ensure we don't activate a Tab that's already active.
            this.adapter.notifyInteracted();
        };
        MDCTabFoundation.prototype.isActive = function () {
            return this.adapter.hasClass(cssClasses$4.ACTIVE);
        };
        /**
         * Sets whether the tab should focus itself when activated
         */
        MDCTabFoundation.prototype.setFocusOnActivate = function (focusOnActivate) {
            this.focusOnActivate_ = focusOnActivate;
        };
        /**
         * Activates the Tab
         */
        MDCTabFoundation.prototype.activate = function (previousIndicatorClientRect) {
            this.adapter.addClass(cssClasses$4.ACTIVE);
            this.adapter.setAttr(strings$4.ARIA_SELECTED, 'true');
            this.adapter.setAttr(strings$4.TABINDEX, '0');
            this.adapter.activateIndicator(previousIndicatorClientRect);
            if (this.focusOnActivate_) {
                this.adapter.focus();
            }
        };
        /**
         * Deactivates the Tab
         */
        MDCTabFoundation.prototype.deactivate = function () {
            // Early exit
            if (!this.isActive()) {
                return;
            }
            this.adapter.removeClass(cssClasses$4.ACTIVE);
            this.adapter.setAttr(strings$4.ARIA_SELECTED, 'false');
            this.adapter.setAttr(strings$4.TABINDEX, '-1');
            this.adapter.deactivateIndicator();
        };
        /**
         * Returns the dimensions of the Tab
         */
        MDCTabFoundation.prototype.computeDimensions = function () {
            var rootWidth = this.adapter.getOffsetWidth();
            var rootLeft = this.adapter.getOffsetLeft();
            var contentWidth = this.adapter.getContentOffsetWidth();
            var contentLeft = this.adapter.getContentOffsetLeft();
            return {
                contentLeft: rootLeft + contentLeft,
                contentRight: rootLeft + contentLeft + contentWidth,
                rootLeft: rootLeft,
                rootRight: rootLeft + rootWidth,
            };
        };
        return MDCTabFoundation;
    }(MDCFoundation));

    // used for generating unique id for each tab
    let tabIdCounter = 0;
    class TabBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCTabFoundation;
            this.label = '';
            this.icon = '';
            this.hasImageIcon = false;
            this.isFadingIndicator = false;
            this.minWidth = false;
            this.isMinWidthIndicator = false;
            this.indicatorIcon = '';
            this.stacked = false;
            this.focusOnActivate = true;
            this._active = false;
            this.initFocus = false;
        }
        get active() {
            return this._active;
        }
        _handleClick() {
            this.mdcFoundation.handleClick();
        }
        createRenderRoot() {
            return this.attachShadow({ mode: 'open', delegatesFocus: true });
        }
        connectedCallback() {
            this.dir = document.dir;
            super.connectedCallback();
        }
        firstUpdated() {
            super.firstUpdated();
            // create an unique id
            this.id = this.id || `mdc-tab-${++tabIdCounter}`;
        }
        render() {
            const classes = {
                'mdc-tab--min-width': this.minWidth,
                'mdc-tab--stacked': this.stacked,
            };
            let iconTemplate = html ``;
            if (this.hasImageIcon || this.icon) {
                // NOTE: MUST be on same line as spaces will cause vert alignment issues
                // in IE
                iconTemplate = html `
        <span class="mdc-tab__icon material-icons"><slot name="icon">${this.icon}</slot></span>`;
            }
            let labelTemplate = html ``;
            if (this.label) {
                labelTemplate = html `
        <span class="mdc-tab__text-label">${this.label}</span>`;
            }
            const rippleDirective = ripple({
                interactionNode: this,
                unbounded: false,
            });
            return html `
      <button
        @click="${this._handleClick}"
        class="mdc-tab ${classMap(classes)}"
        role="tab"
        aria-selected="false"
        tabindex="-1">
        <span class="mdc-tab__content">
          ${iconTemplate}
          ${labelTemplate}
          ${this.isMinWidthIndicator ? this.renderIndicator() : ''}
        </span>
        ${this.isMinWidthIndicator ? '' : this.renderIndicator()}
        <span class="mdc-tab__ripple" .ripple="${rippleDirective}"></span>
      </button>`;
        }
        renderIndicator() {
            return html `<mwc-tab-indicator
        .icon="${this.indicatorIcon}"
        .fade="${this.isFadingIndicator}"></mwc-tab-indicator>`;
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setAttr: (attr, value) => this.mdcRoot.setAttribute(attr, value), activateIndicator: (previousIndicatorClientRect) => this._tabIndicator
                    .activate(previousIndicatorClientRect), deactivateIndicator: () => this._tabIndicator.deactivate(), notifyInteracted: () => this.dispatchEvent(new CustomEvent(MDCTabFoundation.strings.INTERACTED_EVENT, {
                    detail: { tabId: this.id },
                    bubbles: true,
                    composed: true,
                    cancelable: true,
                })), getOffsetLeft: () => this.offsetLeft, getOffsetWidth: () => this.mdcRoot.offsetWidth, getContentOffsetLeft: () => this._contentElement.offsetLeft, getContentOffsetWidth: () => this._contentElement.offsetWidth, focus: () => {
                    if (this.initFocus) {
                        this.initFocus = false;
                    }
                    else {
                        this.mdcRoot.focus();
                    }
                } });
        }
        activate(clientRect) {
            // happens only on initialization. We don't want to focus to prevent scroll
            if (!clientRect) {
                this.initFocus = true;
            }
            this.mdcFoundation.activate(clientRect);
            this.setActive(this.mdcFoundation.isActive());
        }
        deactivate() {
            this.mdcFoundation.deactivate();
            this.setActive(this.mdcFoundation.isActive());
        }
        setActive(newValue) {
            const oldValue = this.active;
            if (oldValue !== newValue) {
                this._active = newValue;
                this.requestUpdate('active', oldValue);
            }
        }
        computeDimensions() {
            return this.mdcFoundation.computeDimensions();
        }
        computeIndicatorClientRect() {
            return this.tabIndicator.computeContentClientRect();
        }
        // NOTE: needed only for ShadyDOM where delegatesFocus is not implemented
        focus() {
            this.mdcRoot.focus();
        }
    }
    __decorate([
        query('.mdc-tab')
    ], TabBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('mwc-tab-indicator')
    ], TabBase.prototype, "tabIndicator", void 0);
    __decorate([
        property()
    ], TabBase.prototype, "label", void 0);
    __decorate([
        property()
    ], TabBase.prototype, "icon", void 0);
    __decorate([
        property({ type: Boolean })
    ], TabBase.prototype, "hasImageIcon", void 0);
    __decorate([
        property({ type: Boolean })
    ], TabBase.prototype, "isFadingIndicator", void 0);
    __decorate([
        property({ type: Boolean })
    ], TabBase.prototype, "minWidth", void 0);
    __decorate([
        property({ type: Boolean })
    ], TabBase.prototype, "isMinWidthIndicator", void 0);
    __decorate([
        property({ type: Boolean, reflect: true, attribute: 'active' })
    ], TabBase.prototype, "active", null);
    __decorate([
        property()
    ], TabBase.prototype, "indicatorIcon", void 0);
    __decorate([
        property({ type: Boolean })
    ], TabBase.prototype, "stacked", void 0);
    __decorate([
        observer(async function (value) {
            await this.updateComplete;
            this.mdcFoundation.setFocusOnActivate(value);
        }),
        property({ type: Boolean })
    ], TabBase.prototype, "focusOnActivate", void 0);
    __decorate([
        query('mwc-tab-indicator')
    ], TabBase.prototype, "_tabIndicator", void 0);
    __decorate([
        query('.mdc-tab__content')
    ], TabBase.prototype, "_contentElement", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$6 = css `.material-icons{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}.mdc-tab{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-button-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-button-font-size, 0.875rem);line-height:2.25rem;line-height:var(--mdc-typography-button-line-height, 2.25rem);font-weight:500;font-weight:var(--mdc-typography-button-font-weight, 500);letter-spacing:0.0892857143em;letter-spacing:var(--mdc-typography-button-letter-spacing, 0.0892857143em);text-decoration:none;text-decoration:var(--mdc-typography-button-text-decoration, none);text-transform:uppercase;text-transform:var(--mdc-typography-button-text-transform, uppercase);padding-right:24px;padding-left:24px;position:relative;display:flex;flex:1 0 auto;justify-content:center;box-sizing:border-box;margin:0;padding-top:0;padding-bottom:0;border:none;outline:none;background:none;text-align:center;white-space:nowrap;cursor:pointer;-webkit-appearance:none;z-index:1}.mdc-tab .mdc-tab__text-label{color:rgba(0,0,0,.6)}.mdc-tab .mdc-tab__icon{color:rgba(0,0,0,.54);fill:currentColor}.mdc-tab::-moz-focus-inner{padding:0;border:0}.mdc-tab--min-width{flex:0 1 auto}.mdc-tab__content{position:relative;display:flex;align-items:center;justify-content:center;height:inherit;pointer-events:none}.mdc-tab__text-label{transition:150ms color linear;display:inline-block;line-height:1;z-index:2}.mdc-tab__icon{transition:150ms color linear;width:24px;height:24px;font-size:24px;z-index:2}.mdc-tab--stacked .mdc-tab__content{flex-direction:column;align-items:center;justify-content:center}.mdc-tab--stacked .mdc-tab__text-label{padding-top:6px;padding-bottom:4px}.mdc-tab--active .mdc-tab__text-label{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}.mdc-tab--active .mdc-tab__icon{color:#6200ee;color:var(--mdc-theme-primary, #6200ee);fill:currentColor}.mdc-tab--active .mdc-tab__text-label,.mdc-tab--active .mdc-tab__icon{transition-delay:100ms}.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label{padding-left:8px;padding-right:0}[dir=rtl] .mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label,.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label[dir=rtl]{padding-left:0;padding-right:8px}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-tab__ripple{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity;position:absolute;top:0;left:0;width:100%;height:100%;overflow:hidden}.mdc-tab__ripple::before,.mdc-tab__ripple::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-tab__ripple::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}.mdc-tab__ripple.mdc-ripple-upgraded::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-tab__ripple.mdc-ripple-upgraded::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-tab__ripple.mdc-ripple-upgraded--unbounded::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-tab__ripple.mdc-ripple-upgraded--foreground-activation::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-tab__ripple.mdc-ripple-upgraded--foreground-deactivation::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-tab__ripple::before,.mdc-tab__ripple::after{top:calc(50% - 100%);left:calc(50% - 100%);width:200%;height:200%}.mdc-tab__ripple.mdc-ripple-upgraded::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-tab__ripple::before,.mdc-tab__ripple::after{background-color:#6200ee;background-color:var(--mdc-theme-primary, #6200ee)}.mdc-tab__ripple:hover::before{opacity:.04}.mdc-tab__ripple.mdc-ripple-upgraded--background-focused::before,.mdc-tab__ripple:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.12}.mdc-tab__ripple:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-tab__ripple:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.12}.mdc-tab__ripple.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.12}:host{outline:none;flex:1 0 auto;display:flex;justify-content:center}.mdc-tab{height:var(--mdc-tab-height, 48px);margin-left:0;margin-right:0;padding-right:var(--mdc-tab-horizontal-padding, 24px);padding-left:var(--mdc-tab-horizontal-padding, 24px)}.mdc-tab--stacked{height:var(--mdc-tab-stacked-height, 72px)}.mdc-tab::-moz-focus-inner{border:0}.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label{padding-left:8px;padding-right:0}[dir=rtl] .mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label,.mdc-tab:not(.mdc-tab--stacked) .mdc-tab__icon+.mdc-tab__text-label[dir=rtl]{padding-left:0;padding-right:8px}.mdc-tab:not(.mdc-tab--active) .mdc-tab__text-label{color:var(--mdc-tab-text-label-color-default, rgba(0, 0, 0, 0.6))}.mdc-tab:not(.mdc-tab--active) .mdc-tab__icon{color:var(--mdc-tab-color-default, rgba(0, 0, 0, 0.54))}`;

    let Tab = class Tab extends TabBase {
    };
    Tab.styles = style$6;
    Tab = __decorate([
        customElement('mwc-tab')
    ], Tab);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$5 = {
        ANIMATING: 'mdc-tab-scroller--animating',
        SCROLL_AREA_SCROLL: 'mdc-tab-scroller__scroll-area--scroll',
        SCROLL_TEST: 'mdc-tab-scroller__test',
    };
    var strings$5 = {
        AREA_SELECTOR: '.mdc-tab-scroller__scroll-area',
        CONTENT_SELECTOR: '.mdc-tab-scroller__scroll-content',
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTL = /** @class */ (function () {
        function MDCTabScrollerRTL(adapter) {
            this.adapter = adapter;
        }
        return MDCTabScrollerRTL;
    }());

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLDefault = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLDefault, _super);
        function MDCTabScrollerRTLDefault() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLDefault.prototype.getScrollPositionRTL = function () {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var right = this.calculateScrollEdges_().right;
            // Scroll values on most browsers are ints instead of floats so we round
            return Math.round(right - currentScrollLeft);
        };
        MDCTabScrollerRTLDefault.prototype.scrollToRTL = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(edges.right - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLDefault.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLDefault.prototype.getAnimatingScrollPosition = function (scrollX) {
            return scrollX;
        };
        MDCTabScrollerRTLDefault.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: 0,
                right: contentWidth - rootWidth,
            };
        };
        MDCTabScrollerRTLDefault.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.left, scrollX), edges.right);
        };
        return MDCTabScrollerRTLDefault;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLNegative = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLNegative, _super);
        function MDCTabScrollerRTLNegative() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLNegative.prototype.getScrollPositionRTL = function (translateX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            return Math.round(translateX - currentScrollLeft);
        };
        MDCTabScrollerRTLNegative.prototype.scrollToRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(-scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLNegative.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft - scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: clampedScrollLeft - currentScrollLeft,
            };
        };
        MDCTabScrollerRTLNegative.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
            return scrollX - translateX;
        };
        MDCTabScrollerRTLNegative.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: rootWidth - contentWidth,
                right: 0,
            };
        };
        MDCTabScrollerRTLNegative.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.max(Math.min(edges.right, scrollX), edges.left);
        };
        return MDCTabScrollerRTLNegative;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerRTLReverse = /** @class */ (function (_super) {
        __extends(MDCTabScrollerRTLReverse, _super);
        function MDCTabScrollerRTLReverse() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        MDCTabScrollerRTLReverse.prototype.getScrollPositionRTL = function (translateX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            // Scroll values on most browsers are ints instead of floats so we round
            return Math.round(currentScrollLeft - translateX);
        };
        MDCTabScrollerRTLReverse.prototype.scrollToRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: currentScrollLeft - clampedScrollLeft,
            };
        };
        MDCTabScrollerRTLReverse.prototype.incrementScrollRTL = function (scrollX) {
            var currentScrollLeft = this.adapter.getScrollAreaScrollLeft();
            var clampedScrollLeft = this.clampScrollValue_(currentScrollLeft + scrollX);
            return {
                finalScrollPosition: clampedScrollLeft,
                scrollDelta: currentScrollLeft - clampedScrollLeft,
            };
        };
        MDCTabScrollerRTLReverse.prototype.getAnimatingScrollPosition = function (scrollX, translateX) {
            return scrollX + translateX;
        };
        MDCTabScrollerRTLReverse.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: contentWidth - rootWidth,
                right: 0,
            };
        };
        MDCTabScrollerRTLReverse.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.right, scrollX), edges.left);
        };
        return MDCTabScrollerRTLReverse;
    }(MDCTabScrollerRTL));

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCTabScrollerFoundation = /** @class */ (function (_super) {
        __extends(MDCTabScrollerFoundation, _super);
        function MDCTabScrollerFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCTabScrollerFoundation.defaultAdapter), adapter)) || this;
            /**
             * Controls whether we should handle the transitionend and interaction events during the animation.
             */
            _this.isAnimating_ = false;
            return _this;
        }
        Object.defineProperty(MDCTabScrollerFoundation, "cssClasses", {
            get: function () {
                return cssClasses$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabScrollerFoundation, "strings", {
            get: function () {
                return strings$5;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabScrollerFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    eventTargetMatchesSelector: function () { return false; },
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    addScrollAreaClass: function () { return undefined; },
                    setScrollAreaStyleProperty: function () { return undefined; },
                    setScrollContentStyleProperty: function () { return undefined; },
                    getScrollContentStyleValue: function () { return ''; },
                    setScrollAreaScrollLeft: function () { return undefined; },
                    getScrollAreaScrollLeft: function () { return 0; },
                    getScrollContentOffsetWidth: function () { return 0; },
                    getScrollAreaOffsetWidth: function () { return 0; },
                    computeScrollAreaClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    computeScrollContentClientRect: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    computeHorizontalScrollbarHeight: function () { return 0; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        MDCTabScrollerFoundation.prototype.init = function () {
            // Compute horizontal scrollbar height on scroller with overflow initially hidden, then update overflow to scroll
            // and immediately adjust bottom margin to avoid the scrollbar initially appearing before JS runs.
            var horizontalScrollbarHeight = this.adapter.computeHorizontalScrollbarHeight();
            this.adapter.setScrollAreaStyleProperty('margin-bottom', -horizontalScrollbarHeight + 'px');
            this.adapter.addScrollAreaClass(MDCTabScrollerFoundation.cssClasses.SCROLL_AREA_SCROLL);
        };
        /**
         * Computes the current visual scroll position
         */
        MDCTabScrollerFoundation.prototype.getScrollPosition = function () {
            if (this.isRTL_()) {
                return this.computeCurrentScrollPositionRTL_();
            }
            var currentTranslateX = this.calculateCurrentTranslateX_();
            var scrollLeft = this.adapter.getScrollAreaScrollLeft();
            return scrollLeft - currentTranslateX;
        };
        /**
         * Handles interaction events that occur during transition
         */
        MDCTabScrollerFoundation.prototype.handleInteraction = function () {
            // Early exit if we aren't animating
            if (!this.isAnimating_) {
                return;
            }
            // Prevent other event listeners from handling this event
            this.stopScrollAnimation_();
        };
        /**
         * Handles the transitionend event
         */
        MDCTabScrollerFoundation.prototype.handleTransitionEnd = function (evt) {
            // Early exit if we aren't animating or the event was triggered by a different element.
            var evtTarget = evt.target;
            if (!this.isAnimating_ ||
                !this.adapter.eventTargetMatchesSelector(evtTarget, MDCTabScrollerFoundation.strings.CONTENT_SELECTOR)) {
                return;
            }
            this.isAnimating_ = false;
            this.adapter.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
        };
        /**
         * Increment the scroll value by the scrollXIncrement using animation.
         * @param scrollXIncrement The value by which to increment the scroll position
         */
        MDCTabScrollerFoundation.prototype.incrementScroll = function (scrollXIncrement) {
            // Early exit for non-operational increment values
            if (scrollXIncrement === 0) {
                return;
            }
            this.animate_(this.getIncrementScrollOperation_(scrollXIncrement));
        };
        /**
         * Increment the scroll value by the scrollXIncrement without animation.
         * @param scrollXIncrement The value by which to increment the scroll position
         */
        MDCTabScrollerFoundation.prototype.incrementScrollImmediate = function (scrollXIncrement) {
            // Early exit for non-operational increment values
            if (scrollXIncrement === 0) {
                return;
            }
            var operation = this.getIncrementScrollOperation_(scrollXIncrement);
            if (operation.scrollDelta === 0) {
                return;
            }
            this.stopScrollAnimation_();
            this.adapter.setScrollAreaScrollLeft(operation.finalScrollPosition);
        };
        /**
         * Scrolls to the given scrollX value
         */
        MDCTabScrollerFoundation.prototype.scrollTo = function (scrollX) {
            if (this.isRTL_()) {
                return this.scrollToRTL_(scrollX);
            }
            this.scrollTo_(scrollX);
        };
        /**
         * @return Browser-specific {@link MDCTabScrollerRTL} instance.
         */
        MDCTabScrollerFoundation.prototype.getRTLScroller = function () {
            if (!this.rtlScrollerInstance_) {
                this.rtlScrollerInstance_ = this.rtlScrollerFactory_();
            }
            return this.rtlScrollerInstance_;
        };
        /**
         * @return translateX value from a CSS matrix transform function string.
         */
        MDCTabScrollerFoundation.prototype.calculateCurrentTranslateX_ = function () {
            var transformValue = this.adapter.getScrollContentStyleValue('transform');
            // Early exit if no transform is present
            if (transformValue === 'none') {
                return 0;
            }
            // The transform value comes back as a matrix transformation in the form
            // of `matrix(a, b, c, d, tx, ty)`. We only care about tx (translateX) so
            // we're going to grab all the parenthesized values, strip out tx, and
            // parse it.
            var match = /\((.+?)\)/.exec(transformValue);
            if (!match) {
                return 0;
            }
            var matrixParams = match[1];
            // tslint:disable-next-line:ban-ts-ignore "Unused vars" should be a linter warning, not a compiler error.
            // @ts-ignore These unused variables should retain their semantic names for clarity.
            var _a = __read(matrixParams.split(','), 6), a = _a[0], b = _a[1], c = _a[2], d = _a[3], tx = _a[4], ty = _a[5];
            return parseFloat(tx); // tslint:disable-line:ban
        };
        /**
         * Calculates a safe scroll value that is > 0 and < the max scroll value
         * @param scrollX The distance to scroll
         */
        MDCTabScrollerFoundation.prototype.clampScrollValue_ = function (scrollX) {
            var edges = this.calculateScrollEdges_();
            return Math.min(Math.max(edges.left, scrollX), edges.right);
        };
        MDCTabScrollerFoundation.prototype.computeCurrentScrollPositionRTL_ = function () {
            var translateX = this.calculateCurrentTranslateX_();
            return this.getRTLScroller().getScrollPositionRTL(translateX);
        };
        MDCTabScrollerFoundation.prototype.calculateScrollEdges_ = function () {
            var contentWidth = this.adapter.getScrollContentOffsetWidth();
            var rootWidth = this.adapter.getScrollAreaOffsetWidth();
            return {
                left: 0,
                right: contentWidth - rootWidth,
            };
        };
        /**
         * Internal scroll method
         * @param scrollX The new scroll position
         */
        MDCTabScrollerFoundation.prototype.scrollTo_ = function (scrollX) {
            var currentScrollX = this.getScrollPosition();
            var safeScrollX = this.clampScrollValue_(scrollX);
            var scrollDelta = safeScrollX - currentScrollX;
            this.animate_({
                finalScrollPosition: safeScrollX,
                scrollDelta: scrollDelta,
            });
        };
        /**
         * Internal RTL scroll method
         * @param scrollX The new scroll position
         */
        MDCTabScrollerFoundation.prototype.scrollToRTL_ = function (scrollX) {
            var animation = this.getRTLScroller().scrollToRTL(scrollX);
            this.animate_(animation);
        };
        /**
         * Internal method to compute the increment scroll operation values.
         * @param scrollX The desired scroll position increment
         * @return MDCTabScrollerAnimation with the sanitized values for performing the scroll operation.
         */
        MDCTabScrollerFoundation.prototype.getIncrementScrollOperation_ = function (scrollX) {
            if (this.isRTL_()) {
                return this.getRTLScroller().incrementScrollRTL(scrollX);
            }
            var currentScrollX = this.getScrollPosition();
            var targetScrollX = scrollX + currentScrollX;
            var safeScrollX = this.clampScrollValue_(targetScrollX);
            var scrollDelta = safeScrollX - currentScrollX;
            return {
                finalScrollPosition: safeScrollX,
                scrollDelta: scrollDelta,
            };
        };
        /**
         * Animates the tab scrolling
         * @param animation The animation to apply
         */
        MDCTabScrollerFoundation.prototype.animate_ = function (animation) {
            var _this = this;
            // Early exit if translateX is 0, which means there's no animation to perform
            if (animation.scrollDelta === 0) {
                return;
            }
            this.stopScrollAnimation_();
            // This animation uses the FLIP approach.
            // Read more here: https://aerotwist.com/blog/flip-your-animations/
            this.adapter.setScrollAreaScrollLeft(animation.finalScrollPosition);
            this.adapter.setScrollContentStyleProperty('transform', "translateX(" + animation.scrollDelta + "px)");
            // Force repaint
            this.adapter.computeScrollAreaClientRect();
            requestAnimationFrame(function () {
                _this.adapter.addClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
                _this.adapter.setScrollContentStyleProperty('transform', 'none');
            });
            this.isAnimating_ = true;
        };
        /**
         * Stops scroll animation
         */
        MDCTabScrollerFoundation.prototype.stopScrollAnimation_ = function () {
            this.isAnimating_ = false;
            var currentScrollPosition = this.getAnimatingScrollPosition_();
            this.adapter.removeClass(MDCTabScrollerFoundation.cssClasses.ANIMATING);
            this.adapter.setScrollContentStyleProperty('transform', 'translateX(0px)');
            this.adapter.setScrollAreaScrollLeft(currentScrollPosition);
        };
        /**
         * Gets the current scroll position during animation
         */
        MDCTabScrollerFoundation.prototype.getAnimatingScrollPosition_ = function () {
            var currentTranslateX = this.calculateCurrentTranslateX_();
            var scrollLeft = this.adapter.getScrollAreaScrollLeft();
            if (this.isRTL_()) {
                return this.getRTLScroller().getAnimatingScrollPosition(scrollLeft, currentTranslateX);
            }
            return scrollLeft - currentTranslateX;
        };
        /**
         * Determines the RTL Scroller to use
         */
        MDCTabScrollerFoundation.prototype.rtlScrollerFactory_ = function () {
            // Browsers have three different implementations of scrollLeft in RTL mode,
            // dependent on the browser. The behavior is based off the max LTR
            // scrollLeft value and 0.
            //
            // * Default scrolling in RTL *
            //    - Left-most value: 0
            //    - Right-most value: Max LTR scrollLeft value
            //
            // * Negative scrolling in RTL *
            //    - Left-most value: Negated max LTR scrollLeft value
            //    - Right-most value: 0
            //
            // * Reverse scrolling in RTL *
            //    - Left-most value: Max LTR scrollLeft value
            //    - Right-most value: 0
            //
            // We use those principles below to determine which RTL scrollLeft
            // behavior is implemented in the current browser.
            var initialScrollLeft = this.adapter.getScrollAreaScrollLeft();
            this.adapter.setScrollAreaScrollLeft(initialScrollLeft - 1);
            var newScrollLeft = this.adapter.getScrollAreaScrollLeft();
            // If the newScrollLeft value is negative,then we know that the browser has
            // implemented negative RTL scrolling, since all other implementations have
            // only positive values.
            if (newScrollLeft < 0) {
                // Undo the scrollLeft test check
                this.adapter.setScrollAreaScrollLeft(initialScrollLeft);
                return new MDCTabScrollerRTLNegative(this.adapter);
            }
            var rootClientRect = this.adapter.computeScrollAreaClientRect();
            var contentClientRect = this.adapter.computeScrollContentClientRect();
            var rightEdgeDelta = Math.round(contentClientRect.right - rootClientRect.right);
            // Undo the scrollLeft test check
            this.adapter.setScrollAreaScrollLeft(initialScrollLeft);
            // By calculating the clientRect of the root element and the clientRect of
            // the content element, we can determine how much the scroll value changed
            // when we performed the scrollLeft subtraction above.
            if (rightEdgeDelta === newScrollLeft) {
                return new MDCTabScrollerRTLReverse(this.adapter);
            }
            return new MDCTabScrollerRTLDefault(this.adapter);
        };
        MDCTabScrollerFoundation.prototype.isRTL_ = function () {
            return this.adapter.getScrollContentStyleValue('direction') === 'rtl';
        };
        return MDCTabScrollerFoundation;
    }(MDCFoundation));

    class TabScrollerBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCTabScrollerFoundation;
            this._scrollbarHeight = -1;
        }
        _handleInteraction() {
            this.mdcFoundation.handleInteraction();
        }
        _handleTransitionEnd(e) {
            this.mdcFoundation.handleTransitionEnd(e);
        }
        render() {
            return html `
      <div class="mdc-tab-scroller">
        <div class="mdc-tab-scroller__scroll-area"
            @wheel="${this._handleInteraction}"
            @touchstart="${this._handleInteraction}"
            @pointerdown="${this._handleInteraction}"
            @mousedown="${this._handleInteraction}"
            @keydown="${this._handleInteraction}"
            @transitionend="${this._handleTransitionEnd}">
          <div class="mdc-tab-scroller__scroll-content"><slot></slot></div>
        </div>
      </div>
      `;
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { eventTargetMatchesSelector: (evtTarget, selector) => matches(evtTarget, selector), addScrollAreaClass: (className) => this.scrollAreaElement.classList.add(className), setScrollAreaStyleProperty: (prop, value) => this.scrollAreaElement.style.setProperty(prop, value), setScrollContentStyleProperty: (prop, value) => this.scrollContentElement.style.setProperty(prop, value), getScrollContentStyleValue: (propName) => window.getComputedStyle(this.scrollContentElement)
                    .getPropertyValue(propName), setScrollAreaScrollLeft: (scrollX) => this.scrollAreaElement.scrollLeft = scrollX, getScrollAreaScrollLeft: () => this.scrollAreaElement.scrollLeft, getScrollContentOffsetWidth: () => this.scrollContentElement.offsetWidth, getScrollAreaOffsetWidth: () => this.scrollAreaElement.offsetWidth, computeScrollAreaClientRect: () => this.scrollAreaElement.getBoundingClientRect(), computeScrollContentClientRect: () => this.scrollContentElement.getBoundingClientRect(), computeHorizontalScrollbarHeight: () => {
                    if (this._scrollbarHeight === -1) {
                        this.scrollAreaElement.style.overflowX = 'scroll';
                        this._scrollbarHeight = this.scrollAreaElement.offsetHeight -
                            this.scrollAreaElement.clientHeight;
                        this.scrollAreaElement.style.overflowX = '';
                    }
                    return this._scrollbarHeight;
                } });
        }
        /**
         * Returns the current visual scroll position
         * @return {number}
         */
        getScrollPosition() {
            return this.mdcFoundation.getScrollPosition();
        }
        /**
         * Returns the width of the scroll content
         * @return {number}
         */
        getScrollContentWidth() {
            return this.scrollContentElement.offsetWidth;
        }
        /**
         * Increments the scroll value by the given amount
         * @param {number} scrollXIncrement The pixel value by which to increment the
         *     scroll value
         */
        incrementScrollPosition(scrollXIncrement) {
            this.mdcFoundation.incrementScroll(scrollXIncrement);
        }
        /**
         * Scrolls to the given pixel position
         * @param {number} scrollX The pixel value to scroll to
         */
        scrollToPosition(scrollX) {
            this.mdcFoundation.scrollTo(scrollX);
        }
    }
    __decorate([
        query('.mdc-tab-scroller')
    ], TabScrollerBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('.mdc-tab-scroller__scroll-area')
    ], TabScrollerBase.prototype, "scrollAreaElement", void 0);
    __decorate([
        query('.mdc-tab-scroller__scroll-content')
    ], TabScrollerBase.prototype, "scrollContentElement", void 0);
    __decorate([
        eventOptions({ passive: true })
    ], TabScrollerBase.prototype, "_handleInteraction", null);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$7 = css `.mdc-tab-scroller{overflow-y:hidden}.mdc-tab-scroller.mdc-tab-scroller--animating .mdc-tab-scroller__scroll-content{transition:250ms transform cubic-bezier(0.4, 0, 0.2, 1)}.mdc-tab-scroller__test{position:absolute;top:-9999px;width:100px;height:100px;overflow-x:scroll}.mdc-tab-scroller__scroll-area{-webkit-overflow-scrolling:touch;display:flex;overflow-x:hidden}.mdc-tab-scroller__scroll-area::-webkit-scrollbar,.mdc-tab-scroller__test::-webkit-scrollbar{display:none}.mdc-tab-scroller__scroll-area--scroll{overflow-x:scroll}.mdc-tab-scroller__scroll-content{position:relative;display:flex;flex:1 0 auto;transform:none;will-change:transform}.mdc-tab-scroller--align-start .mdc-tab-scroller__scroll-content{justify-content:flex-start}.mdc-tab-scroller--align-end .mdc-tab-scroller__scroll-content{justify-content:flex-end}.mdc-tab-scroller--align-center .mdc-tab-scroller__scroll-content{justify-content:center}.mdc-tab-scroller--animating .mdc-tab-scroller__scroll-area{-webkit-overflow-scrolling:auto}:host{display:flex}.mdc-tab-scroller{flex:1}`;

    let TabScroller = class TabScroller extends TabScrollerBase {
    };
    TabScroller.styles = style$7;
    TabScroller = __decorate([
        customElement('mwc-tab-scroller')
    ], TabScroller);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$6 = {
        ARROW_LEFT_KEY: 'ArrowLeft',
        ARROW_RIGHT_KEY: 'ArrowRight',
        END_KEY: 'End',
        ENTER_KEY: 'Enter',
        HOME_KEY: 'Home',
        SPACE_KEY: 'Space',
        TAB_ACTIVATED_EVENT: 'MDCTabBar:activated',
        TAB_SCROLLER_SELECTOR: '.mdc-tab-scroller',
        TAB_SELECTOR: '.mdc-tab',
    };
    var numbers$2 = {
        ARROW_LEFT_KEYCODE: 37,
        ARROW_RIGHT_KEYCODE: 39,
        END_KEYCODE: 35,
        ENTER_KEYCODE: 13,
        EXTRA_SCROLL_AMOUNT: 20,
        HOME_KEYCODE: 36,
        SPACE_KEYCODE: 32,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var ACCEPTABLE_KEYS = new Set();
    // IE11 has no support for new Set with iterable so we need to initialize this by hand
    ACCEPTABLE_KEYS.add(strings$6.ARROW_LEFT_KEY);
    ACCEPTABLE_KEYS.add(strings$6.ARROW_RIGHT_KEY);
    ACCEPTABLE_KEYS.add(strings$6.END_KEY);
    ACCEPTABLE_KEYS.add(strings$6.HOME_KEY);
    ACCEPTABLE_KEYS.add(strings$6.ENTER_KEY);
    ACCEPTABLE_KEYS.add(strings$6.SPACE_KEY);
    var KEYCODE_MAP = new Map();
    // IE11 has no support for new Map with iterable so we need to initialize this by hand
    KEYCODE_MAP.set(numbers$2.ARROW_LEFT_KEYCODE, strings$6.ARROW_LEFT_KEY);
    KEYCODE_MAP.set(numbers$2.ARROW_RIGHT_KEYCODE, strings$6.ARROW_RIGHT_KEY);
    KEYCODE_MAP.set(numbers$2.END_KEYCODE, strings$6.END_KEY);
    KEYCODE_MAP.set(numbers$2.HOME_KEYCODE, strings$6.HOME_KEY);
    KEYCODE_MAP.set(numbers$2.ENTER_KEYCODE, strings$6.ENTER_KEY);
    KEYCODE_MAP.set(numbers$2.SPACE_KEYCODE, strings$6.SPACE_KEY);
    var MDCTabBarFoundation = /** @class */ (function (_super) {
        __extends(MDCTabBarFoundation, _super);
        function MDCTabBarFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCTabBarFoundation.defaultAdapter), adapter)) || this;
            _this.useAutomaticActivation_ = false;
            return _this;
        }
        Object.defineProperty(MDCTabBarFoundation, "strings", {
            get: function () {
                return strings$6;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabBarFoundation, "numbers", {
            get: function () {
                return numbers$2;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCTabBarFoundation, "defaultAdapter", {
            get: function () {
                // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
                return {
                    scrollTo: function () { return undefined; },
                    incrementScroll: function () { return undefined; },
                    getScrollPosition: function () { return 0; },
                    getScrollContentWidth: function () { return 0; },
                    getOffsetWidth: function () { return 0; },
                    isRTL: function () { return false; },
                    setActiveTab: function () { return undefined; },
                    activateTabAtIndex: function () { return undefined; },
                    deactivateTabAtIndex: function () { return undefined; },
                    focusTabAtIndex: function () { return undefined; },
                    getTabIndicatorClientRectAtIndex: function () { return ({ top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0 }); },
                    getTabDimensionsAtIndex: function () { return ({ rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 }); },
                    getPreviousActiveTabIndex: function () { return -1; },
                    getFocusedTabIndex: function () { return -1; },
                    getIndexOfTabById: function () { return -1; },
                    getTabListLength: function () { return 0; },
                    notifyTabActivated: function () { return undefined; },
                };
                // tslint:enable:object-literal-sort-keys
            },
            enumerable: true,
            configurable: true
        });
        /**
         * Switches between automatic and manual activation modes.
         * See https://www.w3.org/TR/wai-aria-practices/#tabpanel for examples.
         */
        MDCTabBarFoundation.prototype.setUseAutomaticActivation = function (useAutomaticActivation) {
            this.useAutomaticActivation_ = useAutomaticActivation;
        };
        MDCTabBarFoundation.prototype.activateTab = function (index) {
            var previousActiveIndex = this.adapter.getPreviousActiveTabIndex();
            if (!this.indexIsInRange_(index) || index === previousActiveIndex) {
                return;
            }
            var previousClientRect;
            if (previousActiveIndex !== -1) {
                this.adapter.deactivateTabAtIndex(previousActiveIndex);
                previousClientRect =
                    this.adapter.getTabIndicatorClientRectAtIndex(previousActiveIndex);
            }
            this.adapter.activateTabAtIndex(index, previousClientRect);
            this.scrollIntoView(index);
            this.adapter.notifyTabActivated(index);
        };
        MDCTabBarFoundation.prototype.handleKeyDown = function (evt) {
            // Get the key from the event
            var key = this.getKeyFromEvent_(evt);
            // Early exit if the event key isn't one of the keyboard navigation keys
            if (key === undefined) {
                return;
            }
            // Prevent default behavior for movement keys, but not for activation keys, since :active is used to apply ripple
            if (!this.isActivationKey_(key)) {
                evt.preventDefault();
            }
            if (this.useAutomaticActivation_) {
                if (this.isActivationKey_(key)) {
                    return;
                }
                var index = this.determineTargetFromKey_(this.adapter.getPreviousActiveTabIndex(), key);
                this.adapter.setActiveTab(index);
                this.scrollIntoView(index);
            }
            else {
                var focusedTabIndex = this.adapter.getFocusedTabIndex();
                if (this.isActivationKey_(key)) {
                    this.adapter.setActiveTab(focusedTabIndex);
                }
                else {
                    var index = this.determineTargetFromKey_(focusedTabIndex, key);
                    this.adapter.focusTabAtIndex(index);
                    this.scrollIntoView(index);
                }
            }
        };
        /**
         * Handles the MDCTab:interacted event
         */
        MDCTabBarFoundation.prototype.handleTabInteraction = function (evt) {
            this.adapter.setActiveTab(this.adapter.getIndexOfTabById(evt.detail.tabId));
        };
        /**
         * Scrolls the tab at the given index into view
         * @param index The tab index to make visible
         */
        MDCTabBarFoundation.prototype.scrollIntoView = function (index) {
            // Early exit if the index is out of range
            if (!this.indexIsInRange_(index)) {
                return;
            }
            // Always scroll to 0 if scrolling to the 0th index
            if (index === 0) {
                return this.adapter.scrollTo(0);
            }
            // Always scroll to the max value if scrolling to the Nth index
            // MDCTabScroller.scrollTo() will never scroll past the max possible value
            if (index === this.adapter.getTabListLength() - 1) {
                return this.adapter.scrollTo(this.adapter.getScrollContentWidth());
            }
            if (this.isRTL_()) {
                return this.scrollIntoViewRTL_(index);
            }
            this.scrollIntoView_(index);
        };
        /**
         * Private method for determining the index of the destination tab based on what key was pressed
         * @param origin The original index from which to determine the destination
         * @param key The name of the key
         */
        MDCTabBarFoundation.prototype.determineTargetFromKey_ = function (origin, key) {
            var isRTL = this.isRTL_();
            var maxIndex = this.adapter.getTabListLength() - 1;
            var shouldGoToEnd = key === strings$6.END_KEY;
            var shouldDecrement = key === strings$6.ARROW_LEFT_KEY && !isRTL || key === strings$6.ARROW_RIGHT_KEY && isRTL;
            var shouldIncrement = key === strings$6.ARROW_RIGHT_KEY && !isRTL || key === strings$6.ARROW_LEFT_KEY && isRTL;
            var index = origin;
            if (shouldGoToEnd) {
                index = maxIndex;
            }
            else if (shouldDecrement) {
                index -= 1;
            }
            else if (shouldIncrement) {
                index += 1;
            }
            else {
                index = 0;
            }
            if (index < 0) {
                index = maxIndex;
            }
            else if (index > maxIndex) {
                index = 0;
            }
            return index;
        };
        /**
         * Calculates the scroll increment that will make the tab at the given index visible
         * @param index The index of the tab
         * @param nextIndex The index of the next tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the Tab Bar
         */
        MDCTabBarFoundation.prototype.calculateScrollIncrement_ = function (index, nextIndex, scrollPosition, barWidth) {
            var nextTabDimensions = this.adapter.getTabDimensionsAtIndex(nextIndex);
            var relativeContentLeft = nextTabDimensions.contentLeft - scrollPosition - barWidth;
            var relativeContentRight = nextTabDimensions.contentRight - scrollPosition;
            var leftIncrement = relativeContentRight - numbers$2.EXTRA_SCROLL_AMOUNT;
            var rightIncrement = relativeContentLeft + numbers$2.EXTRA_SCROLL_AMOUNT;
            if (nextIndex < index) {
                return Math.min(leftIncrement, 0);
            }
            return Math.max(rightIncrement, 0);
        };
        /**
         * Calculates the scroll increment that will make the tab at the given index visible in RTL
         * @param index The index of the tab
         * @param nextIndex The index of the next tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the Tab Bar
         * @param scrollContentWidth The width of the scroll content
         */
        MDCTabBarFoundation.prototype.calculateScrollIncrementRTL_ = function (index, nextIndex, scrollPosition, barWidth, scrollContentWidth) {
            var nextTabDimensions = this.adapter.getTabDimensionsAtIndex(nextIndex);
            var relativeContentLeft = scrollContentWidth - nextTabDimensions.contentLeft - scrollPosition;
            var relativeContentRight = scrollContentWidth - nextTabDimensions.contentRight - scrollPosition - barWidth;
            var leftIncrement = relativeContentRight + numbers$2.EXTRA_SCROLL_AMOUNT;
            var rightIncrement = relativeContentLeft - numbers$2.EXTRA_SCROLL_AMOUNT;
            if (nextIndex > index) {
                return Math.max(leftIncrement, 0);
            }
            return Math.min(rightIncrement, 0);
        };
        /**
         * Determines the index of the adjacent tab closest to either edge of the Tab Bar
         * @param index The index of the tab
         * @param tabDimensions The dimensions of the tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the tab bar
         */
        MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdge_ = function (index, tabDimensions, scrollPosition, barWidth) {
            /**
             * Tabs are laid out in the Tab Scroller like this:
             *
             *    Scroll Position
             *    +---+
             *    |   |   Bar Width
             *    |   +-----------------------------------+
             *    |   |                                   |
             *    |   V                                   V
             *    |   +-----------------------------------+
             *    V   |             Tab Scroller          |
             *    +------------+--------------+-------------------+
             *    |    Tab     |      Tab     |        Tab        |
             *    +------------+--------------+-------------------+
             *        |                                   |
             *        +-----------------------------------+
             *
             * To determine the next adjacent index, we look at the Tab root left and
             * Tab root right, both relative to the scroll position. If the Tab root
             * left is less than 0, then we know it's out of view to the left. If the
             * Tab root right minus the bar width is greater than 0, we know the Tab is
             * out of view to the right. From there, we either increment or decrement
             * the index.
             */
            var relativeRootLeft = tabDimensions.rootLeft - scrollPosition;
            var relativeRootRight = tabDimensions.rootRight - scrollPosition - barWidth;
            var relativeRootDelta = relativeRootLeft + relativeRootRight;
            var leftEdgeIsCloser = relativeRootLeft < 0 || relativeRootDelta < 0;
            var rightEdgeIsCloser = relativeRootRight > 0 || relativeRootDelta > 0;
            if (leftEdgeIsCloser) {
                return index - 1;
            }
            if (rightEdgeIsCloser) {
                return index + 1;
            }
            return -1;
        };
        /**
         * Determines the index of the adjacent tab closest to either edge of the Tab Bar in RTL
         * @param index The index of the tab
         * @param tabDimensions The dimensions of the tab
         * @param scrollPosition The current scroll position
         * @param barWidth The width of the tab bar
         * @param scrollContentWidth The width of the scroller content
         */
        MDCTabBarFoundation.prototype.findAdjacentTabIndexClosestToEdgeRTL_ = function (index, tabDimensions, scrollPosition, barWidth, scrollContentWidth) {
            var rootLeft = scrollContentWidth - tabDimensions.rootLeft - barWidth - scrollPosition;
            var rootRight = scrollContentWidth - tabDimensions.rootRight - scrollPosition;
            var rootDelta = rootLeft + rootRight;
            var leftEdgeIsCloser = rootLeft > 0 || rootDelta > 0;
            var rightEdgeIsCloser = rootRight < 0 || rootDelta < 0;
            if (leftEdgeIsCloser) {
                return index + 1;
            }
            if (rightEdgeIsCloser) {
                return index - 1;
            }
            return -1;
        };
        /**
         * Returns the key associated with a keydown event
         * @param evt The keydown event
         */
        MDCTabBarFoundation.prototype.getKeyFromEvent_ = function (evt) {
            if (ACCEPTABLE_KEYS.has(evt.key)) {
                return evt.key;
            }
            return KEYCODE_MAP.get(evt.keyCode);
        };
        MDCTabBarFoundation.prototype.isActivationKey_ = function (key) {
            return key === strings$6.SPACE_KEY || key === strings$6.ENTER_KEY;
        };
        /**
         * Returns whether a given index is inclusively between the ends
         * @param index The index to test
         */
        MDCTabBarFoundation.prototype.indexIsInRange_ = function (index) {
            return index >= 0 && index < this.adapter.getTabListLength();
        };
        /**
         * Returns the view's RTL property
         */
        MDCTabBarFoundation.prototype.isRTL_ = function () {
            return this.adapter.isRTL();
        };
        /**
         * Scrolls the tab at the given index into view for left-to-right user agents.
         * @param index The index of the tab to scroll into view
         */
        MDCTabBarFoundation.prototype.scrollIntoView_ = function (index) {
            var scrollPosition = this.adapter.getScrollPosition();
            var barWidth = this.adapter.getOffsetWidth();
            var tabDimensions = this.adapter.getTabDimensionsAtIndex(index);
            var nextIndex = this.findAdjacentTabIndexClosestToEdge_(index, tabDimensions, scrollPosition, barWidth);
            if (!this.indexIsInRange_(nextIndex)) {
                return;
            }
            var scrollIncrement = this.calculateScrollIncrement_(index, nextIndex, scrollPosition, barWidth);
            this.adapter.incrementScroll(scrollIncrement);
        };
        /**
         * Scrolls the tab at the given index into view in RTL
         * @param index The tab index to make visible
         */
        MDCTabBarFoundation.prototype.scrollIntoViewRTL_ = function (index) {
            var scrollPosition = this.adapter.getScrollPosition();
            var barWidth = this.adapter.getOffsetWidth();
            var tabDimensions = this.adapter.getTabDimensionsAtIndex(index);
            var scrollWidth = this.adapter.getScrollContentWidth();
            var nextIndex = this.findAdjacentTabIndexClosestToEdgeRTL_(index, tabDimensions, scrollPosition, barWidth, scrollWidth);
            if (!this.indexIsInRange_(nextIndex)) {
                return;
            }
            var scrollIncrement = this.calculateScrollIncrementRTL_(index, nextIndex, scrollPosition, barWidth, scrollWidth);
            this.adapter.incrementScroll(scrollIncrement);
        };
        return MDCTabBarFoundation;
    }(MDCFoundation));

    class TabBarBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCTabBarFoundation;
            this.activeIndex = 0;
            this._previousActiveIndex = -1;
        }
        _handleTabInteraction(e) {
            this.mdcFoundation.handleTabInteraction(e);
        }
        _handleKeydown(e) {
            this.mdcFoundation.handleKeyDown(e);
        }
        // TODO(sorvell): can scroller be optional for perf?
        render() {
            return html `
      <div class="mdc-tab-bar" role="tablist"
          @MDCTab:interacted="${this._handleTabInteraction}"
          @keydown="${this._handleKeydown}">
        <mwc-tab-scroller><slot></slot></mwc-tab-scroller>
      </div>
      `;
        }
        // TODO(sorvell): probably want to memoize this and use a `slotChange` event
        _getTabs() {
            return this.tabsSlot
                .assignedNodes({ flatten: true })
                .filter((e) => e instanceof Tab);
        }
        _getTab(index) {
            return this._getTabs()[index];
        }
        createAdapter() {
            return {
                scrollTo: (scrollX) => this.scrollerElement.scrollToPosition(scrollX),
                incrementScroll: (scrollXIncrement) => this.scrollerElement.incrementScrollPosition(scrollXIncrement),
                getScrollPosition: () => this.scrollerElement.getScrollPosition(),
                getScrollContentWidth: () => this.scrollerElement.getScrollContentWidth(),
                getOffsetWidth: () => this.mdcRoot.offsetWidth,
                isRTL: () => window.getComputedStyle(this.mdcRoot)
                    .getPropertyValue('direction') === 'rtl',
                setActiveTab: (index) => this.mdcFoundation.activateTab(index),
                activateTabAtIndex: (index, clientRect) => {
                    const tab = this._getTab(index);
                    if (tab !== undefined) {
                        tab.activate(clientRect);
                    }
                    this._previousActiveIndex = index;
                },
                deactivateTabAtIndex: (index) => {
                    const tab = this._getTab(index);
                    if (tab !== undefined) {
                        tab.deactivate();
                    }
                },
                focusTabAtIndex: (index) => {
                    const tab = this._getTab(index);
                    if (tab !== undefined) {
                        tab.focus();
                    }
                },
                // TODO(sorvell): tab may not be able to synchronously answer
                // `computeIndicatorClientRect` if an update is pending or it has not yet
                // updated. If this is necessary, LitElement may need a `forceUpdate`
                // method.
                getTabIndicatorClientRectAtIndex: (index) => {
                    const tab = this._getTab(index);
                    return tab !== undefined ? tab.computeIndicatorClientRect() :
                        new DOMRect();
                },
                getTabDimensionsAtIndex: (index) => {
                    const tab = this._getTab(index);
                    return tab !== undefined ?
                        tab.computeDimensions() :
                        { rootLeft: 0, rootRight: 0, contentLeft: 0, contentRight: 0 };
                },
                getPreviousActiveTabIndex: () => {
                    return this._previousActiveIndex;
                },
                getFocusedTabIndex: () => {
                    const tabElements = this._getTabs();
                    const activeElement = this.getRootNode().activeElement;
                    return tabElements.indexOf(activeElement);
                },
                getIndexOfTabById: (id) => {
                    const tabElements = this._getTabs();
                    for (let i = 0; i < tabElements.length; i++) {
                        if (tabElements[i].id === id) {
                            return i;
                        }
                    }
                    return -1;
                },
                getTabListLength: () => this._getTabs().length,
                notifyTabActivated: (index) => {
                    // Synchronize the tabs `activeIndex` to the foundation.
                    // This is needed when a tab is changed via a click, for example.
                    this.activeIndex = index;
                    this.dispatchEvent(new CustomEvent(MDCTabBarFoundation.strings.TAB_ACTIVATED_EVENT, { detail: { index }, bubbles: true, cancelable: true }));
                },
            };
        }
        firstUpdated() {
            // NOTE: Delay creating foundation until scroller is fully updated.
            // This is necessary because the foundation/adapter synchronously addresses
            // the scroller element.
        }
        _getUpdateComplete() {
            return super._getUpdateComplete()
                .then(() => this.scrollerElement.updateComplete)
                .then(() => {
                if (this.mdcFoundation === undefined) {
                    this.createFoundation();
                }
            });
        }
        scrollIndexIntoView(index) {
            this.mdcFoundation.scrollIntoView(index);
        }
    }
    __decorate([
        query('.mdc-tab-bar')
    ], TabBarBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('mwc-tab-scroller')
    ], TabBarBase.prototype, "scrollerElement", void 0);
    __decorate([
        query('slot')
    ], TabBarBase.prototype, "tabsSlot", void 0);
    __decorate([
        observer(async function () {
            await this.updateComplete;
            // only provoke the foundation if we are out of sync with it, i.e.
            // ignore an foundation generated set.
            // use `activeIndex` directly to avoid staleness if it was set before the
            // first render.
            if (this.activeIndex !== this._previousActiveIndex) {
                this.mdcFoundation.activateTab(this.activeIndex);
            }
        }),
        property({ type: Number })
    ], TabBarBase.prototype, "activeIndex", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$8 = css `.mdc-tab-bar{width:100%}.mdc-tab{height:48px}.mdc-tab--stacked{height:72px}:host{display:block}.mdc-tab-bar{flex:1}mwc-tab{--mdc-tab-height: 48px;--mdc-tab-stacked-height: 72px}`;

    let TabBar = class TabBar extends TabBarBase {
    };
    TabBar.styles = style$8;
    TabBar = __decorate([
        customElement('mwc-tab-bar')
    ], TabBar);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$9 = css `:host{font-family:var(--mdc-icon-font, "Material Icons");font-weight:normal;font-style:normal;font-size:var(--mdc-icon-size, 24px);line-height:1;letter-spacing:normal;text-transform:none;display:inline-block;white-space:nowrap;word-wrap:normal;direction:ltr;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;-moz-osx-font-smoothing:grayscale;font-feature-settings:"liga"}`;

    /** @soyCompatible */
    let Icon = class Icon extends LitElement {
        /** @soyCompatible */
        render() {
            return html `<slot></slot>`;
        }
    };
    Icon.styles = style$9;
    Icon = __decorate([
        customElement('mwc-icon')
    ], Icon);

    /**
     * @license
     * Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
     * This code may only be used under the BSD style license found at
     * http://polymer.github.io/LICENSE.txt
     * The complete set of authors may be found at
     * http://polymer.github.io/AUTHORS.txt
     * The complete set of contributors may be found at
     * http://polymer.github.io/CONTRIBUTORS.txt
     * Code distributed by Google as part of the polymer project is also
     * subject to an additional IP rights grant found at
     * http://polymer.github.io/PATENTS.txt
     */
    const previousValues = new WeakMap();
    /**
     * For AttributeParts, sets the attribute if the value is defined and removes
     * the attribute if the value is undefined.
     *
     * For other part types, this directive is a no-op.
     */
    const ifDefined = directive((value) => (part) => {
        const previousValue = previousValues.get(part);
        if (value === undefined && part instanceof AttributePart) {
            // If the value is undefined, remove the attribute, but only if the value
            // was previously defined.
            if (previousValue !== undefined || !previousValues.has(part)) {
                const name = part.committer.name;
                part.committer.element.removeAttribute(name);
            }
        }
        else if (value !== previousValue) {
            part.setValue(value);
        }
        previousValues.set(part, value);
    });

    /**
     * @license
     * Copyright 2020 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    /**
     * KEY provides normalized string values for keys.
     */
    var KEY = {
        UNKNOWN: 'Unknown',
        BACKSPACE: 'Backspace',
        ENTER: 'Enter',
        SPACEBAR: 'Spacebar',
        PAGE_UP: 'PageUp',
        PAGE_DOWN: 'PageDown',
        END: 'End',
        HOME: 'Home',
        ARROW_LEFT: 'ArrowLeft',
        ARROW_UP: 'ArrowUp',
        ARROW_RIGHT: 'ArrowRight',
        ARROW_DOWN: 'ArrowDown',
        DELETE: 'Delete',
        ESCAPE: 'Escape',
    };
    var normalizedKeys = new Set();
    // IE11 has no support for new Map with iterable so we need to initialize this
    // by hand.
    normalizedKeys.add(KEY.BACKSPACE);
    normalizedKeys.add(KEY.ENTER);
    normalizedKeys.add(KEY.SPACEBAR);
    normalizedKeys.add(KEY.PAGE_UP);
    normalizedKeys.add(KEY.PAGE_DOWN);
    normalizedKeys.add(KEY.END);
    normalizedKeys.add(KEY.HOME);
    normalizedKeys.add(KEY.ARROW_LEFT);
    normalizedKeys.add(KEY.ARROW_UP);
    normalizedKeys.add(KEY.ARROW_RIGHT);
    normalizedKeys.add(KEY.ARROW_DOWN);
    normalizedKeys.add(KEY.DELETE);
    normalizedKeys.add(KEY.ESCAPE);
    var KEY_CODE = {
        BACKSPACE: 8,
        ENTER: 13,
        SPACEBAR: 32,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        END: 35,
        HOME: 36,
        ARROW_LEFT: 37,
        ARROW_UP: 38,
        ARROW_RIGHT: 39,
        ARROW_DOWN: 40,
        DELETE: 46,
        ESCAPE: 27,
    };
    var mappedKeyCodes = new Map();
    // IE11 has no support for new Map with iterable so we need to initialize this
    // by hand.
    mappedKeyCodes.set(KEY_CODE.BACKSPACE, KEY.BACKSPACE);
    mappedKeyCodes.set(KEY_CODE.ENTER, KEY.ENTER);
    mappedKeyCodes.set(KEY_CODE.SPACEBAR, KEY.SPACEBAR);
    mappedKeyCodes.set(KEY_CODE.PAGE_UP, KEY.PAGE_UP);
    mappedKeyCodes.set(KEY_CODE.PAGE_DOWN, KEY.PAGE_DOWN);
    mappedKeyCodes.set(KEY_CODE.END, KEY.END);
    mappedKeyCodes.set(KEY_CODE.HOME, KEY.HOME);
    mappedKeyCodes.set(KEY_CODE.ARROW_LEFT, KEY.ARROW_LEFT);
    mappedKeyCodes.set(KEY_CODE.ARROW_UP, KEY.ARROW_UP);
    mappedKeyCodes.set(KEY_CODE.ARROW_RIGHT, KEY.ARROW_RIGHT);
    mappedKeyCodes.set(KEY_CODE.ARROW_DOWN, KEY.ARROW_DOWN);
    mappedKeyCodes.set(KEY_CODE.DELETE, KEY.DELETE);
    mappedKeyCodes.set(KEY_CODE.ESCAPE, KEY.ESCAPE);
    var navigationKeys = new Set();
    // IE11 has no support for new Set with iterable so we need to initialize this
    // by hand.
    navigationKeys.add(KEY.PAGE_UP);
    navigationKeys.add(KEY.PAGE_DOWN);
    navigationKeys.add(KEY.END);
    navigationKeys.add(KEY.HOME);
    navigationKeys.add(KEY.ARROW_LEFT);
    navigationKeys.add(KEY.ARROW_UP);
    navigationKeys.add(KEY.ARROW_RIGHT);
    navigationKeys.add(KEY.ARROW_DOWN);
    /**
     * normalizeKey returns the normalized string for a navigational action.
     */
    function normalizeKey(evt) {
        var key = evt.key;
        // If the event already has a normalized key, return it
        if (normalizedKeys.has(key)) {
            return key;
        }
        // tslint:disable-next-line:deprecation
        var mappedKey = mappedKeyCodes.get(evt.keyCode);
        if (mappedKey) {
            return mappedKey;
        }
        return KEY.UNKNOWN;
    }

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$6 = {
        LIST_ITEM_ACTIVATED_CLASS: 'mdc-list-item--activated',
        LIST_ITEM_CLASS: 'mdc-list-item',
        LIST_ITEM_DISABLED_CLASS: 'mdc-list-item--disabled',
        LIST_ITEM_SELECTED_CLASS: 'mdc-list-item--selected',
        LIST_ITEM_TEXT_CLASS: 'mdc-list-item__text',
        LIST_ITEM_PRIMARY_TEXT_CLASS: 'mdc-list-item__primary-text',
        ROOT: 'mdc-list',
    };
    var strings$7 = {
        ACTION_EVENT: 'MDCList:action',
        ARIA_CHECKED: 'aria-checked',
        ARIA_CHECKED_CHECKBOX_SELECTOR: '[role="checkbox"][aria-checked="true"]',
        ARIA_CHECKED_RADIO_SELECTOR: '[role="radio"][aria-checked="true"]',
        ARIA_CURRENT: 'aria-current',
        ARIA_DISABLED: 'aria-disabled',
        ARIA_ORIENTATION: 'aria-orientation',
        ARIA_ORIENTATION_HORIZONTAL: 'horizontal',
        ARIA_ROLE_CHECKBOX_SELECTOR: '[role="checkbox"]',
        ARIA_SELECTED: 'aria-selected',
        CHECKBOX_RADIO_SELECTOR: 'input[type="checkbox"], input[type="radio"]',
        CHECKBOX_SELECTOR: 'input[type="checkbox"]',
        CHILD_ELEMENTS_TO_TOGGLE_TABINDEX: "\n    ." + cssClasses$6.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$6.LIST_ITEM_CLASS + " a\n  ",
        FOCUSABLE_CHILD_ELEMENTS: "\n    ." + cssClasses$6.LIST_ITEM_CLASS + " button:not(:disabled),\n    ." + cssClasses$6.LIST_ITEM_CLASS + " a,\n    ." + cssClasses$6.LIST_ITEM_CLASS + " input[type=\"radio\"]:not(:disabled),\n    ." + cssClasses$6.LIST_ITEM_CLASS + " input[type=\"checkbox\"]:not(:disabled)\n  ",
        RADIO_SELECTOR: 'input[type="radio"]',
    };
    var numbers$3 = {
        UNSET_INDEX: -1,
        TYPEAHEAD_BUFFER_CLEAR_TIMEOUT_MS: 300
    };

    /**
     @license
     Copyright 2020 Google Inc. All Rights Reserved.

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */
    const findIndexDiff = (oldSet, newSet) => {
        const oldArr = Array.from(oldSet);
        const newArr = Array.from(newSet);
        const diff = { added: [], removed: [] };
        const oldSorted = oldArr.sort();
        const newSorted = newArr.sort();
        let i = 0;
        let j = 0;
        while (i < oldSorted.length || j < newSorted.length) {
            const oldVal = oldSorted[i];
            const newVal = newSorted[j];
            if (oldVal === newVal) {
                i++;
                j++;
                continue;
            }
            if (oldVal !== undefined && (newVal === undefined || oldVal < newVal)) {
                diff.removed.push(oldVal);
                i++;
                continue;
            }
            if (newVal !== undefined && (oldVal === undefined || newVal < oldVal)) {
                diff.added.push(newVal);
                j++;
                continue;
            }
        }
        return diff;
    };
    const ELEMENTS_KEY_ALLOWED_IN = ['input', 'button', 'textarea', 'select'];
    function isIndexSet(selectedIndex) {
        return selectedIndex instanceof Set;
    }
    const createSetFromIndex = (index) => {
        const entry = index === numbers$3.UNSET_INDEX ? new Set() : index;
        return isIndexSet(entry) ? new Set(entry) : new Set([entry]);
    };
    class MDCListFoundation extends MDCFoundation {
        constructor(adapter) {
            super(Object.assign(Object.assign({}, MDCListFoundation.defaultAdapter), adapter));
            this.isMulti_ = false;
            this.wrapFocus_ = false;
            this.isVertical_ = true;
            this.selectedIndex_ = numbers$3.UNSET_INDEX;
            this.focusedItemIndex_ = numbers$3.UNSET_INDEX;
            this.useActivatedClass_ = false;
            this.ariaCurrentAttrValue_ = null;
        }
        static get strings() {
            return strings$7;
        }
        static get numbers() {
            return numbers$3;
        }
        static get defaultAdapter() {
            return {
                focusItemAtIndex: () => undefined,
                getFocusedElementIndex: () => 0,
                getListItemCount: () => 0,
                isFocusInsideList: () => false,
                isRootFocused: () => false,
                notifyAction: () => undefined,
                notifySelected: () => undefined,
                getSelectedStateForElementIndex: () => false,
                setDisabledStateForElementIndex: () => undefined,
                getDisabledStateForElementIndex: () => false,
                setSelectedStateForElementIndex: () => undefined,
                setActivatedStateForElementIndex: () => undefined,
                setTabIndexForElementIndex: () => undefined,
                setAttributeForElementIndex: () => undefined,
                getAttributeForElementIndex: () => null,
            };
        }
        /**
         * Sets the private wrapFocus_ variable.
         */
        setWrapFocus(value) {
            this.wrapFocus_ = value;
        }
        /**
         * Sets the private wrapFocus_ variable.
         */
        setMulti(value) {
            this.isMulti_ = value;
            const currentIndex = this.selectedIndex_;
            if (value) {
                // number to set
                if (!isIndexSet(currentIndex)) {
                    const isUnset = currentIndex === numbers$3.UNSET_INDEX;
                    this.selectedIndex_ = isUnset ? new Set() : new Set([currentIndex]);
                }
            }
            else {
                // set to first sorted number in set
                if (isIndexSet(currentIndex)) {
                    if (currentIndex.size) {
                        const vals = Array.from(currentIndex).sort();
                        this.selectedIndex_ = vals[0];
                    }
                    else {
                        this.selectedIndex_ = numbers$3.UNSET_INDEX;
                    }
                }
            }
        }
        /**
         * Sets the isVertical_ private variable.
         */
        setVerticalOrientation(value) {
            this.isVertical_ = value;
        }
        /**
         * Sets the useActivatedClass_ private variable.
         */
        setUseActivatedClass(useActivated) {
            this.useActivatedClass_ = useActivated;
        }
        getSelectedIndex() {
            return this.selectedIndex_;
        }
        setSelectedIndex(index) {
            if (!this.isIndexValid_(index)) {
                return;
            }
            if (this.isMulti_) {
                this.setMultiSelectionAtIndex_(createSetFromIndex(index));
            }
            else {
                this.setSingleSelectionAtIndex_(index);
            }
        }
        /**
         * Focus in handler for the list items.
         */
        handleFocusIn(_, listItemIndex) {
            if (listItemIndex >= 0) {
                this.adapter.setTabIndexForElementIndex(listItemIndex, 0);
            }
        }
        /**
         * Focus out handler for the list items.
         */
        handleFocusOut(_, listItemIndex) {
            if (listItemIndex >= 0) {
                this.adapter.setTabIndexForElementIndex(listItemIndex, -1);
            }
            /**
             * Between Focusout & Focusin some browsers do not have focus on any
             * element. Setting a delay to wait till the focus is moved to next element.
             */
            setTimeout(() => {
                if (!this.adapter.isFocusInsideList()) {
                    this.setTabindexToFirstSelectedItem_();
                }
            }, 0);
        }
        /**
         * Key handler for the list.
         */
        handleKeydown(event, isRootListItem, listItemIndex) {
            const isArrowLeft = normalizeKey(event) === 'ArrowLeft';
            const isArrowUp = normalizeKey(event) === 'ArrowUp';
            const isArrowRight = normalizeKey(event) === 'ArrowRight';
            const isArrowDown = normalizeKey(event) === 'ArrowDown';
            const isHome = normalizeKey(event) === 'Home';
            const isEnd = normalizeKey(event) === 'End';
            const isEnter = normalizeKey(event) === 'Enter';
            const isSpace = normalizeKey(event) === 'Spacebar';
            if (this.adapter.isRootFocused()) {
                if (isArrowUp || isEnd) {
                    event.preventDefault();
                    this.focusLastElement();
                }
                else if (isArrowDown || isHome) {
                    event.preventDefault();
                    this.focusFirstElement();
                }
                return;
            }
            let currentIndex = this.adapter.getFocusedElementIndex();
            if (currentIndex === -1) {
                currentIndex = listItemIndex;
                if (currentIndex < 0) {
                    // If this event doesn't have a mdc-list-item ancestor from the
                    // current list (not from a sublist), return early.
                    return;
                }
            }
            let nextIndex;
            if ((this.isVertical_ && isArrowDown) ||
                (!this.isVertical_ && isArrowRight)) {
                this.preventDefaultEvent(event);
                nextIndex = this.focusNextElement(currentIndex);
            }
            else if ((this.isVertical_ && isArrowUp) || (!this.isVertical_ && isArrowLeft)) {
                this.preventDefaultEvent(event);
                nextIndex = this.focusPrevElement(currentIndex);
            }
            else if (isHome) {
                this.preventDefaultEvent(event);
                nextIndex = this.focusFirstElement();
            }
            else if (isEnd) {
                this.preventDefaultEvent(event);
                nextIndex = this.focusLastElement();
            }
            else if (isEnter || isSpace) {
                if (isRootListItem) {
                    // Return early if enter key is pressed on anchor element which triggers
                    // synthetic MouseEvent event.
                    const target = event.target;
                    if (target && target.tagName === 'A' && isEnter) {
                        return;
                    }
                    this.preventDefaultEvent(event);
                    this.setSelectedIndexOnAction_(currentIndex, true);
                }
            }
            this.focusedItemIndex_ = currentIndex;
            if (nextIndex !== undefined) {
                this.setTabindexAtIndex_(nextIndex);
                this.focusedItemIndex_ = nextIndex;
            }
        }
        /**
         * Click handler for the list.
         */
        handleSingleSelection(index, isInteraction, force) {
            if (index === numbers$3.UNSET_INDEX) {
                return;
            }
            this.setSelectedIndexOnAction_(index, isInteraction, force);
            this.setTabindexAtIndex_(index);
            this.focusedItemIndex_ = index;
        }
        /**
         * Focuses the next element on the list.
         */
        focusNextElement(index) {
            const count = this.adapter.getListItemCount();
            let nextIndex = index + 1;
            if (nextIndex >= count) {
                if (this.wrapFocus_) {
                    nextIndex = 0;
                }
                else {
                    // Return early because last item is already focused.
                    return index;
                }
            }
            this.adapter.focusItemAtIndex(nextIndex);
            return nextIndex;
        }
        /**
         * Focuses the previous element on the list.
         */
        focusPrevElement(index) {
            let prevIndex = index - 1;
            if (prevIndex < 0) {
                if (this.wrapFocus_) {
                    prevIndex = this.adapter.getListItemCount() - 1;
                }
                else {
                    // Return early because first item is already focused.
                    return index;
                }
            }
            this.adapter.focusItemAtIndex(prevIndex);
            return prevIndex;
        }
        focusFirstElement() {
            this.adapter.focusItemAtIndex(0);
            return 0;
        }
        focusLastElement() {
            const lastIndex = this.adapter.getListItemCount() - 1;
            this.adapter.focusItemAtIndex(lastIndex);
            return lastIndex;
        }
        /**
         * @param itemIndex Index of the list item
         * @param isEnabled Sets the list item to enabled or disabled.
         */
        setEnabled(itemIndex, isEnabled) {
            if (!this.isIndexValid_(itemIndex)) {
                return;
            }
            this.adapter.setDisabledStateForElementIndex(itemIndex, !isEnabled);
        }
        /**
         * Ensures that preventDefault is only called if the containing element
         * doesn't consume the event, and it will cause an unintended scroll.
         */
        preventDefaultEvent(evt) {
            const target = evt.target;
            const tagName = `${target.tagName}`.toLowerCase();
            if (ELEMENTS_KEY_ALLOWED_IN.indexOf(tagName) === -1) {
                evt.preventDefault();
            }
        }
        setSingleSelectionAtIndex_(index, isInteraction = true) {
            if (this.selectedIndex_ === index) {
                return;
            }
            // unset previous
            if (this.selectedIndex_ !== numbers$3.UNSET_INDEX) {
                this.adapter.setSelectedStateForElementIndex(this.selectedIndex_, false);
                if (this.useActivatedClass_) {
                    this.adapter.setActivatedStateForElementIndex(this.selectedIndex_, false);
                }
            }
            // set new
            if (isInteraction) {
                this.adapter.setSelectedStateForElementIndex(index, true);
            }
            if (this.useActivatedClass_) {
                this.adapter.setActivatedStateForElementIndex(index, true);
            }
            this.setAriaForSingleSelectionAtIndex_(index);
            this.selectedIndex_ = index;
            this.adapter.notifySelected(index);
        }
        setMultiSelectionAtIndex_(newIndex, isInteraction = true) {
            const oldIndex = createSetFromIndex(this.selectedIndex_);
            const diff = findIndexDiff(oldIndex, newIndex);
            if (!diff.removed.length && !diff.added.length) {
                return;
            }
            for (const removed of diff.removed) {
                if (isInteraction) {
                    this.adapter.setSelectedStateForElementIndex(removed, false);
                }
                if (this.useActivatedClass_) {
                    this.adapter.setActivatedStateForElementIndex(removed, false);
                }
            }
            for (const added of diff.added) {
                if (isInteraction) {
                    this.adapter.setSelectedStateForElementIndex(added, true);
                }
                if (this.useActivatedClass_) {
                    this.adapter.setActivatedStateForElementIndex(added, true);
                }
            }
            this.selectedIndex_ = newIndex;
            this.adapter.notifySelected(newIndex, diff);
        }
        /**
         * Sets aria attribute for single selection at given index.
         */
        setAriaForSingleSelectionAtIndex_(index) {
            // Detect the presence of aria-current and get the value only during list
            // initialization when it is in unset state.
            if (this.selectedIndex_ === numbers$3.UNSET_INDEX) {
                this.ariaCurrentAttrValue_ =
                    this.adapter.getAttributeForElementIndex(index, strings$7.ARIA_CURRENT);
            }
            const isAriaCurrent = this.ariaCurrentAttrValue_ !== null;
            const ariaAttribute = isAriaCurrent ? strings$7.ARIA_CURRENT : strings$7.ARIA_SELECTED;
            if (this.selectedIndex_ !== numbers$3.UNSET_INDEX) {
                this.adapter.setAttributeForElementIndex(this.selectedIndex_, ariaAttribute, 'false');
            }
            const ariaAttributeValue = isAriaCurrent ? this.ariaCurrentAttrValue_ : 'true';
            this.adapter.setAttributeForElementIndex(index, ariaAttribute, ariaAttributeValue);
        }
        setTabindexAtIndex_(index) {
            if (this.focusedItemIndex_ === numbers$3.UNSET_INDEX && index !== 0) {
                // If no list item was selected set first list item's tabindex to -1.
                // Generally, tabindex is set to 0 on first list item of list that has no
                // preselected items.
                this.adapter.setTabIndexForElementIndex(0, -1);
            }
            else if (this.focusedItemIndex_ >= 0 && this.focusedItemIndex_ !== index) {
                this.adapter.setTabIndexForElementIndex(this.focusedItemIndex_, -1);
            }
            this.adapter.setTabIndexForElementIndex(index, 0);
        }
        setTabindexToFirstSelectedItem_() {
            let targetIndex = 0;
            if (typeof this.selectedIndex_ === 'number' &&
                this.selectedIndex_ !== numbers$3.UNSET_INDEX) {
                targetIndex = this.selectedIndex_;
            }
            else if (isIndexSet(this.selectedIndex_) && this.selectedIndex_.size > 0) {
                targetIndex = Math.min(...this.selectedIndex_);
            }
            this.setTabindexAtIndex_(targetIndex);
        }
        isIndexValid_(index) {
            if (index instanceof Set) {
                if (!this.isMulti_) {
                    throw new Error('MDCListFoundation: Array of index is only supported for checkbox based list');
                }
                if (index.size === 0) {
                    return true;
                }
                else {
                    let isOneInRange = false;
                    for (const entry of index) {
                        isOneInRange = this.isIndexInRange_(entry);
                        if (isOneInRange) {
                            break;
                        }
                    }
                    return isOneInRange;
                }
            }
            else if (typeof index === 'number') {
                if (this.isMulti_) {
                    throw new Error('MDCListFoundation: Expected array of index for checkbox based list but got number: ' +
                        index);
                }
                return index === numbers$3.UNSET_INDEX || this.isIndexInRange_(index);
            }
            else {
                return false;
            }
        }
        isIndexInRange_(index) {
            const listSize = this.adapter.getListItemCount();
            return index >= 0 && index < listSize;
        }
        /**
         * Sets selected index on user action, toggles checkbox / radio based on
         * toggleCheckbox value. User interaction should not toggle list item(s) when
         * disabled.
         */
        setSelectedIndexOnAction_(index, isInteraction, force) {
            if (this.adapter.getDisabledStateForElementIndex(index)) {
                return;
            }
            let checkedIndex = index;
            if (this.isMulti_) {
                checkedIndex = new Set([index]);
            }
            if (!this.isIndexValid_(checkedIndex)) {
                return;
            }
            if (this.isMulti_) {
                this.toggleMultiAtIndex(index, force, isInteraction);
            }
            else {
                if (isInteraction || force) {
                    this.setSingleSelectionAtIndex_(index, isInteraction);
                }
                else {
                    const isDeselection = this.selectedIndex_ === index;
                    if (isDeselection) {
                        this.setSingleSelectionAtIndex_(numbers$3.UNSET_INDEX);
                    }
                }
            }
            if (isInteraction) {
                this.adapter.notifyAction(index);
            }
        }
        toggleMultiAtIndex(index, force, isInteraction = true) {
            let newSelectionValue = false;
            if (force === undefined) {
                newSelectionValue = !this.adapter.getSelectedStateForElementIndex(index);
            }
            else {
                newSelectionValue = force;
            }
            const newSet = createSetFromIndex(this.selectedIndex_);
            if (newSelectionValue) {
                newSet.add(index);
            }
            else {
                newSet.delete(index);
            }
            this.setMultiSelectionAtIndex_(newSet, isInteraction);
        }
    }

    /**
    @license
    Copyright 2020 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const isListItem = (element) => {
        return element.hasAttribute('mwc-list-item');
    };
    /**
     * @fires selected {SelectedDetail}
     * @fires action {ActionDetail}
     * @fires items-updated
     */
    class ListBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.mdcAdapter = null;
            this.mdcFoundationClass = MDCListFoundation;
            this.activatable = false;
            this.multi = false;
            this.wrapFocus = false;
            this.itemRoles = null;
            this.innerRole = null;
            this.innerAriaLabel = null;
            this.rootTabbable = false;
            this.previousTabindex = null;
            this.noninteractive = false;
            this.items_ = [];
        }
        get assignedElements() {
            const slot = this.slotElement;
            if (slot) {
                return slot.assignedNodes({ flatten: true }).filter(isNodeElement);
            }
            return [];
        }
        get items() {
            return this.items_;
        }
        updateItems() {
            const nodes = this.assignedElements;
            const listItems = [];
            for (const node of nodes) {
                if (isListItem(node)) {
                    listItems.push(node);
                    node._managingList = this;
                }
                if (node.hasAttribute('divider') && !node.hasAttribute('role')) {
                    node.setAttribute('role', 'separator');
                }
            }
            this.items_ = listItems;
            const selectedIndices = new Set();
            this.items_.forEach((item, index) => {
                if (this.itemRoles) {
                    item.setAttribute('role', this.itemRoles);
                }
                else {
                    item.removeAttribute('role');
                }
                if (item.selected) {
                    selectedIndices.add(index);
                }
            });
            if (this.multi) {
                this.select(selectedIndices);
            }
            else {
                const index = selectedIndices.size ? selectedIndices.entries().next().value[1] : -1;
                this.select(index);
            }
            const itemsUpdatedEv = new Event('items-updated', { bubbles: true, composed: true });
            this.dispatchEvent(itemsUpdatedEv);
        }
        get selected() {
            const index = this.index;
            if (!isIndexSet(index)) {
                if (index === -1) {
                    return null;
                }
                return this.items[index];
            }
            const selected = [];
            for (const entry of index) {
                selected.push(this.items[entry]);
            }
            return selected;
        }
        get index() {
            if (this.mdcFoundation) {
                return this.mdcFoundation.getSelectedIndex();
            }
            return -1;
        }
        render() {
            const role = this.innerRole === null ? undefined : this.innerRole;
            const ariaLabel = this.innerAriaLabel === null ? undefined : this.innerAriaLabel;
            const tabindex = this.rootTabbable ? '0' : '-1';
            return html `
      <!-- @ts-ignore -->
      <ul
          tabindex=${tabindex}
          role="${ifDefined(role)}"
          aria-label="${ifDefined(ariaLabel)}"
          class="mdc-list"
          @keydown=${this.onKeydown}
          @focusin=${this.onFocusIn}
          @focusout=${this.onFocusOut}
          @request-selected=${this.onRequestSelected}
          @list-item-rendered=${this.onListItemConnected}>
        <slot></slot>
      </ul>
    `;
        }
        firstUpdated() {
            super.firstUpdated();
            if (!this.items.length) {
                // required because this is called before observers
                this.mdcFoundation.setMulti(this.multi);
                // for when children upgrade before list
                this.layout();
            }
        }
        onFocusIn(evt) {
            if (this.mdcFoundation && this.mdcRoot) {
                const index = this.getIndexOfTarget(evt);
                this.mdcFoundation.handleFocusIn(evt, index);
            }
        }
        onFocusOut(evt) {
            if (this.mdcFoundation && this.mdcRoot) {
                const index = this.getIndexOfTarget(evt);
                this.mdcFoundation.handleFocusOut(evt, index);
            }
        }
        onKeydown(evt) {
            if (this.mdcFoundation && this.mdcRoot) {
                const index = this.getIndexOfTarget(evt);
                const target = evt.target;
                const isRootListItem = isListItem(target);
                this.mdcFoundation.handleKeydown(evt, isRootListItem, index);
            }
        }
        onRequestSelected(evt) {
            if (this.mdcFoundation) {
                let index = this.getIndexOfTarget(evt);
                // might happen in shady dom slowness. Recalc children
                if (index === -1) {
                    this.layout();
                    index = this.getIndexOfTarget(evt);
                    // still not found; may not be mwc-list-item. Unsupported case.
                    if (index === -1) {
                        return;
                    }
                }
                const element = this.items[index];
                if (element.disabled) {
                    return;
                }
                const selected = evt.detail.selected;
                const source = evt.detail.source;
                this.mdcFoundation.handleSingleSelection(index, source === 'interaction', selected);
                evt.stopPropagation();
            }
        }
        getIndexOfTarget(evt) {
            const elements = this.items;
            const path = evt.composedPath();
            for (const pathItem of path) {
                let index = -1;
                if (isNodeElement(pathItem) && isListItem(pathItem)) {
                    index = elements.indexOf(pathItem);
                }
                if (index !== -1) {
                    return index;
                }
            }
            return -1;
        }
        createAdapter() {
            this.mdcAdapter = {
                getListItemCount: () => {
                    if (this.mdcRoot) {
                        return this.items.length;
                    }
                    return 0;
                },
                getFocusedElementIndex: this.getFocusedItemIndex,
                getAttributeForElementIndex: (index, attr) => {
                    const listElement = this.mdcRoot;
                    if (!listElement) {
                        return '';
                    }
                    const element = this.items[index];
                    return element ? element.getAttribute(attr) : '';
                },
                setAttributeForElementIndex: (index, attr, val) => {
                    if (!this.mdcRoot) {
                        return;
                    }
                    const element = this.items[index];
                    if (element) {
                        element.setAttribute(attr, val);
                    }
                },
                focusItemAtIndex: (index) => {
                    const element = this.items[index];
                    if (element) {
                        element.focus();
                    }
                },
                setTabIndexForElementIndex: (index, value) => {
                    const item = this.items[index];
                    if (item) {
                        item.tabindex = value;
                    }
                },
                notifyAction: (index) => {
                    const init = { bubbles: true, composed: true };
                    init.detail = { index };
                    const ev = new CustomEvent('action', init);
                    this.dispatchEvent(ev);
                },
                notifySelected: (index, diff) => {
                    const init = { bubbles: true, composed: true };
                    init.detail = { index, diff };
                    const ev = new CustomEvent('selected', init);
                    this.dispatchEvent(ev);
                },
                isFocusInsideList: () => {
                    return doesElementContainFocus(this);
                },
                isRootFocused: () => {
                    const mdcRoot = this.mdcRoot;
                    const root = mdcRoot.getRootNode();
                    return root.activeElement === mdcRoot;
                },
                setDisabledStateForElementIndex: (index, value) => {
                    const item = this.items[index];
                    if (!item) {
                        return;
                    }
                    item.disabled = value;
                },
                getDisabledStateForElementIndex: (index) => {
                    const item = this.items[index];
                    if (!item) {
                        return false;
                    }
                    return item.disabled;
                },
                setSelectedStateForElementIndex: (index, value) => {
                    const item = this.items[index];
                    if (!item) {
                        return;
                    }
                    item.selected = value;
                },
                getSelectedStateForElementIndex: (index) => {
                    const item = this.items[index];
                    if (!item) {
                        return false;
                    }
                    return item.selected;
                },
                setActivatedStateForElementIndex: (index, value) => {
                    const item = this.items[index];
                    if (!item) {
                        return;
                    }
                    item.activated = value;
                },
            };
            return this.mdcAdapter;
        }
        selectUi(index, activate = false) {
            const item = this.items[index];
            if (item) {
                item.selected = true;
                item.activated = activate;
            }
        }
        deselectUi(index) {
            const item = this.items[index];
            if (item) {
                item.selected = false;
                item.activated = false;
            }
        }
        select(index) {
            if (!this.mdcFoundation) {
                return;
            }
            this.mdcFoundation.setSelectedIndex(index);
        }
        toggle(index, force) {
            if (this.multi) {
                this.mdcFoundation.toggleMultiAtIndex(index, force);
            }
        }
        onListItemConnected(e) {
            const target = e.target;
            this.layout(this.items.indexOf(target) === -1);
        }
        layout(updateItems = true) {
            if (updateItems) {
                this.updateItems();
            }
            const first = this.items[0];
            for (const item of this.items) {
                item.tabindex = -1;
            }
            if (first) {
                if (this.noninteractive) {
                    if (!this.previousTabindex) {
                        this.previousTabindex = first;
                    }
                }
                else {
                    first.tabindex = 0;
                }
            }
        }
        getFocusedItemIndex() {
            if (!this.mdcRoot) {
                return -1;
            }
            if (!this.items.length) {
                return -1;
            }
            const activeElementPath = deepActiveElementPath();
            if (!activeElementPath.length) {
                return -1;
            }
            for (let i = activeElementPath.length - 1; i >= 0; i--) {
                const activeItem = activeElementPath[i];
                if (isListItem(activeItem)) {
                    return this.items.indexOf(activeItem);
                }
            }
            return -1;
        }
        focusItemAtIndex(index) {
            for (const item of this.items) {
                if (item.tabindex === 0) {
                    item.tabindex = -1;
                    break;
                }
            }
            this.items[index].tabindex = 0;
            this.items[index].focus();
        }
        focus() {
            const root = this.mdcRoot;
            if (root) {
                root.focus();
            }
        }
        blur() {
            const root = this.mdcRoot;
            if (root) {
                root.blur();
            }
        }
    }
    __decorate([
        query('.mdc-list')
    ], ListBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('slot')
    ], ListBase.prototype, "slotElement", void 0);
    __decorate([
        property({ type: Boolean }),
        observer(function (value) {
            if (this.mdcFoundation) {
                this.mdcFoundation.setUseActivatedClass(value);
            }
        })
    ], ListBase.prototype, "activatable", void 0);
    __decorate([
        property({ type: Boolean }),
        observer(function (newValue, oldValue) {
            if (this.mdcFoundation) {
                this.mdcFoundation.setMulti(newValue);
            }
            if (oldValue !== undefined) {
                this.layout();
            }
        })
    ], ListBase.prototype, "multi", void 0);
    __decorate([
        property({ type: Boolean }),
        observer(function (value) {
            if (this.mdcFoundation) {
                this.mdcFoundation.setWrapFocus(value);
            }
        })
    ], ListBase.prototype, "wrapFocus", void 0);
    __decorate([
        property({ type: String }),
        observer(function (_newValue, oldValue) {
            if (oldValue !== undefined) {
                this.updateItems();
            }
        })
    ], ListBase.prototype, "itemRoles", void 0);
    __decorate([
        property({ type: String })
    ], ListBase.prototype, "innerRole", void 0);
    __decorate([
        property({ type: String })
    ], ListBase.prototype, "innerAriaLabel", void 0);
    __decorate([
        property({ type: Boolean })
    ], ListBase.prototype, "rootTabbable", void 0);
    __decorate([
        property({ type: Boolean, reflect: true }),
        observer(function (value) {
            const slot = this.slotElement;
            if (value && slot) {
                const tabbable = findAssignedElement(slot, '[tabindex="0"]');
                this.previousTabindex = tabbable;
                if (tabbable) {
                    tabbable.setAttribute('tabindex', '-1');
                }
            }
            else if (!value && this.previousTabindex) {
                this.previousTabindex.setAttribute('tabindex', '0');
                this.previousTabindex = null;
            }
        })
    ], ListBase.prototype, "noninteractive", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$a = css `@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}:host{display:block}.mdc-list{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-subtitle1-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:1rem;font-size:var(--mdc-typography-subtitle1-font-size, 1rem);line-height:1.75rem;line-height:var(--mdc-typography-subtitle1-line-height, 1.75rem);font-weight:400;font-weight:var(--mdc-typography-subtitle1-font-weight, 400);letter-spacing:0.009375em;letter-spacing:var(--mdc-typography-subtitle1-letter-spacing, 0.009375em);text-decoration:inherit;text-decoration:var(--mdc-typography-subtitle1-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-subtitle1-text-transform, inherit);line-height:1.5rem;margin:0;padding:8px 0;list-style-type:none;color:rgba(0,0,0,.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87));padding:var(--mdc-list-vertical-padding, 8px) 0}.mdc-list:focus{outline:none}.mdc-list-item{height:48px}.mdc-list--dense{padding-top:4px;padding-bottom:4px;font-size:.812rem}.mdc-list ::slotted([divider]){height:0;margin:0;border:none;border-bottom-width:1px;border-bottom-style:solid;border-bottom-color:rgba(0,0,0,.12)}.mdc-list ::slotted([divider][padded]){margin:0 var(--mdc-list-side-padding, 16px)}.mdc-list ::slotted([divider][inset]){margin-left:var(--mdc-list-inset-margin, 72px);margin-right:0;width:calc(100% - var(--mdc-list-inset-margin, 72px))}.mdc-list-group[dir=rtl] .mdc-list ::slotted([divider][inset]),[dir=rtl] .mdc-list-group .mdc-list ::slotted([divider][inset]){margin-left:0;margin-right:var(--mdc-list-inset-margin, 72px)}.mdc-list ::slotted([divider][inset][padded]){width:calc(100% - var(--mdc-list-inset-margin, 72px) - var(--mdc-list-side-padding, 16px))}.mdc-list--dense ::slotted([mwc-list-item]){height:40px}.mdc-list--dense ::slotted([mwc-list]){--mdc-list-item-graphic-size: 20px}.mdc-list--two-line.mdc-list--dense ::slotted([mwc-list-item]),.mdc-list--avatar-list.mdc-list--dense ::slotted([mwc-list-item]){height:60px}.mdc-list--avatar-list.mdc-list--dense ::slotted([mwc-list]){--mdc-list-item-graphic-size: 36px}:host([noninteractive]){pointer-events:none;cursor:default}.mdc-list--dense ::slotted(.mdc-list-item__primary-text){display:block;margin-top:0;line-height:normal;margin-bottom:-20px}.mdc-list--dense ::slotted(.mdc-list-item__primary-text)::before{display:inline-block;width:0;height:24px;content:"";vertical-align:0}.mdc-list--dense ::slotted(.mdc-list-item__primary-text)::after{display:inline-block;width:0;height:20px;content:"";vertical-align:-20px}`;

    /**
    @license
    Copyright 2020 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    let List = class List extends ListBase {
    };
    List.styles = style$a;
    List = __decorate([
        customElement('mwc-list')
    ], List);

    /**
     @license
     Copyright 2020 Google Inc. All Rights Reserved.

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */
    /**
     * @fires request-selected {RequestSelectedDetail}
     * @fires list-item-rendered
     */
    class ListItemBase extends LitElement {
        constructor() {
            super(...arguments);
            this.value = '';
            this.group = null;
            this.tabindex = -1;
            this.disabled = false;
            this.twoline = false;
            this.activated = false;
            this.graphic = null;
            this.multipleGraphics = false;
            this.hasMeta = false;
            this.noninteractive = false;
            this.selected = false;
            this.shouldRenderRipple = false;
            this._managingList = null;
            this.boundOnClick = this.onClick.bind(this);
            this._firstChanged = true;
            this._skipPropRequest = false;
            this.rippleHandlers = new RippleHandlers(() => {
                this.shouldRenderRipple = true;
                return this.ripple;
            });
            this.listeners = [
                {
                    target: this,
                    eventNames: ['click'],
                    cb: () => {
                        this.onClick();
                    },
                },
                {
                    target: this,
                    eventNames: ['mouseenter'],
                    cb: this.rippleHandlers.startHover,
                },
                {
                    target: this,
                    eventNames: ['mouseleave'],
                    cb: this.rippleHandlers.endHover,
                },
                {
                    target: this,
                    eventNames: ['focus'],
                    cb: this.rippleHandlers.startFocus,
                },
                {
                    target: this,
                    eventNames: ['blur'],
                    cb: this.rippleHandlers.endFocus,
                },
                {
                    target: this,
                    eventNames: ['mousedown', 'touchstart'],
                    cb: (e) => {
                        const name = e.type;
                        this.onDown(name === 'mousedown' ? 'mouseup' : 'touchend', e);
                    },
                },
            ];
        }
        get text() {
            const textContent = this.textContent;
            return textContent ? textContent.trim() : '';
        }
        render() {
            const text = this.renderText();
            const graphic = this.graphic ? this.renderGraphic() : html ``;
            const meta = this.hasMeta ? this.renderMeta() : html ``;
            return html `
      ${this.renderRipple()}
      ${graphic}
      ${text}
      ${meta}`;
        }
        renderRipple() {
            if (this.shouldRenderRipple) {
                return html `
      <mwc-ripple
        .activated=${this.activated}>
      </mwc-ripple>`;
            }
            else if (this.activated) {
                return html `<div class="fake-activated-ripple"></div>`;
            }
            else {
                return html ``;
            }
        }
        renderGraphic() {
            const graphicClasses = {
                multi: this.multipleGraphics,
            };
            return html `
      <span class="mdc-list-item__graphic material-icons ${classMap(graphicClasses)}">
        <slot name="graphic"></slot>
      </span>`;
        }
        renderMeta() {
            return html `
      <span class="mdc-list-item__meta material-icons">
        <slot name="meta"></slot>
      </span>`;
        }
        renderText() {
            const inner = this.twoline ? this.renderTwoline() : this.renderSingleLine();
            return html `
      <span class="mdc-list-item__text">
        ${inner}
      </span>`;
        }
        renderSingleLine() {
            return html `<slot></slot>`;
        }
        renderTwoline() {
            return html `
      <span class="mdc-list-item__primary-text">
        <slot></slot>
      </span>
      <span class="mdc-list-item__secondary-text">
        <slot name="secondary"></slot>
      </span>
    `;
        }
        onClick() {
            this.fireRequestSelected(!this.selected, 'interaction');
        }
        onDown(upName, evt) {
            const onUp = () => {
                window.removeEventListener(upName, onUp);
                this.rippleHandlers.endPress();
            };
            window.addEventListener(upName, onUp);
            this.rippleHandlers.startPress(evt);
        }
        fireRequestSelected(selected, source) {
            if (this.noninteractive) {
                return;
            }
            const customEv = new CustomEvent('request-selected', { bubbles: true, composed: true, detail: { source, selected } });
            this.dispatchEvent(customEv);
        }
        connectedCallback() {
            super.connectedCallback();
            if (!this.noninteractive) {
                this.setAttribute('mwc-list-item', '');
            }
            for (const listener of this.listeners) {
                for (const eventName of listener.eventNames) {
                    listener.target.addEventListener(eventName, listener.cb, { passive: true });
                }
            }
        }
        disconnectedCallback() {
            super.disconnectedCallback();
            for (const listener of this.listeners) {
                for (const eventName of listener.eventNames) {
                    listener.target.removeEventListener(eventName, listener.cb);
                }
            }
            if (this._managingList) {
                this._managingList.layout(true);
            }
        }
        firstUpdated() {
            const ev = new Event('list-item-rendered', { bubbles: true, composed: true });
            this.dispatchEvent(ev);
        }
    }
    __decorate([
        query('slot')
    ], ListItemBase.prototype, "slotElement", void 0);
    __decorate([
        queryAsync('mwc-ripple')
    ], ListItemBase.prototype, "ripple", void 0);
    __decorate([
        property({ type: String })
    ], ListItemBase.prototype, "value", void 0);
    __decorate([
        property({ type: String, reflect: true })
    ], ListItemBase.prototype, "group", void 0);
    __decorate([
        property({ type: Number, reflect: true })
    ], ListItemBase.prototype, "tabindex", void 0);
    __decorate([
        property({ type: Boolean, reflect: true }),
        observer(function (value) {
            if (value) {
                this.setAttribute('aria-disabled', 'true');
            }
            else {
                this.setAttribute('aria-disabled', 'false');
            }
        })
    ], ListItemBase.prototype, "disabled", void 0);
    __decorate([
        property({ type: Boolean, reflect: true })
    ], ListItemBase.prototype, "twoline", void 0);
    __decorate([
        property({ type: Boolean, reflect: true })
    ], ListItemBase.prototype, "activated", void 0);
    __decorate([
        property({ type: String, reflect: true })
    ], ListItemBase.prototype, "graphic", void 0);
    __decorate([
        property({ type: Boolean })
    ], ListItemBase.prototype, "multipleGraphics", void 0);
    __decorate([
        property({ type: Boolean })
    ], ListItemBase.prototype, "hasMeta", void 0);
    __decorate([
        property({ type: Boolean, reflect: true }),
        observer(function (value) {
            if (value) {
                this.removeAttribute('aria-checked');
                this.removeAttribute('mwc-list-item');
                this.selected = false;
                this.activated = false;
                this.tabIndex = -1;
            }
            else {
                this.setAttribute('mwc-list-item', '');
            }
        })
    ], ListItemBase.prototype, "noninteractive", void 0);
    __decorate([
        property({ type: Boolean, reflect: true }),
        observer(function (value) {
            const role = this.getAttribute('role');
            const isAriaSelectable = role === 'gridcell' || role === 'option' ||
                role === 'row' || role === 'tab';
            if (isAriaSelectable && value) {
                this.setAttribute('aria-selected', 'true');
            }
            else if (isAriaSelectable) {
                this.setAttribute('aria-selected', 'false');
            }
            if (this._firstChanged) {
                this._firstChanged = false;
                return;
            }
            if (this._skipPropRequest) {
                return;
            }
            this.fireRequestSelected(value, 'property');
        })
    ], ListItemBase.prototype, "selected", void 0);
    __decorate([
        internalProperty()
    ], ListItemBase.prototype, "shouldRenderRipple", void 0);
    __decorate([
        internalProperty()
    ], ListItemBase.prototype, "_managingList", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$b = css `:host{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;height:48px;display:flex;position:relative;align-items:center;justify-content:flex-start;overflow:hidden;padding:0;padding-left:var(--mdc-list-side-padding, 16px);padding-right:var(--mdc-list-side-padding, 16px);outline:none;height:48px;color:rgba(0,0,0,.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}:host:focus{outline:none}:host([activated]){color:#6200ee;color:var(--mdc-theme-primary, #6200ee);--mdc-ripple-color: var(--mdc-theme-primary, #6200ee)}:host([activated]) .mdc-list-item__graphic{color:#6200ee;color:var(--mdc-theme-primary, #6200ee)}:host([activated]) .fake-activated-ripple::before{position:absolute;display:block;top:0;bottom:0;left:0;right:0;width:100%;height:100%;pointer-events:none;z-index:1;content:"";opacity:0.12;opacity:var(--mdc-ripple-activated-opacity, 0.12);background-color:#6200ee;background-color:var(--mdc-ripple-color, var(--mdc-theme-primary, #6200ee))}.mdc-list-item__graphic{flex-shrink:0;align-items:center;justify-content:center;fill:currentColor;display:inline-flex}.mdc-list-item__graphic ::slotted(*){flex-shrink:0;align-items:center;justify-content:center;fill:currentColor;width:100%;height:100%;text-align:center}.mdc-list-item__meta{width:var(--mdc-list-item-meta-size, 24px);height:var(--mdc-list-item-meta-size, 24px);margin-left:auto;margin-right:0;color:rgba(0,0,0,.38);color:var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38))}.mdc-list-item__meta.multi{width:auto}.mdc-list-item__meta ::slotted(*){width:var(--mdc-list-item-meta-size, 24px);line-height:var(--mdc-list-item-meta-size, 24px)}.mdc-list-item__meta ::slotted(.material-icons),.mdc-list-item__meta ::slotted(mwc-icon){line-height:var(--mdc-list-item-meta-size, 24px) !important}.mdc-list-item__meta ::slotted(:not(.material-icons):not(mwc-icon)){-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-caption-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.75rem;font-size:var(--mdc-typography-caption-font-size, 0.75rem);line-height:1.25rem;line-height:var(--mdc-typography-caption-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-caption-font-weight, 400);letter-spacing:0.0333333333em;letter-spacing:var(--mdc-typography-caption-letter-spacing, 0.0333333333em);text-decoration:inherit;text-decoration:var(--mdc-typography-caption-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-caption-text-transform, inherit)}:host[dir=rtl] .mdc-list-item__meta,[dir=rtl] :host .mdc-list-item__meta{margin-left:0;margin-right:auto}.mdc-list-item__meta ::slotted(*){width:100%;height:100%}.mdc-list-item__text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.mdc-list-item__text ::slotted([for]),.mdc-list-item__text[for]{pointer-events:none}.mdc-list-item__primary-text{text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;margin-top:0;line-height:normal;margin-bottom:-20px;display:block}.mdc-list-item__primary-text::before{display:inline-block;width:0;height:32px;content:"";vertical-align:0}.mdc-list-item__primary-text::after{display:inline-block;width:0;height:20px;content:"";vertical-align:-20px}.mdc-list-item__secondary-text{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);text-overflow:ellipsis;white-space:nowrap;overflow:hidden;display:block;margin-top:0;line-height:normal;display:block}.mdc-list-item__secondary-text::before{display:inline-block;width:0;height:20px;content:"";vertical-align:0}.mdc-list--dense .mdc-list-item__secondary-text{font-size:inherit}* ::slotted(a),a{color:inherit;text-decoration:none}:host([twoline]){height:72px}:host([twoline]) .mdc-list-item__text{align-self:flex-start}:host([disabled]),:host([noninteractive]){cursor:default;pointer-events:none}:host([disabled]) .mdc-list-item__text ::slotted(*){opacity:.38}:host([disabled]) .mdc-list-item__text ::slotted(*),:host([disabled]) .mdc-list-item__primary-text ::slotted(*),:host([disabled]) .mdc-list-item__secondary-text ::slotted(*){color:#000;color:var(--mdc-theme-on-surface, #000)}.mdc-list-item__secondary-text ::slotted(*){color:rgba(0,0,0,.54);color:var(--mdc-theme-text-secondary-on-background, rgba(0, 0, 0, 0.54))}.mdc-list-item__graphic ::slotted(*){background-color:transparent;color:rgba(0,0,0,.38);color:var(--mdc-theme-text-icon-on-background, rgba(0, 0, 0, 0.38))}.mdc-list-group__subheader ::slotted(*){color:rgba(0,0,0,.87);color:var(--mdc-theme-text-primary-on-background, rgba(0, 0, 0, 0.87))}:host([graphic=avatar]) .mdc-list-item__graphic{width:var(--mdc-list-item-graphic-size, 40px);height:var(--mdc-list-item-graphic-size, 40px)}:host([graphic=avatar]) .mdc-list-item__graphic.multi{width:auto}:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(*){width:var(--mdc-list-item-graphic-size, 40px);line-height:var(--mdc-list-item-graphic-size, 40px)}:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(mwc-icon){line-height:var(--mdc-list-item-graphic-size, 40px) !important}:host([graphic=avatar]) .mdc-list-item__graphic ::slotted(*){border-radius:50%}:host([graphic=avatar],[graphic=medium],[graphic=large],[graphic=control]) .mdc-list-item__graphic{margin-left:0;margin-right:var(--mdc-list-item-graphic-margin, 16px)}:host[dir=rtl] :host([graphic=avatar],[graphic=medium],[graphic=large],[graphic=control]) .mdc-list-item__graphic,[dir=rtl] :host :host([graphic=avatar],[graphic=medium],[graphic=large],[graphic=control]) .mdc-list-item__graphic{margin-left:var(--mdc-list-item-graphic-margin, 16px);margin-right:0}:host([graphic=icon]) .mdc-list-item__graphic{width:var(--mdc-list-item-graphic-size, 24px);height:var(--mdc-list-item-graphic-size, 24px);margin-left:0;margin-right:var(--mdc-list-item-graphic-margin, 32px)}:host([graphic=icon]) .mdc-list-item__graphic.multi{width:auto}:host([graphic=icon]) .mdc-list-item__graphic ::slotted(*){width:var(--mdc-list-item-graphic-size, 24px);line-height:var(--mdc-list-item-graphic-size, 24px)}:host([graphic=icon]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=icon]) .mdc-list-item__graphic ::slotted(mwc-icon){line-height:var(--mdc-list-item-graphic-size, 24px) !important}:host[dir=rtl] :host([graphic=icon]) .mdc-list-item__graphic,[dir=rtl] :host :host([graphic=icon]) .mdc-list-item__graphic{margin-left:var(--mdc-list-item-graphic-margin, 32px);margin-right:0}:host([graphic=avatar]:not([twoLine])),:host([graphic=icon]:not([twoLine])){height:56px}:host([graphic=medium]:not([twoLine])),:host([graphic=large]:not([twoLine])){height:72px}:host([graphic=medium]) .mdc-list-item__graphic,:host([graphic=large]) .mdc-list-item__graphic{width:var(--mdc-list-item-graphic-size, 56px);height:var(--mdc-list-item-graphic-size, 56px)}:host([graphic=medium]) .mdc-list-item__graphic.multi,:host([graphic=large]) .mdc-list-item__graphic.multi{width:auto}:host([graphic=medium]) .mdc-list-item__graphic ::slotted(*),:host([graphic=large]) .mdc-list-item__graphic ::slotted(*){width:var(--mdc-list-item-graphic-size, 56px);line-height:var(--mdc-list-item-graphic-size, 56px)}:host([graphic=medium]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=medium]) .mdc-list-item__graphic ::slotted(mwc-icon),:host([graphic=large]) .mdc-list-item__graphic ::slotted(.material-icons),:host([graphic=large]) .mdc-list-item__graphic ::slotted(mwc-icon){line-height:var(--mdc-list-item-graphic-size, 56px) !important}:host([graphic=large]){padding-left:0px}`;

    /**
    @license
    Copyright 2020 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    let ListItem = class ListItem extends ListItemBase {
    };
    ListItem.styles = style$b;
    ListItem = __decorate([
        customElement('mwc-list-item')
    ], ListItem);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    /** @soyCompatible */
    class FormElement extends BaseElement {
        createRenderRoot() {
            return this.attachShadow({ mode: 'open', delegatesFocus: true });
        }
        click() {
            if (this.formElement) {
                this.formElement.focus();
                this.formElement.click();
            }
        }
        setAriaLabel(label) {
            if (this.formElement) {
                this.formElement.setAttribute('aria-label', label);
            }
        }
        firstUpdated() {
            super.firstUpdated();
            this.mdcRoot.addEventListener('change', (e) => {
                this.dispatchEvent(new Event('change', e));
            });
        }
    }

    /** @soyCompatible */
    class CheckboxBase extends FormElement {
        constructor() {
            super(...arguments);
            this.checked = false;
            this.indeterminate = false;
            this.disabled = false;
            this.value = '';
            this.reducedTouchTarget = false;
            this.animationClass = '';
            this.shouldRenderRipple = false;
            this.focused = false;
            // MDC Foundation is unused
            this.mdcFoundationClass = undefined;
            this.mdcFoundation = undefined;
            this.rippleElement = null;
            this.rippleHandlers = new RippleHandlers(() => {
                this.shouldRenderRipple = true;
                this.ripple.then((v) => this.rippleElement = v);
                return this.ripple;
            });
        }
        createAdapter() {
            return {};
        }
        update(changedProperties) {
            const oldIndeterminate = changedProperties.get('indeterminate');
            const oldChecked = changedProperties.get('checked');
            const oldDisabled = changedProperties.get('disabled');
            if (oldIndeterminate !== undefined || oldChecked !== undefined ||
                oldDisabled !== undefined) {
                const oldState = this.calculateAnimationStateName(!!oldChecked, !!oldIndeterminate, !!oldDisabled);
                const newState = this.calculateAnimationStateName(this.checked, this.indeterminate, this.disabled);
                this.animationClass = `${oldState}-${newState}`;
            }
            super.update(changedProperties);
        }
        calculateAnimationStateName(checked, indeterminate, disabled) {
            if (disabled) {
                return 'disabled';
            }
            else if (indeterminate) {
                return 'indeterminate';
            }
            else if (checked) {
                return 'checked';
            }
            else {
                return 'unchecked';
            }
        }
        // TODO(dfreedm): Make this use selected as a param after Polymer/internal#739
        /** @soyCompatible */
        renderRipple() {
            const selected = this.indeterminate || this.checked;
            return html `${this.shouldRenderRipple ? html `
        <mwc-ripple
          .accent="${selected}"
          .disabled="${this.disabled}"
          unbounded>
        </mwc-ripple>` :
            html ``}`;
        }
        /**
         * @soyCompatible
         * @soyAttributes checkboxAttributes: input
         * @soyClasses checkboxClasses: .mdc-checkbox
         */
        render() {
            const selected = this.indeterminate || this.checked;
            /* eslint-disable eqeqeq */
            // tslint:disable:triple-equals
            /** @classMap */
            const classes = {
                'mdc-checkbox--disabled': this.disabled,
                'mdc-checkbox--selected': selected,
                'mdc-checkbox--touch': !this.reducedTouchTarget,
                'mdc-checkbox--focused': this.focused,
                // transition animiation classes
                'mdc-checkbox--anim-checked-indeterminate': this.animationClass == 'checked-indeterminate',
                'mdc-checkbox--anim-checked-unchecked': this.animationClass == 'checked-unchecked',
                'mdc-checkbox--anim-indeterminate-checked': this.animationClass == 'indeterminate-checked',
                'mdc-checkbox--anim-indeterminate-unchecked': this.animationClass == 'indeterminate-unchecked',
                'mdc-checkbox--anim-unchecked-checked': this.animationClass == 'unchecked-checked',
                'mdc-checkbox--anim-unchecked-indeterminate': this.animationClass == 'unchecked-indeterminate',
            };
            // tslint:enable:triple-equals
            /* eslint-enable eqeqeq */
            const ariaChecked = this.indeterminate ? 'mixed' : undefined;
            return html `
      <div class="mdc-checkbox mdc-checkbox--upgraded ${classMap(classes)}">
        <input type="checkbox"
              class="mdc-checkbox__native-control"
              aria-checked="${ifDefined(ariaChecked)}"
              data-indeterminate="${this.indeterminate ? 'true' : 'false'}"
              ?disabled="${this.disabled}"
              .indeterminate="${this.indeterminate}"
              .checked="${this.checked}"
              .value="${this.value}"
              @change="${this._changeHandler}"
              @focus="${this._handleFocus}"
              @blur="${this._handleBlur}"
              @mousedown="${this.handleRippleMouseDown}"
              @mouseenter="${this.handleRippleMouseEnter}"
              @mouseleave="${this.handleRippleMouseLeave}"
              @touchstart="${this.handleRippleTouchStart}"
              @touchend="${this.handleRippleDeactivate}"
              @touchcancel="${this.handleRippleDeactivate}">
        <div class="mdc-checkbox__background"
          @animationend="${this.resetAnimationClass}">
          <svg class="mdc-checkbox__checkmark"
              viewBox="0 0 24 24">
            <path class="mdc-checkbox__checkmark-path"
                  fill="none"
                  d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
          </svg>
          <div class="mdc-checkbox__mixedmark"></div>
        </div>
        ${this.renderRipple()}
      </div>`;
        }
        _handleFocus() {
            this.focused = true;
            this.handleRippleFocus();
        }
        _handleBlur() {
            this.focused = false;
            this.handleRippleBlur();
        }
        handleRippleMouseDown(event) {
            const onUp = () => {
                window.removeEventListener('mouseup', onUp);
                this.handleRippleDeactivate();
            };
            window.addEventListener('mouseup', onUp);
            this.rippleHandlers.startPress(event);
        }
        handleRippleTouchStart(event) {
            this.rippleHandlers.startPress(event);
        }
        handleRippleDeactivate() {
            this.rippleHandlers.endPress();
        }
        handleRippleMouseEnter() {
            this.rippleHandlers.startHover();
        }
        handleRippleMouseLeave() {
            this.rippleHandlers.endHover();
        }
        handleRippleFocus() {
            this.rippleHandlers.startFocus();
        }
        handleRippleBlur() {
            this.rippleHandlers.endFocus();
        }
        _changeHandler() {
            this.checked = this.formElement.checked;
            this.indeterminate = this.formElement.indeterminate;
        }
        resetAnimationClass() {
            this.animationClass = '';
        }
        get isRippleActive() {
            var _a;
            return ((_a = this.rippleElement) === null || _a === void 0 ? void 0 : _a.isActive) || false;
        }
    }
    __decorate([
        query('.mdc-checkbox')
    ], CheckboxBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('input')
    ], CheckboxBase.prototype, "formElement", void 0);
    __decorate([
        property({ type: Boolean, reflect: true })
    ], CheckboxBase.prototype, "checked", void 0);
    __decorate([
        property({ type: Boolean })
    ], CheckboxBase.prototype, "indeterminate", void 0);
    __decorate([
        property({ type: Boolean, reflect: true })
    ], CheckboxBase.prototype, "disabled", void 0);
    __decorate([
        property({ type: String })
    ], CheckboxBase.prototype, "value", void 0);
    __decorate([
        property({ type: Boolean })
    ], CheckboxBase.prototype, "reducedTouchTarget", void 0);
    __decorate([
        internalProperty()
    ], CheckboxBase.prototype, "animationClass", void 0);
    __decorate([
        internalProperty()
    ], CheckboxBase.prototype, "shouldRenderRipple", void 0);
    __decorate([
        internalProperty()
    ], CheckboxBase.prototype, "focused", void 0);
    __decorate([
        queryAsync('mwc-ripple')
    ], CheckboxBase.prototype, "ripple", void 0);
    __decorate([
        eventOptions({ passive: true })
    ], CheckboxBase.prototype, "handleRippleTouchStart", null);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$c = css `.mdc-touch-target-wrapper{display:inline}@keyframes mdc-checkbox-unchecked-checked-checkmark-path{0%,50%{stroke-dashoffset:29.7833385}50%{animation-timing-function:cubic-bezier(0, 0, 0.2, 1)}100%{stroke-dashoffset:0}}@keyframes mdc-checkbox-unchecked-indeterminate-mixedmark{0%,68.2%{transform:scaleX(0)}68.2%{animation-timing-function:cubic-bezier(0, 0, 0, 1)}100%{transform:scaleX(1)}}@keyframes mdc-checkbox-checked-unchecked-checkmark-path{from{animation-timing-function:cubic-bezier(0.4, 0, 1, 1);opacity:1;stroke-dashoffset:0}to{opacity:0;stroke-dashoffset:-29.7833385}}@keyframes mdc-checkbox-checked-indeterminate-checkmark{from{animation-timing-function:cubic-bezier(0, 0, 0.2, 1);transform:rotate(0deg);opacity:1}to{transform:rotate(45deg);opacity:0}}@keyframes mdc-checkbox-indeterminate-checked-checkmark{from{animation-timing-function:cubic-bezier(0.14, 0, 0, 1);transform:rotate(45deg);opacity:0}to{transform:rotate(360deg);opacity:1}}@keyframes mdc-checkbox-checked-indeterminate-mixedmark{from{animation-timing-function:mdc-animation-deceleration-curve-timing-function;transform:rotate(-45deg);opacity:0}to{transform:rotate(0deg);opacity:1}}@keyframes mdc-checkbox-indeterminate-checked-mixedmark{from{animation-timing-function:cubic-bezier(0.14, 0, 0, 1);transform:rotate(0deg);opacity:1}to{transform:rotate(315deg);opacity:0}}@keyframes mdc-checkbox-indeterminate-unchecked-mixedmark{0%{animation-timing-function:linear;transform:scaleX(1);opacity:1}32.8%,100%{transform:scaleX(0);opacity:0}}.mdc-checkbox{display:inline-block;position:relative;flex:0 0 18px;box-sizing:content-box;width:18px;height:18px;line-height:0;white-space:nowrap;cursor:pointer;vertical-align:bottom;padding:11px}.mdc-checkbox .mdc-checkbox__native-control:checked~.mdc-checkbox__background::before,.mdc-checkbox .mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background::before,.mdc-checkbox .mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background::before{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-checkbox--selected .mdc-checkbox__ripple::after{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-checkbox.mdc-checkbox--selected:hover .mdc-checkbox__ripple::before{opacity:.04}.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded--background-focused .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):focus .mdc-checkbox__ripple::before{transition-duration:75ms;opacity:.12}.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded) .mdc-checkbox__ripple::after{transition:opacity 150ms linear}.mdc-checkbox.mdc-checkbox--selected:not(.mdc-ripple-upgraded):active .mdc-checkbox__ripple::after{transition-duration:75ms;opacity:.12}.mdc-checkbox.mdc-checkbox--selected.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.12}.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple::before,.mdc-checkbox.mdc-ripple-upgraded--background-focused.mdc-checkbox--selected .mdc-checkbox__ripple::after{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-checkbox .mdc-checkbox__background{top:11px;left:11px}.mdc-checkbox .mdc-checkbox__background::before{top:-13px;left:-13px;width:40px;height:40px}.mdc-checkbox .mdc-checkbox__native-control{top:0px;right:0px;left:0px;width:40px;height:40px}.mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:rgba(0,0,0,.54);background-color:transparent}.mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,.mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true]:enabled~.mdc-checkbox__background{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786);background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}@keyframes mdc-checkbox-fade-in-background-8A000000secondary00000000secondary{0%{border-color:rgba(0,0,0,.54);background-color:transparent}50%{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786);background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}}@keyframes mdc-checkbox-fade-out-background-8A000000secondary00000000secondary{0%,80%{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786);background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}100%{border-color:rgba(0,0,0,.54);background-color:transparent}}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-in-background-8A000000secondary00000000secondary}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-out-background-8A000000secondary00000000secondary}.mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:rgba(0,0,0,.38);background-color:transparent}.mdc-checkbox__native-control[disabled]:checked~.mdc-checkbox__background,.mdc-checkbox__native-control[disabled]:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true][disabled]~.mdc-checkbox__background{border-color:transparent;background-color:rgba(0,0,0,.38)}.mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff}.mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff}@media screen and (-ms-high-contrast: active){.mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:GrayText;background-color:transparent}.mdc-checkbox__native-control[disabled]:checked~.mdc-checkbox__background,.mdc-checkbox__native-control[disabled]:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true][disabled]~.mdc-checkbox__background{border-color:GrayText;background-color:transparent}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:GrayText}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:GrayText}.mdc-checkbox__mixedmark{margin:0 1px}}.mdc-checkbox--disabled{cursor:default;pointer-events:none}.mdc-checkbox__background{display:inline-flex;position:absolute;align-items:center;justify-content:center;box-sizing:border-box;width:18px;height:18px;border:2px solid currentColor;border-radius:2px;background-color:transparent;pointer-events:none;will-change:background-color,border-color;transition:background-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),border-color 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox__background .mdc-checkbox__background::before{background-color:#000;background-color:var(--mdc-theme-on-surface, #000)}.mdc-checkbox__checkmark{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;opacity:0;transition:opacity 180ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox--upgraded .mdc-checkbox__checkmark{opacity:1}.mdc-checkbox__checkmark-path{transition:stroke-dashoffset 180ms 0ms cubic-bezier(0.4, 0, 0.6, 1);stroke:currentColor;stroke-width:3.12px;stroke-dashoffset:29.7833385;stroke-dasharray:29.7833385}.mdc-checkbox__mixedmark{width:100%;height:0;transform:scaleX(0) rotate(0deg);border-width:1px;border-style:solid;opacity:0;transition:opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox--upgraded .mdc-checkbox__background,.mdc-checkbox--upgraded .mdc-checkbox__checkmark,.mdc-checkbox--upgraded .mdc-checkbox__checkmark-path,.mdc-checkbox--upgraded .mdc-checkbox__mixedmark{transition:none !important}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__background,.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__background,.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__background,.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__background{animation-duration:180ms;animation-timing-function:linear}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__checkmark-path{animation:mdc-checkbox-unchecked-checked-checkmark-path 180ms linear 0s;transition:none}.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__mixedmark{animation:mdc-checkbox-unchecked-indeterminate-mixedmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__checkmark-path{animation:mdc-checkbox-checked-unchecked-checkmark-path 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__checkmark{animation:mdc-checkbox-checked-indeterminate-checkmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-checked-indeterminate .mdc-checkbox__mixedmark{animation:mdc-checkbox-checked-indeterminate-mixedmark 90ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__checkmark{animation:mdc-checkbox-indeterminate-checked-checkmark 500ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-checked .mdc-checkbox__mixedmark{animation:mdc-checkbox-indeterminate-checked-mixedmark 500ms linear 0s;transition:none}.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__mixedmark{animation:mdc-checkbox-indeterminate-unchecked-mixedmark 300ms linear 0s;transition:none}.mdc-checkbox__native-control:checked~.mdc-checkbox__background,.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background{transition:border-color 90ms 0ms cubic-bezier(0, 0, 0.2, 1),background-color 90ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__checkmark-path,.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__checkmark-path,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background .mdc-checkbox__checkmark-path{stroke-dashoffset:0}.mdc-checkbox__background::before{position:absolute;transform:scale(0, 0);border-radius:50%;opacity:0;pointer-events:none;content:"";will-change:opacity,transform;transition:opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox__native-control:focus~.mdc-checkbox__background::before{transform:scale(1);opacity:.12;transition:opacity 80ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 80ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-checkbox__native-control{position:absolute;margin:0;padding:0;opacity:0;cursor:inherit}.mdc-checkbox__native-control:disabled{cursor:default;pointer-events:none}.mdc-checkbox--touch{margin-top:4px;margin-bottom:4px;margin-right:4px;margin-left:4px}.mdc-checkbox--touch .mdc-checkbox__native-control{top:-4px;right:-4px;left:-4px;width:48px;height:48px}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__checkmark{transition:opacity 180ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 180ms 0ms cubic-bezier(0, 0, 0.2, 1);opacity:1}.mdc-checkbox__native-control:checked~.mdc-checkbox__background .mdc-checkbox__mixedmark{transform:scaleX(1) rotate(-45deg)}.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__checkmark,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background .mdc-checkbox__checkmark{transform:rotate(45deg);opacity:0;transition:opacity 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 90ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-checkbox__native-control:indeterminate~.mdc-checkbox__background .mdc-checkbox__mixedmark,.mdc-checkbox__native-control[data-indeterminate=true]~.mdc-checkbox__background .mdc-checkbox__mixedmark{transform:scaleX(1) rotate(0deg);opacity:1}:host{outline:none;display:inline-block}.mdc-checkbox .mdc-checkbox__native-control:focus~.mdc-checkbox__background::before{background-color:rgba(0, 0, 0, 0.54);background-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54))}.mdc-checkbox .mdc-checkbox__background::before{content:none}.mdc-checkbox__native-control[disabled]:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:rgba(0, 0, 0, 0.38);border-color:var(--mdc-checkbox-disabled-color, rgba(0, 0, 0, 0.38));background-color:transparent}.mdc-checkbox__native-control[disabled]:checked~.mdc-checkbox__background,.mdc-checkbox__native-control[disabled]:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true][disabled]~.mdc-checkbox__background{border-color:transparent;background-color:rgba(0, 0, 0, 0.38);background-color:var(--mdc-checkbox-disabled-color, rgba(0, 0, 0, 0.38))}.mdc-checkbox__native-control:enabled:not(:checked):not(:indeterminate):not([data-indeterminate=true])~.mdc-checkbox__background{border-color:rgba(0, 0, 0, 0.54);border-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54));background-color:transparent}.mdc-checkbox__native-control:enabled:checked~.mdc-checkbox__background,.mdc-checkbox__native-control:enabled:indeterminate~.mdc-checkbox__background,.mdc-checkbox__native-control[data-indeterminate=true]:enabled~.mdc-checkbox__background{border-color:#018786;border-color:var(--m-checkbox-checked-color, var(--mdc-theme-secondary, #018786));background-color:#018786;background-color:var(--m-checkbox-checked-color, var(--mdc-theme-secondary, #018786))}@keyframes mdc-checkbox-fade-in-background---mdc-checkbox-unchecked-color--m-checkbox-checked-color00000000--m-checkbox-checked-color{0%{border-color:rgba(0, 0, 0, 0.54);border-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54));background-color:transparent}50%{border-color:#018786;border-color:var(--m-checkbox-checked-color, var(--mdc-theme-secondary, #018786));background-color:#018786;background-color:var(--m-checkbox-checked-color, var(--mdc-theme-secondary, #018786))}}@keyframes mdc-checkbox-fade-out-background---mdc-checkbox-unchecked-color--m-checkbox-checked-color00000000--m-checkbox-checked-color{0%,80%{border-color:#018786;border-color:var(--m-checkbox-checked-color, var(--mdc-theme-secondary, #018786));background-color:#018786;background-color:var(--m-checkbox-checked-color, var(--mdc-theme-secondary, #018786))}100%{border-color:rgba(0, 0, 0, 0.54);border-color:var(--mdc-checkbox-unchecked-color, rgba(0, 0, 0, 0.54));background-color:transparent}}.mdc-checkbox--anim-unchecked-checked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox--anim-unchecked-indeterminate .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-in-background---mdc-checkbox-unchecked-color--m-checkbox-checked-color00000000--m-checkbox-checked-color}.mdc-checkbox--anim-checked-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background,.mdc-checkbox--anim-indeterminate-unchecked .mdc-checkbox__native-control:enabled~.mdc-checkbox__background{animation-name:mdc-checkbox-fade-out-background---mdc-checkbox-unchecked-color--m-checkbox-checked-color00000000--m-checkbox-checked-color}.mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff;color:var(--mdc-checkbox-mark-color, #fff)}.mdc-checkbox__native-control:enabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff;border-color:var(--mdc-checkbox-mark-color, #fff)}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__checkmark{color:#fff;color:var(--mdc-checkbox-mark-color, #fff)}.mdc-checkbox__native-control:disabled~.mdc-checkbox__background .mdc-checkbox__mixedmark{border-color:#fff;border-color:var(--mdc-checkbox-mark-color, #fff)}`;

    /** @soyCompatible */
    let Checkbox = class Checkbox extends CheckboxBase {
    };
    Checkbox.styles = style$c;
    Checkbox = __decorate([
        customElement('mwc-checkbox')
    ], Checkbox);

    /**
     @license
     Copyright 2020 Google Inc. All Rights Reserved.

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */
    class CheckListItemBase extends ListItemBase {
        constructor() {
            super(...arguments);
            this.left = false;
            this.graphic = 'control';
        }
        render() {
            const checkboxClasses = {
                'mdc-list-item__graphic': this.left,
                'mdc-list-item__meta': !this.left,
            };
            const text = this.renderText();
            const graphic = this.graphic && this.graphic !== 'control' && !this.left ?
                this.renderGraphic() :
                html ``;
            const meta = this.hasMeta && this.left ? this.renderMeta() : html ``;
            const ripple = this.renderRipple();
            return html `
      ${ripple}
      ${graphic}
      ${this.left ? '' : text}
      <span class=${classMap(checkboxClasses)}>
        <mwc-checkbox
            reducedTouchTarget
            tabindex=${this.tabindex}
            .checked=${this.selected}
            ?disabled=${this.disabled}
            @change=${this.onChange}>
        </mwc-checkbox>
      </span>
      ${this.left ? text : ''}
      ${meta}`;
        }
        async onChange(evt) {
            const checkbox = evt.target;
            const changeFromProp = this.selected === checkbox.checked;
            if (!changeFromProp) {
                this._skipPropRequest = true;
                this.selected = checkbox.checked;
                await this.updateComplete;
                this._skipPropRequest = false;
            }
        }
    }
    __decorate([
        query('slot')
    ], CheckListItemBase.prototype, "slotElement", void 0);
    __decorate([
        query('mwc-checkbox')
    ], CheckListItemBase.prototype, "checkboxElement", void 0);
    __decorate([
        property({ type: Boolean })
    ], CheckListItemBase.prototype, "left", void 0);
    __decorate([
        property({ type: String, reflect: true })
    ], CheckListItemBase.prototype, "graphic", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$d = css `:host(:not([twoline])){height:56px}:host(:not([left])) .mdc-list-item__meta{height:40px;width:40px}`;

    /**
    @license
    Copyright 2020 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    let CheckListItem = class CheckListItem extends CheckListItemBase {
    };
    CheckListItem.styles = [style$b, style$d];
    CheckListItem = __decorate([
        customElement('mwc-check-list-item')
    ], CheckListItem);

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var strings$8 = {
        NATIVE_CONTROL_SELECTOR: '.mdc-radio__native-control',
    };
    var cssClasses$7 = {
        DISABLED: 'mdc-radio--disabled',
        ROOT: 'mdc-radio',
    };

    /**
     * @license
     * Copyright 2016 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var MDCRadioFoundation = /** @class */ (function (_super) {
        __extends(MDCRadioFoundation, _super);
        function MDCRadioFoundation(adapter) {
            return _super.call(this, __assign(__assign({}, MDCRadioFoundation.defaultAdapter), adapter)) || this;
        }
        Object.defineProperty(MDCRadioFoundation, "cssClasses", {
            get: function () {
                return cssClasses$7;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRadioFoundation, "strings", {
            get: function () {
                return strings$8;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCRadioFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    removeClass: function () { return undefined; },
                    setNativeControlDisabled: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCRadioFoundation.prototype.setDisabled = function (disabled) {
            var DISABLED = MDCRadioFoundation.cssClasses.DISABLED;
            this.adapter.setNativeControlDisabled(disabled);
            if (disabled) {
                this.adapter.addClass(DISABLED);
            }
            else {
                this.adapter.removeClass(DISABLED);
            }
        };
        return MDCRadioFoundation;
    }(MDCFoundation));

    /**
     * @license
     *  Copyright 2020 Google Inc. All Rights Reserved.
     *
     * Licensed under the Apache License, Version 2.0 (the "License");
     * you may not use this file except in compliance with the License.
     * You may obtain a copy of the License at
     *
     * http://www.apache.org/licenses/LICENSE-2.0
     *
     *
     *     Unless required by applicable law or agreed to in writing, software
     * distributed under the License is distributed on an "AS IS" BASIS,
     * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     * See the License for the specific language governing permissions and
     * limitations under the License.
     */
    /**
     * Unique symbol for marking roots
     */
    const selectionController = Symbol('selection controller');
    /**
     * Set of checkable elements with added metadata
     */
    class SingleSelectionSet {
        constructor() {
            this.selected = null;
            this.ordered = null;
            this.set = new Set();
        }
    }
    /**
     * Controller that provides behavior similar to a native `<input type="radio">`
     * group.
     *
     * Behaviors:
     *
     * - Selection via key navigation (currently LTR is supported)
     * - Deselection of other grouped, checkable controls upon selection
     * - Grouping of checkable elements by name
     *   - Defaults grouping scope to host shadow root
     *   - Document-wide scoping enabled
     *
     * Intended Usage:
     *
     * ```ts
     * class MyElement extends HTMLElement {
     *   private selectionController: SingleSelectionController | null = null;
     *   name = "";
     *   global = false;
     *
     *   private _checked = false;
     *   set checked(checked: boolean) {
     *     const oldVal = this._checked;
     *     if (checked === oldVal) return;
     *
     *     this._checked = checked;
     *
     *     if (this.selectionController) {
     *       this.selectionController.update(this)
     *     }
     *   }
     *
     *   get checked() {
     *     return this._checked;
     *   }
     *
     *   connectedCallback() {
     *     this.selectionController = SelectionController.getController(this);
     *     this.selectionController.register(this);
     *     this.selectionController.update(this);
     *   }
     *
     *   disconnectedCallback() {
     *     this.selectionController!.unregister(this);
     *     this.selectionController = null;
     *   }
     *
     *   focus() {
     *     // focus native radio element
     *   }
     * }
     * ```
     */
    class SingleSelectionController {
        constructor(element) {
            this.sets = {};
            this.focusedSet = null;
            this.mouseIsDown = false;
            this.updating = false;
            element.addEventListener('keydown', (e) => {
                this.keyDownHandler(e);
            });
            element.addEventListener('mousedown', () => {
                this.mousedownHandler();
            });
            element.addEventListener('mouseup', () => {
                this.mouseupHandler();
            });
        }
        /**
         * Get a controller for the given element. If no controller exists, one will
         * be created. Defaults to getting the controller scoped to the element's root
         * node shadow root unless `element.global` is true. Then, it will get a
         * `window.document`-scoped controller.
         *
         * @param element Element from which to get / create a SelectionController. If
         *     `element.global` is true, it gets a selection controller scoped to
         *     `window.document`.
         */
        static getController(element) {
            const useGlobal = !('global' in element) || ('global' in element && element.global);
            const root = useGlobal ? document :
                element.getRootNode();
            let controller = root[selectionController];
            if (controller === undefined) {
                controller = new SingleSelectionController(root);
                root[selectionController] = controller;
            }
            return controller;
        }
        keyDownHandler(e) {
            const element = e.target;
            if (!('checked' in element)) {
                return;
            }
            if (!this.has(element)) {
                return;
            }
            if (e.key == 'ArrowRight' || e.key == 'ArrowDown') {
                this.selectNext(element);
            }
            else if (e.key == 'ArrowLeft' || e.key == 'ArrowUp') {
                this.selectPrevious(element);
            }
        }
        mousedownHandler() {
            this.mouseIsDown = true;
        }
        mouseupHandler() {
            this.mouseIsDown = false;
        }
        /**
         * Whether or not the controller controls  the given element.
         *
         * @param element element to check
         */
        has(element) {
            const set = this.getSet(element.name);
            return set.set.has(element);
        }
        /**
         * Selects and returns the controlled element previous to the given element in
         * document position order. See
         * [Node.compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).
         *
         * @param element element relative from which preceding element is fetched
         */
        selectPrevious(element) {
            const order = this.getOrdered(element);
            const i = order.indexOf(element);
            const previous = order[i - 1] || order[order.length - 1];
            this.select(previous);
            return previous;
        }
        /**
         * Selects and returns the controlled element next to the given element in
         * document position order. See
         * [Node.compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).
         *
         * @param element element relative from which following element is fetched
         */
        selectNext(element) {
            const order = this.getOrdered(element);
            const i = order.indexOf(element);
            const next = order[i + 1] || order[0];
            this.select(next);
            return next;
        }
        select(element) {
            element.click();
        }
        /**
         * Focuses the selected element in the given element's selection set. User's
         * mouse selection will override this focus.
         *
         * @param element Element from which selection set is derived and subsequently
         *     focused.
         */
        focus(element) {
            // Only manage focus state when using keyboard
            if (this.mouseIsDown) {
                return;
            }
            const set = this.getSet(element.name);
            const currentFocusedSet = this.focusedSet;
            this.focusedSet = set;
            if (currentFocusedSet != set && set.selected && set.selected != element) {
                set.selected.focus();
            }
        }
        /**
         * Returns the elements in the given element's selection set in document
         * position order.
         * [Node.compareDocumentPosition](https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition).
         *
         * @param element Element from which selection set is derived and subsequently
         *     ordered.
         */
        getOrdered(element) {
            const set = this.getSet(element.name);
            if (!set.ordered) {
                set.ordered = Array.from(set.set);
                set.ordered.sort((a, b) => a.compareDocumentPosition(b) == Node.DOCUMENT_POSITION_PRECEDING ?
                    1 :
                    0);
            }
            return set.ordered;
        }
        /**
         * Gets the selection set of the given name and creates one if it does not yet
         * exist.
         *
         * @param name Name of set
         */
        getSet(name) {
            if (!this.sets[name]) {
                this.sets[name] = new SingleSelectionSet();
            }
            return this.sets[name];
        }
        /**
         * Register the element in the selection controller.
         *
         * @param element Element to register. Registers in set of `element.name`.
         */
        register(element) {
            const set = this.getSet(element.name);
            set.set.add(element);
            set.ordered = null;
        }
        /**
         * Unregister the element from selection controller.
         *
         * @param element Element to register. Registers in set of `element.name`.
         */
        unregister(element) {
            const set = this.getSet(element.name);
            set.set.delete(element);
            set.ordered = null;
            if (set.selected == element) {
                set.selected = null;
            }
        }
        /**
         * Unselects other elements in element's set if element is checked. Noop
         * otherwise.
         *
         * @param element Element from which to calculate selection controller update.
         */
        update(element) {
            if (this.updating) {
                return;
            }
            this.updating = true;
            if (element.checked) {
                const set = this.getSet(element.name);
                for (const e of set.set) {
                    e.checked = (e == element);
                }
                set.selected = element;
            }
            this.updating = false;
        }
    }

    /**
     * @fires checked
     */
    class RadioBase extends FormElement {
        constructor() {
            super(...arguments);
            this._checked = false;
            this.global = false;
            this.disabled = false;
            this.value = '';
            this.name = '';
            this.mdcFoundationClass = MDCRadioFoundation;
        }
        get checked() {
            return this._checked;
        }
        /**
         * We define our own getter/setter for `checked` because we need to track
         * changes to it synchronously.
         *
         * The order in which the `checked` property is set across radio buttons
         * within the same group is very important. However, we can't rely on
         * UpdatingElement's `updated` callback to observe these changes (which is
         * also what the `@observer` decorator uses), because it batches changes to
         * all properties.
         *
         * Consider:
         *
         *   radio1.disabled = true;
         *   radio2.checked = true;
         *   radio1.checked = true;
         *
         * In this case we'd first see all changes for radio1, and then for radio2,
         * and we couldn't tell that radio1 was the most recently checked.
         */
        set checked(checked) {
            const oldValue = this._checked;
            if (!!checked === !!oldValue) {
                return;
            }
            this._checked = checked;
            if (this.formElement) {
                this.formElement.checked = checked;
            }
            if (this._selectionController !== undefined) {
                this._selectionController.update(this);
            }
            this.requestUpdate('checked', oldValue);
            // useful when unchecks self and wrapping element needs to synchronize
            this.dispatchEvent(new Event('checked', { bubbles: true, composed: true }));
        }
        _handleUpdatedValue(newValue) {
            // the observer function can't access protected fields (according to
            // closure compiler) because it's not a method on the class, so we need this
            // wrapper.
            this.formElement.value = newValue;
        }
        connectedCallback() {
            super.connectedCallback();
            // Note that we must defer creating the selection controller until the
            // element has connected, because selection controllers are keyed by the
            // radio's shadow root. For example, if we're stamping in a lit-html map
            // or repeat, then we'll be constructed before we're added to a root node.
            //
            // Also note if we aren't using native shadow DOM, then we don't technically
            // need a SelectionController, because our inputs will share document-scoped
            // native selection groups. However, it simplifies implementation and
            // testing to use one in all cases. In particular, it means we correctly
            // manage groups before the first update stamps the native input.
            //
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            this._selectionController = SingleSelectionController.getController(this);
            this._selectionController.register(this);
            // With native <input type="radio">, when a checked radio is added to the
            // root, then it wins. Immediately update to emulate this behavior.
            this._selectionController.update(this);
        }
        disconnectedCallback() {
            // The controller is initialized in connectedCallback, so if we are in
            // disconnectedCallback then it must be initialized.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this._selectionController.unregister(this);
            this._selectionController = undefined;
        }
        focus() {
            this.focusNative();
        }
        focusNative() {
            this.formElement.focus();
        }
        get ripple() {
            return this.rippleElement.ripple;
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { setNativeControlDisabled: (disabled) => {
                    this.formElement.disabled = disabled;
                } });
        }
        _changeHandler() {
            this.checked = this.formElement.checked;
        }
        _focusHandler() {
            if (this._selectionController !== undefined) {
                this._selectionController.focus(this);
            }
        }
        _clickHandler() {
            // Firefox has weird behavior with radios if they are not focused
            this.formElement.focus();
        }
        render() {
            return html `
      <div class="mdc-radio" .ripple=${ripple()}>
        <input
          class="mdc-radio__native-control"
          type="radio"
          name="${this.name}"
          .checked="${this.checked}"
          .value="${this.value}"
          @change="${this._changeHandler}"
          @focus="${this._focusHandler}"
          @click="${this._clickHandler}">
        <div class="mdc-radio__background">
          <div class="mdc-radio__outer-circle"></div>
          <div class="mdc-radio__inner-circle"></div>
        </div>
        <div class="mdc-radio__ripple"></div>
      </div>`;
        }
        firstUpdated() {
            super.firstUpdated();
            // We might not have been able to synchronize this from the checked setter
            // earlier, if checked was set before the input was stamped.
            this.formElement.checked = this.checked;
            if (this._selectionController !== undefined) {
                this._selectionController.update(this);
            }
        }
    }
    __decorate([
        query('.mdc-radio')
    ], RadioBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('input')
    ], RadioBase.prototype, "formElement", void 0);
    __decorate([
        query('.mdc-radio__ripple')
    ], RadioBase.prototype, "rippleElement", void 0);
    __decorate([
        property({ type: Boolean })
    ], RadioBase.prototype, "global", void 0);
    __decorate([
        property({ type: Boolean, reflect: true })
    ], RadioBase.prototype, "checked", null);
    __decorate([
        property({ type: Boolean }),
        observer(function (disabled) {
            this.mdcFoundation.setDisabled(disabled);
        })
    ], RadioBase.prototype, "disabled", void 0);
    __decorate([
        property({ type: String }),
        observer(function (value) {
            this._handleUpdatedValue(value);
        })
    ], RadioBase.prototype, "value", void 0);
    __decorate([
        property({ type: String })
    ], RadioBase.prototype, "name", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$e = css `.mdc-touch-target-wrapper{display:inline}.mdc-radio{padding:10px;display:inline-block;position:relative;flex:0 0 auto;box-sizing:content-box;width:20px;height:20px;cursor:pointer;will-change:opacity,transform,border-color,color}.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:rgba(0,0,0,.54)}.mdc-radio .mdc-radio__native-control:enabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-radio .mdc-radio__native-control:enabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:#018786;border-color:var(--mdc-theme-secondary, #018786)}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:rgba(0,0,0,.38)}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:rgba(0,0,0,.38)}.mdc-radio [aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:rgba(0,0,0,.38)}.mdc-radio .mdc-radio__background::before{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-radio .mdc-radio__background::before{top:-10px;left:-10px;width:40px;height:40px}.mdc-radio .mdc-radio__native-control{top:0px;right:0px;left:0px;width:40px;height:40px}.mdc-radio__background{display:inline-block;position:relative;box-sizing:border-box;width:20px;height:20px}.mdc-radio__background::before{position:absolute;transform:scale(0, 0);border-radius:50%;opacity:0;pointer-events:none;content:"";transition:opacity 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1),transform 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-radio__outer-circle{position:absolute;top:0;left:0;box-sizing:border-box;width:100%;height:100%;border-width:2px;border-style:solid;border-radius:50%;transition:border-color 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-radio__inner-circle{position:absolute;top:0;left:0;box-sizing:border-box;width:100%;height:100%;transform:scale(0, 0);border-width:10px;border-style:solid;border-radius:50%;transition:transform 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1),border-color 120ms 0ms cubic-bezier(0.4, 0, 0.6, 1)}.mdc-radio__native-control{position:absolute;margin:0;padding:0;opacity:0;cursor:inherit;z-index:1}.mdc-radio--touch{margin-top:4px;margin-bottom:4px;margin-right:4px;margin-left:4px}.mdc-radio--touch .mdc-radio__native-control{top:-4px;right:-4px;left:-4px;width:48px;height:48px}.mdc-radio__native-control:checked+.mdc-radio__background,.mdc-radio__native-control:disabled+.mdc-radio__background{transition:opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__outer-circle{transition:border-color 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{transition:transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1),border-color 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio--disabled{cursor:default;pointer-events:none}.mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__inner-circle{transform:scale(0.5);transition:transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1),border-color 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-radio__native-control:disabled+.mdc-radio__background,[aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background{cursor:default}.mdc-radio__native-control:focus+.mdc-radio__background::before{transform:scale(1);opacity:.12;transition:opacity 120ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 120ms 0ms cubic-bezier(0, 0, 0.2, 1)}@keyframes mdc-ripple-fg-radius-in{from{animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1);transform:translate(var(--mdc-ripple-fg-translate-start, 0)) scale(1)}to{transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}}@keyframes mdc-ripple-fg-opacity-in{from{animation-timing-function:linear;opacity:0}to{opacity:var(--mdc-ripple-fg-opacity, 0)}}@keyframes mdc-ripple-fg-opacity-out{from{animation-timing-function:linear;opacity:var(--mdc-ripple-fg-opacity, 0)}to{opacity:0}}.mdc-radio{--mdc-ripple-fg-size: 0;--mdc-ripple-left: 0;--mdc-ripple-top: 0;--mdc-ripple-fg-scale: 1;--mdc-ripple-fg-translate-end: 0;--mdc-ripple-fg-translate-start: 0;-webkit-tap-highlight-color:rgba(0,0,0,0);will-change:transform,opacity}.mdc-radio .mdc-radio__ripple::before,.mdc-radio .mdc-radio__ripple::after{position:absolute;border-radius:50%;opacity:0;pointer-events:none;content:""}.mdc-radio .mdc-radio__ripple::before{transition:opacity 15ms linear,background-color 15ms linear;z-index:1}.mdc-radio.mdc-ripple-upgraded .mdc-radio__ripple::before{transform:scale(var(--mdc-ripple-fg-scale, 1))}.mdc-radio.mdc-ripple-upgraded .mdc-radio__ripple::after{top:0;left:0;transform:scale(0);transform-origin:center center}.mdc-radio.mdc-ripple-upgraded--unbounded .mdc-radio__ripple::after{top:var(--mdc-ripple-top, 0);left:var(--mdc-ripple-left, 0)}.mdc-radio.mdc-ripple-upgraded--foreground-activation .mdc-radio__ripple::after{animation:mdc-ripple-fg-radius-in 225ms forwards,mdc-ripple-fg-opacity-in 75ms forwards}.mdc-radio.mdc-ripple-upgraded--foreground-deactivation .mdc-radio__ripple::after{animation:mdc-ripple-fg-opacity-out 150ms;transform:translate(var(--mdc-ripple-fg-translate-end, 0)) scale(var(--mdc-ripple-fg-scale, 1))}.mdc-radio .mdc-radio__ripple::before,.mdc-radio .mdc-radio__ripple::after{top:calc(50% - 50%);left:calc(50% - 50%);width:100%;height:100%}.mdc-radio.mdc-ripple-upgraded .mdc-radio__ripple::before,.mdc-radio.mdc-ripple-upgraded .mdc-radio__ripple::after{top:var(--mdc-ripple-top, calc(50% - 50%));left:var(--mdc-ripple-left, calc(50% - 50%));width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-radio.mdc-ripple-upgraded .mdc-radio__ripple::after{width:var(--mdc-ripple-fg-size, 100%);height:var(--mdc-ripple-fg-size, 100%)}.mdc-radio .mdc-radio__ripple::before,.mdc-radio .mdc-radio__ripple::after{background-color:#018786;background-color:var(--mdc-theme-secondary, #018786)}.mdc-radio:hover .mdc-radio__ripple::before{opacity:.04}.mdc-radio.mdc-ripple-upgraded--background-focused .mdc-radio__ripple::before,.mdc-radio:not(.mdc-ripple-upgraded):focus .mdc-radio__ripple::before{transition-duration:75ms;opacity:.12}.mdc-radio:not(.mdc-ripple-upgraded) .mdc-radio__ripple::after{transition:opacity 150ms linear}.mdc-radio:not(.mdc-ripple-upgraded):active .mdc-radio__ripple::after{transition-duration:75ms;opacity:.12}.mdc-radio.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.12}.mdc-radio.mdc-ripple-upgraded--background-focused .mdc-radio__background::before{content:none}.mdc-radio__ripple{position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none}:host{display:inline-block;outline:none}.mdc-radio{vertical-align:bottom}.mdc-radio .mdc-radio__native-control:enabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-unchecked-color, rgba(0, 0, 0, 0.54))}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:not(:checked)+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-color, rgba(0, 0, 0, 0.38))}.mdc-radio [aria-disabled=true] .mdc-radio__native-control:checked+.mdc-radio__background .mdc-radio__outer-circle,.mdc-radio .mdc-radio__native-control:disabled:checked+.mdc-radio__background .mdc-radio__outer-circle{border-color:var(--mdc-radio-disabled-color, rgba(0, 0, 0, 0.38))}.mdc-radio [aria-disabled=true] .mdc-radio__native-control+.mdc-radio__background .mdc-radio__inner-circle,.mdc-radio .mdc-radio__native-control:disabled+.mdc-radio__background .mdc-radio__inner-circle{border-color:var(--mdc-radio-disabled-color, rgba(0, 0, 0, 0.38))}`;

    let Radio = class Radio extends RadioBase {
    };
    Radio.styles = style$e;
    Radio = __decorate([
        customElement('mwc-radio')
    ], Radio);

    /**
     @license
     Copyright 2020 Google Inc. All Rights Reserved.

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */
    class RadioListItemBase extends ListItemBase {
        constructor() {
            super(...arguments);
            this.left = false;
            this.graphic = 'control';
            this._changeFromClick = false;
        }
        render() {
            const radioClasses = {
                'mdc-list-item__graphic': this.left,
                'mdc-list-item__meta': !this.left,
            };
            const text = this.renderText();
            const graphic = this.graphic && this.graphic !== 'control' && !this.left ?
                this.renderGraphic() :
                html ``;
            const meta = this.hasMeta && this.left ? this.renderMeta() : html ``;
            const ripple = this.renderRipple();
            return html `
      ${ripple}
      ${graphic}
      ${this.left ? '' : text}
      <mwc-radio
          global
          class=${classMap(radioClasses)}
          tabindex=${this.tabindex}
          name=${ifDefined(this.group === null ? undefined : this.group)}
          .checked=${this.selected}
          ?disabled=${this.disabled}
          @checked=${this.onChange}>
      </mwc-radio>
      ${this.left ? text : ''}
      ${meta}`;
        }
        onClick() {
            this._changeFromClick = true;
            super.onClick();
        }
        async onChange(evt) {
            const checkbox = evt.target;
            const changeFromProp = this.selected === checkbox.checked;
            if (!changeFromProp) {
                this._skipPropRequest = true;
                this.selected = checkbox.checked;
                await this.updateComplete;
                this._skipPropRequest = false;
                if (!this._changeFromClick) {
                    this.fireRequestSelected(this.selected, 'interaction');
                }
            }
            this._changeFromClick = false;
        }
    }
    __decorate([
        query('slot')
    ], RadioListItemBase.prototype, "slotElement", void 0);
    __decorate([
        query('mwc-radio')
    ], RadioListItemBase.prototype, "radioElement", void 0);
    __decorate([
        property({ type: Boolean })
    ], RadioListItemBase.prototype, "left", void 0);
    __decorate([
        property({ type: String, reflect: true })
    ], RadioListItemBase.prototype, "graphic", void 0);

    /**
    @license
    Copyright 2020 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    let RadioListItem = class RadioListItem extends RadioListItemBase {
    };
    RadioListItem.styles = [style$b, style$d];
    RadioListItem = __decorate([
        customElement('mwc-radio-list-item')
    ], RadioListItem);

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var cssClasses$8 = {
        CLOSING: 'mdc-snackbar--closing',
        OPEN: 'mdc-snackbar--open',
        OPENING: 'mdc-snackbar--opening',
    };
    var strings$9 = {
        ACTION_SELECTOR: '.mdc-snackbar__action',
        ARIA_LIVE_LABEL_TEXT_ATTR: 'data-mdc-snackbar-label-text',
        CLOSED_EVENT: 'MDCSnackbar:closed',
        CLOSING_EVENT: 'MDCSnackbar:closing',
        DISMISS_SELECTOR: '.mdc-snackbar__dismiss',
        LABEL_SELECTOR: '.mdc-snackbar__label',
        OPENED_EVENT: 'MDCSnackbar:opened',
        OPENING_EVENT: 'MDCSnackbar:opening',
        REASON_ACTION: 'action',
        REASON_DISMISS: 'dismiss',
        SURFACE_SELECTOR: '.mdc-snackbar__surface',
    };
    var numbers$4 = {
        DEFAULT_AUTO_DISMISS_TIMEOUT_MS: 5000,
        INDETERMINATE: -1,
        MAX_AUTO_DISMISS_TIMEOUT_MS: 10000,
        MIN_AUTO_DISMISS_TIMEOUT_MS: 4000,
        // These variables need to be kept in sync with the values in _variables.scss.
        SNACKBAR_ANIMATION_CLOSE_TIME_MS: 75,
        SNACKBAR_ANIMATION_OPEN_TIME_MS: 150,
        /**
         * Number of milliseconds to wait between temporarily clearing the label text
         * in the DOM and subsequently restoring it. This is necessary to force IE 11
         * to pick up the `aria-live` content change and announce it to the user.
         */
        ARIA_LIVE_DELAY_MS: 1000,
    };

    /**
     * @license
     * Copyright 2018 Google Inc.
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     *
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     *
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    var OPENING = cssClasses$8.OPENING, OPEN = cssClasses$8.OPEN, CLOSING = cssClasses$8.CLOSING;
    var REASON_ACTION = strings$9.REASON_ACTION, REASON_DISMISS = strings$9.REASON_DISMISS;
    var MDCSnackbarFoundation = /** @class */ (function (_super) {
        __extends(MDCSnackbarFoundation, _super);
        function MDCSnackbarFoundation(adapter) {
            var _this = _super.call(this, __assign(__assign({}, MDCSnackbarFoundation.defaultAdapter), adapter)) || this;
            _this.isOpen_ = false;
            _this.animationFrame_ = 0;
            _this.animationTimer_ = 0;
            _this.autoDismissTimer_ = 0;
            _this.autoDismissTimeoutMs_ = numbers$4.DEFAULT_AUTO_DISMISS_TIMEOUT_MS;
            _this.closeOnEscape_ = true;
            return _this;
        }
        Object.defineProperty(MDCSnackbarFoundation, "cssClasses", {
            get: function () {
                return cssClasses$8;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCSnackbarFoundation, "strings", {
            get: function () {
                return strings$9;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCSnackbarFoundation, "numbers", {
            get: function () {
                return numbers$4;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MDCSnackbarFoundation, "defaultAdapter", {
            get: function () {
                return {
                    addClass: function () { return undefined; },
                    announce: function () { return undefined; },
                    notifyClosed: function () { return undefined; },
                    notifyClosing: function () { return undefined; },
                    notifyOpened: function () { return undefined; },
                    notifyOpening: function () { return undefined; },
                    removeClass: function () { return undefined; },
                };
            },
            enumerable: true,
            configurable: true
        });
        MDCSnackbarFoundation.prototype.destroy = function () {
            this.clearAutoDismissTimer_();
            cancelAnimationFrame(this.animationFrame_);
            this.animationFrame_ = 0;
            clearTimeout(this.animationTimer_);
            this.animationTimer_ = 0;
            this.adapter.removeClass(OPENING);
            this.adapter.removeClass(OPEN);
            this.adapter.removeClass(CLOSING);
        };
        MDCSnackbarFoundation.prototype.open = function () {
            var _this = this;
            this.clearAutoDismissTimer_();
            this.isOpen_ = true;
            this.adapter.notifyOpening();
            this.adapter.removeClass(CLOSING);
            this.adapter.addClass(OPENING);
            this.adapter.announce();
            // Wait a frame once display is no longer "none", to establish basis for animation
            this.runNextAnimationFrame_(function () {
                _this.adapter.addClass(OPEN);
                _this.animationTimer_ = setTimeout(function () {
                    var timeoutMs = _this.getTimeoutMs();
                    _this.handleAnimationTimerEnd_();
                    _this.adapter.notifyOpened();
                    if (timeoutMs !== numbers$4.INDETERMINATE) {
                        _this.autoDismissTimer_ = setTimeout(function () {
                            _this.close(REASON_DISMISS);
                        }, timeoutMs);
                    }
                }, numbers$4.SNACKBAR_ANIMATION_OPEN_TIME_MS);
            });
        };
        /**
         * @param reason Why the snackbar was closed. Value will be passed to CLOSING_EVENT and CLOSED_EVENT via the
         *     `event.detail.reason` property. Standard values are REASON_ACTION and REASON_DISMISS, but custom
         *     client-specific values may also be used if desired.
         */
        MDCSnackbarFoundation.prototype.close = function (reason) {
            var _this = this;
            if (reason === void 0) { reason = ''; }
            if (!this.isOpen_) {
                // Avoid redundant close calls (and events), e.g. repeated interactions as the snackbar is animating closed
                return;
            }
            cancelAnimationFrame(this.animationFrame_);
            this.animationFrame_ = 0;
            this.clearAutoDismissTimer_();
            this.isOpen_ = false;
            this.adapter.notifyClosing(reason);
            this.adapter.addClass(cssClasses$8.CLOSING);
            this.adapter.removeClass(cssClasses$8.OPEN);
            this.adapter.removeClass(cssClasses$8.OPENING);
            clearTimeout(this.animationTimer_);
            this.animationTimer_ = setTimeout(function () {
                _this.handleAnimationTimerEnd_();
                _this.adapter.notifyClosed(reason);
            }, numbers$4.SNACKBAR_ANIMATION_CLOSE_TIME_MS);
        };
        MDCSnackbarFoundation.prototype.isOpen = function () {
            return this.isOpen_;
        };
        MDCSnackbarFoundation.prototype.getTimeoutMs = function () {
            return this.autoDismissTimeoutMs_;
        };
        MDCSnackbarFoundation.prototype.setTimeoutMs = function (timeoutMs) {
            // Use shorter variable names to make the code more readable
            var minValue = numbers$4.MIN_AUTO_DISMISS_TIMEOUT_MS;
            var maxValue = numbers$4.MAX_AUTO_DISMISS_TIMEOUT_MS;
            var indeterminateValue = numbers$4.INDETERMINATE;
            if (timeoutMs === numbers$4.INDETERMINATE || (timeoutMs <= maxValue && timeoutMs >= minValue)) {
                this.autoDismissTimeoutMs_ = timeoutMs;
            }
            else {
                throw new Error("\n        timeoutMs must be an integer in the range " + minValue + "\u2013" + maxValue + "\n        (or " + indeterminateValue + " to disable), but got '" + timeoutMs + "'");
            }
        };
        MDCSnackbarFoundation.prototype.getCloseOnEscape = function () {
            return this.closeOnEscape_;
        };
        MDCSnackbarFoundation.prototype.setCloseOnEscape = function (closeOnEscape) {
            this.closeOnEscape_ = closeOnEscape;
        };
        MDCSnackbarFoundation.prototype.handleKeyDown = function (evt) {
            var isEscapeKey = evt.key === 'Escape' || evt.keyCode === 27;
            if (isEscapeKey && this.getCloseOnEscape()) {
                this.close(REASON_DISMISS);
            }
        };
        MDCSnackbarFoundation.prototype.handleActionButtonClick = function (_evt) {
            this.close(REASON_ACTION);
        };
        MDCSnackbarFoundation.prototype.handleActionIconClick = function (_evt) {
            this.close(REASON_DISMISS);
        };
        MDCSnackbarFoundation.prototype.clearAutoDismissTimer_ = function () {
            clearTimeout(this.autoDismissTimer_);
            this.autoDismissTimer_ = 0;
        };
        MDCSnackbarFoundation.prototype.handleAnimationTimerEnd_ = function () {
            this.animationTimer_ = 0;
            this.adapter.removeClass(cssClasses$8.OPENING);
            this.adapter.removeClass(cssClasses$8.CLOSING);
        };
        /**
         * Runs the given logic on the next animation frame, using setTimeout to factor in Firefox reflow behavior.
         */
        MDCSnackbarFoundation.prototype.runNextAnimationFrame_ = function (callback) {
            var _this = this;
            cancelAnimationFrame(this.animationFrame_);
            this.animationFrame_ = requestAnimationFrame(function () {
                _this.animationFrame_ = 0;
                clearTimeout(_this.animationTimer_);
                _this.animationTimer_ = setTimeout(callback, 0);
            });
        };
        return MDCSnackbarFoundation;
    }(MDCFoundation));

    /**
    @license
    Copyright 2019 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const { ARIA_LIVE_LABEL_TEXT_ATTR } = MDCSnackbarFoundation.strings;
    const { ARIA_LIVE_DELAY_MS } = MDCSnackbarFoundation.numbers;
    /**
     * Maps an accessibleLabel container part to its label element and the timeoutID
     * of the task that restores its text content from ::before back to textContent.
     */
    const stateMap = new WeakMap();
    /**
     * A lit directive implementation of @material/mdc-snackbar/util.ts#announce,
     * which does some tricks to ensure that snackbar labels will be handled
     * correctly by screen readers.
     *
     * The existing MDC announce util function is difficult to use directly here,
     * because Lit can crash when DOM that it is managing changes outside of its
     * purvue. In this case, we would render our labelText as the text content of
     * the label div, but the MDC announce function then clears that text content,
     * and resets it after a timeout (see below for why). We do the same thing here,
     * but in a way that fits into Lit's lifecycle.
     *
     * TODO(aomarks) Investigate whether this can be simplified; but to do that we
     * first need testing infrastructure to verify that it remains compatible with
     * screen readers. For example, can we just create an entirely new label node
     * every time we open or labelText changes? If not, and the async text/::before
     * swap is strictly required, can we at elast make this directive more generic
     * (e.g. so that we don't hard-code the name of the label class).
     */
    const accessibleSnackbarLabel = directive((labelText, isOpen) => (part) => {
        if (!isOpen) {
            // We never need to do anything if we're closed, even if the label also
            // changed in this batch of changes. We'll fully reset the label text
            // whenever we next open.
            return;
        }
        let maybeState = stateMap.get(part);
        if (maybeState === undefined) {
            // Create the label element once, the first time we open.
            const labelEl = document.createElement('div');
            labelEl.setAttribute('class', 'mdc-snackbar__label');
            labelEl.setAttribute('role', 'status');
            labelEl.setAttribute('aria-live', 'polite');
            labelEl.textContent = labelText;
            // endNode can't be a Document, so it must have a parent.
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            part.endNode.parentNode.insertBefore(labelEl, part.endNode);
            maybeState = {
                labelEl,
                timerId: null,
            };
            stateMap.set(part, maybeState);
            // No need to do anything more for ARIA the first time we open. We just
            // created the element with the current label, so screen readers will
            // detect it fine.
            return;
        }
        const state = maybeState;
        const labelEl = state.labelEl;
        // Temporarily disable `aria-live` to prevent JAWS+Firefox from announcing
        // the message twice.
        labelEl.setAttribute('aria-live', 'off');
        // Temporarily clear `textContent` to force a DOM mutation event that will
        // be detected by screen readers. `aria-live` elements are only announced
        // when the element's `textContent` *changes*, so snackbars sent to the
        // browser in the initial HTML response won't be read unless we clear the
        // element's `textContent` first. Similarly, displaying the same snackbar
        // message twice in a row doesn't trigger a DOM mutation event, so screen
        // readers won't announce the second message unless we first clear
        // `textContent`.
        //
        // We have to clear the label text two different ways to make it work in
        // all browsers and screen readers:
        //
        //   1. `textContent = ''` is required for IE11 + JAWS
        //   2. `innerHTML = '&nbsp;'` is required for Chrome + JAWS and NVDA
        //
        // All other browser/screen reader combinations support both methods.
        //
        // The wrapper `<span>` visually hides the space character so that it
        // doesn't cause jank when added/removed. N.B.: Setting `position:
        // absolute`, `opacity: 0`, or `height: 0` prevents Chrome from detecting
        // the DOM change.
        //
        // This technique has been tested in:
        //
        //   * JAWS 2019:
        //       - Chrome 70
        //       - Firefox 60 (ESR)
        //       - IE 11
        //   * NVDA 2018:
        //       - Chrome 70
        //       - Firefox 60 (ESR)
        //       - IE 11
        //   * ChromeVox 53
        labelEl.textContent = '';
        labelEl.innerHTML =
            '<span style="display: inline-block; width: 0; height: 1px;">' +
                '&nbsp;</span>';
        // Prevent visual jank by temporarily displaying the label text in the
        // ::before pseudo-element. CSS generated content is normally announced by
        // screen readers (except in IE 11; see
        // https://tink.uk/accessibility-support-for-css-generated-content/);
        // however, `aria-live` is turned off, so this DOM update will be ignored
        // by screen readers.
        labelEl.setAttribute(ARIA_LIVE_LABEL_TEXT_ATTR, labelText);
        if (state.timerId !== null) {
            // We hadn't yet swapped the textContent back in since the last time we
            // opened or changed the label. Cancel that task so we don't clobber the
            // new label.
            clearTimeout(state.timerId);
        }
        state.timerId = window.setTimeout(() => {
            state.timerId = null;
            // Allow screen readers to announce changes to the DOM again.
            labelEl.setAttribute('aria-live', 'polite');
            // Remove the message from the ::before pseudo-element.
            labelEl.removeAttribute(ARIA_LIVE_LABEL_TEXT_ATTR);
            // Restore the original label text, which will be announced by
            // screen readers.
            labelEl.textContent = labelText;
        }, ARIA_LIVE_DELAY_MS);
    });

    const { OPENING_EVENT, OPENED_EVENT, CLOSING_EVENT, CLOSED_EVENT, } = MDCSnackbarFoundation.strings;
    class SnackbarBase extends BaseElement {
        constructor() {
            super(...arguments);
            this.mdcFoundationClass = MDCSnackbarFoundation;
            this.open = false;
            this.timeoutMs = 5000;
            this.closeOnEscape = false;
            this.labelText = '';
            this.stacked = false;
            this.leading = false;
            this.reason = '';
        }
        render() {
            const classes = {
                'mdc-snackbar--stacked': this.stacked,
                'mdc-snackbar--leading': this.leading,
            };
            return html `
      <div class="mdc-snackbar ${classMap(classes)}" @keydown="${this._handleKeydown}">
        <div class="mdc-snackbar__surface">
          ${accessibleSnackbarLabel(this.labelText, this.open)}
          <div class="mdc-snackbar__actions">
            <slot name="action" @click="${this._handleActionClick}"></slot>
            <slot name="dismiss" @click="${this._handleDismissClick}"></slot>
          </div>
        </div>
      </div>`;
        }
        createAdapter() {
            return Object.assign(Object.assign({}, addHasRemoveClass(this.mdcRoot)), { announce: () => {
                    /* We handle announce ourselves with the accessible directive. */
                }, notifyClosed: (reason) => {
                    this.dispatchEvent(new CustomEvent(CLOSED_EVENT, { bubbles: true, cancelable: true, detail: { reason: reason } }));
                }, notifyClosing: (reason) => {
                    this.open = false;
                    this.dispatchEvent(new CustomEvent(CLOSING_EVENT, { bubbles: true, cancelable: true, detail: { reason: reason } }));
                }, notifyOpened: () => {
                    this.dispatchEvent(new CustomEvent(OPENED_EVENT, { bubbles: true, cancelable: true }));
                }, notifyOpening: () => {
                    this.open = true;
                    this.dispatchEvent(new CustomEvent(OPENING_EVENT, { bubbles: true, cancelable: true }));
                } });
        }
        /** @export */
        show() {
            this.open = true;
        }
        /** @export */
        close(reason = '') {
            this.reason = reason;
            this.open = false;
        }
        firstUpdated() {
            super.firstUpdated();
            if (this.open) {
                this.mdcFoundation.open();
            }
        }
        _handleKeydown(e) {
            this.mdcFoundation.handleKeyDown(e);
        }
        _handleActionClick(e) {
            this.mdcFoundation.handleActionButtonClick(e);
        }
        _handleDismissClick(e) {
            this.mdcFoundation.handleActionIconClick(e);
        }
    }
    __decorate([
        query('.mdc-snackbar')
    ], SnackbarBase.prototype, "mdcRoot", void 0);
    __decorate([
        query('.mdc-snackbar__label')
    ], SnackbarBase.prototype, "labelElement", void 0);
    __decorate([
        property({ type: Boolean, reflect: true }),
        observer(function (value) {
            if (this.mdcFoundation) {
                if (value) {
                    this.mdcFoundation.open();
                }
                else {
                    this.mdcFoundation.close(this.reason);
                    this.reason = '';
                }
            }
        })
    ], SnackbarBase.prototype, "open", void 0);
    __decorate([
        observer(function (value) {
            this.mdcFoundation.setTimeoutMs(value);
        }),
        property({ type: Number })
    ], SnackbarBase.prototype, "timeoutMs", void 0);
    __decorate([
        observer(function (value) {
            this.mdcFoundation.setCloseOnEscape(value);
        }),
        property({ type: Boolean })
    ], SnackbarBase.prototype, "closeOnEscape", void 0);
    __decorate([
        property({ type: String })
    ], SnackbarBase.prototype, "labelText", void 0);
    __decorate([
        property({ type: Boolean })
    ], SnackbarBase.prototype, "stacked", void 0);
    __decorate([
        property({ type: Boolean })
    ], SnackbarBase.prototype, "leading", void 0);

    /**
    @license
    Copyright 2018 Google Inc. All Rights Reserved.

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
    */
    const style$f = css `.mdc-snackbar{z-index:8;margin:8px;display:none;position:fixed;right:0;bottom:0;left:0;align-items:center;justify-content:center;box-sizing:border-box;pointer-events:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.mdc-snackbar__surface{background-color:#333}.mdc-snackbar__label{color:rgba(255,255,255,.87)}.mdc-snackbar__surface{min-width:344px}@media(max-width: 480px),(max-width: 344px){.mdc-snackbar__surface{min-width:100%}}.mdc-snackbar__surface{max-width:672px}.mdc-snackbar__surface{box-shadow:0px 3px 5px -1px rgba(0, 0, 0, 0.2),0px 6px 10px 0px rgba(0, 0, 0, 0.14),0px 1px 18px 0px rgba(0,0,0,.12)}.mdc-snackbar__surface{border-radius:4px;border-radius:var(--mdc-shape-small, 4px)}.mdc-snackbar--opening,.mdc-snackbar--open,.mdc-snackbar--closing{display:flex}.mdc-snackbar--leading{justify-content:flex-start}.mdc-snackbar--stacked .mdc-snackbar__label{padding-left:16px;padding-right:8px;padding-bottom:12px}[dir=rtl] .mdc-snackbar--stacked .mdc-snackbar__label,.mdc-snackbar--stacked .mdc-snackbar__label[dir=rtl]{padding-left:8px;padding-right:16px}.mdc-snackbar--stacked .mdc-snackbar__surface{flex-direction:column;align-items:flex-start}.mdc-snackbar--stacked .mdc-snackbar__actions{align-self:flex-end;margin-bottom:8px}.mdc-snackbar__surface{padding-left:0;padding-right:8px;display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;transform:scale(0.8);opacity:0}[dir=rtl] .mdc-snackbar__surface,.mdc-snackbar__surface[dir=rtl]{padding-left:8px;padding-right:0}.mdc-snackbar--open .mdc-snackbar__surface{transform:scale(1);opacity:1;pointer-events:auto;transition:opacity 150ms 0ms cubic-bezier(0, 0, 0.2, 1),transform 150ms 0ms cubic-bezier(0, 0, 0.2, 1)}.mdc-snackbar--closing .mdc-snackbar__surface{transform:scale(1);transition:opacity 75ms 0ms cubic-bezier(0.4, 0, 1, 1)}.mdc-snackbar__label{-moz-osx-font-smoothing:grayscale;-webkit-font-smoothing:antialiased;font-family:Roboto, sans-serif;font-family:var(--mdc-typography-body2-font-family, var(--mdc-typography-font-family, Roboto, sans-serif));font-size:0.875rem;font-size:var(--mdc-typography-body2-font-size, 0.875rem);line-height:1.25rem;line-height:var(--mdc-typography-body2-line-height, 1.25rem);font-weight:400;font-weight:var(--mdc-typography-body2-font-weight, 400);letter-spacing:0.0178571429em;letter-spacing:var(--mdc-typography-body2-letter-spacing, 0.0178571429em);text-decoration:inherit;text-decoration:var(--mdc-typography-body2-text-decoration, inherit);text-transform:inherit;text-transform:var(--mdc-typography-body2-text-transform, inherit);padding-left:16px;padding-right:8px;width:100%;flex-grow:1;box-sizing:border-box;margin:0;padding-top:14px;padding-bottom:14px}[dir=rtl] .mdc-snackbar__label,.mdc-snackbar__label[dir=rtl]{padding-left:8px;padding-right:16px}.mdc-snackbar__label::before{display:inline;content:attr(data-mdc-snackbar-label-text)}.mdc-snackbar__actions{display:flex;flex-shrink:0;align-items:center;box-sizing:border-box}.mdc-snackbar__action:not(:disabled){color:#bb86fc}.mdc-snackbar__action::before,.mdc-snackbar__action::after{background-color:#bb86fc}.mdc-snackbar__action:hover::before{opacity:.08}.mdc-snackbar__action.mdc-ripple-upgraded--background-focused::before,.mdc-snackbar__action:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.24}.mdc-snackbar__action:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-snackbar__action:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.24}.mdc-snackbar__action.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.24}.mdc-snackbar__dismiss{color:rgba(255,255,255,.87)}.mdc-snackbar__dismiss::before,.mdc-snackbar__dismiss::after{background-color:rgba(255,255,255,.87)}.mdc-snackbar__dismiss:hover::before{opacity:.08}.mdc-snackbar__dismiss.mdc-ripple-upgraded--background-focused::before,.mdc-snackbar__dismiss:not(.mdc-ripple-upgraded):focus::before{transition-duration:75ms;opacity:.24}.mdc-snackbar__dismiss:not(.mdc-ripple-upgraded)::after{transition:opacity 150ms linear}.mdc-snackbar__dismiss:not(.mdc-ripple-upgraded):active::after{transition-duration:75ms;opacity:.24}.mdc-snackbar__dismiss.mdc-ripple-upgraded{--mdc-ripple-fg-opacity: 0.24}.mdc-snackbar__dismiss.mdc-snackbar__dismiss{width:36px;height:36px;padding:9px;font-size:18px}.mdc-snackbar__dismiss.mdc-snackbar__dismiss svg,.mdc-snackbar__dismiss.mdc-snackbar__dismiss img{width:18px;height:18px}.mdc-snackbar__action+.mdc-snackbar__dismiss{margin-left:8px;margin-right:0}[dir=rtl] .mdc-snackbar__action+.mdc-snackbar__dismiss,.mdc-snackbar__action+.mdc-snackbar__dismiss[dir=rtl]{margin-left:0;margin-right:8px}slot[name=action]::slotted(mwc-button){--mdc-theme-primary: var(--mdc-snackbar-action-color, #bb86fc)}slot[name=dismiss]::slotted(mwc-icon-button){--mdc-icon-size: 18px;--mdc-icon-button-size: 36px;color:rgba(255, 255, 255, 0.87);margin-left:8px;margin-right:0}[dir=rtl] slot[name=dismiss]::slotted(mwc-icon-button),slot[name=dismiss]::slotted(mwc-icon-button)[dir=rtl]{margin-left:0;margin-right:8px}`;

    let Snackbar = class Snackbar extends SnackbarBase {
    };
    Snackbar.styles = style$f;
    Snackbar = __decorate([
        customElement('mwc-snackbar')
    ], Snackbar);

    /* src/GlobalCss/GlobalCss.svelte generated by Svelte v3.25.0 */

    function create_fragment(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GlobalCss", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GlobalCss> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class GlobalCss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GlobalCss",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* src/components/CharacterSheet/PageHeading/logo.svg generated by Svelte v3.25.0 */

    function create_fragment$1(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "375" },
    		{ height: "171" },
    		{ viewBox: "0 0 375 171" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					xmlns: true,
    					width: true,
    					height: true,
    					viewBox: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "m53.07 161.987c-5.948-1.393-8.692-4.436-8.33-9.238 0.454-6.007 3.861-8.045 14.175-8.476 8.787-0.368 16.211 1.603 15.368 4.08-0.45 1.322-4.764 1.393-12.515 0.205-5.286-0.81-7.231 0.591-7.231 5.207 0 2.733 0.505 3.594 2.569 4.379 3.016 1.147 7.456 0.325 9.063-1.677 0.819-1.02 2.274-1.228 5.25-0.752 4.554 0.728 4.956 1.347 2.367 3.648-3.777 3.357-12.739 4.493-20.717 2.624zm35.876 0.057c-10.604-2.544-12.34-12.551-2.864-16.51 5.226-2.183 17.677-1.853 22.478 0.596 6.467 3.299 6.636 10.531 0.332 14.212-3.754 2.193-14.189 3.083-19.946 1.702zm13.335-5.129c1.972-1.637 1.54-6.574-0.679-7.762-3.244-1.736-8.575-1.235-10.593 0.995-5.021 5.549 5.285 11.736 11.272 6.767zm168.756 5.335c-4.531-1.186-7.5-3.034-7.5-4.668 0-2.041 8.301-2.012 10 0.035 1.685 2.03 9 2.046 9 0.019 0-0.815-1.012-1.711-2.25-1.992-1.237-0.281-4.445-0.98-7.127-1.552-6.805-1.452-8.804-2.7-8.434-5.268 0.472-3.276 4.461-4.678 13.311-4.678 7.893 0 12.449 1.279 13.254 3.721 0.525 1.592-8.857 1.747-10.433 0.172-1.307-1.307-6.456-0.827-6.206 0.578 0.098 0.55 3.188 1.507 6.867 2.127 8.511 1.434 11.017 2.772 11.017 5.883 0 1.704-0.913 2.911-3.028 4.005-3.528 1.824-14.134 2.753-18.472 1.618zm-151.5-9.132v-9l4.75 0.025c4.215 0.023 5.425 0.588 10.75 5.022l6 4.997 0.302-5.022 0.302-5.022h4.448 4.448v9 9h-4.885c-4.313 0-5.525-0.527-10.351-4.5-3.006-2.475-5.758-4.5-6.115-4.5-0.357 0-0.649 2.025-0.649 4.5v4.5h-4.5-4.5zm38-0.002v-9.165l11.931 0.334c10.239 0.286 12.33 0.631 14.75 2.434 4.057 3.022 4.436 9.001 0.789 12.432-2.451 2.305-3.445 2.49-15.047 2.8l-12.422 0.331v-9.165zm18.8 3.802c0.66-0.66 1.2-2.444 1.2-3.965 0-3.189-2.361-4.835-6.934-4.835-3.012 0-3.066 0.087-3.066 5v5h3.8c2.09 0 4.34-0.54 5-1.2zm17.2-3.8v-9h13.5c12.833 0 13.5 0.099 13.5 2 0 1.843-0.667 2-8.5 2-6.889 0-8.5 0.284-8.5 1.5 0 1.209 1.564 1.5 8.073 1.5 7.15 0 8.035 0.2 7.739 1.75-0.278 1.456-1.636 1.799-8.073 2.042-5.98 0.226-7.739 0.624-7.739 1.75 0 1.163 1.72 1.458 8.5 1.458 7.833 0 8.5 0.157 8.5 2 0 1.901-0.667 2-13.5 2h-13.5zm33 0v-9h4.768c4.24 0 5.431 0.547 10.75 4.94l5.982 4.94 0.302-4.94 0.302-4.94h4.448 4.448v9 9H252.78c-4.159 0-5.447-0.566-10.243-4.5-3.017-2.475-5.827-4.5-6.243-4.5-0.416 0-0.757 2.025-0.757 4.5v4.5h-4.5-4.5zm72 0v-9h13.573c12.388 0 13.544 0.153 13.239 1.75-0.281 1.469-1.659 1.797-8.573 2.04-6.423 0.226-8.239 0.612-8.239 1.75 0 1.15 1.592 1.46 7.5 1.46 6.833 0 7.5 0.178 7.5 2 0 1.822-0.667 2-7.5 2-6 0-7.5 0.3-7.5 1.5 0 1.216 1.611 1.5 8.5 1.5 7.833 0 8.5 0.157 8.5 2 0 1.901-0.667 2-13.5 2h-13.5zm33 0v-9l10.75 0.002c8.235 0.001 11.566 0.411 14.239 1.75 6.253 3.133 6.641 10.674 0.734 14.276-2.699 1.645-5.054 1.966-14.473 1.969l-11.25 0.003zm18.8 3.8c1.683-1.683 1.494-5.364-0.371-7.229-0.864-0.864-3.114-1.571-5-1.571h-3.429v5 5h3.8c2.09 0 4.34-0.54 5-1.2zm-306.024-33.05-0.276-15.25-15.25-0.276-15.25-0.276V96.117 84.169l15.25-0.276 15.25-0.276 0.272-19.25 0.272-19.25h41.978c23.322 0 41.978 0.389 41.978 0.875 0 1.302-9.13 23.424-10.266 24.875-0.728 0.929-6.353 1.25-21.906 1.25h-20.927l0.3 5.75 0.3 5.75 18.31 0.273 18.31 0.273-0.703 2.227c-0.387 1.225-2.551 6.603-4.81 11.951l-4.107 9.723-13.5 0.277-13.5 0.277-0.276 15.25-0.276 15.25h-15.448-15.448zm59.224 14.891c0-0.645 2.689-7.173 26.422-64.141 25.453-61.098 27.765-66.5 28.461-66.5 0.356 0 4.318 8.888 8.805 19.75 4.487 10.863 12.199 29.425 17.136 41.25 4.938 11.825 13.296 31.85 18.575 44.5 5.278 12.65 9.598 23.593 9.599 24.317 0.001 0.87-0.689 1.098-2.033 0.672-1.119-0.355-9.071-1.637-17.671-2.848l-15.636-2.203-1.167-3.469-1.167-3.469-16.544-0.274-16.544-0.274-1.568 3.92c-1.54 3.848-1.683 3.932-7.868 4.594-6.554 0.702-22.642 3.247-26.55 4.201-1.237 0.302-2.25 0.29-2.25-0.026zm62.749-35.891c-0.255-0.687-1.932-5.3-3.726-10.25-1.794-4.95-3.589-9.359-3.989-9.797-0.401-0.438-2.327 3.387-4.28 8.5-1.953 5.113-3.87 10.084-4.26 11.047-0.642 1.587 0.104 1.75 8.006 1.75 6.552 0 8.599-0.31 8.249-1.25zm52.251 2.275V71.117h-10.525c-9.987 0-10.57-0.115-11.407-2.25-0.485-1.237-2.921-7.087-5.413-13l-4.531-10.75h86.938 86.938v12.983 12.983l-24.75 0.267-24.75 0.267-0.307 4.25-0.307 4.25h23.058 23.058v11.5 11.5h-23-23v5 5h25 25v13.011 13.011l-40.25-0.261-40.25-0.261-0.263-33.75-0.263-33.75h-14.473-14.473l-0.263 33.75-0.263 33.75-15.75 0.275-15.75 0.275z");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "375" },
    				{ height: "171" },
    				{ viewBox: "0 0 375 171" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class Logo extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});
    	}
    }

    /* src/components/CharacterSheet/PageHeading/PageHeading.svelte generated by Svelte v3.25.0 */
    const file = "src/components/CharacterSheet/PageHeading/PageHeading.svelte";

    function create_fragment$2(ctx) {
    	let div5;
    	let div4;
    	let div0;
    	let span;
    	let t1;
    	let div1;
    	let input;
    	let t2;
    	let div3;
    	let div2;
    	let logo;
    	let current;
    	let mounted;
    	let dispose;

    	logo = new Logo({
    			props: { height: "100%", width: "100%" },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div4 = element("div");
    			div0 = element("div");
    			span = element("span");
    			span.textContent = "Name";
    			t1 = space();
    			div1 = element("div");
    			input = element("input");
    			t2 = space();
    			div3 = element("div");
    			div2 = element("div");
    			create_component(logo.$$.fragment);
    			attr_dev(span, "class", "name-label svelte-1mroyin");
    			add_location(span, file, 37, 12, 582);
    			attr_dev(div0, "class", "td top svelte-1mroyin");
    			add_location(div0, file, 36, 8, 549);
    			attr_dev(input, "class", "name-input svelte-1mroyin");
    			attr_dev(input, "maxlength", "25");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Please enter a name");
    			add_location(input, file, 40, 16, 682);
    			attr_dev(div1, "class", "td bottom svelte-1mroyin");
    			add_location(div1, file, 39, 8, 642);
    			attr_dev(div2, "class", "logo svelte-1mroyin");
    			add_location(div2, file, 48, 12, 981);
    			attr_dev(div3, "class", "td bottom svelte-1mroyin");
    			add_location(div3, file, 47, 8, 945);
    			attr_dev(div4, "class", "tr");
    			add_location(div4, file, 35, 4, 524);
    			attr_dev(div5, "class", "table");
    			add_location(div5, file, 34, 0, 500);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div4);
    			append_dev(div4, div0);
    			append_dev(div0, span);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, input);
    			set_input_value(input, /*name*/ ctx[0]);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			mount_component(logo, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[1]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*name*/ 1 && input.value !== /*name*/ ctx[0]) {
    				set_input_value(input, /*name*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logo.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logo.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(logo);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("PageHeading", slots, []);
    	let { name = "" } = $$props;
    	const writable_props = ["name"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PageHeading> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		name = this.value;
    		$$invalidate(0, name);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({ Logo, name });

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, input_input_handler];
    }

    class PageHeading extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PageHeading",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get name() {
    		throw new Error("<PageHeading>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<PageHeading>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Section/Section.svelte generated by Svelte v3.25.0 */

    const file$1 = "src/components/CharacterSheet/Section/Section.svelte";

    // (59:8) {#if (hint != "")}
    function create_if_block(ctx) {
    	let span;
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(/*hint*/ ctx[1]);
    			attr_dev(span, "class", "hint svelte-bx5ski");
    			add_location(span, file$1, 59, 12, 1304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*hint*/ 2) set_data_dev(t, /*hint*/ ctx[1]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(59:8) {#if (hint != \\\"\\\")}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div2;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let current;
    	let if_block = /*hint*/ ctx[1] != "" && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[5].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[4], null);
    	let div2_levels = [{ class: "section" }, /*props*/ ctx[3]];
    	let div2_data = {};

    	for (let i = 0; i < div2_levels.length; i += 1) {
    		div2_data = assign(div2_data, div2_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*title*/ ctx[0]);
    			t1 = space();
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t2 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(span, "class", "svelte-bx5ski");
    			add_location(span, file$1, 55, 8, 1176);
    			attr_dev(div0, "class", "header svelte-bx5ski");
    			set_style(div0, "padding-left", /*indent*/ ctx[2]);
    			add_location(div0, file$1, 54, 4, 1117);
    			attr_dev(div1, "class", "content svelte-bx5ski");
    			set_style(div1, "padding-left", /*indent*/ ctx[2]);
    			add_location(div1, file$1, 57, 4, 1213);
    			set_attributes(div2, div2_data);
    			toggle_class(div2, "svelte-bx5ski", true);
    			add_location(div2, file$1, 53, 0, 1080);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t2);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 1) set_data_dev(t0, /*title*/ ctx[0]);

    			if (!current || dirty & /*indent*/ 4) {
    				set_style(div0, "padding-left", /*indent*/ ctx[2]);
    			}

    			if (/*hint*/ ctx[1] != "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 16) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[4], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*indent*/ 4) {
    				set_style(div1, "padding-left", /*indent*/ ctx[2]);
    			}

    			set_attributes(div2, div2_data = get_spread_update(div2_levels, [{ class: "section" }, dirty & /*props*/ 8 && /*props*/ ctx[3]]));
    			toggle_class(div2, "svelte-bx5ski", true);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Section", slots, ['default']);
    	let { title } = $$props;
    	let { hint = "" } = $$props;
    	let { indent = "0.15in" } = $$props;
    	let { props } = $$props;
    	const writable_props = ["title", "hint", "indent", "props"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Section> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("hint" in $$props) $$invalidate(1, hint = $$props.hint);
    		if ("indent" in $$props) $$invalidate(2, indent = $$props.indent);
    		if ("props" in $$props) $$invalidate(3, props = $$props.props);
    		if ("$$scope" in $$props) $$invalidate(4, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ title, hint, indent, props });

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(0, title = $$props.title);
    		if ("hint" in $$props) $$invalidate(1, hint = $$props.hint);
    		if ("indent" in $$props) $$invalidate(2, indent = $$props.indent);
    		if ("props" in $$props) $$invalidate(3, props = $$props.props);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [title, hint, indent, props, $$scope, slots];
    }

    class Section extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { title: 0, hint: 1, indent: 2, props: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Section",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*title*/ ctx[0] === undefined && !("title" in props)) {
    			console.warn("<Section> was created without expected prop 'title'");
    		}

    		if (/*props*/ ctx[3] === undefined && !("props" in props)) {
    			console.warn("<Section> was created without expected prop 'props'");
    		}
    	}

    	get title() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hint() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hint(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get indent() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set indent(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<Section>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Section>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Aspects/Aspects.svelte generated by Svelte v3.25.0 */
    const file$2 = "src/components/CharacterSheet/Aspects/Aspects.svelte";

    // (32:0) <Section title="Aspects" indent="0.75in">
    function create_default_slot(ctx) {
    	let div0;
    	let label0;
    	let span0;
    	let t1;
    	let textarea0;
    	let t2;
    	let div1;
    	let label1;
    	let span1;
    	let t4;
    	let textarea1;
    	let t5;
    	let div2;
    	let label2;
    	let span2;
    	let t7;
    	let textarea2;
    	let t8;
    	let div3;
    	let label3;
    	let span3;
    	let t10;
    	let textarea3;
    	let t11;
    	let div4;
    	let label4;
    	let span4;
    	let t13;
    	let textarea4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			label0 = element("label");
    			span0 = element("span");
    			span0.textContent = "High Concept";
    			t1 = space();
    			textarea0 = element("textarea");
    			t2 = space();
    			div1 = element("div");
    			label1 = element("label");
    			span1 = element("span");
    			span1.textContent = "Trouble";
    			t4 = space();
    			textarea1 = element("textarea");
    			t5 = space();
    			div2 = element("div");
    			label2 = element("label");
    			span2 = element("span");
    			span2.textContent = "Relationship";
    			t7 = space();
    			textarea2 = element("textarea");
    			t8 = space();
    			div3 = element("div");
    			label3 = element("label");
    			span3 = element("span");
    			span3.textContent = "Other Aspect";
    			t10 = space();
    			textarea3 = element("textarea");
    			t11 = space();
    			div4 = element("div");
    			label4 = element("label");
    			span4 = element("span");
    			span4.textContent = "Other Aspect";
    			t13 = space();
    			textarea4 = element("textarea");
    			add_location(span0, file$2, 34, 8, 734);
    			attr_dev(label0, "class", "aspect-label svelte-968nxt");
    			add_location(label0, file$2, 33, 4, 697);
    			attr_dev(textarea0, "placeholder", "Please describe the character concept.");
    			attr_dev(textarea0, "rows", /*rows*/ ctx[1]);
    			attr_dev(textarea0, "maxlength", "110");
    			attr_dev(textarea0, "class", "svelte-968nxt");
    			add_location(textarea0, file$2, 36, 8, 781);
    			attr_dev(div0, "class", "aspect svelte-968nxt");
    			add_location(div0, file$2, 32, 4, 672);
    			add_location(span1, file$2, 45, 8, 1062);
    			attr_dev(label1, "class", "aspect-label svelte-968nxt");
    			add_location(label1, file$2, 44, 4, 1025);
    			attr_dev(textarea1, "placeholder", "Please describe the character's trouble.");
    			attr_dev(textarea1, "rows", /*rows*/ ctx[1]);
    			attr_dev(textarea1, "maxlength", "110");
    			attr_dev(textarea1, "class", "svelte-968nxt");
    			add_location(textarea1, file$2, 47, 8, 1104);
    			attr_dev(div1, "class", "aspect svelte-968nxt");
    			add_location(div1, file$2, 43, 4, 1000);
    			add_location(span2, file$2, 55, 8, 1382);
    			attr_dev(label2, "class", "aspect-label svelte-968nxt");
    			add_location(label2, file$2, 54, 4, 1345);
    			attr_dev(textarea2, "placeholder", "Please describe the relationship");
    			attr_dev(textarea2, "rows", /*rows*/ ctx[1]);
    			attr_dev(textarea2, "maxlength", "110");
    			attr_dev(textarea2, "class", "svelte-968nxt");
    			add_location(textarea2, file$2, 57, 8, 1429);
    			attr_dev(div2, "class", "aspect svelte-968nxt");
    			add_location(div2, file$2, 53, 4, 1320);
    			add_location(span3, file$2, 65, 8, 1704);
    			attr_dev(label3, "class", "aspect-label svelte-968nxt");
    			add_location(label3, file$2, 64, 4, 1667);
    			attr_dev(textarea3, "placeholder", "Please describe the aspect");
    			attr_dev(textarea3, "maxlength", "110");
    			attr_dev(textarea3, "rows", /*rows*/ ctx[1]);
    			attr_dev(textarea3, "class", "svelte-968nxt");
    			add_location(textarea3, file$2, 67, 8, 1751);
    			attr_dev(div3, "class", "aspect svelte-968nxt");
    			add_location(div3, file$2, 63, 4, 1642);
    			add_location(span4, file$2, 75, 8, 2023);
    			attr_dev(label4, "class", "aspect-label svelte-968nxt");
    			add_location(label4, file$2, 74, 4, 1986);
    			attr_dev(textarea4, "placeholder", "Please describe the aspect.");
    			attr_dev(textarea4, "maxlength", "110");
    			attr_dev(textarea4, "rows", /*rows*/ ctx[1]);
    			attr_dev(textarea4, "class", "svelte-968nxt");
    			add_location(textarea4, file$2, 77, 8, 2070);
    			attr_dev(div4, "class", "aspect svelte-968nxt");
    			add_location(div4, file$2, 73, 4, 1961);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, label0);
    			append_dev(label0, span0);
    			append_dev(div0, t1);
    			append_dev(div0, textarea0);
    			set_input_value(textarea0, /*aspects*/ ctx[0].highConcept);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, label1);
    			append_dev(label1, span1);
    			append_dev(div1, t4);
    			append_dev(div1, textarea1);
    			set_input_value(textarea1, /*aspects*/ ctx[0].trouble);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, label2);
    			append_dev(label2, span2);
    			append_dev(div2, t7);
    			append_dev(div2, textarea2);
    			set_input_value(textarea2, /*aspects*/ ctx[0].relationship);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, label3);
    			append_dev(label3, span3);
    			append_dev(div3, t10);
    			append_dev(div3, textarea3);
    			set_input_value(textarea3, /*aspects*/ ctx[0].otherAspects[0]);
    			insert_dev(target, t11, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, label4);
    			append_dev(label4, span4);
    			append_dev(div4, t13);
    			append_dev(div4, textarea4);
    			set_input_value(textarea4, /*aspects*/ ctx[0].otherAspects[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(textarea0, "input", /*textarea0_input_handler*/ ctx[2]),
    					listen_dev(textarea1, "input", /*textarea1_input_handler*/ ctx[3]),
    					listen_dev(textarea2, "input", /*textarea2_input_handler*/ ctx[4]),
    					listen_dev(textarea3, "input", /*textarea3_input_handler*/ ctx[5]),
    					listen_dev(textarea4, "input", /*textarea4_input_handler*/ ctx[6])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*aspects*/ 1) {
    				set_input_value(textarea0, /*aspects*/ ctx[0].highConcept);
    			}

    			if (dirty & /*aspects*/ 1) {
    				set_input_value(textarea1, /*aspects*/ ctx[0].trouble);
    			}

    			if (dirty & /*aspects*/ 1) {
    				set_input_value(textarea2, /*aspects*/ ctx[0].relationship);
    			}

    			if (dirty & /*aspects*/ 1) {
    				set_input_value(textarea3, /*aspects*/ ctx[0].otherAspects[0]);
    			}

    			if (dirty & /*aspects*/ 1) {
    				set_input_value(textarea4, /*aspects*/ ctx[0].otherAspects[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t11);
    			if (detaching) detach_dev(div4);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(32:0) <Section title=\\\"Aspects\\\" indent=\\\"0.75in\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				title: "Aspects",
    				indent: "0.75in",
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope, aspects*/ 129) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Aspects", slots, []);

    	let { aspects = {
    		highConcept: "",
    		trouble: "",
    		relationship: "",
    		otherAspects: ["", ""]
    	} } = $$props;

    	let rows = 2;
    	const writable_props = ["aspects"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Aspects> was created with unknown prop '${key}'`);
    	});

    	function textarea0_input_handler() {
    		aspects.highConcept = this.value;
    		$$invalidate(0, aspects);
    	}

    	function textarea1_input_handler() {
    		aspects.trouble = this.value;
    		$$invalidate(0, aspects);
    	}

    	function textarea2_input_handler() {
    		aspects.relationship = this.value;
    		$$invalidate(0, aspects);
    	}

    	function textarea3_input_handler() {
    		aspects.otherAspects[0] = this.value;
    		$$invalidate(0, aspects);
    	}

    	function textarea4_input_handler() {
    		aspects.otherAspects[1] = this.value;
    		$$invalidate(0, aspects);
    	}

    	$$self.$$set = $$props => {
    		if ("aspects" in $$props) $$invalidate(0, aspects = $$props.aspects);
    	};

    	$$self.$capture_state = () => ({ Section, aspects, rows });

    	$$self.$inject_state = $$props => {
    		if ("aspects" in $$props) $$invalidate(0, aspects = $$props.aspects);
    		if ("rows" in $$props) $$invalidate(1, rows = $$props.rows);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		aspects,
    		rows,
    		textarea0_input_handler,
    		textarea1_input_handler,
    		textarea2_input_handler,
    		textarea3_input_handler,
    		textarea4_input_handler
    	];
    }

    class Aspects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { aspects: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Aspects",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get aspects() {
    		throw new Error("<Aspects>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set aspects(value) {
    		throw new Error("<Aspects>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Vitals/CheckedItem/small-check.svg generated by Svelte v3.25.0 */

    function create_fragment$5(ctx) {
    	let svg;
    	let path;

    	let svg_levels = [
    		{ xmlns: "http://www.w3.org/2000/svg" },
    		{ width: "64" },
    		{ height: "64" },
    		{ viewBox: "0 0 64 64" },
    		/*$$props*/ ctx[0]
    	];

    	let svg_data = {};

    	for (let i = 0; i < svg_levels.length; i += 1) {
    		svg_data = assign(svg_data, svg_levels[i]);
    	}

    	return {
    		c() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			this.h();
    		},
    		l(nodes) {
    			svg = claim_element(
    				nodes,
    				"svg",
    				{
    					xmlns: true,
    					width: true,
    					height: true,
    					viewBox: true
    				},
    				1
    			);

    			var svg_nodes = children(svg);
    			path = claim_element(svg_nodes, "path", { d: true, "stroke-width": true }, 1);
    			children(path).forEach(detach);
    			svg_nodes.forEach(detach);
    			this.h();
    		},
    		h() {
    			attr(path, "d", "m17.9 60.5c-0.4-1-1.6-4.6-2.7-7.9-1.1-3.3-2.6-7.4-3.4-9.1-2.4-5.3-6-8.9-8.9-8.9-1.5 0-1.3-0.8 0.4-2.7 2-2.2 5-3.2 7.3-2.5 2 0.6 4.9 3.5 7.6 7.6 1 1.6 2.1 2.9 2.4 2.9 0.3 0 1.3-1.3 2.3-2.9C29.5 26.3 41 13.4 49.9 6.9 53.8 4 59.4 1.4 61.4 1.4c1.2 0 0.9 0.4-3.3 4.2C50.8 12.3 43.2 21.8 35.9 33.6 31.9 39.9 26.4 50.3 24.1 55.8c-2.4 5.8-2.7 6.2-4.2 6.4-1.1 0.1-1.3-0.1-2-1.7z");
    			attr(path, "stroke-width", "0.5");
    			set_svg_attributes(svg, svg_data);
    		},
    		m(target, anchor) {
    			insert(target, svg, anchor);
    			append(svg, path);
    		},
    		p(ctx, [dirty]) {
    			set_svg_attributes(svg, svg_data = get_spread_update(svg_levels, [
    				{ xmlns: "http://www.w3.org/2000/svg" },
    				{ width: "64" },
    				{ height: "64" },
    				{ viewBox: "0 0 64 64" },
    				dirty & /*$$props*/ 1 && /*$$props*/ ctx[0]
    			]));
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(svg);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	$$self.$$set = $$new_props => {
    		$$invalidate(0, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [$$props];
    }

    class SmallCheck extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});
    	}
    }

    /* src/components/CharacterSheet/Vitals/CheckedItem/CheckedItem.svelte generated by Svelte v3.25.0 */
    const file$3 = "src/components/CharacterSheet/Vitals/CheckedItem/CheckedItem.svelte";

    // (99:4) {#if checked}
    function create_if_block$1(ctx) {
    	let div1;
    	let div0;
    	let check;
    	let current;

    	check = new SmallCheck({
    			props: {
    				width: /*css*/ ctx[2].size,
    				height: /*css*/ ctx[2].size
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			create_component(check.$$.fragment);
    			add_location(div0, file$3, 100, 12, 2187);
    			attr_dev(div1, "class", "checkmark svelte-g03tv2");
    			set_style(div1, "width", "100%");
    			set_style(div1, "height", "100%");
    			add_location(div1, file$3, 99, 8, 2118);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			mount_component(check, div0, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const check_changes = {};
    			if (dirty & /*css*/ 4) check_changes.width = /*css*/ ctx[2].size;
    			if (dirty & /*css*/ 4) check_changes.height = /*css*/ ctx[2].size;
    			check.$set(check_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(check.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(check.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(check);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(99:4) {#if checked}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div1;
    	let div0;
    	let span;
    	let t0;
    	let t1;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*checked*/ ctx[0] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t0 = text(/*number*/ ctx[1]);
    			t1 = space();
    			if (if_block) if_block.c();
    			attr_dev(span, "class", "svelte-g03tv2");
    			add_location(span, file$3, 94, 4, 2047);
    			attr_dev(div0, "class", "check-text svelte-g03tv2");
    			set_style(div0, "width", /*css*/ ctx[2].size);
    			set_style(div0, "height", /*css*/ ctx[2].size);
    			add_location(div0, file$3, 93, 4, 1973);
    			attr_dev(div1, "class", "box svelte-g03tv2");
    			set_style(div1, "color", /*css*/ ctx[2].color);
    			set_style(div1, "width", /*css*/ ctx[2].size);
    			set_style(div1, "height", /*css*/ ctx[2].size);
    			set_style(div1, "border-width", /*css*/ ctx[2].borderWidth);
    			set_style(div1, "border-color", /*css*/ ctx[2].color);
    			set_style(div1, "border-style", "solid");
    			set_style(div1, "background-color", /*css*/ ctx[2].backgroundColor);
    			add_location(div1, file$3, 89, 0, 1728);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t0);
    			append_dev(div1, t1);
    			if (if_block) if_block.m(div1, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*handleClick*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*number*/ 2) set_data_dev(t0, /*number*/ ctx[1]);

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div0, "width", /*css*/ ctx[2].size);
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div0, "height", /*css*/ ctx[2].size);
    			}

    			if (/*checked*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*checked*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div1, "color", /*css*/ ctx[2].color);
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div1, "width", /*css*/ ctx[2].size);
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div1, "height", /*css*/ ctx[2].size);
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div1, "border-width", /*css*/ ctx[2].borderWidth);
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div1, "border-color", /*css*/ ctx[2].color);
    			}

    			if (!current || dirty & /*css*/ 4) {
    				set_style(div1, "background-color", /*css*/ ctx[2].backgroundColor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const defaultCss = {
    	color: "black",
    	backgroundColor: "transparent",
    	size: "1.45em",
    	borderWidth: "1.0pt"
    };

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CheckedItem", slots, []);
    	let { number = 1 } = $$props;
    	let { css = defaultCss } = $$props;
    	let { checked } = $$props;
    	const dispatch = createEventDispatcher();

    	function handleClick() {
    		$$invalidate(0, checked = !checked);
    		dispatch("checkedChanged", { checked });
    	}

    	const writable_props = ["number", "css", "checked"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CheckedItem> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("number" in $$props) $$invalidate(1, number = $$props.number);
    		if ("css" in $$props) $$invalidate(2, css = $$props.css);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({
    		defaultCss,
    		createEventDispatcher,
    		Check: SmallCheck,
    		number,
    		css,
    		checked,
    		dispatch,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("number" in $$props) $$invalidate(1, number = $$props.number);
    		if ("css" in $$props) $$invalidate(2, css = $$props.css);
    		if ("checked" in $$props) $$invalidate(0, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [checked, number, css, handleClick];
    }

    class CheckedItem extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { number: 1, css: 2, checked: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CheckedItem",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*checked*/ ctx[0] === undefined && !("checked" in props)) {
    			console.warn("<CheckedItem> was created without expected prop 'checked'");
    		}
    	}

    	get number() {
    		throw new Error("<CheckedItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set number(value) {
    		throw new Error("<CheckedItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get css() {
    		throw new Error("<CheckedItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set css(value) {
    		throw new Error("<CheckedItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<CheckedItem>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<CheckedItem>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Vitals/StressTrack/StressTrack.svelte generated by Svelte v3.25.0 */
    const file$4 = "src/components/CharacterSheet/Vitals/StressTrack/StressTrack.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (64:4) {#each Array(count) as _, i}
    function create_each_block(ctx) {
    	let div;
    	let checkeditem;
    	let current;

    	checkeditem = new CheckedItem({
    			props: {
    				css: /*i*/ ctx[8] < 3 ? /*css*/ ctx[3] : /*grayCss*/ ctx[4],
    				number: "1",
    				checked: /*i*/ ctx[8] < /*stressTaken*/ ctx[0]
    			},
    			$$inline: true
    		});

    	checkeditem.$on("checkedChanged", /*handleCheckedChanged*/ ctx[5]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(checkeditem.$$.fragment);
    			attr_dev(div, "class", "column svelte-ceyz7n");
    			add_location(div, file$4, 64, 8, 1151);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(checkeditem, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const checkeditem_changes = {};
    			if (dirty & /*stressTaken*/ 1) checkeditem_changes.checked = /*i*/ ctx[8] < /*stressTaken*/ ctx[0];
    			checkeditem.$set(checkeditem_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkeditem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkeditem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(checkeditem);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(64:4) {#each Array(count) as _, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div2;
    	let div0;
    	let span0;
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let span1;
    	let current;
    	let each_value = Array(/*count*/ ctx[2]);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(/*title*/ ctx[1]);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			div1 = element("div");
    			span1 = element("span");
    			attr_dev(span0, "class", "svelte-ceyz7n");
    			add_location(span0, file$4, 60, 8, 1077);
    			attr_dev(div0, "class", "title-column stress-track-title svelte-ceyz7n");
    			add_location(div0, file$4, 59, 4, 1023);
    			set_style(span1, "width", "1.4em");
    			attr_dev(span1, "class", "svelte-ceyz7n");
    			add_location(span1, file$4, 69, 8, 1372);
    			attr_dev(div1, "class", ".last-col");
    			add_location(div1, file$4, 68, 4, 1340);
    			attr_dev(div2, "class", "row svelte-ceyz7n");
    			add_location(div2, file$4, 58, 0, 1001);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div2, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, span1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*title*/ 2) set_data_dev(t0, /*title*/ ctx[1]);

    			if (dirty & /*css, grayCss, stressTaken, handleCheckedChanged, count*/ 61) {
    				each_value = Array(/*count*/ ctx[2]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, t2);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("StressTrack", slots, []);
    	let { title = "Physical" } = $$props;
    	let { stressTaken = 0 } = $$props;
    	let { count = 3 } = $$props;
    	let css = { ...defaultCss, color: "black" };
    	let grayCss = { ...css, color: "gray" };

    	function handleCheckedChanged(event) {
    		$$invalidate(0, stressTaken += event.detail.checked ? 1 : -1);
    	}

    	const writable_props = ["title", "stressTaken", "count"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<StressTrack> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("stressTaken" in $$props) $$invalidate(0, stressTaken = $$props.stressTaken);
    		if ("count" in $$props) $$invalidate(2, count = $$props.count);
    	};

    	$$self.$capture_state = () => ({
    		CheckedItem,
    		CSS: defaultCss,
    		title,
    		stressTaken,
    		count,
    		css,
    		grayCss,
    		handleCheckedChanged
    	});

    	$$self.$inject_state = $$props => {
    		if ("title" in $$props) $$invalidate(1, title = $$props.title);
    		if ("stressTaken" in $$props) $$invalidate(0, stressTaken = $$props.stressTaken);
    		if ("count" in $$props) $$invalidate(2, count = $$props.count);
    		if ("css" in $$props) $$invalidate(3, css = $$props.css);
    		if ("grayCss" in $$props) $$invalidate(4, grayCss = $$props.grayCss);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stressTaken, title, count, css, grayCss, handleCheckedChanged];
    }

    class StressTrack extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { title: 1, stressTaken: 0, count: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StressTrack",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get title() {
    		throw new Error("<StressTrack>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set title(value) {
    		throw new Error("<StressTrack>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get stressTaken() {
    		throw new Error("<StressTrack>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stressTaken(value) {
    		throw new Error("<StressTrack>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get count() {
    		throw new Error("<StressTrack>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set count(value) {
    		throw new Error("<StressTrack>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Vitals/Consequence/Consequence.svelte generated by Svelte v3.25.0 */
    const file$5 = "src/components/CharacterSheet/Vitals/Consequence/Consequence.svelte";

    function create_fragment$8(ctx) {
    	let div2;
    	let div0;
    	let checkeditem;
    	let t0;
    	let div1;
    	let label;
    	let span;
    	let t1;
    	let t2;
    	let textarea;
    	let current;
    	let mounted;
    	let dispose;

    	checkeditem = new CheckedItem({
    			props: {
    				css: /*isExtra*/ ctx[3] == "true"
    				? /*grayCss*/ ctx[5]
    				: /*css*/ ctx[4],
    				number: /*value*/ ctx[2],
    				checked: /*description*/ ctx[0] != ""
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(checkeditem.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			label = element("label");
    			span = element("span");
    			t1 = text(/*name*/ ctx[1]);
    			t2 = space();
    			textarea = element("textarea");
    			attr_dev(div0, "class", "column svelte-135uqsj");
    			add_location(div0, file$5, 49, 4, 1051);
    			add_location(span, file$5, 53, 29, 1282);
    			attr_dev(label, "class", "title svelte-135uqsj");
    			add_location(label, file$5, 53, 8, 1261);
    			attr_dev(textarea, "maxlength", "70");
    			attr_dev(textarea, "rows", "2");
    			attr_dev(textarea, "placeholder", "Please state the consequence");
    			attr_dev(textarea, "class", "svelte-135uqsj");
    			add_location(textarea, file$5, 54, 8, 1318);
    			attr_dev(div1, "class", "column svelte-135uqsj");
    			set_style(div1, "padding-left", "1em");
    			set_style(div1, "width", "90%");
    			add_location(div1, file$5, 52, 4, 1195);
    			attr_dev(div2, "class", "row consequence svelte-135uqsj");
    			add_location(div2, file$5, 47, 0, 1016);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(checkeditem, div0, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, label);
    			append_dev(label, span);
    			append_dev(span, t1);
    			append_dev(div1, t2);
    			append_dev(div1, textarea);
    			set_input_value(textarea, /*description*/ ctx[0]);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(textarea, "input", /*textarea_input_handler*/ ctx[6]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const checkeditem_changes = {};

    			if (dirty & /*isExtra*/ 8) checkeditem_changes.css = /*isExtra*/ ctx[3] == "true"
    			? /*grayCss*/ ctx[5]
    			: /*css*/ ctx[4];

    			if (dirty & /*value*/ 4) checkeditem_changes.number = /*value*/ ctx[2];
    			if (dirty & /*description*/ 1) checkeditem_changes.checked = /*description*/ ctx[0] != "";
    			checkeditem.$set(checkeditem_changes);
    			if (!current || dirty & /*name*/ 2) set_data_dev(t1, /*name*/ ctx[1]);

    			if (dirty & /*description*/ 1) {
    				set_input_value(textarea, /*description*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(checkeditem.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(checkeditem.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(checkeditem);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Consequence", slots, []);
    	let { name = "Mild" } = $$props;
    	let { value = 2 } = $$props;
    	let { isExtra = false } = $$props;
    	let { description = "" } = $$props;
    	let css = { ...defaultCss, color: "black" };
    	let grayCss = { ...css, color: "gray" };
    	const writable_props = ["name", "value", "isExtra", "description"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Consequence> was created with unknown prop '${key}'`);
    	});

    	function textarea_input_handler() {
    		description = this.value;
    		$$invalidate(0, description);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("isExtra" in $$props) $$invalidate(3, isExtra = $$props.isExtra);
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    	};

    	$$self.$capture_state = () => ({
    		CheckedItem,
    		CSS: defaultCss,
    		name,
    		value,
    		isExtra,
    		description,
    		css,
    		grayCss
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(1, name = $$props.name);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("isExtra" in $$props) $$invalidate(3, isExtra = $$props.isExtra);
    		if ("description" in $$props) $$invalidate(0, description = $$props.description);
    		if ("css" in $$props) $$invalidate(4, css = $$props.css);
    		if ("grayCss" in $$props) $$invalidate(5, grayCss = $$props.grayCss);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [description, name, value, isExtra, css, grayCss, textarea_input_handler];
    }

    class Consequence extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {
    			name: 1,
    			value: 2,
    			isExtra: 3,
    			description: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Consequence",
    			options,
    			id: create_fragment$8.name
    		});
    	}

    	get name() {
    		throw new Error("<Consequence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Consequence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Consequence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Consequence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get isExtra() {
    		throw new Error("<Consequence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set isExtra(value) {
    		throw new Error("<Consequence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get description() {
    		throw new Error("<Consequence>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set description(value) {
    		throw new Error("<Consequence>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Vitals/Vitals.svelte generated by Svelte v3.25.0 */
    const file$6 = "src/components/CharacterSheet/Vitals/Vitals.svelte";

    // (74:4) {#if (will > 4 || physique > 4)}
    function create_if_block$2(ctx) {
    	let consequence;
    	let updating_description;
    	let current;

    	function consequence_description_binding(value) {
    		/*consequence_description_binding*/ ctx[8].call(null, value);
    	}

    	let consequence_props = {
    		name: "Mild",
    		isExtra: "true",
    		value: "2"
    	};

    	if (/*vitals*/ ctx[0].consequences.mild2 !== void 0) {
    		consequence_props.description = /*vitals*/ ctx[0].consequences.mild2;
    	}

    	consequence = new Consequence({ props: consequence_props, $$inline: true });
    	binding_callbacks.push(() => bind(consequence, "description", consequence_description_binding));

    	const block = {
    		c: function create() {
    			create_component(consequence.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(consequence, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const consequence_changes = {};

    			if (!updating_description && dirty & /*vitals*/ 1) {
    				updating_description = true;
    				consequence_changes.description = /*vitals*/ ctx[0].consequences.mild2;
    				add_flush_callback(() => updating_description = false);
    			}

    			consequence.$set(consequence_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(consequence.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(consequence.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(consequence, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(74:4) {#if (will > 4 || physique > 4)}",
    		ctx
    	});

    	return block;
    }

    // (55:0) <Section title="Vitals">
    function create_default_slot$1(ctx) {
    	let div0;
    	let span0;
    	let t1;
    	let div1;
    	let stresstrack0;
    	let updating_stressTaken;
    	let t2;
    	let stresstrack1;
    	let updating_stressTaken_1;
    	let t3;
    	let div2;
    	let span1;
    	let t5;
    	let consequence0;
    	let updating_description;
    	let t6;
    	let consequence1;
    	let updating_description_1;
    	let t7;
    	let consequence2;
    	let updating_description_2;
    	let t8;
    	let if_block_anchor;
    	let current;

    	function stresstrack0_stressTaken_binding(value) {
    		/*stresstrack0_stressTaken_binding*/ ctx[3].call(null, value);
    	}

    	let stresstrack0_props = {
    		title: "Physical",
    		count: getStressTrackCount(/*physique*/ ctx[2])
    	};

    	if (/*vitals*/ ctx[0].physicalStressTaken !== void 0) {
    		stresstrack0_props.stressTaken = /*vitals*/ ctx[0].physicalStressTaken;
    	}

    	stresstrack0 = new StressTrack({
    			props: stresstrack0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(stresstrack0, "stressTaken", stresstrack0_stressTaken_binding));

    	function stresstrack1_stressTaken_binding(value) {
    		/*stresstrack1_stressTaken_binding*/ ctx[4].call(null, value);
    	}

    	let stresstrack1_props = {
    		title: "Mental",
    		count: getStressTrackCount(/*will*/ ctx[1])
    	};

    	if (/*vitals*/ ctx[0].mentalStressTaken !== void 0) {
    		stresstrack1_props.stressTaken = /*vitals*/ ctx[0].mentalStressTaken;
    	}

    	stresstrack1 = new StressTrack({
    			props: stresstrack1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(stresstrack1, "stressTaken", stresstrack1_stressTaken_binding));

    	function consequence0_description_binding(value) {
    		/*consequence0_description_binding*/ ctx[5].call(null, value);
    	}

    	let consequence0_props = {
    		name: "Mild",
    		isExtra: "false",
    		value: "2"
    	};

    	if (/*vitals*/ ctx[0].consequences.mild1 !== void 0) {
    		consequence0_props.description = /*vitals*/ ctx[0].consequences.mild1;
    	}

    	consequence0 = new Consequence({
    			props: consequence0_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(consequence0, "description", consequence0_description_binding));

    	function consequence1_description_binding(value) {
    		/*consequence1_description_binding*/ ctx[6].call(null, value);
    	}

    	let consequence1_props = {
    		name: "Moderate",
    		isExtra: "false",
    		value: "4"
    	};

    	if (/*vitals*/ ctx[0].consequences.moderate !== void 0) {
    		consequence1_props.description = /*vitals*/ ctx[0].consequences.moderate;
    	}

    	consequence1 = new Consequence({
    			props: consequence1_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(consequence1, "description", consequence1_description_binding));

    	function consequence2_description_binding(value) {
    		/*consequence2_description_binding*/ ctx[7].call(null, value);
    	}

    	let consequence2_props = {
    		name: "Severe",
    		isExtra: "false",
    		value: "6"
    	};

    	if (/*vitals*/ ctx[0].consequences.severe !== void 0) {
    		consequence2_props.description = /*vitals*/ ctx[0].consequences.severe;
    	}

    	consequence2 = new Consequence({
    			props: consequence2_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(consequence2, "description", consequence2_description_binding));
    	let if_block = (/*will*/ ctx[1] > 4 || /*physique*/ ctx[2] > 4) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "STRESS";
    			t1 = space();
    			div1 = element("div");
    			create_component(stresstrack0.$$.fragment);
    			t2 = space();
    			create_component(stresstrack1.$$.fragment);
    			t3 = space();
    			div2 = element("div");
    			span1 = element("span");
    			span1.textContent = "CONSEQUENCES";
    			t5 = space();
    			create_component(consequence0.$$.fragment);
    			t6 = space();
    			create_component(consequence1.$$.fragment);
    			t7 = space();
    			create_component(consequence2.$$.fragment);
    			t8 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			add_location(span0, file$6, 56, 8, 1068);
    			attr_dev(div0, "class", "row subheading svelte-14kjjfw");
    			add_location(div0, file$6, 55, 4, 1031);
    			set_style(div1, "margin-left", "2em");
    			add_location(div1, file$6, 58, 4, 1103);
    			set_style(span1, "font-weight", "bold");
    			add_location(span1, file$6, 67, 8, 1559);
    			attr_dev(div2, "class", "row subheading svelte-14kjjfw");
    			set_style(div2, "margin-top", "10px");
    			add_location(div2, file$6, 66, 4, 1498);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, span0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(stresstrack0, div1, null);
    			append_dev(div1, t2);
    			mount_component(stresstrack1, div1, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div2, anchor);
    			append_dev(div2, span1);
    			insert_dev(target, t5, anchor);
    			mount_component(consequence0, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(consequence1, target, anchor);
    			insert_dev(target, t7, anchor);
    			mount_component(consequence2, target, anchor);
    			insert_dev(target, t8, anchor);
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const stresstrack0_changes = {};
    			if (dirty & /*physique*/ 4) stresstrack0_changes.count = getStressTrackCount(/*physique*/ ctx[2]);

    			if (!updating_stressTaken && dirty & /*vitals*/ 1) {
    				updating_stressTaken = true;
    				stresstrack0_changes.stressTaken = /*vitals*/ ctx[0].physicalStressTaken;
    				add_flush_callback(() => updating_stressTaken = false);
    			}

    			stresstrack0.$set(stresstrack0_changes);
    			const stresstrack1_changes = {};
    			if (dirty & /*will*/ 2) stresstrack1_changes.count = getStressTrackCount(/*will*/ ctx[1]);

    			if (!updating_stressTaken_1 && dirty & /*vitals*/ 1) {
    				updating_stressTaken_1 = true;
    				stresstrack1_changes.stressTaken = /*vitals*/ ctx[0].mentalStressTaken;
    				add_flush_callback(() => updating_stressTaken_1 = false);
    			}

    			stresstrack1.$set(stresstrack1_changes);
    			const consequence0_changes = {};

    			if (!updating_description && dirty & /*vitals*/ 1) {
    				updating_description = true;
    				consequence0_changes.description = /*vitals*/ ctx[0].consequences.mild1;
    				add_flush_callback(() => updating_description = false);
    			}

    			consequence0.$set(consequence0_changes);
    			const consequence1_changes = {};

    			if (!updating_description_1 && dirty & /*vitals*/ 1) {
    				updating_description_1 = true;
    				consequence1_changes.description = /*vitals*/ ctx[0].consequences.moderate;
    				add_flush_callback(() => updating_description_1 = false);
    			}

    			consequence1.$set(consequence1_changes);
    			const consequence2_changes = {};

    			if (!updating_description_2 && dirty & /*vitals*/ 1) {
    				updating_description_2 = true;
    				consequence2_changes.description = /*vitals*/ ctx[0].consequences.severe;
    				add_flush_callback(() => updating_description_2 = false);
    			}

    			consequence2.$set(consequence2_changes);

    			if (/*will*/ ctx[1] > 4 || /*physique*/ ctx[2] > 4) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*will, physique*/ 6) {
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
    		i: function intro(local) {
    			if (current) return;
    			transition_in(stresstrack0.$$.fragment, local);
    			transition_in(stresstrack1.$$.fragment, local);
    			transition_in(consequence0.$$.fragment, local);
    			transition_in(consequence1.$$.fragment, local);
    			transition_in(consequence2.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(stresstrack0.$$.fragment, local);
    			transition_out(stresstrack1.$$.fragment, local);
    			transition_out(consequence0.$$.fragment, local);
    			transition_out(consequence1.$$.fragment, local);
    			transition_out(consequence2.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_component(stresstrack0);
    			destroy_component(stresstrack1);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t5);
    			destroy_component(consequence0, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(consequence1, detaching);
    			if (detaching) detach_dev(t7);
    			destroy_component(consequence2, detaching);
    			if (detaching) detach_dev(t8);
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(55:0) <Section title=\\\"Vitals\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				title: "Vitals",
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope, vitals, will, physique*/ 519) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function getStressTrackCount(attr) {
    	if (attr > 0) {
    		if (attr > 2) {
    			return 6;
    		}

    		return 4;
    	}

    	return 3;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Vitals", slots, []);

    	let { vitals = {
    		physicalStressTaken: 0,
    		mentalStressTaken: 0,
    		consequences: {
    			mild1: "",
    			moderate: "",
    			severe: "",
    			mild2: ""
    		}
    	} } = $$props;

    	let { will = 0 } = $$props;
    	let { physique = 0 } = $$props;
    	const writable_props = ["vitals", "will", "physique"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Vitals> was created with unknown prop '${key}'`);
    	});

    	function stresstrack0_stressTaken_binding(value) {
    		vitals.physicalStressTaken = value;
    		$$invalidate(0, vitals);
    	}

    	function stresstrack1_stressTaken_binding(value) {
    		vitals.mentalStressTaken = value;
    		$$invalidate(0, vitals);
    	}

    	function consequence0_description_binding(value) {
    		vitals.consequences.mild1 = value;
    		$$invalidate(0, vitals);
    	}

    	function consequence1_description_binding(value) {
    		vitals.consequences.moderate = value;
    		$$invalidate(0, vitals);
    	}

    	function consequence2_description_binding(value) {
    		vitals.consequences.severe = value;
    		$$invalidate(0, vitals);
    	}

    	function consequence_description_binding(value) {
    		vitals.consequences.mild2 = value;
    		$$invalidate(0, vitals);
    	}

    	$$self.$$set = $$props => {
    		if ("vitals" in $$props) $$invalidate(0, vitals = $$props.vitals);
    		if ("will" in $$props) $$invalidate(1, will = $$props.will);
    		if ("physique" in $$props) $$invalidate(2, physique = $$props.physique);
    	};

    	$$self.$capture_state = () => ({
    		StressTrack,
    		Consequence,
    		Section,
    		vitals,
    		will,
    		physique,
    		getStressTrackCount
    	});

    	$$self.$inject_state = $$props => {
    		if ("vitals" in $$props) $$invalidate(0, vitals = $$props.vitals);
    		if ("will" in $$props) $$invalidate(1, will = $$props.will);
    		if ("physique" in $$props) $$invalidate(2, physique = $$props.physique);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		vitals,
    		will,
    		physique,
    		stresstrack0_stressTaken_binding,
    		stresstrack1_stressTaken_binding,
    		consequence0_description_binding,
    		consequence1_description_binding,
    		consequence2_description_binding,
    		consequence_description_binding
    	];
    }

    class Vitals extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, { vitals: 0, will: 1, physique: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Vitals",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get vitals() {
    		throw new Error("<Vitals>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set vitals(value) {
    		throw new Error("<Vitals>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get will() {
    		throw new Error("<Vitals>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set will(value) {
    		throw new Error("<Vitals>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get physique() {
    		throw new Error("<Vitals>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set physique(value) {
    		throw new Error("<Vitals>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Skills/Skills.svelte generated by Svelte v3.25.0 */
    const file$7 = "src/components/CharacterSheet/Skills/Skills.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	child_ctx[5] = list;
    	child_ctx[6] = i;
    	return child_ctx;
    }

    // (70:4) {#each skills as skill}
    function create_each_block$1(ctx) {
    	let div;
    	let span;
    	let t1;
    	let input0;
    	let t2;
    	let input1;
    	let t3;
    	let mounted;
    	let dispose;

    	function input0_input_handler() {
    		/*input0_input_handler*/ ctx[2].call(input0, /*each_value*/ ctx[5], /*skill_index*/ ctx[6]);
    	}

    	function input1_input_handler() {
    		/*input1_input_handler*/ ctx[3].call(input1, /*each_value*/ ctx[5], /*skill_index*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			span.textContent = "+";
    			t1 = space();
    			input0 = element("input");
    			t2 = space();
    			input1 = element("input");
    			t3 = space();
    			add_location(span, file$7, 71, 12, 1683);
    			attr_dev(input0, "maxlength", "2");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", "skill-value svelte-899iq4");
    			attr_dev(input0, "min", "0");
    			attr_dev(input0, "max", "10");
    			add_location(input0, file$7, 72, 12, 1710);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "skill-name svelte-899iq4");
    			add_location(input1, file$7, 73, 12, 1821);
    			attr_dev(div, "class", "skill-line svelte-899iq4");
    			add_location(div, file$7, 70, 8, 1646);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(div, t1);
    			append_dev(div, input0);
    			set_input_value(input0, /*skill*/ ctx[4].value);
    			append_dev(div, t2);
    			append_dev(div, input1);
    			set_input_value(input1, /*skill*/ ctx[4].name);
    			append_dev(div, t3);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", input0_input_handler),
    					listen_dev(input1, "input", input1_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*skills*/ 1 && to_number(input0.value) !== /*skill*/ ctx[4].value) {
    				set_input_value(input0, /*skill*/ ctx[4].value);
    			}

    			if (dirty & /*skills*/ 1 && input1.value !== /*skill*/ ctx[4].name) {
    				set_input_value(input1, /*skill*/ ctx[4].name);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(70:4) {#each skills as skill}",
    		ctx
    	});

    	return block;
    }

    // (68:0) <Section title="Skills" hint="{skillsHint}">
    function create_default_slot$2(ctx) {
    	let each_1_anchor;
    	let each_value = /*skills*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*skills*/ 1) {
    				each_value = /*skills*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$2.name,
    		type: "slot",
    		source: "(68:0) <Section title=\\\"Skills\\\" hint=\\\"{skillsHint}\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				title: "Skills",
    				hint: /*skillsHint*/ ctx[1],
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope, skills*/ 129) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Skills", slots, []);

    	let { skills = [
    		{ name: "Academics", value: 0 },
    		{ name: "Athletics", value: 0 },
    		{ name: "Burglary", value: 0 },
    		{ name: "Contacts", value: 0 },
    		{ name: "Crafts", value: 0 },
    		{ name: "Deceive", value: 0 },
    		{ name: "Drive", value: 0 },
    		{ name: "Empathy", value: 0 },
    		{ name: "Fight", value: 0 },
    		{ name: "Investigate", value: 0 },
    		{ name: "Lore", value: 0 },
    		{ name: "Notice", value: 0 },
    		{ name: "Physique", value: 0 },
    		{ name: "Provoke", value: 0 },
    		{ name: "Rapport", value: 0 },
    		{ name: "Resources", value: 0 },
    		{ name: "Shoot", value: 0 },
    		{ name: "Stealth", value: 0 },
    		{ name: "Will", value: 0 }
    	] } = $$props;

    	let skillsHint = "Start with one Great (+4), two Good (+3), three Fair (+2), four Average (+1), rest at Mediocre (=0)";
    	const writable_props = ["skills"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Skills> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler(each_value, skill_index) {
    		each_value[skill_index].value = to_number(this.value);
    		$$invalidate(0, skills);
    	}

    	function input1_input_handler(each_value, skill_index) {
    		each_value[skill_index].name = this.value;
    		$$invalidate(0, skills);
    	}

    	$$self.$$set = $$props => {
    		if ("skills" in $$props) $$invalidate(0, skills = $$props.skills);
    	};

    	$$self.$capture_state = () => ({ Section, skills, skillsHint });

    	$$self.$inject_state = $$props => {
    		if ("skills" in $$props) $$invalidate(0, skills = $$props.skills);
    		if ("skillsHint" in $$props) $$invalidate(1, skillsHint = $$props.skillsHint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [skills, skillsHint, input0_input_handler, input1_input_handler];
    }

    class Skills extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, { skills: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Skills",
    			options,
    			id: create_fragment$a.name
    		});
    	}

    	get skills() {
    		throw new Error("<Skills>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set skills(value) {
    		throw new Error("<Skills>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/Stunts/Stunts.svelte generated by Svelte v3.25.0 */
    const file$8 = "src/components/CharacterSheet/Stunts/Stunts.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[6] = list;
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (44:4) {#each stunts as stunt,i}
    function create_each_block$2(ctx) {
    	let div;
    	let input;
    	let t0;
    	let textarea;
    	let t1;
    	let mounted;
    	let dispose;

    	function input_input_handler() {
    		/*input_input_handler*/ ctx[3].call(input, /*each_value*/ ctx[6], /*i*/ ctx[7]);
    	}

    	function textarea_input_handler() {
    		/*textarea_input_handler*/ ctx[4].call(textarea, /*each_value*/ ctx[6], /*i*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			textarea = element("textarea");
    			t1 = space();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "maxlength", "40");
    			attr_dev(input, "class", "name-input svelte-13pt205");
    			attr_dev(input, "placeholder", "Please name the stunt.");
    			add_location(input, file$8, 45, 12, 1072);
    			attr_dev(textarea, "placeholder", "Please describe the stunt.");
    			attr_dev(textarea, "maxlength", "130");
    			attr_dev(textarea, "rows", /*rows*/ ctx[1]);
    			attr_dev(textarea, "class", "svelte-13pt205");
    			add_location(textarea, file$8, 46, 12, 1200);
    			attr_dev(div, "class", "stunt svelte-13pt205");
    			add_location(div, file$8, 44, 8, 1040);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			set_input_value(input, /*stunt*/ ctx[5].name);
    			append_dev(div, t0);
    			append_dev(div, textarea);
    			set_input_value(textarea, /*stunt*/ ctx[5].description);
    			append_dev(div, t1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", input_input_handler),
    					listen_dev(textarea, "input", textarea_input_handler)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*stunts*/ 1 && input.value !== /*stunt*/ ctx[5].name) {
    				set_input_value(input, /*stunt*/ ctx[5].name);
    			}

    			if (dirty & /*stunts*/ 1) {
    				set_input_value(textarea, /*stunt*/ ctx[5].description);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(44:4) {#each stunts as stunt,i}",
    		ctx
    	});

    	return block;
    }

    // (42:0) <Section title="Stunts" hint="{stuntsHint}" indent="0.75in">
    function create_default_slot$3(ctx) {
    	let each_1_anchor;
    	let each_value = /*stunts*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*rows, stunts*/ 3) {
    				each_value = /*stunts*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$3.name,
    		type: "slot",
    		source: "(42:0) <Section title=\\\"Stunts\\\" hint=\\\"{stuntsHint}\\\" indent=\\\"0.75in\\\">",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let section;
    	let current;

    	section = new Section({
    			props: {
    				title: "Stunts",
    				hint: /*stuntsHint*/ ctx[2],
    				indent: "0.75in",
    				$$slots: { default: [create_default_slot$3] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(section.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(section, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const section_changes = {};

    			if (dirty & /*$$scope, stunts*/ 257) {
    				section_changes.$$scope = { dirty, ctx };
    			}

    			section.$set(section_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(section.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(section.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(section, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Stunts", slots, []);

    	let { stunts = [
    		{ name: "", description: "" },
    		{ name: "", description: "" },
    		{ name: "", description: "" },
    		{ name: "", description: "" },
    		{ name: "", description: "" },
    		{ name: "", description: "" }
    	] } = $$props;

    	let rows = 3;
    	let stuntsHint = "Start with three stunts for free. You may buy additional stunts for 1 Refresh each, so long as your Refresh remains at 1 or above.";
    	const writable_props = ["stunts"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Stunts> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler(each_value, i) {
    		each_value[i].name = this.value;
    		$$invalidate(0, stunts);
    	}

    	function textarea_input_handler(each_value, i) {
    		each_value[i].description = this.value;
    		$$invalidate(0, stunts);
    	}

    	$$self.$$set = $$props => {
    		if ("stunts" in $$props) $$invalidate(0, stunts = $$props.stunts);
    	};

    	$$self.$capture_state = () => ({ Section, stunts, rows, stuntsHint });

    	$$self.$inject_state = $$props => {
    		if ("stunts" in $$props) $$invalidate(0, stunts = $$props.stunts);
    		if ("rows" in $$props) $$invalidate(1, rows = $$props.rows);
    		if ("stuntsHint" in $$props) $$invalidate(2, stuntsHint = $$props.stuntsHint);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [stunts, rows, stuntsHint, input_input_handler, textarea_input_handler];
    }

    class Stunts extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, { stunts: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Stunts",
    			options,
    			id: create_fragment$b.name
    		});
    	}

    	get stunts() {
    		throw new Error("<Stunts>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set stunts(value) {
    		throw new Error("<Stunts>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/RefreshAndFate/RefreshAndFate.svelte generated by Svelte v3.25.0 */

    const file$9 = "src/components/CharacterSheet/RefreshAndFate/RefreshAndFate.svelte";

    function create_fragment$c(ctx) {
    	let div5;
    	let div0;
    	let t1;
    	let div1;
    	let input0;
    	let input0_step_value;
    	let input0_min_value;
    	let input0_max_value;
    	let t2;
    	let div2;
    	let span0;
    	let t4;
    	let div3;
    	let span1;
    	let t6;
    	let div4;
    	let input1;
    	let input1_step_value;
    	let input1_min_value;
    	let input1_max_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			div0.textContent = " ";
    			t1 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t2 = space();
    			div2 = element("div");
    			span0 = element("span");
    			span0.textContent = "Refresh";
    			t4 = space();
    			div3 = element("div");
    			span1 = element("span");
    			span1.textContent = "Fate";
    			t6 = space();
    			div4 = element("div");
    			input1 = element("input");
    			set_style(div0, "display", "inline-block");
    			attr_dev(div0, "class", "svelte-w3qrjc");
    			add_location(div0, file$9, 129, 4, 2354);
    			attr_dev(input0, "maxlength", "1");
    			attr_dev(input0, "class", "circle svelte-w3qrjc");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "step", input0_step_value = 1);
    			attr_dev(input0, "min", input0_min_value = 0);
    			attr_dev(input0, "max", input0_max_value = 10);
    			add_location(input0, file$9, 131, 8, 2443);
    			attr_dev(div1, "class", "refresh-points svelte-w3qrjc");
    			add_location(div1, file$9, 130, 4, 2406);
    			set_style(span0, "margin-left", "5.3em");
    			attr_dev(span0, "class", "svelte-w3qrjc");
    			add_location(span0, file$9, 142, 8, 2714);
    			attr_dev(div2, "class", "refresh-label svelte-w3qrjc");
    			add_location(div2, file$9, 141, 4, 2678);
    			set_style(span1, "margin-right", "5.3em");
    			attr_dev(span1, "class", "svelte-w3qrjc");
    			add_location(span1, file$9, 145, 8, 2809);
    			attr_dev(div3, "class", "fate-label svelte-w3qrjc");
    			add_location(div3, file$9, 144, 4, 2776);
    			attr_dev(input1, "maxlength", "1");
    			attr_dev(input1, "class", "circle svelte-w3qrjc");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "step", input1_step_value = 1);
    			attr_dev(input1, "min", input1_min_value = 0);
    			attr_dev(input1, "max", input1_max_value = 10);
    			add_location(input1, file$9, 148, 8, 2903);
    			attr_dev(div4, "class", "fate-points svelte-w3qrjc");
    			add_location(div4, file$9, 147, 4, 2869);
    			attr_dev(div5, "class", "header svelte-w3qrjc");
    			add_location(div5, file$9, 128, 0, 2328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t1);
    			append_dev(div5, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*refresh*/ ctx[0]);
    			append_dev(div5, t2);
    			append_dev(div5, div2);
    			append_dev(div2, span0);
    			append_dev(div5, t4);
    			append_dev(div5, div3);
    			append_dev(div3, span1);
    			append_dev(div5, t6);
    			append_dev(div5, div4);
    			append_dev(div4, input1);
    			set_input_value(input1, /*fate*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[2]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[3])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*refresh*/ 1 && to_number(input0.value) !== /*refresh*/ ctx[0]) {
    				set_input_value(input0, /*refresh*/ ctx[0]);
    			}

    			if (dirty & /*fate*/ 2 && to_number(input1.value) !== /*fate*/ ctx[1]) {
    				set_input_value(input1, /*fate*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("RefreshAndFate", slots, []);
    	let { refresh = 3 } = $$props;
    	let { fate = 3 } = $$props;
    	const writable_props = ["refresh", "fate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<RefreshAndFate> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		refresh = to_number(this.value);
    		$$invalidate(0, refresh);
    	}

    	function input1_input_handler() {
    		fate = to_number(this.value);
    		$$invalidate(1, fate);
    	}

    	$$self.$$set = $$props => {
    		if ("refresh" in $$props) $$invalidate(0, refresh = $$props.refresh);
    		if ("fate" in $$props) $$invalidate(1, fate = $$props.fate);
    	};

    	$$self.$capture_state = () => ({ refresh, fate });

    	$$self.$inject_state = $$props => {
    		if ("refresh" in $$props) $$invalidate(0, refresh = $$props.refresh);
    		if ("fate" in $$props) $$invalidate(1, fate = $$props.fate);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [refresh, fate, input0_input_handler, input1_input_handler];
    }

    class RefreshAndFate extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, { refresh: 0, fate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RefreshAndFate",
    			options,
    			id: create_fragment$c.name
    		});
    	}

    	get refresh() {
    		throw new Error("<RefreshAndFate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set refresh(value) {
    		throw new Error("<RefreshAndFate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fate() {
    		throw new Error("<RefreshAndFate>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fate(value) {
    		throw new Error("<RefreshAndFate>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/CharacterSheet/CharacterSheet.svelte generated by Svelte v3.25.0 */
    const file$a = "src/components/CharacterSheet/CharacterSheet.svelte";

    function create_fragment$d(ctx) {
    	let div7;
    	let pageheading;
    	let updating_name;
    	let t0;
    	let div6;
    	let div2;
    	let div0;
    	let aspects;
    	let updating_aspects;
    	let t1;
    	let div1;
    	let vitals;
    	let updating_vitals;
    	let updating_will;
    	let updating_physique;
    	let t2;
    	let div5;
    	let div3;
    	let stunts;
    	let updating_stunts;
    	let t3;
    	let refreshandfate;
    	let updating_fate;
    	let updating_refresh;
    	let t4;
    	let div4;
    	let skills;
    	let updating_skills;
    	let current;

    	function pageheading_name_binding(value) {
    		/*pageheading_name_binding*/ ctx[1].call(null, value);
    	}

    	let pageheading_props = {};

    	if (/*character*/ ctx[0].name !== void 0) {
    		pageheading_props.name = /*character*/ ctx[0].name;
    	}

    	pageheading = new PageHeading({ props: pageheading_props, $$inline: true });
    	binding_callbacks.push(() => bind(pageheading, "name", pageheading_name_binding));

    	function aspects_aspects_binding(value) {
    		/*aspects_aspects_binding*/ ctx[2].call(null, value);
    	}

    	let aspects_props = {};

    	if (/*character*/ ctx[0].aspects !== void 0) {
    		aspects_props.aspects = /*character*/ ctx[0].aspects;
    	}

    	aspects = new Aspects({ props: aspects_props, $$inline: true });
    	binding_callbacks.push(() => bind(aspects, "aspects", aspects_aspects_binding));

    	function vitals_vitals_binding(value) {
    		/*vitals_vitals_binding*/ ctx[3].call(null, value);
    	}

    	function vitals_will_binding(value) {
    		/*vitals_will_binding*/ ctx[4].call(null, value);
    	}

    	function vitals_physique_binding(value) {
    		/*vitals_physique_binding*/ ctx[5].call(null, value);
    	}

    	let vitals_props = {};

    	if (/*character*/ ctx[0].vitals !== void 0) {
    		vitals_props.vitals = /*character*/ ctx[0].vitals;
    	}

    	if (/*character*/ ctx[0].skills[18].value !== void 0) {
    		vitals_props.will = /*character*/ ctx[0].skills[18].value;
    	}

    	if (/*character*/ ctx[0].skills[12].value !== void 0) {
    		vitals_props.physique = /*character*/ ctx[0].skills[12].value;
    	}

    	vitals = new Vitals({ props: vitals_props, $$inline: true });
    	binding_callbacks.push(() => bind(vitals, "vitals", vitals_vitals_binding));
    	binding_callbacks.push(() => bind(vitals, "will", vitals_will_binding));
    	binding_callbacks.push(() => bind(vitals, "physique", vitals_physique_binding));

    	function stunts_stunts_binding(value) {
    		/*stunts_stunts_binding*/ ctx[6].call(null, value);
    	}

    	let stunts_props = {};

    	if (/*character*/ ctx[0].stunts !== void 0) {
    		stunts_props.stunts = /*character*/ ctx[0].stunts;
    	}

    	stunts = new Stunts({ props: stunts_props, $$inline: true });
    	binding_callbacks.push(() => bind(stunts, "stunts", stunts_stunts_binding));

    	function refreshandfate_fate_binding(value) {
    		/*refreshandfate_fate_binding*/ ctx[7].call(null, value);
    	}

    	function refreshandfate_refresh_binding(value) {
    		/*refreshandfate_refresh_binding*/ ctx[8].call(null, value);
    	}

    	let refreshandfate_props = {};

    	if (/*character*/ ctx[0].fate !== void 0) {
    		refreshandfate_props.fate = /*character*/ ctx[0].fate;
    	}

    	if (/*character*/ ctx[0].refresh !== void 0) {
    		refreshandfate_props.refresh = /*character*/ ctx[0].refresh;
    	}

    	refreshandfate = new RefreshAndFate({
    			props: refreshandfate_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(refreshandfate, "fate", refreshandfate_fate_binding));
    	binding_callbacks.push(() => bind(refreshandfate, "refresh", refreshandfate_refresh_binding));

    	function skills_skills_binding(value) {
    		/*skills_skills_binding*/ ctx[9].call(null, value);
    	}

    	let skills_props = {};

    	if (/*character*/ ctx[0].skills !== void 0) {
    		skills_props.skills = /*character*/ ctx[0].skills;
    	}

    	skills = new Skills({ props: skills_props, $$inline: true });
    	binding_callbacks.push(() => bind(skills, "skills", skills_skills_binding));

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			create_component(pageheading.$$.fragment);
    			t0 = space();
    			div6 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(aspects.$$.fragment);
    			t1 = space();
    			div1 = element("div");
    			create_component(vitals.$$.fragment);
    			t2 = space();
    			div5 = element("div");
    			div3 = element("div");
    			create_component(stunts.$$.fragment);
    			t3 = space();
    			create_component(refreshandfate.$$.fragment);
    			t4 = space();
    			div4 = element("div");
    			create_component(skills.$$.fragment);
    			attr_dev(div0, "class", "td border svelte-1ld3z25");
    			add_location(div0, file$a, 40, 12, 878);
    			attr_dev(div1, "class", "td");
    			set_style(div1, "width", "40.8%");
    			add_location(div1, file$a, 43, 12, 995);
    			attr_dev(div2, "class", "tr");
    			add_location(div2, file$a, 39, 8, 849);
    			attr_dev(div3, "class", "td border svelte-1ld3z25");
    			add_location(div3, file$a, 49, 12, 1246);
    			attr_dev(div4, "class", "td");
    			add_location(div4, file$a, 53, 12, 1458);
    			attr_dev(div5, "class", "tr");
    			add_location(div5, file$a, 48, 8, 1217);
    			attr_dev(div6, "class", "table");
    			add_location(div6, file$a, 37, 4, 820);
    			attr_dev(div7, "class", "character-sheet svelte-1ld3z25");
    			add_location(div7, file$a, 35, 0, 738);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			mount_component(pageheading, div7, null);
    			append_dev(div7, t0);
    			append_dev(div7, div6);
    			append_dev(div6, div2);
    			append_dev(div2, div0);
    			mount_component(aspects, div0, null);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			mount_component(vitals, div1, null);
    			append_dev(div6, t2);
    			append_dev(div6, div5);
    			append_dev(div5, div3);
    			mount_component(stunts, div3, null);
    			append_dev(div3, t3);
    			mount_component(refreshandfate, div3, null);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			mount_component(skills, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const pageheading_changes = {};

    			if (!updating_name && dirty & /*character*/ 1) {
    				updating_name = true;
    				pageheading_changes.name = /*character*/ ctx[0].name;
    				add_flush_callback(() => updating_name = false);
    			}

    			pageheading.$set(pageheading_changes);
    			const aspects_changes = {};

    			if (!updating_aspects && dirty & /*character*/ 1) {
    				updating_aspects = true;
    				aspects_changes.aspects = /*character*/ ctx[0].aspects;
    				add_flush_callback(() => updating_aspects = false);
    			}

    			aspects.$set(aspects_changes);
    			const vitals_changes = {};

    			if (!updating_vitals && dirty & /*character*/ 1) {
    				updating_vitals = true;
    				vitals_changes.vitals = /*character*/ ctx[0].vitals;
    				add_flush_callback(() => updating_vitals = false);
    			}

    			if (!updating_will && dirty & /*character*/ 1) {
    				updating_will = true;
    				vitals_changes.will = /*character*/ ctx[0].skills[18].value;
    				add_flush_callback(() => updating_will = false);
    			}

    			if (!updating_physique && dirty & /*character*/ 1) {
    				updating_physique = true;
    				vitals_changes.physique = /*character*/ ctx[0].skills[12].value;
    				add_flush_callback(() => updating_physique = false);
    			}

    			vitals.$set(vitals_changes);
    			const stunts_changes = {};

    			if (!updating_stunts && dirty & /*character*/ 1) {
    				updating_stunts = true;
    				stunts_changes.stunts = /*character*/ ctx[0].stunts;
    				add_flush_callback(() => updating_stunts = false);
    			}

    			stunts.$set(stunts_changes);
    			const refreshandfate_changes = {};

    			if (!updating_fate && dirty & /*character*/ 1) {
    				updating_fate = true;
    				refreshandfate_changes.fate = /*character*/ ctx[0].fate;
    				add_flush_callback(() => updating_fate = false);
    			}

    			if (!updating_refresh && dirty & /*character*/ 1) {
    				updating_refresh = true;
    				refreshandfate_changes.refresh = /*character*/ ctx[0].refresh;
    				add_flush_callback(() => updating_refresh = false);
    			}

    			refreshandfate.$set(refreshandfate_changes);
    			const skills_changes = {};

    			if (!updating_skills && dirty & /*character*/ 1) {
    				updating_skills = true;
    				skills_changes.skills = /*character*/ ctx[0].skills;
    				add_flush_callback(() => updating_skills = false);
    			}

    			skills.$set(skills_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pageheading.$$.fragment, local);
    			transition_in(aspects.$$.fragment, local);
    			transition_in(vitals.$$.fragment, local);
    			transition_in(stunts.$$.fragment, local);
    			transition_in(refreshandfate.$$.fragment, local);
    			transition_in(skills.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pageheading.$$.fragment, local);
    			transition_out(aspects.$$.fragment, local);
    			transition_out(vitals.$$.fragment, local);
    			transition_out(stunts.$$.fragment, local);
    			transition_out(refreshandfate.$$.fragment, local);
    			transition_out(skills.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_component(pageheading);
    			destroy_component(aspects);
    			destroy_component(vitals);
    			destroy_component(stunts);
    			destroy_component(refreshandfate);
    			destroy_component(skills);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CharacterSheet", slots, []);
    	let { character } = $$props;
    	window.scrollTo(0, 0);
    	const writable_props = ["character"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CharacterSheet> was created with unknown prop '${key}'`);
    	});

    	function pageheading_name_binding(value) {
    		character.name = value;
    		$$invalidate(0, character);
    	}

    	function aspects_aspects_binding(value) {
    		character.aspects = value;
    		$$invalidate(0, character);
    	}

    	function vitals_vitals_binding(value) {
    		character.vitals = value;
    		$$invalidate(0, character);
    	}

    	function vitals_will_binding(value) {
    		character.skills[18].value = value;
    		$$invalidate(0, character);
    	}

    	function vitals_physique_binding(value) {
    		character.skills[12].value = value;
    		$$invalidate(0, character);
    	}

    	function stunts_stunts_binding(value) {
    		character.stunts = value;
    		$$invalidate(0, character);
    	}

    	function refreshandfate_fate_binding(value) {
    		character.fate = value;
    		$$invalidate(0, character);
    	}

    	function refreshandfate_refresh_binding(value) {
    		character.refresh = value;
    		$$invalidate(0, character);
    	}

    	function skills_skills_binding(value) {
    		character.skills = value;
    		$$invalidate(0, character);
    	}

    	$$self.$$set = $$props => {
    		if ("character" in $$props) $$invalidate(0, character = $$props.character);
    	};

    	$$self.$capture_state = () => ({
    		PageHeading,
    		Aspects,
    		Vitals,
    		Skills,
    		Stunts,
    		RefreshAndFate,
    		character
    	});

    	$$self.$inject_state = $$props => {
    		if ("character" in $$props) $$invalidate(0, character = $$props.character);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		character,
    		pageheading_name_binding,
    		aspects_aspects_binding,
    		vitals_vitals_binding,
    		vitals_will_binding,
    		vitals_physique_binding,
    		stunts_stunts_binding,
    		refreshandfate_fate_binding,
    		refreshandfate_refresh_binding,
    		skills_skills_binding
    	];
    }

    class CharacterSheet extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, { character: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CharacterSheet",
    			options,
    			id: create_fragment$d.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*character*/ ctx[0] === undefined && !("character" in props)) {
    			console.warn("<CharacterSheet> was created without expected prop 'character'");
    		}
    	}

    	get character() {
    		throw new Error("<CharacterSheet>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set character(value) {
    		throw new Error("<CharacterSheet>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var marked = createCommonjsModule(function (module, exports) {
    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2020, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;

        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

        return arr2;
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it;

        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            return function () {
              if (i >= o.length) return {
                done: true
              };
              return {
                done: false,
                value: o[i++]
              };
            };
          }

          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }

        it = o[Symbol.iterator]();
        return it.next.bind(it);
      }

      function createCommonjsModule(fn, module) {
      	return module = { exports: {} }, fn(module, module.exports), module.exports;
      }

      var defaults = createCommonjsModule(function (module) {
        function getDefaults() {
          return {
            baseUrl: null,
            breaks: false,
            gfm: true,
            headerIds: true,
            headerPrefix: '',
            highlight: null,
            langPrefix: 'language-',
            mangle: true,
            pedantic: false,
            renderer: null,
            sanitize: false,
            sanitizer: null,
            silent: false,
            smartLists: false,
            smartypants: false,
            tokenizer: null,
            walkTokens: null,
            xhtml: false
          };
        }

        function changeDefaults(newDefaults) {
          module.exports.defaults = newDefaults;
        }

        module.exports = {
          defaults: getDefaults(),
          getDefaults: getDefaults,
          changeDefaults: changeDefaults
        };
      });
      var defaults_1 = defaults.defaults;
      var defaults_2 = defaults.getDefaults;
      var defaults_3 = defaults.changeDefaults;

      /**
       * Helpers
       */
      var escapeTest = /[&<>"']/;
      var escapeReplace = /[&<>"']/g;
      var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
      var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
      var escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      var getEscapeReplacement = function getEscapeReplacement(ch) {
        return escapeReplacements[ch];
      };

      function escape(html, encode) {
        if (encode) {
          if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
          }
        } else {
          if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
        }

        return html;
      }

      var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

      function unescape(html) {
        // explicitly match decimal, hex, and named HTML entities
        return html.replace(unescapeTest, function (_, n) {
          n = n.toLowerCase();
          if (n === 'colon') return ':';

          if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
          }

          return '';
        });
      }

      var caret = /(^|[^\[])\^/g;

      function edit(regex, opt) {
        regex = regex.source || regex;
        opt = opt || '';
        var obj = {
          replace: function replace(name, val) {
            val = val.source || val;
            val = val.replace(caret, '$1');
            regex = regex.replace(name, val);
            return obj;
          },
          getRegex: function getRegex() {
            return new RegExp(regex, opt);
          }
        };
        return obj;
      }

      var nonWordAndColonTest = /[^\w:]/g;
      var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

      function cleanUrl(sanitize, base, href) {
        if (sanitize) {
          var prot;

          try {
            prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
          } catch (e) {
            return null;
          }

          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
          }
        }

        if (base && !originIndependentUrl.test(href)) {
          href = resolveUrl(base, href);
        }

        try {
          href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
          return null;
        }

        return href;
      }

      var baseUrls = {};
      var justDomain = /^[^:]+:\/*[^/]*$/;
      var protocol = /^([^:]+:)[\s\S]*$/;
      var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

      function resolveUrl(base, href) {
        if (!baseUrls[' ' + base]) {
          // we can ignore everything in base after the last slash of its path component,
          // but we might need to add _that_
          // https://tools.ietf.org/html/rfc3986#section-3
          if (justDomain.test(base)) {
            baseUrls[' ' + base] = base + '/';
          } else {
            baseUrls[' ' + base] = rtrim(base, '/', true);
          }
        }

        base = baseUrls[' ' + base];
        var relativeBase = base.indexOf(':') === -1;

        if (href.substring(0, 2) === '//') {
          if (relativeBase) {
            return href;
          }

          return base.replace(protocol, '$1') + href;
        } else if (href.charAt(0) === '/') {
          if (relativeBase) {
            return href;
          }

          return base.replace(domain, '$1') + href;
        } else {
          return base + href;
        }
      }

      var noopTest = {
        exec: function noopTest() {}
      };

      function merge(obj) {
        var i = 1,
            target,
            key;

        for (; i < arguments.length; i++) {
          target = arguments[i];

          for (key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
              obj[key] = target[key];
            }
          }
        }

        return obj;
      }

      function splitCells(tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
          var escaped = false,
              curr = offset;

          while (--curr >= 0 && str[curr] === '\\') {
            escaped = !escaped;
          }

          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
            cells = row.split(/ \|/);
        var i = 0;

        if (cells.length > count) {
          cells.splice(count);
        } else {
          while (cells.length < count) {
            cells.push('');
          }
        }

        for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
      } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
      // /c*$/ is vulnerable to REDOS.
      // invert: Remove suffix of non-c chars instead. Default falsey.


      function rtrim(str, c, invert) {
        var l = str.length;

        if (l === 0) {
          return '';
        } // Length of suffix matching the invert condition.


        var suffLen = 0; // Step left until we fail to match the invert condition.

        while (suffLen < l) {
          var currChar = str.charAt(l - suffLen - 1);

          if (currChar === c && !invert) {
            suffLen++;
          } else if (currChar !== c && invert) {
            suffLen++;
          } else {
            break;
          }
        }

        return str.substr(0, l - suffLen);
      }

      function findClosingBracket(str, b) {
        if (str.indexOf(b[1]) === -1) {
          return -1;
        }

        var l = str.length;
        var level = 0,
            i = 0;

        for (; i < l; i++) {
          if (str[i] === '\\') {
            i++;
          } else if (str[i] === b[0]) {
            level++;
          } else if (str[i] === b[1]) {
            level--;

            if (level < 0) {
              return i;
            }
          }
        }

        return -1;
      }

      function checkSanitizeDeprecation(opt) {
        if (opt && opt.sanitize && !opt.silent) {
          console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
        }
      }

      var helpers = {
        escape: escape,
        unescape: unescape,
        edit: edit,
        cleanUrl: cleanUrl,
        resolveUrl: resolveUrl,
        noopTest: noopTest,
        merge: merge,
        splitCells: splitCells,
        rtrim: rtrim,
        findClosingBracket: findClosingBracket,
        checkSanitizeDeprecation: checkSanitizeDeprecation
      };

      var defaults$1 = defaults.defaults;
      var rtrim$1 = helpers.rtrim,
          splitCells$1 = helpers.splitCells,
          _escape = helpers.escape,
          findClosingBracket$1 = helpers.findClosingBracket;

      function outputLink(cap, link, raw) {
        var href = link.href;
        var title = link.title ? _escape(link.title) : null;
        var text = cap[1].replace(/\\([\[\]])/g, '$1');

        if (cap[0].charAt(0) !== '!') {
          return {
            type: 'link',
            raw: raw,
            href: href,
            title: title,
            text: text
          };
        } else {
          return {
            type: 'image',
            raw: raw,
            href: href,
            title: title,
            text: _escape(text)
          };
        }
      }

      function indentCodeCompensation(raw, text) {
        var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

        if (matchIndentToCode === null) {
          return text;
        }

        var indentToCode = matchIndentToCode[1];
        return text.split('\n').map(function (node) {
          var matchIndentInNode = node.match(/^\s+/);

          if (matchIndentInNode === null) {
            return node;
          }

          var indentInNode = matchIndentInNode[0];

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        }).join('\n');
      }
      /**
       * Tokenizer
       */


      var Tokenizer_1 = /*#__PURE__*/function () {
        function Tokenizer(options) {
          this.options = options || defaults$1;
        }

        var _proto = Tokenizer.prototype;

        _proto.space = function space(src) {
          var cap = this.rules.block.newline.exec(src);

          if (cap) {
            if (cap[0].length > 1) {
              return {
                type: 'space',
                raw: cap[0]
              };
            }

            return {
              raw: '\n'
            };
          }
        };

        _proto.code = function code(src, tokens) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

            if (lastToken && lastToken.type === 'paragraph') {
              return {
                raw: cap[0],
                text: cap[0].trimRight()
              };
            }

            var text = cap[0].replace(/^ {4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic ? rtrim$1(text, '\n') : text
            };
          }
        };

        _proto.fences = function fences(src) {
          var cap = this.rules.block.fences.exec(src);

          if (cap) {
            var raw = cap[0];
            var text = indentCodeCompensation(raw, cap[3] || '');
            return {
              type: 'code',
              raw: raw,
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: text
            };
          }
        };

        _proto.heading = function heading(src) {
          var cap = this.rules.block.heading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[1].length,
              text: cap[2]
            };
          }
        };

        _proto.nptable = function nptable(src) {
          var cap = this.rules.block.nptable.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
              raw: cap[0]
            };

            if (item.header.length === item.align.length) {
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells$1(item.cells[i], item.header.length);
              }

              return item;
            }
          }
        };

        _proto.hr = function hr(src) {
          var cap = this.rules.block.hr.exec(src);

          if (cap) {
            return {
              type: 'hr',
              raw: cap[0]
            };
          }
        };

        _proto.blockquote = function blockquote(src) {
          var cap = this.rules.block.blockquote.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ *> ?/gm, '');
            return {
              type: 'blockquote',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.list = function list(src) {
          var cap = this.rules.block.list.exec(src);

          if (cap) {
            var raw = cap[0];
            var bull = cap[2];
            var isordered = bull.length > 1;
            var isparen = bull[bull.length - 1] === ')';
            var list = {
              type: 'list',
              raw: raw,
              ordered: isordered,
              start: isordered ? +bull.slice(0, -1) : '',
              loose: false,
              items: []
            }; // Get each top-level item.

            var itemMatch = cap[0].match(this.rules.block.item);
            var next = false,
                item,
                space,
                b,
                addBack,
                loose,
                istask,
                ischecked;
            var l = itemMatch.length;

            for (var i = 0; i < l; i++) {
              item = itemMatch[i];
              raw = item; // Remove the list item's bullet
              // so it is seen as the next token.

              space = item.length;
              item = item.replace(/^ *([*+-]|\d+[.)]) */, ''); // Outdent whatever the
              // list item contains. Hacky.

              if (~item.indexOf('\n ')) {
                space -= item.length;
                item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
              } // Determine whether the next list item belongs here.
              // Backpedal if it does not belong in this list.


              if (i !== l - 1) {
                b = this.rules.block.bullet.exec(itemMatch[i + 1])[0];

                if (isordered ? b.length === 1 || !isparen && b[b.length - 1] === ')' : b.length > 1 || this.options.smartLists && b !== bull) {
                  addBack = itemMatch.slice(i + 1).join('\n');
                  list.raw = list.raw.substring(0, list.raw.length - addBack.length);
                  i = l - 1;
                }
              } // Determine whether item is loose or not.
              // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
              // for discount behavior.


              loose = next || /\n\n(?!\s*$)/.test(item);

              if (i !== l - 1) {
                next = item.charAt(item.length - 1) === '\n';
                if (!loose) loose = next;
              }

              if (loose) {
                list.loose = true;
              } // Check for task list items


              istask = /^\[[ xX]\] /.test(item);
              ischecked = undefined;

              if (istask) {
                ischecked = item[1] !== ' ';
                item = item.replace(/^\[[ xX]\] +/, '');
              }

              list.items.push({
                type: 'list_item',
                raw: raw,
                task: istask,
                checked: ischecked,
                loose: loose,
                text: item
              });
            }

            return list;
          }
        };

        _proto.html = function html(src) {
          var cap = this.rules.block.html.exec(src);

          if (cap) {
            return {
              type: this.options.sanitize ? 'paragraph' : 'html',
              raw: cap[0],
              pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.def = function def(src) {
          var cap = this.rules.block.def.exec(src);

          if (cap) {
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            return {
              tag: tag,
              raw: cap[0],
              href: cap[2],
              title: cap[3]
            };
          }
        };

        _proto.table = function table(src) {
          var cap = this.rules.block.table.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              item.raw = cap[0];
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells$1(item.cells[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
              }

              return item;
            }
          }
        };

        _proto.lheading = function lheading(src) {
          var cap = this.rules.block.lheading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            };
          }
        };

        _proto.paragraph = function paragraph(src) {
          var cap = this.rules.block.paragraph.exec(src);

          if (cap) {
            return {
              type: 'paragraph',
              raw: cap[0],
              text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
            };
          }
        };

        _proto.text = function text(src, tokens) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
            var lastToken = tokens[tokens.length - 1];

            if (lastToken && lastToken.type === 'text') {
              return {
                raw: cap[0],
                text: cap[0]
              };
            }

            return {
              type: 'text',
              raw: cap[0],
              text: cap[0]
            };
          }
        };

        _proto.escape = function escape(src) {
          var cap = this.rules.inline.escape.exec(src);

          if (cap) {
            return {
              type: 'escape',
              raw: cap[0],
              text: _escape(cap[1])
            };
          }
        };

        _proto.tag = function tag(src, inLink, inRawBlock) {
          var cap = this.rules.inline.tag.exec(src);

          if (cap) {
            if (!inLink && /^<a /i.test(cap[0])) {
              inLink = true;
            } else if (inLink && /^<\/a>/i.test(cap[0])) {
              inLink = false;
            }

            if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = true;
            } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = false;
            }

            return {
              type: this.options.sanitize ? 'text' : 'html',
              raw: cap[0],
              inLink: inLink,
              inRawBlock: inRawBlock,
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.link = function link(src) {
          var cap = this.rules.inline.link.exec(src);

          if (cap) {
            var lastParenIndex = findClosingBracket$1(cap[2], '()');

            if (lastParenIndex > -1) {
              var start = cap[0].indexOf('!') === 0 ? 5 : 4;
              var linkLen = start + cap[1].length + lastParenIndex;
              cap[2] = cap[2].substring(0, lastParenIndex);
              cap[0] = cap[0].substring(0, linkLen).trim();
              cap[3] = '';
            }

            var href = cap[2];
            var title = '';

            if (this.options.pedantic) {
              var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              } else {
                title = '';
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }

            href = href.trim().replace(/^<([\s\S]*)>$/, '$1');
            var token = outputLink(cap, {
              href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
              title: title ? title.replace(this.rules.inline._escapes, '$1') : title
            }, cap[0]);
            return token;
          }
        };

        _proto.reflink = function reflink(src, links) {
          var cap;

          if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
            var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = links[link.toLowerCase()];

            if (!link || !link.href) {
              var text = cap[0].charAt(0);
              return {
                type: 'text',
                raw: text,
                text: text
              };
            }

            var token = outputLink(cap, link, cap[0]);
            return token;
          }
        };

        _proto.strong = function strong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.strong.start.exec(src);

          if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
            maskedSrc = maskedSrc.slice(-1 * src.length);
            var endReg = match[0] === '**' ? this.rules.inline.strong.endAst : this.rules.inline.strong.endUnd;
            endReg.lastIndex = 0;
            var cap;

            while ((match = endReg.exec(maskedSrc)) != null) {
              cap = this.rules.inline.strong.middle.exec(maskedSrc.slice(0, match.index + 3));

              if (cap) {
                return {
                  type: 'strong',
                  raw: src.slice(0, cap[0].length),
                  text: src.slice(2, cap[0].length - 2)
                };
              }
            }
          }
        };

        _proto.em = function em(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.em.start.exec(src);

          if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
            maskedSrc = maskedSrc.slice(-1 * src.length);
            var endReg = match[0] === '*' ? this.rules.inline.em.endAst : this.rules.inline.em.endUnd;
            endReg.lastIndex = 0;
            var cap;

            while ((match = endReg.exec(maskedSrc)) != null) {
              cap = this.rules.inline.em.middle.exec(maskedSrc.slice(0, match.index + 2));

              if (cap) {
                return {
                  type: 'em',
                  raw: src.slice(0, cap[0].length),
                  text: src.slice(1, cap[0].length - 1)
                };
              }
            }
          }
        };

        _proto.codespan = function codespan(src) {
          var cap = this.rules.inline.code.exec(src);

          if (cap) {
            var text = cap[2].replace(/\n/g, ' ');
            var hasNonSpaceChars = /[^ ]/.test(text);
            var hasSpaceCharsOnBothEnds = text.startsWith(' ') && text.endsWith(' ');

            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
              text = text.substring(1, text.length - 1);
            }

            text = _escape(text, true);
            return {
              type: 'codespan',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.br = function br(src) {
          var cap = this.rules.inline.br.exec(src);

          if (cap) {
            return {
              type: 'br',
              raw: cap[0]
            };
          }
        };

        _proto.del = function del(src) {
          var cap = this.rules.inline.del.exec(src);

          if (cap) {
            return {
              type: 'del',
              raw: cap[0],
              text: cap[1]
            };
          }
        };

        _proto.autolink = function autolink(src, mangle) {
          var cap = this.rules.inline.autolink.exec(src);

          if (cap) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
              href = 'mailto:' + text;
            } else {
              text = _escape(cap[1]);
              href = text;
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.url = function url(src, mangle) {
          var cap;

          if (cap = this.rules.inline.url.exec(src)) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              var prevCapZero;

              do {
                prevCapZero = cap[0];
                cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);

              text = _escape(cap[0]);

              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.inlineText = function inlineText(src, inRawBlock, smartypants) {
          var cap = this.rules.inline.text.exec(src);

          if (cap) {
            var text;

            if (inRawBlock) {
              text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
            } else {
              text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
            }

            return {
              type: 'text',
              raw: cap[0],
              text: text
            };
          }
        };

        return Tokenizer;
      }();

      var noopTest$1 = helpers.noopTest,
          edit$1 = helpers.edit,
          merge$1 = helpers.merge;
      /**
       * Block-Level Grammar
       */

      var block = {
        newline: /^\n+/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
        hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
        heading: /^ {0,3}(#{1,6}) +([^\n]*?)(?: +#+)? *(?:\n+|$)/,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
        html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?\\?>\\n*' // (3)
        + '|<![A-Z][\\s\\S]*?>\\n*' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?\\]\\]>\\n*' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
        def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
        nptable: noopTest$1,
        table: noopTest$1,
        lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
        // regex template, placeholders will be replaced according to different paragraph
        // interruption rules of commonmark and the original markdown spec:
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
        text: /^[^\n]+/
      };
      block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
      block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
      block.def = edit$1(block.def).replace('label', block._label).replace('title', block._title).getRegex();
      block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
      block.item = /^( *)(bull) ?[^\n]*(?:\n(?!\1bull ?)[^\n]*)*/;
      block.item = edit$1(block.item, 'gm').replace(/bull/g, block.bullet).getRegex();
      block.list = edit$1(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
      block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
      block._comment = /<!--(?!-?>)[\s\S]*?-->/;
      block.html = edit$1(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
      block.paragraph = edit$1(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      block.blockquote = edit$1(block.blockquote).replace('paragraph', block.paragraph).getRegex();
      /**
       * Normal Block Grammar
       */

      block.normal = merge$1({}, block);
      /**
       * GFM Block Grammar
       */

      block.gfm = merge$1({}, block.normal, {
        nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
        + ' *([-:]+ *\\|[-| :]*)' // Align
        + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
        // Cells
        table: '^ *\\|(.+)\\n' // Header
        + ' *\\|?( *[-:]+[-| :]*)' // Align
        + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

      });
      block.gfm.nptable = edit$1(block.gfm.nptable).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      block.gfm.table = edit$1(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      /**
       * Pedantic grammar (original John Gruber's loose markdown specification)
       */

      block.pedantic = merge$1({}, block.normal, {
        html: edit$1('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^ *(#{1,6}) *([^\n]+?) *(?:#+ *)?(?:\n+|$)/,
        fences: noopTest$1,
        // fences not supported
        paragraph: edit$1(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
      });
      /**
       * Inline-Level Grammar
       */

      var inline = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: noopTest$1,
        tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
        // CDATA section
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
        nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
        reflinkSearch: 'reflink|nolink(?!\\()',
        strong: {
          start: /^(?:(\*\*(?=[*punctuation]))|\*\*)(?![\s])|__/,
          // (1) returns if starts w/ punctuation
          middle: /^\*\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?)__$/,
          endAst: /[^punctuation\s]\*\*(?!\*)|[punctuation]\*\*(?!\*)(?:(?=[punctuation\s]|$))/,
          // last char can't be punct, or final * must also be followed by punct (or endline)
          endUnd: /[^\s]__(?!_)(?:(?=[punctuation\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

        },
        em: {
          start: /^(?:(\*(?=[punctuation]))|\*)(?![*\s])|_/,
          // (1) returns if starts w/ punctuation
          middle: /^\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?_$/,
          endAst: /[^punctuation\s]\*(?!\*)|[punctuation]\*(?!\*)(?:(?=[punctuation\s]|$))/,
          // last char can't be punct, or final * must also be followed by punct (or endline)
          endUnd: /[^\s]_(?!_)(?:(?=[punctuation\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest$1,
        text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n))|(?= {2,}\n))/,
        punctuation: /^([\s*punctuation])/
      }; // list of punctuation marks from common mark spec
      // without * and _ to workaround cases with double emphasis

      inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline.punctuation = edit$1(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline._blockSkip = '\\[[^\\]]*?\\]\\([^\\)]*?\\)|`[^`]*?`|<[^>]*?>';
      inline._overlapSkip = '__[^_]*?__|\\*\\*\\[^\\*\\]*?\\*\\*';
      inline.em.start = edit$1(inline.em.start).replace(/punctuation/g, inline._punctuation).getRegex();
      inline.em.middle = edit$1(inline.em.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
      inline.em.endAst = edit$1(inline.em.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.em.endUnd = edit$1(inline.em.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.start = edit$1(inline.strong.start).replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.middle = edit$1(inline.strong.middle).replace(/punctuation/g, inline._punctuation).replace(/blockSkip/g, inline._blockSkip).getRegex();
      inline.strong.endAst = edit$1(inline.strong.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.endUnd = edit$1(inline.strong.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.blockSkip = edit$1(inline._blockSkip, 'g').getRegex();
      inline.overlapSkip = edit$1(inline._overlapSkip, 'g').getRegex();
      inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
      inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
      inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
      inline.autolink = edit$1(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
      inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
      inline.tag = edit$1(inline.tag).replace('comment', block._comment).replace('attribute', inline._attribute).getRegex();
      inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
      inline._href = /<(?:\\[<>]?|[^\s<>\\])*>|[^\s\x00-\x1f]*/;
      inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
      inline.link = edit$1(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
      inline.reflink = edit$1(inline.reflink).replace('label', inline._label).getRegex();
      inline.reflinkSearch = edit$1(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
      /**
       * Normal Inline Grammar
       */

      inline.normal = merge$1({}, inline);
      /**
       * Pedantic Inline Grammar
       */

      inline.pedantic = merge$1({}, inline.normal, {
        strong: {
          start: /^__|\*\*/,
          middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g
        },
        link: edit$1(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
        reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
      });
      /**
       * GFM Inline Grammar
       */

      inline.gfm = merge$1({}, inline.normal, {
        escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
        _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^~+(?=\S)([\s\S]*?\S)~+/,
        text: /^(`+|[^`])(?:[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?= {2,}\n|[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
      });
      inline.gfm.url = edit$1(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
      /**
       * GFM + Line Breaks Inline Grammar
       */

      inline.breaks = merge$1({}, inline.gfm, {
        br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
        text: edit$1(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
      });
      var rules = {
        block: block,
        inline: inline
      };

      var defaults$2 = defaults.defaults;
      var block$1 = rules.block,
          inline$1 = rules.inline;
      /**
       * smartypants text replacement
       */

      function smartypants(text) {
        return text // em-dashes
        .replace(/---/g, "\u2014") // en-dashes
        .replace(/--/g, "\u2013") // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
        .replace(/'/g, "\u2019") // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
        .replace(/"/g, "\u201D") // ellipses
        .replace(/\.{3}/g, "\u2026");
      }
      /**
       * mangle email addresses
       */


      function mangle(text) {
        var out = '',
            i,
            ch;
        var l = text.length;

        for (i = 0; i < l; i++) {
          ch = text.charCodeAt(i);

          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }

          out += '&#' + ch + ';';
        }

        return out;
      }
      /**
       * Block Lexer
       */


      var Lexer_1 = /*#__PURE__*/function () {
        function Lexer(options) {
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || defaults$2;
          this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          var rules = {
            block: block$1.normal,
            inline: inline$1.normal
          };

          if (this.options.pedantic) {
            rules.block = block$1.pedantic;
            rules.inline = inline$1.pedantic;
          } else if (this.options.gfm) {
            rules.block = block$1.gfm;

            if (this.options.breaks) {
              rules.inline = inline$1.breaks;
            } else {
              rules.inline = inline$1.gfm;
            }
          }

          this.tokenizer.rules = rules;
        }
        /**
         * Expose Rules
         */


        /**
         * Static Lex Method
         */
        Lexer.lex = function lex(src, options) {
          var lexer = new Lexer(options);
          return lexer.lex(src);
        }
        /**
         * Preprocessing
         */
        ;

        var _proto = Lexer.prototype;

        _proto.lex = function lex(src) {
          src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
          this.blockTokens(src, this.tokens, true);
          this.inline(this.tokens);
          return this.tokens;
        }
        /**
         * Lexing
         */
        ;

        _proto.blockTokens = function blockTokens(src, tokens, top) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (top === void 0) {
            top = true;
          }

          src = src.replace(/^ +$/gm, '');
          var token, i, l, lastToken;

          while (src) {
            // newline
            if (token = this.tokenizer.space(src)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              }

              continue;
            } // code


            if (token = this.tokenizer.code(src, tokens)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              } else {
                lastToken = tokens[tokens.length - 1];
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              }

              continue;
            } // fences


            if (token = this.tokenizer.fences(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // heading


            if (token = this.tokenizer.heading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // table no leading pipe (gfm)


            if (token = this.tokenizer.nptable(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // hr


            if (token = this.tokenizer.hr(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // blockquote


            if (token = this.tokenizer.blockquote(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.blockTokens(token.text, [], top);
              tokens.push(token);
              continue;
            } // list


            if (token = this.tokenizer.list(src)) {
              src = src.substring(token.raw.length);
              l = token.items.length;

              for (i = 0; i < l; i++) {
                token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
              }

              tokens.push(token);
              continue;
            } // html


            if (token = this.tokenizer.html(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // def


            if (top && (token = this.tokenizer.def(src))) {
              src = src.substring(token.raw.length);

              if (!this.tokens.links[token.tag]) {
                this.tokens.links[token.tag] = {
                  href: token.href,
                  title: token.title
                };
              }

              continue;
            } // table (gfm)


            if (token = this.tokenizer.table(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // lheading


            if (token = this.tokenizer.lheading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // top-level paragraph


            if (top && (token = this.tokenizer.paragraph(src))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.text(src, tokens)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              } else {
                lastToken = tokens[tokens.length - 1];
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _proto.inline = function inline(tokens) {
          var i, j, k, l2, row, token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'paragraph':
              case 'text':
              case 'heading':
                {
                  token.tokens = [];
                  this.inlineTokens(token.text, token.tokens);
                  break;
                }

              case 'table':
                {
                  token.tokens = {
                    header: [],
                    cells: []
                  }; // header

                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    token.tokens.header[j] = [];
                    this.inlineTokens(token.header[j], token.tokens.header[j]);
                  } // cells


                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.cells[j];
                    token.tokens.cells[j] = [];

                    for (k = 0; k < row.length; k++) {
                      token.tokens.cells[j][k] = [];
                      this.inlineTokens(row[k], token.tokens.cells[j][k]);
                    }
                  }

                  break;
                }

              case 'blockquote':
                {
                  this.inline(token.tokens);
                  break;
                }

              case 'list':
                {
                  l2 = token.items.length;

                  for (j = 0; j < l2; j++) {
                    this.inline(token.items[j].tokens);
                  }

                  break;
                }
            }
          }

          return tokens;
        }
        /**
         * Lexing/Compiling
         */
        ;

        _proto.inlineTokens = function inlineTokens(src, tokens, inLink, inRawBlock, prevChar) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (inLink === void 0) {
            inLink = false;
          }

          if (inRawBlock === void 0) {
            inRawBlock = false;
          }

          if (prevChar === void 0) {
            prevChar = '';
          }

          var token; // String with links masked to avoid interference with em and strong

          var maskedSrc = src;
          var match; // Mask out reflinks

          if (this.tokens.links) {
            var links = Object.keys(this.tokens.links);

            if (links.length > 0) {
              while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                  maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                }
              }
            }
          } // Mask out other blocks


          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + 'a'.repeat(match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          }

          while (src) {
            // escape
            if (token = this.tokenizer.escape(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // tag


            if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
              src = src.substring(token.raw.length);
              inLink = token.inLink;
              inRawBlock = token.inRawBlock;
              tokens.push(token);
              continue;
            } // link


            if (token = this.tokenizer.link(src)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // reflink, nolink


            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // strong


            if (token = this.tokenizer.strong(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // em


            if (token = this.tokenizer.em(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // code


            if (token = this.tokenizer.codespan(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // br


            if (token = this.tokenizer.br(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // del (gfm)


            if (token = this.tokenizer.del(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // autolink


            if (token = this.tokenizer.autolink(src, mangle)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // url (gfm)


            if (!inLink && (token = this.tokenizer.url(src, mangle))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
              src = src.substring(token.raw.length);
              prevChar = token.raw.slice(-1);
              tokens.push(token);
              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _createClass(Lexer, null, [{
          key: "rules",
          get: function get() {
            return {
              block: block$1,
              inline: inline$1
            };
          }
        }]);

        return Lexer;
      }();

      var defaults$3 = defaults.defaults;
      var cleanUrl$1 = helpers.cleanUrl,
          escape$1 = helpers.escape;
      /**
       * Renderer
       */

      var Renderer_1 = /*#__PURE__*/function () {
        function Renderer(options) {
          this.options = options || defaults$3;
        }

        var _proto = Renderer.prototype;

        _proto.code = function code(_code, infostring, escaped) {
          var lang = (infostring || '').match(/\S*/)[0];

          if (this.options.highlight) {
            var out = this.options.highlight(_code, lang);

            if (out != null && out !== _code) {
              escaped = true;
              _code = out;
            }
          }

          if (!lang) {
            return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
          }

          return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
        };

        _proto.blockquote = function blockquote(quote) {
          return '<blockquote>\n' + quote + '</blockquote>\n';
        };

        _proto.html = function html(_html) {
          return _html;
        };

        _proto.heading = function heading(text, level, raw, slugger) {
          if (this.options.headerIds) {
            return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
          } // ignore IDs


          return '<h' + level + '>' + text + '</h' + level + '>\n';
        };

        _proto.hr = function hr() {
          return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
        };

        _proto.list = function list(body, ordered, start) {
          var type = ordered ? 'ol' : 'ul',
              startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
          return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
        };

        _proto.listitem = function listitem(text) {
          return '<li>' + text + '</li>\n';
        };

        _proto.checkbox = function checkbox(checked) {
          return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
        };

        _proto.paragraph = function paragraph(text) {
          return '<p>' + text + '</p>\n';
        };

        _proto.table = function table(header, body) {
          if (body) body = '<tbody>' + body + '</tbody>';
          return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
        };

        _proto.tablerow = function tablerow(content) {
          return '<tr>\n' + content + '</tr>\n';
        };

        _proto.tablecell = function tablecell(content, flags) {
          var type = flags.header ? 'th' : 'td';
          var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
          return tag + content + '</' + type + '>\n';
        } // span level renderer
        ;

        _proto.strong = function strong(text) {
          return '<strong>' + text + '</strong>';
        };

        _proto.em = function em(text) {
          return '<em>' + text + '</em>';
        };

        _proto.codespan = function codespan(text) {
          return '<code>' + text + '</code>';
        };

        _proto.br = function br() {
          return this.options.xhtml ? '<br/>' : '<br>';
        };

        _proto.del = function del(text) {
          return '<del>' + text + '</del>';
        };

        _proto.link = function link(href, title, text) {
          href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<a href="' + escape$1(href) + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += '>' + text + '</a>';
          return out;
        };

        _proto.image = function image(href, title, text) {
          href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<img src="' + href + '" alt="' + text + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        return Renderer;
      }();

      /**
       * TextRenderer
       * returns only the textual part of the token
       */
      var TextRenderer_1 = /*#__PURE__*/function () {
        function TextRenderer() {}

        var _proto = TextRenderer.prototype;

        // no need for block level renderers
        _proto.strong = function strong(text) {
          return text;
        };

        _proto.em = function em(text) {
          return text;
        };

        _proto.codespan = function codespan(text) {
          return text;
        };

        _proto.del = function del(text) {
          return text;
        };

        _proto.html = function html(text) {
          return text;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        _proto.link = function link(href, title, text) {
          return '' + text;
        };

        _proto.image = function image(href, title, text) {
          return '' + text;
        };

        _proto.br = function br() {
          return '';
        };

        return TextRenderer;
      }();

      /**
       * Slugger generates header id
       */
      var Slugger_1 = /*#__PURE__*/function () {
        function Slugger() {
          this.seen = {};
        }
        /**
         * Convert string to unique id
         */


        var _proto = Slugger.prototype;

        _proto.slug = function slug(value) {
          var slug = value.toLowerCase().trim() // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');

          if (this.seen.hasOwnProperty(slug)) {
            var originalSlug = slug;

            do {
              this.seen[originalSlug]++;
              slug = originalSlug + '-' + this.seen[originalSlug];
            } while (this.seen.hasOwnProperty(slug));
          }

          this.seen[slug] = 0;
          return slug;
        };

        return Slugger;
      }();

      var defaults$4 = defaults.defaults;
      var unescape$1 = helpers.unescape;
      /**
       * Parsing & Compiling
       */

      var Parser_1 = /*#__PURE__*/function () {
        function Parser(options) {
          this.options = options || defaults$4;
          this.options.renderer = this.options.renderer || new Renderer_1();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.textRenderer = new TextRenderer_1();
          this.slugger = new Slugger_1();
        }
        /**
         * Static Parse Method
         */


        Parser.parse = function parse(tokens, options) {
          var parser = new Parser(options);
          return parser.parse(tokens);
        }
        /**
         * Parse Loop
         */
        ;

        var _proto = Parser.prototype;

        _proto.parse = function parse(tokens, top) {
          if (top === void 0) {
            top = true;
          }

          var out = '',
              i,
              j,
              k,
              l2,
              l3,
              row,
              cell,
              header,
              body,
              token,
              ordered,
              start,
              loose,
              itemBody,
              item,
              checked,
              task,
              checkbox;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'space':
                {
                  continue;
                }

              case 'hr':
                {
                  out += this.renderer.hr();
                  continue;
                }

              case 'heading':
                {
                  out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape$1(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
                  continue;
                }

              case 'code':
                {
                  out += this.renderer.code(token.text, token.lang, token.escaped);
                  continue;
                }

              case 'table':
                {
                  header = ''; // header

                  cell = '';
                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    cell += this.renderer.tablecell(this.parseInline(token.tokens.header[j]), {
                      header: true,
                      align: token.align[j]
                    });
                  }

                  header += this.renderer.tablerow(cell);
                  body = '';
                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.tokens.cells[j];
                    cell = '';
                    l3 = row.length;

                    for (k = 0; k < l3; k++) {
                      cell += this.renderer.tablecell(this.parseInline(row[k]), {
                        header: false,
                        align: token.align[k]
                      });
                    }

                    body += this.renderer.tablerow(cell);
                  }

                  out += this.renderer.table(header, body);
                  continue;
                }

              case 'blockquote':
                {
                  body = this.parse(token.tokens);
                  out += this.renderer.blockquote(body);
                  continue;
                }

              case 'list':
                {
                  ordered = token.ordered;
                  start = token.start;
                  loose = token.loose;
                  l2 = token.items.length;
                  body = '';

                  for (j = 0; j < l2; j++) {
                    item = token.items[j];
                    checked = item.checked;
                    task = item.task;
                    itemBody = '';

                    if (item.task) {
                      checkbox = this.renderer.checkbox(checked);

                      if (loose) {
                        if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                            item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                          }
                        } else {
                          item.tokens.unshift({
                            type: 'text',
                            text: checkbox
                          });
                        }
                      } else {
                        itemBody += checkbox;
                      }
                    }

                    itemBody += this.parse(item.tokens, loose);
                    body += this.renderer.listitem(itemBody, task, checked);
                  }

                  out += this.renderer.list(body, ordered, start);
                  continue;
                }

              case 'html':
                {
                  // TODO parse inline content if parameter markdown=1
                  out += this.renderer.html(token.text);
                  continue;
                }

              case 'paragraph':
                {
                  out += this.renderer.paragraph(this.parseInline(token.tokens));
                  continue;
                }

              case 'text':
                {
                  body = token.tokens ? this.parseInline(token.tokens) : token.text;

                  while (i + 1 < l && tokens[i + 1].type === 'text') {
                    token = tokens[++i];
                    body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
                  }

                  out += top ? this.renderer.paragraph(body) : body;
                  continue;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        }
        /**
         * Parse Inline Tokens
         */
        ;

        _proto.parseInline = function parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          var out = '',
              i,
              token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'escape':
                {
                  out += renderer.text(token.text);
                  break;
                }

              case 'html':
                {
                  out += renderer.html(token.text);
                  break;
                }

              case 'link':
                {
                  out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'image':
                {
                  out += renderer.image(token.href, token.title, token.text);
                  break;
                }

              case 'strong':
                {
                  out += renderer.strong(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'em':
                {
                  out += renderer.em(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'codespan':
                {
                  out += renderer.codespan(token.text);
                  break;
                }

              case 'br':
                {
                  out += renderer.br();
                  break;
                }

              case 'del':
                {
                  out += renderer.del(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'text':
                {
                  out += renderer.text(token.text);
                  break;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        };

        return Parser;
      }();

      var merge$2 = helpers.merge,
          checkSanitizeDeprecation$1 = helpers.checkSanitizeDeprecation,
          escape$2 = helpers.escape;
      var getDefaults = defaults.getDefaults,
          changeDefaults = defaults.changeDefaults,
          defaults$5 = defaults.defaults;
      /**
       * Marked
       */

      function marked(src, opt, callback) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        if (typeof opt === 'function') {
          callback = opt;
          opt = null;
        }

        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);

        if (callback) {
          var highlight = opt.highlight;
          var tokens;

          try {
            tokens = Lexer_1.lex(src, opt);
          } catch (e) {
            return callback(e);
          }

          var done = function done(err) {
            var out;

            if (!err) {
              try {
                out = Parser_1.parse(tokens, opt);
              } catch (e) {
                err = e;
              }
            }

            opt.highlight = highlight;
            return err ? callback(err) : callback(null, out);
          };

          if (!highlight || highlight.length < 3) {
            return done();
          }

          delete opt.highlight;
          if (!tokens.length) return done();
          var pending = 0;
          marked.walkTokens(tokens, function (token) {
            if (token.type === 'code') {
              pending++;
              setTimeout(function () {
                highlight(token.text, token.lang, function (err, code) {
                  if (err) {
                    return done(err);
                  }

                  if (code != null && code !== token.text) {
                    token.text = code;
                    token.escaped = true;
                  }

                  pending--;

                  if (pending === 0) {
                    done();
                  }
                });
              }, 0);
            }
          });

          if (pending === 0) {
            done();
          }

          return;
        }

        try {
          var _tokens = Lexer_1.lex(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(_tokens, opt.walkTokens);
          }

          return Parser_1.parse(_tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      }
      /**
       * Options
       */


      marked.options = marked.setOptions = function (opt) {
        merge$2(marked.defaults, opt);
        changeDefaults(marked.defaults);
        return marked;
      };

      marked.getDefaults = getDefaults;
      marked.defaults = defaults$5;
      /**
       * Use Extension
       */

      marked.use = function (extension) {
        var opts = merge$2({}, extension);

        if (extension.renderer) {
          (function () {
            var renderer = marked.defaults.renderer || new Renderer_1();

            var _loop = function _loop(prop) {
              var prevRenderer = renderer[prop];

              renderer[prop] = function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                var ret = extension.renderer[prop].apply(renderer, args);

                if (ret === false) {
                  ret = prevRenderer.apply(renderer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.renderer) {
              _loop(prop);
            }

            opts.renderer = renderer;
          })();
        }

        if (extension.tokenizer) {
          (function () {
            var tokenizer = marked.defaults.tokenizer || new Tokenizer_1();

            var _loop2 = function _loop2(prop) {
              var prevTokenizer = tokenizer[prop];

              tokenizer[prop] = function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                var ret = extension.tokenizer[prop].apply(tokenizer, args);

                if (ret === false) {
                  ret = prevTokenizer.apply(tokenizer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.tokenizer) {
              _loop2(prop);
            }

            opts.tokenizer = tokenizer;
          })();
        }

        if (extension.walkTokens) {
          var walkTokens = marked.defaults.walkTokens;

          opts.walkTokens = function (token) {
            extension.walkTokens(token);

            if (walkTokens) {
              walkTokens(token);
            }
          };
        }

        marked.setOptions(opts);
      };
      /**
       * Run callback for every token
       */


      marked.walkTokens = function (tokens, callback) {
        for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
          var token = _step.value;
          callback(token);

          switch (token.type) {
            case 'table':
              {
                for (var _iterator2 = _createForOfIteratorHelperLoose(token.tokens.header), _step2; !(_step2 = _iterator2()).done;) {
                  var cell = _step2.value;
                  marked.walkTokens(cell, callback);
                }

                for (var _iterator3 = _createForOfIteratorHelperLoose(token.tokens.cells), _step3; !(_step3 = _iterator3()).done;) {
                  var row = _step3.value;

                  for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                    var _cell = _step4.value;
                    marked.walkTokens(_cell, callback);
                  }
                }

                break;
              }

            case 'list':
              {
                marked.walkTokens(token.items, callback);
                break;
              }

            default:
              {
                if (token.tokens) {
                  marked.walkTokens(token.tokens, callback);
                }
              }
          }
        }
      };
      /**
       * Expose
       */


      marked.Parser = Parser_1;
      marked.parser = Parser_1.parse;
      marked.Renderer = Renderer_1;
      marked.TextRenderer = TextRenderer_1;
      marked.Lexer = Lexer_1;
      marked.lexer = Lexer_1.lex;
      marked.Tokenizer = Tokenizer_1;
      marked.Slugger = Slugger_1;
      marked.parse = marked;
      var marked_1 = marked;

      return marked_1;

    })));
    });

    /* src/components/shared/Markdown/Markdown.svelte generated by Svelte v3.25.0 */
    const file$b = "src/components/shared/Markdown/Markdown.svelte";

    // (97:0) {#if markdown}
    function create_if_block$3(ctx) {
    	let section;
    	let raw_value = marked(/*markdown*/ ctx[0]) + "";
    	let section_class_value;

    	let section_levels = [
    		{
    			class: section_class_value = "" + (/*columnClass*/ ctx[2] + " page")
    		},
    		/*props*/ ctx[1]
    	];

    	let section_data = {};

    	for (let i = 0; i < section_levels.length; i += 1) {
    		section_data = assign(section_data, section_levels[i]);
    	}

    	const block = {
    		c: function create() {
    			section = element("section");
    			set_attributes(section, section_data);
    			toggle_class(section, "svelte-1lcd2mm", true);
    			add_location(section, file$b, 98, 0, 1708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, section, anchor);
    			section.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*markdown*/ 1 && raw_value !== (raw_value = marked(/*markdown*/ ctx[0]) + "")) section.innerHTML = raw_value;
    			set_attributes(section, section_data = get_spread_update(section_levels, [
    				dirty & /*columnClass*/ 4 && section_class_value !== (section_class_value = "" + (/*columnClass*/ ctx[2] + " page")) && { class: section_class_value },
    				dirty & /*props*/ 2 && /*props*/ ctx[1]
    			]));

    			toggle_class(section, "svelte-1lcd2mm", true);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(97:0) {#if markdown}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$e(ctx) {
    	let if_block_anchor;
    	let if_block = /*markdown*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*markdown*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Markdown", slots, []);
    	let { markdownFile } = $$props;
    	let { markdown } = $$props;

    	if (!markdown) {
    		fetch(markdownFile).then(response => response.text().then(data => $$invalidate(0, markdown = data)));
    	}

    	let { props = {} } = $$props;
    	let { columns = 2 } = $$props;
    	let columnClass = "two-column-content";

    	let lookup = {
    		1: "single-column-content",
    		2: "two-column-content",
    		3: "three-column-content",
    		4: "four-column-content",
    		"not-found": "two-column-content"
    	};

    	if (columns in lookup) {
    		columnClass = lookup[columns];
    	}

    	window.scrollTo(0, 0);
    	const writable_props = ["markdownFile", "markdown", "props", "columns"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Markdown> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("markdownFile" in $$props) $$invalidate(3, markdownFile = $$props.markdownFile);
    		if ("markdown" in $$props) $$invalidate(0, markdown = $$props.markdown);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("columns" in $$props) $$invalidate(4, columns = $$props.columns);
    	};

    	$$self.$capture_state = () => ({
    		marked,
    		markdownFile,
    		markdown,
    		props,
    		columns,
    		columnClass,
    		lookup
    	});

    	$$self.$inject_state = $$props => {
    		if ("markdownFile" in $$props) $$invalidate(3, markdownFile = $$props.markdownFile);
    		if ("markdown" in $$props) $$invalidate(0, markdown = $$props.markdown);
    		if ("props" in $$props) $$invalidate(1, props = $$props.props);
    		if ("columns" in $$props) $$invalidate(4, columns = $$props.columns);
    		if ("columnClass" in $$props) $$invalidate(2, columnClass = $$props.columnClass);
    		if ("lookup" in $$props) lookup = $$props.lookup;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [markdown, props, columnClass, markdownFile, columns];
    }

    class Markdown extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {
    			markdownFile: 3,
    			markdown: 0,
    			props: 1,
    			columns: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Markdown",
    			options,
    			id: create_fragment$e.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*markdownFile*/ ctx[3] === undefined && !("markdownFile" in props)) {
    			console.warn("<Markdown> was created without expected prop 'markdownFile'");
    		}

    		if (/*markdown*/ ctx[0] === undefined && !("markdown" in props)) {
    			console.warn("<Markdown> was created without expected prop 'markdown'");
    		}
    	}

    	get markdownFile() {
    		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markdownFile(value) {
    		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get markdown() {
    		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set markdown(value) {
    		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get props() {
    		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set props(value) {
    		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get columns() {
    		throw new Error("<Markdown>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set columns(value) {
    		throw new Error("<Markdown>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/SRD/SRD.svelte generated by Svelte v3.25.0 */
    const file$c = "src/components/SRD/SRD.svelte";

    // (43:8) {#if tocMarkdown}
    function create_if_block_1(ctx) {
    	let html_tag;
    	let raw_value = marked(/*tocMarkdown*/ ctx[1]) + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_anchor = empty();
    			html_tag = new HtmlTag(html_anchor);
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*tocMarkdown*/ 2 && raw_value !== (raw_value = marked(/*tocMarkdown*/ ctx[1]) + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(43:8) {#if tocMarkdown}",
    		ctx
    	});

    	return block;
    }

    // (48:8) {#if srdMarkdown}
    function create_if_block$4(ctx) {
    	let markdown;
    	let current;

    	markdown = new Markdown({
    			props: {
    				markdown: /*srdMarkdown*/ ctx[0],
    				columns: "1",
    				props: { style: "line-height:1.2rem;" }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(markdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(markdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const markdown_changes = {};
    			if (dirty & /*srdMarkdown*/ 1) markdown_changes.markdown = /*srdMarkdown*/ ctx[0];
    			markdown.$set(markdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(markdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(markdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(markdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(48:8) {#if srdMarkdown}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$f(ctx) {
    	let div0;
    	let h2;
    	let t1;
    	let t2;
    	let div1;
    	let current;
    	let if_block0 = /*tocMarkdown*/ ctx[1] && create_if_block_1(ctx);
    	let if_block1 = /*srdMarkdown*/ ctx[0] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h2 = element("h2");
    			h2.textContent = "Table of Contents";
    			t1 = space();
    			if (if_block0) if_block0.c();
    			t2 = space();
    			div1 = element("div");
    			if (if_block1) if_block1.c();
    			add_location(h2, file$c, 41, 8, 1029);
    			attr_dev(div0, "class", "toc svelte-oxaiv2");
    			add_location(div0, file$c, 40, 4, 1003);
    			add_location(div1, file$c, 46, 4, 1151);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h2);
    			append_dev(div0, t1);
    			if (if_block0) if_block0.m(div0, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);
    			if (if_block1) if_block1.m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*tocMarkdown*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*srdMarkdown*/ ctx[0]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*srdMarkdown*/ 1) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block$4(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (if_block0) if_block0.d();
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("SRD", slots, []);
    	let { srdMarkdown } = $$props;
    	let { tocMarkdown } = $$props;

    	if (!srdMarkdown) {
    		fetch("./md/Fate-Condensed-SRD-CC-BY.md").then(response => response.text().then(data => $$invalidate(0, srdMarkdown = data)));
    	}

    	if (!tocMarkdown) {
    		fetch("./md/SRD-TOC.md").then(response => response.text().then(data => $$invalidate(1, tocMarkdown = data)));
    	}

    	if (window.location.hash) {
    		setTimeout(
    			() => {
    				document.getElementById(window.location.hash.replace("#", "")).scrollIntoView();
    			},
    			250
    		);
    	}

    	const writable_props = ["srdMarkdown", "tocMarkdown"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<SRD> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("srdMarkdown" in $$props) $$invalidate(0, srdMarkdown = $$props.srdMarkdown);
    		if ("tocMarkdown" in $$props) $$invalidate(1, tocMarkdown = $$props.tocMarkdown);
    	};

    	$$self.$capture_state = () => ({
    		marked,
    		Markdown,
    		srdMarkdown,
    		tocMarkdown
    	});

    	$$self.$inject_state = $$props => {
    		if ("srdMarkdown" in $$props) $$invalidate(0, srdMarkdown = $$props.srdMarkdown);
    		if ("tocMarkdown" in $$props) $$invalidate(1, tocMarkdown = $$props.tocMarkdown);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [srdMarkdown, tocMarkdown];
    }

    class SRD extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, { srdMarkdown: 0, tocMarkdown: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SRD",
    			options,
    			id: create_fragment$f.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*srdMarkdown*/ ctx[0] === undefined && !("srdMarkdown" in props)) {
    			console.warn("<SRD> was created without expected prop 'srdMarkdown'");
    		}

    		if (/*tocMarkdown*/ ctx[1] === undefined && !("tocMarkdown" in props)) {
    			console.warn("<SRD> was created without expected prop 'tocMarkdown'");
    		}
    	}

    	get srdMarkdown() {
    		throw new Error("<SRD>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set srdMarkdown(value) {
    		throw new Error("<SRD>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get tocMarkdown() {
    		throw new Error("<SRD>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tocMarkdown(value) {
    		throw new Error("<SRD>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function getNewCharacter() {
        return {
            name: "",
            fate: 3,
            refresh: 3,
            aspects: {
                highConcept: "",
                trouble: "",
                relationship: "",
                otherAspects: ["", ""]
            },
            skills: [
                {name: "Academics", value: 0},
                {name: "Athletics", value: 0},
                {name: "Burglary", value: 0},
                {name: "Contacts", value: 0},
                {name: "Crafts", value: 0},
                {name: "Deceive", value: 0},
                {name: "Drive", value: 0},
                {name: "Empathy", value: 0},
                {name: "Fight", value: 0},
                {name: "Investigate", value: 0},
                {name: "Lore", value: 0},
                {name: "Notice", value: 0},
                {name: "Physique", value: 0},
                {name: "Provoke", value: 0},
                {name: "Rapport", value: 0},
                {name: "Resources", value: 0},
                {name: "Shoot", value: 0},
                {name: "Stealth", value: 0},
                {name: "Will", value: 0}
            ],
            stunts: [
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""},
                {name: "", description: ""}
            ],
            vitals: {
                physicalStressTaken: 0,
                mentalStressTaken: 0,
                consequences: {
                    mild1: "",
                    moderate: "",
                    severe: "",
                    mild2: "",
                }
            }
        };
    }

    var FileSaver_min = createCommonjsModule(function (module, exports) {
    (function(a,b){b();})(commonjsGlobal,function(){function b(a,b){return "undefined"==typeof b?b={autoBom:!1}:"object"!=typeof b&&(console.warn("Deprecated: Expected third argument to be a object"),b={autoBom:!b}),b.autoBom&&/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a.type)?new Blob(["\uFEFF",a],{type:a.type}):a}function c(b,c,d){var e=new XMLHttpRequest;e.open("GET",b),e.responseType="blob",e.onload=function(){a(e.response,c,d);},e.onerror=function(){console.error("could not download file");},e.send();}function d(a){var b=new XMLHttpRequest;b.open("HEAD",a,!1);try{b.send();}catch(a){}return 200<=b.status&&299>=b.status}function e(a){try{a.dispatchEvent(new MouseEvent("click"));}catch(c){var b=document.createEvent("MouseEvents");b.initMouseEvent("click",!0,!0,window,0,0,0,80,20,!1,!1,!1,!1,0,null),a.dispatchEvent(b);}}var f="object"==typeof window&&window.window===window?window:"object"==typeof self&&self.self===self?self:"object"==typeof commonjsGlobal&&commonjsGlobal.global===commonjsGlobal?commonjsGlobal:void 0,a=f.saveAs||("object"!=typeof window||window!==f?function(){}:"download"in HTMLAnchorElement.prototype?function(b,g,h){var i=f.URL||f.webkitURL,j=document.createElement("a");g=g||b.name||"download",j.download=g,j.rel="noopener","string"==typeof b?(j.href=b,j.origin===location.origin?e(j):d(j.href)?c(b,g,h):e(j,j.target="_blank")):(j.href=i.createObjectURL(b),setTimeout(function(){i.revokeObjectURL(j.href);},4E4),setTimeout(function(){e(j);},0));}:"msSaveOrOpenBlob"in navigator?function(f,g,h){if(g=g||f.name||"download","string"!=typeof f)navigator.msSaveOrOpenBlob(b(f,h),g);else if(d(f))c(f,g,h);else {var i=document.createElement("a");i.href=f,i.target="_blank",setTimeout(function(){e(i);});}}:function(a,b,d,e){if(e=e||open("","_blank"),e&&(e.document.title=e.document.body.innerText="downloading..."),"string"==typeof a)return c(a,b,d);var g="application/octet-stream"===a.type,h=/constructor/i.test(f.HTMLElement)||f.safari,i=/CriOS\/[\d]+/.test(navigator.userAgent);if((i||g&&h)&&"object"==typeof FileReader){var j=new FileReader;j.onloadend=function(){var a=j.result;a=i?a:a.replace(/^data:[^;]*;/,"data:attachment/file;"),e?e.location.href=a:location=a,e=null;},j.readAsDataURL(a);}else {var k=f.URL||f.webkitURL,l=k.createObjectURL(a);e?e.location=l:location.href=l,e=null,setTimeout(function(){k.revokeObjectURL(l);},4E4);}});f.saveAs=a.saveAs=a,(module.exports=a);});


    });

    var COMMON_MIME_TYPES = new Map([
        ['avi', 'video/avi'],
        ['gif', 'image/gif'],
        ['ico', 'image/x-icon'],
        ['jpeg', 'image/jpeg'],
        ['jpg', 'image/jpeg'],
        ['mkv', 'video/x-matroska'],
        ['mov', 'video/quicktime'],
        ['mp4', 'video/mp4'],
        ['pdf', 'application/pdf'],
        ['png', 'image/png'],
        ['zip', 'application/zip'],
        ['doc', 'application/msword'],
        ['docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ]);
    function toFileWithPath(file, path) {
        var f = withMimeType(file);
        if (typeof f.path !== 'string') { // on electron, path is already set to the absolute path
            var webkitRelativePath = file.webkitRelativePath;
            Object.defineProperty(f, 'path', {
                value: typeof path === 'string'
                    ? path
                    // If <input webkitdirectory> is set,
                    // the File will have a {webkitRelativePath} property
                    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
                    : typeof webkitRelativePath === 'string' && webkitRelativePath.length > 0
                        ? webkitRelativePath
                        : file.name,
                writable: false,
                configurable: false,
                enumerable: true
            });
        }
        return f;
    }
    function withMimeType(file) {
        var name = file.name;
        var hasExtension = name && name.lastIndexOf('.') !== -1;
        if (hasExtension && !file.type) {
            var ext = name.split('.')
                .pop().toLowerCase();
            var type = COMMON_MIME_TYPES.get(ext);
            if (type) {
                Object.defineProperty(file, 'type', {
                    value: type,
                    writable: false,
                    configurable: false,
                    enumerable: true
                });
            }
        }
        return file;
    }

    var FILES_TO_IGNORE = [
        // Thumbnail cache files for macOS and Windows
        '.DS_Store',
        'Thumbs.db' // Windows
    ];
    /**
     * Convert a DragEvent's DataTrasfer object to a list of File objects
     * NOTE: If some of the items are folders,
     * everything will be flattened and placed in the same list but the paths will be kept as a {path} property.
     * @param evt
     */
    function fromEvent(evt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, isDragEvt(evt) && evt.dataTransfer
                        ? getDataTransferFiles(evt.dataTransfer, evt.type)
                        : getInputFiles(evt)];
            });
        });
    }
    function isDragEvt(value) {
        return !!value.dataTransfer;
    }
    function getInputFiles(evt) {
        var files = isInput(evt.target)
            ? evt.target.files
                ? fromList(evt.target.files)
                : []
            : [];
        return files.map(function (file) { return toFileWithPath(file); });
    }
    function isInput(value) {
        return value !== null;
    }
    function getDataTransferFiles(dt, type) {
        return __awaiter(this, void 0, void 0, function () {
            var items, files;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!dt.items) return [3 /*break*/, 2];
                        items = fromList(dt.items)
                            .filter(function (item) { return item.kind === 'file'; });
                        // According to https://html.spec.whatwg.org/multipage/dnd.html#dndevents,
                        // only 'dragstart' and 'drop' has access to the data (source node)
                        if (type !== 'drop') {
                            return [2 /*return*/, items];
                        }
                        return [4 /*yield*/, Promise.all(items.map(toFilePromises))];
                    case 1:
                        files = _a.sent();
                        return [2 /*return*/, noIgnoredFiles(flatten(files))];
                    case 2: return [2 /*return*/, noIgnoredFiles(fromList(dt.files)
                            .map(function (file) { return toFileWithPath(file); }))];
                }
            });
        });
    }
    function noIgnoredFiles(files) {
        return files.filter(function (file) { return FILES_TO_IGNORE.indexOf(file.name) === -1; });
    }
    // IE11 does not support Array.from()
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from#Browser_compatibility
    // https://developer.mozilla.org/en-US/docs/Web/API/FileList
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItemList
    function fromList(items) {
        var files = [];
        // tslint:disable: prefer-for-of
        for (var i = 0; i < items.length; i++) {
            var file = items[i];
            files.push(file);
        }
        return files;
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/DataTransferItem
    function toFilePromises(item) {
        if (typeof item.webkitGetAsEntry !== 'function') {
            return fromDataTransferItem(item);
        }
        var entry = item.webkitGetAsEntry();
        // Safari supports dropping an image node from a different window and can be retrieved using
        // the DataTransferItem.getAsFile() API
        // NOTE: FileSystemEntry.file() throws if trying to get the file
        if (entry && entry.isDirectory) {
            return fromDirEntry(entry);
        }
        return fromDataTransferItem(item);
    }
    function flatten(items) {
        return items.reduce(function (acc, files) { return __spread(acc, (Array.isArray(files) ? flatten(files) : [files])); }, []);
    }
    function fromDataTransferItem(item) {
        var file = item.getAsFile();
        if (!file) {
            return Promise.reject(item + " is not a File");
        }
        var fwp = toFileWithPath(file);
        return Promise.resolve(fwp);
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemEntry
    function fromEntry(entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, entry.isDirectory ? fromDirEntry(entry) : fromFileEntry(entry)];
            });
        });
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry
    function fromDirEntry(entry) {
        var reader = entry.createReader();
        return new Promise(function (resolve, reject) {
            var entries = [];
            function readEntries() {
                var _this = this;
                // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryEntry/createReader
                // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemDirectoryReader/readEntries
                reader.readEntries(function (batch) { return __awaiter(_this, void 0, void 0, function () {
                    var files, err_1, items;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!!batch.length) return [3 /*break*/, 5];
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 3, , 4]);
                                return [4 /*yield*/, Promise.all(entries)];
                            case 2:
                                files = _a.sent();
                                resolve(files);
                                return [3 /*break*/, 4];
                            case 3:
                                err_1 = _a.sent();
                                reject(err_1);
                                return [3 /*break*/, 4];
                            case 4: return [3 /*break*/, 6];
                            case 5:
                                items = Promise.all(batch.map(fromEntry));
                                entries.push(items);
                                // Continue reading
                                readEntries();
                                _a.label = 6;
                            case 6: return [2 /*return*/];
                        }
                    });
                }); }, function (err) {
                    reject(err);
                });
            }
            readEntries();
        });
    }
    // https://developer.mozilla.org/en-US/docs/Web/API/FileSystemFileEntry
    function fromFileEntry(entry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        entry.file(function (file) {
                            var fwp = toFileWithPath(file, entry.fullPath);
                            resolve(fwp);
                        }, function (err) {
                            reject(err);
                        });
                    })];
            });
        });
    }

    var es = createCommonjsModule(function (module, exports) {

    exports.__esModule = true;

    exports.default = function (file, acceptedFiles) {
      if (file && acceptedFiles) {
        var acceptedFilesArray = Array.isArray(acceptedFiles) ? acceptedFiles : acceptedFiles.split(',');
        var fileName = file.name || '';
        var mimeType = file.type || '';
        var baseMimeType = mimeType.replace(/\/.*$/, '');
        return acceptedFilesArray.some(function (type) {
          var validType = type.trim();

          if (validType.charAt(0) === '.') {
            return fileName.toLowerCase().endsWith(validType.toLowerCase());
          } else if (validType.endsWith('/*')) {
            // This is something like a image/* mime type
            return baseMimeType === validType.replace(/\/.*$/, '');
          }

          return mimeType === validType;
        });
      }

      return true;
    };
    });

    var accepts = unwrapExports(es);

    // Error codes
    const FILE_INVALID_TYPE = "file-invalid-type";
    const FILE_TOO_LARGE = "file-too-large";
    const FILE_TOO_SMALL = "file-too-small";
    const TOO_MANY_FILES = "too-many-files";

    // File Errors
    const getInvalidTypeRejectionErr = (accept) => {
      accept = Array.isArray(accept) && accept.length === 1 ? accept[0] : accept;
      const messageSuffix = Array.isArray(accept)
        ? `one of ${accept.join(", ")}`
        : accept;
      return {
        code: FILE_INVALID_TYPE,
        message: `File type must be ${messageSuffix}`,
      };
    };

    const getTooLargeRejectionErr = (maxSize) => {
      return {
        code: FILE_TOO_LARGE,
        message: `File is larger than ${maxSize} bytes`,
      };
    };

    const getTooSmallRejectionErr = (minSize) => {
      return {
        code: FILE_TOO_SMALL,
        message: `File is smaller than ${minSize} bytes`,
      };
    };

    const TOO_MANY_FILES_REJECTION = {
      code: TOO_MANY_FILES,
      message: "Too many files",
    };

    // Firefox versions prior to 53 return a bogus MIME type for every file drag, so dragovers with
    // that MIME type will always be accepted
    function fileAccepted(file, accept) {
      const isAcceptable =
        file.type === "application/x-moz-file" || accepts(file, accept);
      return [
        isAcceptable,
        isAcceptable ? null : getInvalidTypeRejectionErr(accept),
      ];
    }

    function fileMatchSize(file, minSize, maxSize) {
      if (isDefined(file.size)) {
        if (isDefined(minSize) && isDefined(maxSize)) {
          if (file.size > maxSize) return [false, getTooLargeRejectionErr(maxSize)];
          if (file.size < minSize) return [false, getTooSmallRejectionErr(minSize)];
        } else if (isDefined(minSize) && file.size < minSize)
          return [false, getTooSmallRejectionErr(minSize)];
        else if (isDefined(maxSize) && file.size > maxSize)
          return [false, getTooLargeRejectionErr(maxSize)];
      }
      return [true, null];
    }

    function isDefined(value) {
      return value !== undefined && value !== null;
    }

    function allFilesAccepted({
      files,
      accept,
      minSize,
      maxSize,
      multiple,
    }) {
      if (!multiple && files.length > 1) {
        return false;
      }

      return files.every((file) => {
        const [accepted] = fileAccepted(file, accept);
        const [sizeMatch] = fileMatchSize(file, minSize, maxSize);
        return accepted && sizeMatch;
      });
    }

    // React's synthetic events has event.isPropagationStopped,
    // but to remain compatibility with other libs (Preact) fall back
    // to check event.cancelBubble
    function isPropagationStopped(event) {
      if (typeof event.isPropagationStopped === "function") {
        return event.isPropagationStopped();
      } else if (typeof event.cancelBubble !== "undefined") {
        return event.cancelBubble;
      }
      return false;
    }

    function isEvtWithFiles(event) {
      if (!event.dataTransfer) {
        return !!event.target && !!event.target.files;
      }
      // https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer/types
      // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Recommended_drag_types#file
      return Array.prototype.some.call(
        event.dataTransfer.types,
        (type) => type === "Files" || type === "application/x-moz-file"
      );
    }

    // allow the entire document to be a drag target
    function onDocumentDragOver(event) {
      event.preventDefault();
    }

    function isIe(userAgent) {
      return (
        userAgent.indexOf("MSIE") !== -1 || userAgent.indexOf("Trident/") !== -1
      );
    }

    function isEdge(userAgent) {
      return userAgent.indexOf("Edge/") !== -1;
    }

    function isIeOrEdge(userAgent = window.navigator.userAgent) {
      return isIe(userAgent) || isEdge(userAgent);
    }

    /**
     * This is intended to be used to compose event handlers
     * They are executed in order until one of them calls `event.isPropagationStopped()`.
     * Note that the check is done on the first invoke too,
     * meaning that if propagation was stopped before invoking the fns,
     * no handlers will be executed.
     *
     * @param {Function} fns the event hanlder functions
     * @return {Function} the event handler to add to an element
     */
    function composeEventHandlers(...fns) {
      return (event, ...args) =>
        fns.some((fn) => {
          if (!isPropagationStopped(event) && fn) {
            fn(event, ...args);
          }
          return isPropagationStopped(event);
        });
    }

    /* node_modules/svelte-file-dropzone/src/components/Dropzone.svelte generated by Svelte v3.25.0 */
    const file$d = "node_modules/svelte-file-dropzone/src/components/Dropzone.svelte";

    // (349:8)       
    function fallback_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Drag 'n' drop some files here, or click to select files";
    			add_location(p, file$d, 349, 4, 9204);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(349:8)       ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$g(ctx) {
    	let div;
    	let input;
    	let t;
    	let div_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[28].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[27], null);
    	const default_slot_or_fallback = default_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t = space();
    			if (default_slot_or_fallback) default_slot_or_fallback.c();
    			attr_dev(input, "accept", /*accept*/ ctx[0]);
    			input.multiple = /*multiple*/ ctx[1];
    			attr_dev(input, "type", "file");
    			attr_dev(input, "autocomplete", "off");
    			attr_dev(input, "tabindex", "-1");
    			set_style(input, "display", "none");
    			add_location(input, file$d, 338, 2, 8973);
    			attr_dev(div, "class", div_class_value = "" + ((/*disableDefaultStyles*/ ctx[4] ? "" : "dropzone") + "\r\n  " + /*containerClasses*/ ctx[2] + " svelte-4uigcm"));
    			attr_dev(div, "style", /*containerStyles*/ ctx[3]);
    			attr_dev(div, "tabindex", "0");
    			add_location(div, file$d, 324, 0, 8442);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			/*input_binding*/ ctx[29](input);
    			append_dev(div, t);

    			if (default_slot_or_fallback) {
    				default_slot_or_fallback.m(div, null);
    			}

    			/*div_binding*/ ctx[30](div);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*onDropCb*/ ctx[14], false, false, false),
    					listen_dev(input, "click", onInputElementClick, false, false, false),
    					listen_dev(div, "keydown", /*composeKeyboardHandler*/ ctx[16](/*onKeyDownCb*/ ctx[7]), false, false, false),
    					listen_dev(div, "focus", /*composeKeyboardHandler*/ ctx[16](/*onFocusCb*/ ctx[8]), false, false, false),
    					listen_dev(div, "blur", /*composeKeyboardHandler*/ ctx[16](/*onBlurCb*/ ctx[9]), false, false, false),
    					listen_dev(div, "click", /*composeHandler*/ ctx[15](/*onClickCb*/ ctx[10]), false, false, false),
    					listen_dev(div, "dragenter", /*composeDragHandler*/ ctx[17](/*onDragEnterCb*/ ctx[11]), false, false, false),
    					listen_dev(div, "dragover", /*composeDragHandler*/ ctx[17](/*onDragOverCb*/ ctx[12]), false, false, false),
    					listen_dev(div, "dragleave", /*composeDragHandler*/ ctx[17](/*onDragLeaveCb*/ ctx[13]), false, false, false),
    					listen_dev(div, "drop", /*composeDragHandler*/ ctx[17](/*onDropCb*/ ctx[14]), false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (!current || dirty[0] & /*accept*/ 1) {
    				attr_dev(input, "accept", /*accept*/ ctx[0]);
    			}

    			if (!current || dirty[0] & /*multiple*/ 2) {
    				prop_dev(input, "multiple", /*multiple*/ ctx[1]);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty[0] & /*$$scope*/ 134217728) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[27], dirty, null, null);
    				}
    			}

    			if (!current || dirty[0] & /*disableDefaultStyles, containerClasses*/ 20 && div_class_value !== (div_class_value = "" + ((/*disableDefaultStyles*/ ctx[4] ? "" : "dropzone") + "\r\n  " + /*containerClasses*/ ctx[2] + " svelte-4uigcm"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (!current || dirty[0] & /*containerStyles*/ 8) {
    				attr_dev(div, "style", /*containerStyles*/ ctx[3]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*input_binding*/ ctx[29](null);
    			if (default_slot_or_fallback) default_slot_or_fallback.d(detaching);
    			/*div_binding*/ ctx[30](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function onInputElementClick(event) {
    	event.stopPropagation();
    }

    function instance$g($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dropzone", slots, ['default']);
    	let { accept } = $$props; // string or string[]
    	let { disabled = false } = $$props;
    	let { getFilesFromEvent = fromEvent } = $$props;
    	let { maxSize = Infinity } = $$props;
    	let { minSize = 0 } = $$props;
    	let { multiple = true } = $$props;
    	let { preventDropOnDocument = true } = $$props;
    	let { noClick = false } = $$props;
    	let { noKeyboard = false } = $$props;
    	let { noDrag = false } = $$props;
    	let { noDragEventsBubbling = false } = $$props;
    	let { containerClasses = "" } = $$props;
    	let { containerStyles = "" } = $$props;
    	let { disableDefaultStyles = false } = $$props;
    	const dispatch = createEventDispatcher();

    	//state
    	let state = {
    		isFocused: false,
    		isFileDialogActive: false,
    		isDragActive: false,
    		isDragAccept: false,
    		isDragReject: false,
    		draggedFiles: [],
    		acceptedFiles: [],
    		fileRejections: []
    	};

    	let rootRef;
    	let inputRef;

    	function resetState() {
    		state.isFileDialogActive = false;
    		state.isDragActive = false;
    		state.draggedFiles = [];
    		state.acceptedFiles = [];
    		state.fileRejections = [];
    	}

    	// Fn for opening the file dialog programmatically
    	function openFileDialog() {
    		if (inputRef) {
    			$$invalidate(6, inputRef.value = null, inputRef); // TODO check if null needs to be set
    			state.isFileDialogActive = true;
    			inputRef.click();
    		}
    	}

    	// Cb to open the file dialog when SPACE/ENTER occurs on the dropzone
    	function onKeyDownCb(event) {
    		// Ignore keyboard events bubbling up the DOM tree
    		if (!rootRef || !rootRef.isEqualNode(event.target)) {
    			return;
    		}

    		if (event.keyCode === 32 || event.keyCode === 13) {
    			event.preventDefault();
    			openFileDialog();
    		}
    	}

    	// Update focus state for the dropzone
    	function onFocusCb() {
    		state.isFocused = true;
    	}

    	function onBlurCb() {
    		state.isFocused = false;
    	}

    	// Cb to open the file dialog when click occurs on the dropzone
    	function onClickCb() {
    		if (noClick) {
    			return;
    		}

    		// In IE11/Edge the file-browser dialog is blocking, therefore, use setTimeout()
    		// to ensure React can handle state changes
    		// See: https://github.com/react-dropzone/react-dropzone/issues/450
    		if (isIeOrEdge()) {
    			setTimeout(openFileDialog, 0);
    		} else {
    			openFileDialog();
    		}
    	}

    	function onDragEnterCb(event) {
    		event.preventDefault();
    		stopPropagation(event);
    		dragTargetsRef = [...dragTargetsRef, event.target];

    		if (isEvtWithFiles(event)) {
    			Promise.resolve(getFilesFromEvent(event)).then(draggedFiles => {
    				if (isPropagationStopped(event) && !noDragEventsBubbling) {
    					return;
    				}

    				state.draggedFiles = draggedFiles;
    				state.isDragActive = true;
    				dispatch("dragenter", { dragEvent: event });
    			});
    		}
    	}

    	function onDragOverCb(event) {
    		event.preventDefault();
    		stopPropagation(event);

    		if (event.dataTransfer) {
    			try {
    				event.dataTransfer.dropEffect = "copy";
    			} catch {
    				
    			} /* eslint-disable-line no-empty */
    		}

    		if (isEvtWithFiles(event)) {
    			dispatch("dragover", { dragEvent: event });
    		}

    		return false;
    	}

    	function onDragLeaveCb(event) {
    		event.preventDefault();
    		stopPropagation(event);

    		// Only deactivate once the dropzone and all children have been left
    		const targets = dragTargetsRef.filter(target => rootRef && rootRef.contains(target));

    		// Make sure to remove a target present multiple times only once
    		// (Firefox may fire dragenter/dragleave multiple times on the same element)
    		const targetIdx = targets.indexOf(event.target);

    		if (targetIdx !== -1) {
    			targets.splice(targetIdx, 1);
    		}

    		dragTargetsRef = targets;

    		if (targets.length > 0) {
    			return;
    		}

    		state.isDragActive = false;
    		state.draggedFiles = [];

    		if (isEvtWithFiles(event)) {
    			dispatch("dragleave", { dragEvent: event });
    		}
    	}

    	function onDropCb(event) {
    		event.preventDefault();
    		stopPropagation(event);
    		dragTargetsRef = [];

    		if (isEvtWithFiles(event)) {
    			Promise.resolve(getFilesFromEvent(event)).then(files => {
    				if (isPropagationStopped(event) && !noDragEventsBubbling) {
    					return;
    				}

    				const acceptedFiles = [];
    				const fileRejections = [];

    				files.forEach(file => {
    					const [accepted, acceptError] = fileAccepted(file, accept);
    					const [sizeMatch, sizeError] = fileMatchSize(file, minSize, maxSize);

    					if (accepted && sizeMatch) {
    						acceptedFiles.push(file);
    					} else {
    						const errors = [acceptError, sizeError].filter(e => e);
    						fileRejections.push({ file, errors });
    					}
    				});

    				if (!multiple && acceptedFiles.length > 1) {
    					// Reject everything and empty accepted files
    					acceptedFiles.forEach(file => {
    						fileRejections.push({ file, errors: [TOO_MANY_FILES_REJECTION] });
    					});

    					acceptedFiles.splice(0);
    				}

    				state.acceptedFiles = acceptedFiles;
    				state.fileRejections = fileRejections;
    				dispatch("drop", { acceptedFiles, fileRejections, event });

    				if (fileRejections.length > 0) {
    					dispatch("droprejected", { fileRejections, event });
    				}

    				if (acceptedFiles.length > 0) {
    					dispatch("dropaccepted", { acceptedFiles, event });
    				}
    			});
    		}

    		resetState();
    	}

    	function composeHandler(fn) {
    		return disabled ? null : fn;
    	}

    	function composeKeyboardHandler(fn) {
    		return noKeyboard ? null : composeHandler(fn);
    	}

    	function composeDragHandler(fn) {
    		return noDrag ? null : composeHandler(fn);
    	}

    	function stopPropagation(event) {
    		if (noDragEventsBubbling) {
    			event.stopPropagation();
    		}
    	}

    	let dragTargetsRef = [];

    	function onDocumentDrop(event) {
    		if (rootRef && rootRef.contains(event.target)) {
    			// If we intercepted an event for our instance, let it propagate down to the instance's onDrop handler
    			return;
    		}

    		event.preventDefault();
    		dragTargetsRef = [];
    	}

    	// Update file dialog active state when the window is focused on
    	function onWindowFocus() {
    		// Execute the timeout only if the file dialog is opened in the browser
    		if (state.isFileDialogActive) {
    			setTimeout(
    				() => {
    					if (inputRef) {
    						const { files } = inputRef;

    						if (!files.length) {
    							state.isFileDialogActive = false;
    							dispatch("filedialogcancel");
    						}
    					}
    				},
    				300
    			);
    		}
    	}

    	onMount(() => {
    		window.addEventListener("focus", onWindowFocus, false);

    		if (preventDropOnDocument) {
    			document.addEventListener("dragover", onDocumentDragOver, false);
    			document.addEventListener("drop", onDocumentDrop, false);
    		}
    	});

    	onDestroy(() => {
    		window.removeEventListener("focus", onWindowFocus, false);

    		if (preventDropOnDocument) {
    			document.removeEventListener("dragover", onDocumentDragOver);
    			document.removeEventListener("drop", onDocumentDrop);
    		}
    	});

    	const writable_props = [
    		"accept",
    		"disabled",
    		"getFilesFromEvent",
    		"maxSize",
    		"minSize",
    		"multiple",
    		"preventDropOnDocument",
    		"noClick",
    		"noKeyboard",
    		"noDrag",
    		"noDragEventsBubbling",
    		"containerClasses",
    		"containerStyles",
    		"disableDefaultStyles"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dropzone> was created with unknown prop '${key}'`);
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			inputRef = $$value;
    			$$invalidate(6, inputRef);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			rootRef = $$value;
    			$$invalidate(5, rootRef);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("accept" in $$props) $$invalidate(0, accept = $$props.accept);
    		if ("disabled" in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ("getFilesFromEvent" in $$props) $$invalidate(19, getFilesFromEvent = $$props.getFilesFromEvent);
    		if ("maxSize" in $$props) $$invalidate(20, maxSize = $$props.maxSize);
    		if ("minSize" in $$props) $$invalidate(21, minSize = $$props.minSize);
    		if ("multiple" in $$props) $$invalidate(1, multiple = $$props.multiple);
    		if ("preventDropOnDocument" in $$props) $$invalidate(22, preventDropOnDocument = $$props.preventDropOnDocument);
    		if ("noClick" in $$props) $$invalidate(23, noClick = $$props.noClick);
    		if ("noKeyboard" in $$props) $$invalidate(24, noKeyboard = $$props.noKeyboard);
    		if ("noDrag" in $$props) $$invalidate(25, noDrag = $$props.noDrag);
    		if ("noDragEventsBubbling" in $$props) $$invalidate(26, noDragEventsBubbling = $$props.noDragEventsBubbling);
    		if ("containerClasses" in $$props) $$invalidate(2, containerClasses = $$props.containerClasses);
    		if ("containerStyles" in $$props) $$invalidate(3, containerStyles = $$props.containerStyles);
    		if ("disableDefaultStyles" in $$props) $$invalidate(4, disableDefaultStyles = $$props.disableDefaultStyles);
    		if ("$$scope" in $$props) $$invalidate(27, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		fromEvent,
    		allFilesAccepted,
    		composeEventHandlers,
    		fileAccepted,
    		fileMatchSize,
    		isEvtWithFiles,
    		isIeOrEdge,
    		isPropagationStopped,
    		onDocumentDragOver,
    		TOO_MANY_FILES_REJECTION,
    		onMount,
    		onDestroy,
    		createEventDispatcher,
    		accept,
    		disabled,
    		getFilesFromEvent,
    		maxSize,
    		minSize,
    		multiple,
    		preventDropOnDocument,
    		noClick,
    		noKeyboard,
    		noDrag,
    		noDragEventsBubbling,
    		containerClasses,
    		containerStyles,
    		disableDefaultStyles,
    		dispatch,
    		state,
    		rootRef,
    		inputRef,
    		resetState,
    		openFileDialog,
    		onKeyDownCb,
    		onFocusCb,
    		onBlurCb,
    		onClickCb,
    		onDragEnterCb,
    		onDragOverCb,
    		onDragLeaveCb,
    		onDropCb,
    		composeHandler,
    		composeKeyboardHandler,
    		composeDragHandler,
    		stopPropagation,
    		dragTargetsRef,
    		onDocumentDrop,
    		onWindowFocus,
    		onInputElementClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("accept" in $$props) $$invalidate(0, accept = $$props.accept);
    		if ("disabled" in $$props) $$invalidate(18, disabled = $$props.disabled);
    		if ("getFilesFromEvent" in $$props) $$invalidate(19, getFilesFromEvent = $$props.getFilesFromEvent);
    		if ("maxSize" in $$props) $$invalidate(20, maxSize = $$props.maxSize);
    		if ("minSize" in $$props) $$invalidate(21, minSize = $$props.minSize);
    		if ("multiple" in $$props) $$invalidate(1, multiple = $$props.multiple);
    		if ("preventDropOnDocument" in $$props) $$invalidate(22, preventDropOnDocument = $$props.preventDropOnDocument);
    		if ("noClick" in $$props) $$invalidate(23, noClick = $$props.noClick);
    		if ("noKeyboard" in $$props) $$invalidate(24, noKeyboard = $$props.noKeyboard);
    		if ("noDrag" in $$props) $$invalidate(25, noDrag = $$props.noDrag);
    		if ("noDragEventsBubbling" in $$props) $$invalidate(26, noDragEventsBubbling = $$props.noDragEventsBubbling);
    		if ("containerClasses" in $$props) $$invalidate(2, containerClasses = $$props.containerClasses);
    		if ("containerStyles" in $$props) $$invalidate(3, containerStyles = $$props.containerStyles);
    		if ("disableDefaultStyles" in $$props) $$invalidate(4, disableDefaultStyles = $$props.disableDefaultStyles);
    		if ("state" in $$props) state = $$props.state;
    		if ("rootRef" in $$props) $$invalidate(5, rootRef = $$props.rootRef);
    		if ("inputRef" in $$props) $$invalidate(6, inputRef = $$props.inputRef);
    		if ("dragTargetsRef" in $$props) dragTargetsRef = $$props.dragTargetsRef;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		accept,
    		multiple,
    		containerClasses,
    		containerStyles,
    		disableDefaultStyles,
    		rootRef,
    		inputRef,
    		onKeyDownCb,
    		onFocusCb,
    		onBlurCb,
    		onClickCb,
    		onDragEnterCb,
    		onDragOverCb,
    		onDragLeaveCb,
    		onDropCb,
    		composeHandler,
    		composeKeyboardHandler,
    		composeDragHandler,
    		disabled,
    		getFilesFromEvent,
    		maxSize,
    		minSize,
    		preventDropOnDocument,
    		noClick,
    		noKeyboard,
    		noDrag,
    		noDragEventsBubbling,
    		$$scope,
    		slots,
    		input_binding,
    		div_binding
    	];
    }

    class Dropzone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$g,
    			create_fragment$g,
    			safe_not_equal,
    			{
    				accept: 0,
    				disabled: 18,
    				getFilesFromEvent: 19,
    				maxSize: 20,
    				minSize: 21,
    				multiple: 1,
    				preventDropOnDocument: 22,
    				noClick: 23,
    				noKeyboard: 24,
    				noDrag: 25,
    				noDragEventsBubbling: 26,
    				containerClasses: 2,
    				containerStyles: 3,
    				disableDefaultStyles: 4
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dropzone",
    			options,
    			id: create_fragment$g.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*accept*/ ctx[0] === undefined && !("accept" in props)) {
    			console.warn("<Dropzone> was created without expected prop 'accept'");
    		}
    	}

    	get accept() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set accept(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get getFilesFromEvent() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set getFilesFromEvent(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get maxSize() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set maxSize(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get minSize() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set minSize(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get multiple() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set multiple(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get preventDropOnDocument() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set preventDropOnDocument(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noClick() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noClick(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noKeyboard() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noKeyboard(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noDrag() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noDrag(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noDragEventsBubbling() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noDragEventsBubbling(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerClasses() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerClasses(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get containerStyles() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set containerStyles(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disableDefaultStyles() {
    		throw new Error("<Dropzone>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disableDefaultStyles(value) {
    		throw new Error("<Dropzone>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class LocalStorageController {
        constructor(

        ) {

        }

        save(itemName, object) {
            console.log("save");
            let key="fate-condensed-"+itemName;
            if (typeof (Storage) !== "undefined") {
                console.log("saving...");
                // Code for localStorage/sessionStorage.
                let text = JSON.stringify(object);
                console.log(text);
                localStorage.setItem(key,text);
            } else {
                // Sorry! No Web Storage support... doing nothing.
                console.log("LocalStorage not supported. Did not save.");
            }
        }

        load(itemName,defaultItemGenerator= ()=>null) {
            console.log("load");
            let key="fate-condensed-"+itemName;
            if (typeof (Storage) === "undefined" || localStorage.getItem(key) === null) {
                console.log("LocalStorage not supported, or no prior item found. Creating new character instead.");
                return defaultItemGenerator();
            }
            console.log("loading...");
            let text = localStorage.getItem(key);
            console.log("loaded:", text);
            if (text === "undefined" || text === "null") return defaultItemGenerator();
            return JSON.parse(text);
        }

        saveCharacter(character) {
            this.save("character-sheet",character);
        }

        loadCharacter() {
            return this.load("character-sheet",getNewCharacter);
        }
    }

    /* src/App/App.svelte generated by Svelte v3.25.0 */

    const { console: console_1 } = globals;
    const file$e = "src/App/App.svelte";

    // (290:8) {:else}
    function create_else_block_2(ctx) {
    	let mwc_icon_button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			mwc_icon_button = element("mwc-icon-button");
    			set_custom_element_data(mwc_icon_button, "icon", "folder_open");
    			set_custom_element_data(mwc_icon_button, "slot", "actionItems");
    			set_custom_element_data(mwc_icon_button, "class", "svelte-1x6mkq6");
    			add_location(mwc_icon_button, file$e, 290, 12, 9585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, mwc_icon_button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(mwc_icon_button, "click", /*handleLoadCharacterClicked*/ ctx[15], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(mwc_icon_button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_2.name,
    		type: "else",
    		source: "(290:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (288:8) {#if showLoadPane}
    function create_if_block_6(ctx) {
    	let mwc_icon_button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			mwc_icon_button = element("mwc-icon-button");
    			set_custom_element_data(mwc_icon_button, "icon", "cancel");
    			set_custom_element_data(mwc_icon_button, "slot", "actionItems");
    			set_custom_element_data(mwc_icon_button, "class", "svelte-1x6mkq6");
    			add_location(mwc_icon_button, file$e, 288, 12, 9464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, mwc_icon_button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(mwc_icon_button, "click", /*hideLoadPane*/ ctx[18], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(mwc_icon_button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(288:8) {#if showLoadPane}",
    		ctx
    	});

    	return block;
    }

    // (300:8) {:else}
    function create_else_block(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let t;
    	let mwc_snackbar;
    	let mwc_icon_button;
    	let current;

    	const if_block_creators = [
    		create_if_block_1$1,
    		create_if_block_2,
    		create_if_block_3,
    		create_if_block_4,
    		create_if_block_5,
    		create_else_block_1
    	];

    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*activeIndex*/ ctx[1] === 0) return 0;
    		if (/*activeIndex*/ ctx[1] === 1) return 1;
    		if (/*activeIndex*/ ctx[1] === 2) return 2;
    		if (/*activeIndex*/ ctx[1] === 3) return 3;
    		if (/*activeIndex*/ ctx[1] === 4) return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t = space();
    			mwc_snackbar = element("mwc-snackbar");
    			mwc_icon_button = element("mwc-icon-button");
    			set_custom_element_data(mwc_icon_button, "icon", "close");
    			set_custom_element_data(mwc_icon_button, "slot", "dismiss");
    			set_custom_element_data(mwc_icon_button, "class", "svelte-1x6mkq6");
    			add_location(mwc_icon_button, file$e, 317, 20, 11054);
    			set_custom_element_data(mwc_snackbar, "labeltext", /*snackBarText*/ ctx[11]);
    			set_custom_element_data(mwc_snackbar, "class", "svelte-1x6mkq6");
    			add_location(mwc_snackbar, file$e, 316, 16, 10964);
    			attr_dev(div, "id", "content");
    			set_style(div, "margin", "10pt");
    			attr_dev(div, "class", "svelte-1x6mkq6");
    			add_location(div, file$e, 300, 12, 10236);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t);
    			append_dev(div, mwc_snackbar);
    			append_dev(mwc_snackbar, mwc_icon_button);
    			/*mwc_snackbar_binding*/ ctx[24](mwc_snackbar);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t);
    			}

    			if (!current || dirty[0] & /*snackBarText*/ 2048) {
    				set_custom_element_data(mwc_snackbar, "labeltext", /*snackBarText*/ ctx[11]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    			/*mwc_snackbar_binding*/ ctx[24](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(300:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (296:8) {#if (showLoadPane)}
    function create_if_block$5(ctx) {
    	let div;
    	let dropzone;
    	let current;

    	dropzone = new Dropzone({
    			props: {
    				containerStyles: "height:92vh;color:#333333; background-color:#EFEFEF;"
    			},
    			$$inline: true
    		});

    	dropzone.$on("drop", /*handleFilesSelect*/ ctx[17]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(dropzone.$$.fragment);
    			attr_dev(div, "id", "content");
    			attr_dev(div, "class", "noprint file-loader svelte-1x6mkq6");
    			set_style(div, "height", "100%");
    			add_location(div, file$e, 296, 12, 9994);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dropzone, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dropzone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dropzone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(dropzone);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(296:8) {#if (showLoadPane)}",
    		ctx
    	});

    	return block;
    }

    // (314:12) {:else}
    function create_else_block_1(ctx) {
    	let h3;

    	const block = {
    		c: function create() {
    			h3 = element("h3");
    			h3.textContent = "TBD/Coming Soon";
    			attr_dev(h3, "class", "svelte-1x6mkq6");
    			add_location(h3, file$e, 314, 16, 10905);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h3, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h3);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(314:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (312:40) 
    function create_if_block_5(ctx) {
    	let srd;
    	let updating_tocMarkdown;
    	let updating_srdMarkdown;
    	let current;

    	function srd_tocMarkdown_binding(value) {
    		/*srd_tocMarkdown_binding*/ ctx[22].call(null, value);
    	}

    	function srd_srdMarkdown_binding(value) {
    		/*srd_srdMarkdown_binding*/ ctx[23].call(null, value);
    	}

    	let srd_props = {};

    	if (/*tocMarkdown*/ ctx[6] !== void 0) {
    		srd_props.tocMarkdown = /*tocMarkdown*/ ctx[6];
    	}

    	if (/*srdMarkdown*/ ctx[5] !== void 0) {
    		srd_props.srdMarkdown = /*srdMarkdown*/ ctx[5];
    	}

    	srd = new SRD({ props: srd_props, $$inline: true });
    	binding_callbacks.push(() => bind(srd, "tocMarkdown", srd_tocMarkdown_binding));
    	binding_callbacks.push(() => bind(srd, "srdMarkdown", srd_srdMarkdown_binding));

    	const block = {
    		c: function create() {
    			create_component(srd.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(srd, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const srd_changes = {};

    			if (!updating_tocMarkdown && dirty[0] & /*tocMarkdown*/ 64) {
    				updating_tocMarkdown = true;
    				srd_changes.tocMarkdown = /*tocMarkdown*/ ctx[6];
    				add_flush_callback(() => updating_tocMarkdown = false);
    			}

    			if (!updating_srdMarkdown && dirty[0] & /*srdMarkdown*/ 32) {
    				updating_srdMarkdown = true;
    				srd_changes.srdMarkdown = /*srdMarkdown*/ ctx[5];
    				add_flush_callback(() => updating_srdMarkdown = false);
    			}

    			srd.$set(srd_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(srd.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(srd.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(srd, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(312:40) ",
    		ctx
    	});

    	return block;
    }

    // (310:40) 
    function create_if_block_4(ctx) {
    	let markdown;
    	let current;

    	markdown = new Markdown({
    			props: { markdown: /*stuntsMarkdown*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(markdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(markdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const markdown_changes = {};
    			if (dirty[0] & /*stuntsMarkdown*/ 16) markdown_changes.markdown = /*stuntsMarkdown*/ ctx[4];
    			markdown.$set(markdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(markdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(markdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(markdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(310:40) ",
    		ctx
    	});

    	return block;
    }

    // (308:40) 
    function create_if_block_3(ctx) {
    	let markdown;
    	let current;

    	markdown = new Markdown({
    			props: { markdown: /*skillsMarkdown*/ ctx[3] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(markdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(markdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const markdown_changes = {};
    			if (dirty[0] & /*skillsMarkdown*/ 8) markdown_changes.markdown = /*skillsMarkdown*/ ctx[3];
    			markdown.$set(markdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(markdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(markdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(markdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(308:40) ",
    		ctx
    	});

    	return block;
    }

    // (306:40) 
    function create_if_block_2(ctx) {
    	let markdown;
    	let current;

    	markdown = new Markdown({
    			props: {
    				markdown: /*aspectsMarkdown*/ ctx[2],
    				props: { style: "height:8.5in", id: "aspects" }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(markdown.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(markdown, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const markdown_changes = {};
    			if (dirty[0] & /*aspectsMarkdown*/ 4) markdown_changes.markdown = /*aspectsMarkdown*/ ctx[2];
    			markdown.$set(markdown_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(markdown.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(markdown.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(markdown, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(306:40) ",
    		ctx
    	});

    	return block;
    }

    // (302:12) {#if activeIndex === 0}
    function create_if_block_1$1(ctx) {
    	let div;
    	let charactersheet;
    	let updating_character;
    	let current;

    	function charactersheet_character_binding(value) {
    		/*charactersheet_character_binding*/ ctx[21].call(null, value);
    	}

    	let charactersheet_props = {};

    	if (/*character*/ ctx[12] !== void 0) {
    		charactersheet_props.character = /*character*/ ctx[12];
    	}

    	charactersheet = new CharacterSheet({
    			props: charactersheet_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(charactersheet, "character", charactersheet_character_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(charactersheet.$$.fragment);
    			attr_dev(div, "class", "page svelte-1x6mkq6");
    			add_location(div, file$e, 302, 16, 10329);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(charactersheet, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const charactersheet_changes = {};

    			if (!updating_character && dirty[0] & /*character*/ 4096) {
    				updating_character = true;
    				charactersheet_changes.character = /*character*/ ctx[12];
    				add_flush_callback(() => updating_character = false);
    			}

    			charactersheet.$set(charactersheet_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(charactersheet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(charactersheet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(charactersheet);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(302:12) {#if activeIndex === 0}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$h(ctx) {
    	let title_value;
    	let link0;
    	let link1;
    	let t0;
    	let globalcss;
    	let t1;
    	let main0;
    	let mwc_top_app_bar_fixed;
    	let div1;
    	let div0;
    	let span;
    	let t2_value = /*appSettings*/ ctx[0].applicationName + "";
    	let t2;
    	let t3;
    	let mwc_tab_bar;
    	let mwc_tab0;
    	let t4;
    	let mwc_tab1;
    	let t5;
    	let mwc_tab2;
    	let t6;
    	let mwc_tab3;
    	let t7;
    	let mwc_tab4;
    	let t8;
    	let mwc_icon_button0;
    	let t9;
    	let t10;
    	let mwc_icon_button1;
    	let t11;
    	let mwc_icon_button2;
    	let t12;
    	let current_block_type_index;
    	let if_block1;
    	let t13;
    	let main1;
    	let div2;
    	let charactersheet;
    	let updating_character;
    	let current;
    	let mounted;
    	let dispose;
    	document.title = title_value = "" + (/*character*/ ctx[12].name + " - " + /*appSettings*/ ctx[0].applicationName);
    	globalcss = new GlobalCss({ $$inline: true });

    	function select_block_type(ctx, dirty) {
    		if (/*showLoadPane*/ ctx[10]) return create_if_block_6;
    		return create_else_block_2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	const if_block_creators = [create_if_block$5, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*showLoadPane*/ ctx[10]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	function charactersheet_character_binding_1(value) {
    		/*charactersheet_character_binding_1*/ ctx[25].call(null, value);
    	}

    	let charactersheet_props = {};

    	if (/*character*/ ctx[12] !== void 0) {
    		charactersheet_props.character = /*character*/ ctx[12];
    	}

    	charactersheet = new CharacterSheet({
    			props: charactersheet_props,
    			$$inline: true
    		});

    	binding_callbacks.push(() => bind(charactersheet, "character", charactersheet_character_binding_1));

    	const block = {
    		c: function create() {
    			link0 = element("link");
    			link1 = element("link");
    			t0 = space();
    			create_component(globalcss.$$.fragment);
    			t1 = space();
    			main0 = element("main");
    			mwc_top_app_bar_fixed = element("mwc-top-app-bar-fixed");
    			div1 = element("div");
    			div0 = element("div");
    			span = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			mwc_tab_bar = element("mwc-tab-bar");
    			mwc_tab0 = element("mwc-tab");
    			t4 = space();
    			mwc_tab1 = element("mwc-tab");
    			t5 = space();
    			mwc_tab2 = element("mwc-tab");
    			t6 = space();
    			mwc_tab3 = element("mwc-tab");
    			t7 = space();
    			mwc_tab4 = element("mwc-tab");
    			t8 = space();
    			mwc_icon_button0 = element("mwc-icon-button");
    			t9 = space();
    			if_block0.c();
    			t10 = space();
    			mwc_icon_button1 = element("mwc-icon-button");
    			t11 = space();
    			mwc_icon_button2 = element("mwc-icon-button");
    			t12 = space();
    			if_block1.c();
    			t13 = space();
    			main1 = element("main");
    			div2 = element("div");
    			create_component(charactersheet.$$.fragment);
    			attr_dev(link0, "href", "https://fonts.googleapis.com/css?family=Roboto:300,400,500");
    			attr_dev(link0, "rel", "stylesheet");
    			attr_dev(link0, "class", "svelte-1x6mkq6");
    			add_location(link0, file$e, 267, 4, 8431);
    			attr_dev(link1, "href", "https://fonts.googleapis.com/css?family=Material+Icons&display=block");
    			attr_dev(link1, "rel", "stylesheet");
    			attr_dev(link1, "class", "svelte-1x6mkq6");
    			add_location(link1, file$e, 268, 4, 8525);
    			attr_dev(span, "class", "svelte-1x6mkq6");
    			add_location(span, file$e, 277, 47, 8801);
    			set_style(div0, "display", "inline-block");
    			attr_dev(div0, "class", "svelte-1x6mkq6");
    			add_location(div0, file$e, 277, 12, 8766);
    			attr_dev(div1, "slot", "title");
    			attr_dev(div1, "class", "svelte-1x6mkq6");
    			add_location(div1, file$e, 276, 8, 8735);
    			set_custom_element_data(mwc_tab0, "label", "Character Sheet");
    			set_custom_element_data(mwc_tab0, "class", "svelte-1x6mkq6");
    			add_location(mwc_tab0, file$e, 280, 12, 9045);
    			set_custom_element_data(mwc_tab1, "label", "Aspects");
    			set_custom_element_data(mwc_tab1, "class", "svelte-1x6mkq6");
    			add_location(mwc_tab1, file$e, 281, 12, 9101);
    			set_custom_element_data(mwc_tab2, "label", "Skills");
    			set_custom_element_data(mwc_tab2, "class", "svelte-1x6mkq6");
    			add_location(mwc_tab2, file$e, 282, 12, 9149);
    			set_custom_element_data(mwc_tab3, "label", "Stunts");
    			set_custom_element_data(mwc_tab3, "class", "svelte-1x6mkq6");
    			add_location(mwc_tab3, file$e, 283, 12, 9196);
    			set_custom_element_data(mwc_tab4, "label", "SRD");
    			set_custom_element_data(mwc_tab4, "class", "svelte-1x6mkq6");
    			add_location(mwc_tab4, file$e, 284, 12, 9243);
    			set_custom_element_data(mwc_tab_bar, "slot", "actionItems");
    			set_style(mwc_tab_bar, "display", "inline-block");
    			set_custom_element_data(mwc_tab_bar, "activeindex", /*activeIndex*/ ctx[1]);
    			set_custom_element_data(mwc_tab_bar, "class", "svelte-1x6mkq6");
    			add_location(mwc_tab_bar, file$e, 279, 8, 8873);
    			set_custom_element_data(mwc_icon_button0, "icon", "note_add");
    			set_custom_element_data(mwc_icon_button0, "slot", "actionItems");
    			set_custom_element_data(mwc_icon_button0, "disabled", /*disabled*/ ctx[9]);
    			set_custom_element_data(mwc_icon_button0, "class", "svelte-1x6mkq6");
    			add_location(mwc_icon_button0, file$e, 286, 8, 9306);
    			set_custom_element_data(mwc_icon_button1, "icon", "save");
    			set_custom_element_data(mwc_icon_button1, "slot", "actionItems");
    			set_custom_element_data(mwc_icon_button1, "disabled", /*disabled*/ ctx[9]);
    			set_custom_element_data(mwc_icon_button1, "class", "svelte-1x6mkq6");
    			add_location(mwc_icon_button1, file$e, 292, 8, 9719);
    			set_custom_element_data(mwc_icon_button2, "icon", "print");
    			set_custom_element_data(mwc_icon_button2, "slot", "actionItems");
    			set_custom_element_data(mwc_icon_button2, "disabled", /*disabled*/ ctx[9]);
    			set_custom_element_data(mwc_icon_button2, "class", "svelte-1x6mkq6");
    			add_location(mwc_icon_button2, file$e, 293, 8, 9843);
    			set_style(mwc_top_app_bar_fixed, "height", "100%");
    			set_custom_element_data(mwc_top_app_bar_fixed, "class", "svelte-1x6mkq6");
    			add_location(mwc_top_app_bar_fixed, file$e, 274, 4, 8682);
    			attr_dev(main0, "class", "noprint svelte-1x6mkq6");
    			add_location(main0, file$e, 272, 0, 8654);
    			attr_dev(div2, "class", "page svelte-1x6mkq6");
    			add_location(div2, file$e, 330, 4, 11536);
    			attr_dev(main1, "class", "printme svelte-1x6mkq6");
    			set_style(main1, "margin", "0.5in");
    			add_location(main1, file$e, 325, 0, 11222);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, link0);
    			append_dev(document.head, link1);
    			insert_dev(target, t0, anchor);
    			mount_component(globalcss, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main0, anchor);
    			append_dev(main0, mwc_top_app_bar_fixed);
    			append_dev(mwc_top_app_bar_fixed, div1);
    			append_dev(div1, div0);
    			append_dev(div0, span);
    			append_dev(span, t2);
    			append_dev(mwc_top_app_bar_fixed, t3);
    			append_dev(mwc_top_app_bar_fixed, mwc_tab_bar);
    			append_dev(mwc_tab_bar, mwc_tab0);
    			append_dev(mwc_tab_bar, t4);
    			append_dev(mwc_tab_bar, mwc_tab1);
    			append_dev(mwc_tab_bar, t5);
    			append_dev(mwc_tab_bar, mwc_tab2);
    			append_dev(mwc_tab_bar, t6);
    			append_dev(mwc_tab_bar, mwc_tab3);
    			append_dev(mwc_tab_bar, t7);
    			append_dev(mwc_tab_bar, mwc_tab4);
    			/*mwc_tab_bar_binding*/ ctx[20](mwc_tab_bar);
    			append_dev(mwc_top_app_bar_fixed, t8);
    			append_dev(mwc_top_app_bar_fixed, mwc_icon_button0);
    			append_dev(mwc_top_app_bar_fixed, t9);
    			if_block0.m(mwc_top_app_bar_fixed, null);
    			append_dev(mwc_top_app_bar_fixed, t10);
    			append_dev(mwc_top_app_bar_fixed, mwc_icon_button1);
    			append_dev(mwc_top_app_bar_fixed, t11);
    			append_dev(mwc_top_app_bar_fixed, mwc_icon_button2);
    			append_dev(mwc_top_app_bar_fixed, t12);
    			if_blocks[current_block_type_index].m(mwc_top_app_bar_fixed, null);
    			insert_dev(target, t13, anchor);
    			insert_dev(target, main1, anchor);
    			append_dev(main1, div2);
    			mount_component(charactersheet, div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(mwc_tab_bar, "MDCTabBar:activated", /*handleTabActivated*/ ctx[13], false, false, false),
    					listen_dev(mwc_icon_button0, "click", /*handleNewCharacterClicked*/ ctx[16], false, false, false),
    					listen_dev(mwc_icon_button1, "click", /*handleSaveCharacterClicked*/ ctx[14], false, false, false),
    					listen_dev(mwc_icon_button2, "click", handlePrintClicked, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty[0] & /*character, appSettings*/ 4097) && title_value !== (title_value = "" + (/*character*/ ctx[12].name + " - " + /*appSettings*/ ctx[0].applicationName))) {
    				document.title = title_value;
    			}

    			if ((!current || dirty[0] & /*appSettings*/ 1) && t2_value !== (t2_value = /*appSettings*/ ctx[0].applicationName + "")) set_data_dev(t2, t2_value);

    			if (!current || dirty[0] & /*activeIndex*/ 2) {
    				set_custom_element_data(mwc_tab_bar, "activeindex", /*activeIndex*/ ctx[1]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 512) {
    				set_custom_element_data(mwc_icon_button0, "disabled", /*disabled*/ ctx[9]);
    			}

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(mwc_top_app_bar_fixed, t10);
    				}
    			}

    			if (!current || dirty[0] & /*disabled*/ 512) {
    				set_custom_element_data(mwc_icon_button1, "disabled", /*disabled*/ ctx[9]);
    			}

    			if (!current || dirty[0] & /*disabled*/ 512) {
    				set_custom_element_data(mwc_icon_button2, "disabled", /*disabled*/ ctx[9]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block1 = if_blocks[current_block_type_index];

    				if (!if_block1) {
    					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block1.c();
    				}

    				transition_in(if_block1, 1);
    				if_block1.m(mwc_top_app_bar_fixed, null);
    			}

    			const charactersheet_changes = {};

    			if (!updating_character && dirty[0] & /*character*/ 4096) {
    				updating_character = true;
    				charactersheet_changes.character = /*character*/ ctx[12];
    				add_flush_callback(() => updating_character = false);
    			}

    			charactersheet.$set(charactersheet_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(globalcss.$$.fragment, local);
    			transition_in(if_block1);
    			transition_in(charactersheet.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(globalcss.$$.fragment, local);
    			transition_out(if_block1);
    			transition_out(charactersheet.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(link0);
    			detach_dev(link1);
    			if (detaching) detach_dev(t0);
    			destroy_component(globalcss, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main0);
    			/*mwc_tab_bar_binding*/ ctx[20](null);
    			if_block0.d();
    			if_blocks[current_block_type_index].d();
    			if (detaching) detach_dev(t13);
    			if (detaching) detach_dev(main1);
    			destroy_component(charactersheet);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$h.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function handlePrintClicked() {
    	setTimeout(() => window.print(), 500);
    }

    function instance$h($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let { name } = $$props;

    	let { appSettings = {
    		applicationName: "WARNING: Please pass appSettings from within main.js props."
    	} } = $$props;

    	let activeIndex;
    	let aspectsMarkdown, skillsMarkdown, stuntsMarkdown, srdMarkdown, tocMarkdown;
    	fetch("./md/Aspects.md").then(response => response.text().then(data => $$invalidate(2, aspectsMarkdown = data)));
    	fetch("./md/Skills.md").then(response => response.text().then(data => $$invalidate(3, skillsMarkdown = data)));
    	fetch("./md/Stunts.md").then(response => response.text().then(data => $$invalidate(4, stuntsMarkdown = data)));
    	fetch("./md/Fate-Condensed-SRD-CC-BY.md").then(response => response.text().then(data => $$invalidate(5, srdMarkdown = data)));

    	// Special DOM elements.
    	let printOptionListElement, snackBarElement, saveOptionsListElement, tabBarElement;

    	function handleTabActivated(e) {
    		$$invalidate(1, activeIndex = tabBarElement.activeIndex);
    	}

    	let disabled = "";
    	let showLoadPane = false;
    	let firstCall = true;
    	let saveAlsoDownloads = true;
    	let localStorageController = new LocalStorageController();
    	let url = new URL(window.location);
    	let basePath = url.origin + url.pathname;
    	let snackBarText = "Replace this with a real message";
    	let { tmpChar, charIsValid } = doInitialCharacterLoad();
    	let character = charIsValid ? tmpChar : getNewCharacter();

    	if (url.searchParams.has("character")) {
    		// now store it before we redirect
    		localStorageController.saveCharacter(character);

    		window.location.replace(basePath);
    	}

    	scheduleAutosave();

    	function doInitialCharacterLoad() {
    		let tmpChar;
    		let charIsValid = false;

    		try {
    			tmpChar = url.searchParams.has("character")
    			? JSON.parse(decodeURIComponent(url.searchParams.get("character")))
    			: localStorageController.loadCharacter();

    			charIsValid = validateCharacter(tmpChar);
    		} catch {
    			charIsValid = false;
    		}

    		return { tmpChar, charIsValid };
    	}

    	function validateCharacter(validateMe) {
    		let result = true;

    		try {
    			/* TODO: There has to be a better way.
             like maybe a JSON DTD? */
    			// for now try accessing things in a way that will throw an exception.
    			let _ = validateMe.name.toString();

    			_ = validateMe.fate.toString();
    			_ = validateMe.refresh.toString();
    			_ = validateMe.aspects.highConcept.toString();
    			_ = validateMe.aspects.trouble.toString();
    			_ = validateMe.aspects.relationship.toString();
    			_ = validateMe.aspects.otherAspects[0].toString();
    			_ = validateMe.aspects.otherAspects[1].toString();
    			_ = validateMe.skills[18].name.toString();
    			_ = validateMe.stunts[5].name.toString();
    			_ = validateMe.vitals.physicalStressTaken.toString();
    			_ = validateMe.vitals.mentalStressTaken.toString();
    			_ = validateMe.vitals.consequences.mild1.toString();
    			_ = validateMe.vitals.consequences.moderate.toString();
    			_ = validateMe.vitals.consequences.severe.toString();
    			_ = validateMe.vitals.consequences.mild2.toString();
    		} catch(err) {
    			console.log(err);
    			setTimeout(() => showSnackBar("Invalid data format encountered. Nothing loaded."), 250);
    			result = false;
    		} finally {
    			
    		}

    		return result;
    	}

    	function handleSaveCharacterClicked() {
    		let blob = new Blob([JSON.stringify(character, null, 2)], { type: "text/plain;charset=utf-8" });
    		localStorageController.saveCharacter(character);
    		showSnackBar("Character saved to local storage.");

    		{
    			setTimeout(
    				() => {
    					let charsheet = `${character.name}.fcchar`;
    					FileSaver_min(blob, charsheet);
    					showSnackBar(`Sending file: ${charsheet}. Check your downloads folder.`);
    				},
    				2000
    			);
    		}
    	}

    	function handleLoadCharacterClicked() {
    		$$invalidate(10, showLoadPane = true);
    		$$invalidate(9, disabled = "disabled");
    	}

    	function handleNewCharacterClicked() {
    		$$invalidate(12, character = getNewCharacter());
    		$$invalidate(1, activeIndex = 0);
    		showSnackBar("Created new character.");
    	}

    	function handleFilesSelect(e) {
    		let files = e.detail.acceptedFiles;
    		const reader = new FileReader();

    		reader.onload = function (e) {
    			// e.target.result should contain the text
    			try {
    				let text = e.target.result;
    				let tmpChar = JSON.parse(text);

    				if (validateCharacter(tmpChar)) {
    					setTimeout(() => showSnackBar("Character loaded from file."), 250);
    					$$invalidate(12, character = tmpChar);
    					$$invalidate(1, activeIndex = 0);
    				}
    			} catch(err) {
    				console.log(err);
    				setTimeout(() => showSnackBar("Invalid data format encountered. Nothing loaded."), 250);
    			} finally {
    				hideLoadPane();
    			}
    		};

    		reader.readAsText(files[0]);
    	}

    	function hideLoadPane() {
    		$$invalidate(10, showLoadPane = false);
    		$$invalidate(9, disabled = "");
    	}

    	function scheduleAutosave() {
    		if (!firstCall) {
    			return;
    		}

    		firstCall = false;

    		if (typeof Storage === "undefined") {
    			return;
    		} // nothing to schedule since we can't get at local storage.

    		setInterval(() => localStorageController.saveCharacter(character), 5 * 1000);
    	}

    	function showSnackBar(text) {
    		$$invalidate(11, snackBarText = text);
    		snackBarElement.show();
    	}

    	const writable_props = ["name", "appSettings"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function mwc_tab_bar_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			tabBarElement = $$value;
    			$$invalidate(8, tabBarElement);
    		});
    	}

    	function charactersheet_character_binding(value) {
    		character = value;
    		$$invalidate(12, character);
    	}

    	function srd_tocMarkdown_binding(value) {
    		tocMarkdown = value;
    		$$invalidate(6, tocMarkdown);
    	}

    	function srd_srdMarkdown_binding(value) {
    		srdMarkdown = value;
    		$$invalidate(5, srdMarkdown);
    	}

    	function mwc_snackbar_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			snackBarElement = $$value;
    			$$invalidate(7, snackBarElement);
    		});
    	}

    	function charactersheet_character_binding_1(value) {
    		character = value;
    		$$invalidate(12, character);
    	}

    	$$self.$$set = $$props => {
    		if ("name" in $$props) $$invalidate(19, name = $$props.name);
    		if ("appSettings" in $$props) $$invalidate(0, appSettings = $$props.appSettings);
    	};

    	$$self.$capture_state = () => ({
    		GlobalCss,
    		CharacterSheet,
    		SRD,
    		Markdown,
    		getNewCharacter,
    		downloadToClient: FileSaver_min,
    		Dropzone,
    		LocalStorageController,
    		name,
    		appSettings,
    		activeIndex,
    		aspectsMarkdown,
    		skillsMarkdown,
    		stuntsMarkdown,
    		srdMarkdown,
    		tocMarkdown,
    		printOptionListElement,
    		snackBarElement,
    		saveOptionsListElement,
    		tabBarElement,
    		handleTabActivated,
    		disabled,
    		showLoadPane,
    		firstCall,
    		saveAlsoDownloads,
    		localStorageController,
    		url,
    		basePath,
    		snackBarText,
    		tmpChar,
    		charIsValid,
    		character,
    		doInitialCharacterLoad,
    		validateCharacter,
    		handleSaveCharacterClicked,
    		handleLoadCharacterClicked,
    		handleNewCharacterClicked,
    		handleFilesSelect,
    		hideLoadPane,
    		handlePrintClicked,
    		scheduleAutosave,
    		showSnackBar
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(19, name = $$props.name);
    		if ("appSettings" in $$props) $$invalidate(0, appSettings = $$props.appSettings);
    		if ("activeIndex" in $$props) $$invalidate(1, activeIndex = $$props.activeIndex);
    		if ("aspectsMarkdown" in $$props) $$invalidate(2, aspectsMarkdown = $$props.aspectsMarkdown);
    		if ("skillsMarkdown" in $$props) $$invalidate(3, skillsMarkdown = $$props.skillsMarkdown);
    		if ("stuntsMarkdown" in $$props) $$invalidate(4, stuntsMarkdown = $$props.stuntsMarkdown);
    		if ("srdMarkdown" in $$props) $$invalidate(5, srdMarkdown = $$props.srdMarkdown);
    		if ("tocMarkdown" in $$props) $$invalidate(6, tocMarkdown = $$props.tocMarkdown);
    		if ("printOptionListElement" in $$props) printOptionListElement = $$props.printOptionListElement;
    		if ("snackBarElement" in $$props) $$invalidate(7, snackBarElement = $$props.snackBarElement);
    		if ("saveOptionsListElement" in $$props) saveOptionsListElement = $$props.saveOptionsListElement;
    		if ("tabBarElement" in $$props) $$invalidate(8, tabBarElement = $$props.tabBarElement);
    		if ("disabled" in $$props) $$invalidate(9, disabled = $$props.disabled);
    		if ("showLoadPane" in $$props) $$invalidate(10, showLoadPane = $$props.showLoadPane);
    		if ("firstCall" in $$props) firstCall = $$props.firstCall;
    		if ("saveAlsoDownloads" in $$props) saveAlsoDownloads = $$props.saveAlsoDownloads;
    		if ("localStorageController" in $$props) localStorageController = $$props.localStorageController;
    		if ("url" in $$props) url = $$props.url;
    		if ("basePath" in $$props) basePath = $$props.basePath;
    		if ("snackBarText" in $$props) $$invalidate(11, snackBarText = $$props.snackBarText);
    		if ("tmpChar" in $$props) tmpChar = $$props.tmpChar;
    		if ("charIsValid" in $$props) charIsValid = $$props.charIsValid;
    		if ("character" in $$props) $$invalidate(12, character = $$props.character);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		appSettings,
    		activeIndex,
    		aspectsMarkdown,
    		skillsMarkdown,
    		stuntsMarkdown,
    		srdMarkdown,
    		tocMarkdown,
    		snackBarElement,
    		tabBarElement,
    		disabled,
    		showLoadPane,
    		snackBarText,
    		character,
    		handleTabActivated,
    		handleSaveCharacterClicked,
    		handleLoadCharacterClicked,
    		handleNewCharacterClicked,
    		handleFilesSelect,
    		hideLoadPane,
    		name,
    		mwc_tab_bar_binding,
    		charactersheet_character_binding,
    		srd_tocMarkdown_binding,
    		srd_srdMarkdown_binding,
    		mwc_snackbar_binding,
    		charactersheet_character_binding_1
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$h, create_fragment$h, safe_not_equal, { name: 19, appSettings: 0 }, [-1, -1]);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$h.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[19] === undefined && !("name" in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get appSettings() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set appSettings(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		appSettings: { applicationName: "Fate Condensed Character Sheet" }
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
