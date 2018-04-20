### 非组件节点的diff分析

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

    _component,//vnode对应的组件
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
    __preactattr_// 属性值

    /***生命周期方法**/
    .....
}
```

diff不同类型的vnode也是不同的。Preact的diff算法，是将setState后的vnode与前一次的dom进行比较的，边比较边更新。diff主要进行了两步操作（对于非文本节点来说），
先diff内容```innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);```，再diff属性```diffAttributes(out, vnode.attributes, props);```


1、字符串或者布尔型
如果之前也是一个文本节点，则直接修改节点的nodeValue的值；否则，创建一个新节点，并取代旧节点。并调用```recollectNodeTree```对旧的dom进行腊鸡回收。

2、html的标签类型
- 如果vnode的标签对比dom发生了改变（例如原来是span，后来是div），则新建一个div节点，然后把span的子元素都添加到新的div节点上，把新的div节点替换掉旧的span节点，然后回收旧的（回收节点的操作主要是把这个节点从dom中去掉，从vdom中也去掉）
```javascript
    if (!dom || !isNamedNode(dom, vnodeName)) {
         // isNamedNode方法就是比较dom和vnode的标签类型是不是一样
        out = createNode(vnodeName, isSvgMode);
        if (dom) {
            while (dom.firstChild) out.appendChild(dom.firstChild);
            if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
            recollectNodeTree(dom, true);//recollectNodeTree
        }
    }
```

- 对于子节点的diff
    - Preact对于只含有一个的子字符串节点直接进行特殊处理
    ```javascript
        if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === 'string' && fc != null && fc.splitText !== undefined && fc.nextSibling == null) {
        if (fc.nodeValue != vchildren[0]) {
            fc.nodeValue = vchildren[0];
        }
    }
    ```
    - 对于一般情况
    ```javascript
    /****/
    innerDiffNode(out, vchildren, context, mountAll, hydrating || props.dangerouslySetInnerHTML != null);
    ```
    那么，```innerDiffNode```函数做了什么？
    首先，先解释下函数内定义的一些关键变量到底干了啥
    ```javascript
        let originalChildren = dom.childNodes,// 旧dom的子node集合
        children = [],// 用来存储旧dom中，没有提供key属性的dom node
        keyed = {},// 用来存旧dom中有key的dom node，
    ```

    首先，第一步的操作就是对旧的dom node进行分类。将含有key的node存进```keyed```变量有，这是一个键值对结构；
    将无key的存进```children```中，这是一个数组结构。

    然后，去循环遍历```vchildren```的每一项，用```vchild```表示每一项。若有key属性，则取寻找keyed中是否有该key对应的真实dom；若无，则去遍历children
    数据，寻找一个与其类型相同（例如都是div标签这样）的节点进行diff（用child这个变量去存储）。然后执行idiff函数
    ``` child = idiff(child, vchild, context, mountAll);```。通过前面分析```idiff```函数，我们知道如果传进idiff的child为空，则会新建一个节点。所以对于普通节点的内容的diff就完成了。然后把这个返回新的dom node去取代旧的就可以了，代码如下
    ```javascript
            f = originalChildren[i];
            if (child && child !== dom && child !== f) {
                if (f == null) {
                    dom.appendChild(child);
                } else if (child === f.nextSibling) {
                    removeNode(f);
                } else {
                    dom.insertBefore(child, f);
                }
            }
    ```

    当对vchildren遍历完成diff操作后，把```keyed```和```children```中剩余的dom节点清除。因为他们在新的vnode结构中已经不存在了

    然后对于属性进行diff就可以了。```diffAttributes```的逻辑就比较简单了，取出新vnode 的 props和旧dom的props进行比较。新无旧有的去除，新有旧有的替代，新有旧无的添加。```setAccessor```是对于属性值设置时一些保留字和特殊情况进行一层封装处理
    ```javascript
    function diffAttributes(dom, attrs, old) {
    let name;
    for (name in old) {
        if (!(attrs && attrs[name] != null) && old[name] != null) {
            setAccessor(dom, name, old[name], old[name] = undefined, isSvgMode);
        }
    }
    for (name in attrs) {
        if (name !== 'children' && name !== 'innerHTML' && (!(name in old) || attrs[name] !== (name === 'value' || name === 'checked' ? dom[name] : old[name]))) {
            setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode);
        }
    }
    }
    ```

    至此，对于非组件节点的内容的diff完成了



