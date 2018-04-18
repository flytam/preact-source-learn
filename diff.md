diff的流程，我们从简单到复杂进行分析

通过前面几篇文章的源码阅读，我们也大概清楚了diff函数参数的定义和component各参数的作用

```javascript
/**
 * @param dom 初次渲染是undefinde，第二次起是指当前vnode前一次渲染出的真实dom
 * @param vnode vnode，需要和dom进行比较
 * @param context 类似与react的react
 * @param mountAll
 * @param parent
 * @param componentRoot
 * **/
function diff(dom, vnode, context, mountAll, parent, componentRoot){}
```
```javascript
// component
{

    base,// dom
    nextBase,//dom

    _component,//子vnode对应的组件
    _parentComponent,// 父vnode对应的component
    _ref,// props.ref 
    _key,// props.key
    _disable,

    prevContext,
    context,

    props,
    prevProps,

    state,
    previousState

    _dirty,// true表示该组件需要被更新

    /***生命周期方法**/
    .....
}
```
1、非自定义组件的diff