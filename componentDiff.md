### 组件的diff是如何进行的

在这之前，先有解释下Preact的dom两个个属性


```javascript
dom._component
dom._componentConstructor
const Child1 = <div id="div1"><div id="div2">2333</div></div>
// 我们如果通过dom的API拿到div1和div2。div1的_component就是这个Child1对应的component，div1的_componentConstructor是Child1这个函数
// 而div2都没有这个属性的
```

自定义组件的diff的过程其实和初次渲染的流程一样的，调用的区别主要是传进的dom参数不是undefined了。大致流程如下：
1、调用diff进而调用了idiff
2、idiff中调用了```buildComponentFromVNode```。
    ```buildComponentFromVNode```中，先去判断当前自定义组件所表示的vdom和真实dom的构造函数是否相同（即它们是否同一类）

```javascript
        while (c && !isOwner && (c = c._parentComponent)) {
        isOwner = c.constructor === vnode.nodeName;
    }
```

    不相同直接重新创建component。
3、 setComponentProps 执行这个组件的```componentWillReceiveProps```。

4、enqueueRender
对所有脏组件执行```renderComponent```。setstate中已经说过脏组件怎样产生了。

5、renderComponent

主要：

1、判断孩子节点和上次是否同一类型，如果同一类型，则继续对孩子递归setComponentProps。直到最后没有孩子，设置真实dom。类似于初次产生的过程
2、如果非同一类型，则对它销毁重新挂载吧。。


这个地方感觉表述的不太清....求大佬指点吧