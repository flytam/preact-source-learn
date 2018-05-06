#### Preact.js 源码学习

使用通俗的语言从零开始记录关于对Preact源码的阅读心得。

- [jsx是如何转化成virtualDOM的](./jsxToVirtualDOM.md)
- [virtualDOM如何变为真实dom](./virtualDOMToRealDOM.md)
- [Preact组件实例到DOM的过程](./buildComponent.md)
- [setState解析](./setState.md)
- [非组件节点的diff分析](./normalDiff.md)
- [组件节点的diff分析](./componentDiff.md)

完结。总体思路还是很好理解的，比读react好多了，虽然有的地方还是有点绕，不太懂，Preact源码解读部分就这么多了。。

tipsL src目录下是Preact源码目录，我阅读过程中在里面做了部分笔记

Preact导出的函数结构
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

