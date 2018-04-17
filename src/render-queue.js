import options from './options';
import { defer } from './util';
import { renderComponent } from './vdom/component';

/** Managed queue of dirty components to be re-rendered */

let items = [];

export function enqueueRender(component) {
    // dirty 为true表明这个组件重新渲染
    if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {
        // 只会执行一遍
        (options.debounceRendering || defer)(rerender); // 相当于setTimeout render
    }
}

export function rerender() {
    let p, list = items;
    items = [];
    while ((p = list.pop())) {
        if (p._dirty) renderComponent(p);
    }
}