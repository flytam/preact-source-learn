import { VNode } from './vnode';
import options from './options';


const stack = [];

const EMPTY_CHILDREN = [];

/**
 *
 * @example jsx转为h函数的结构
 *
 * `<div id="foo" name="bar">Hello!</div>`
 *
 * `h('div', { id: 'foo', name : 'bar' }, 'Hello!');`
 *
 * @param {string} nodeName	元素标签名 例如: `div`, `a`, `span`, etc.
 * @param {Object} attributes	jsx上面的属性
 * @param rest	剩下的参数都是子组件
 *
 * @public
 */
export function h(nodeName, attributes) {
    let children = EMPTY_CHILDREN,
        lastSimple, child, simple, i;
    for (i = arguments.length; i-- > 2;) {
        // 把子组件收集起来
        stack.push(arguments[i]);
    }
    if (attributes && attributes.children != null) {
        if (!stack.length) stack.push(attributes.children);
        delete attributes.children;
    }
    while (stack.length) {
        if ((child = stack.pop()) && child.pop !== undefined) {
            // 处理子组件如果返回的是数组的情况
            for (i = child.length; i--;) stack.push(child[i]);
        } else {
            // 根据 子组件返回的不同类型进行处理
            if (typeof child === 'boolean') child = null;

            if ((simple = typeof nodeName !== 'function')) {
                if (child == null) child = '';
                else if (typeof child === 'number') child = String(child);
                else if (typeof child !== 'string') simple = false;
            }
            // 将child存进children中
            if (simple && lastSimple) {
                children[children.length - 1] += child;
            } else if (children === EMPTY_CHILDREN) {
                children = [child];
            } else {
                children.push(child);
            }

            lastSimple = simple;
        }
    }

    let p = new VNode();
    p.nodeName = nodeName;
    p.children = children;
    p.attributes = attributes == null ? undefined : attributes;
    p.key = attributes == null ? undefined : attributes.key;

    // if a "vnode hook" is defined, pass every created VNode to it
    if (options.vnode !== undefined) options.vnode(p);

    return p;
}