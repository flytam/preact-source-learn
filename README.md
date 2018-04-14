#### Preact.js 源码学习

目录结构
```
import { h, h as createElement } from './h';
import { cloneElement } from './clone-element';
import { Component } from './component';
import { render } from './render';
import { rerender } from './render-queue';
import options from './options';
/**
 * h函数和createElement函数是同一个函数
 *
 * */
export default {
    h,
    createElement,
    cloneElement,
    Component,
    render,
    rerender,
    options
};

export {
    h,
    createElement,
    cloneElement,
    Component,
    render,
    rerender,
    options
};
```

- [jsx是如何转化成virtualDOM的](./jsxToVirtualDOM)
- virtualDOM变为真实dom
- diff算法
- 生命周期
