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
3、 setComponentProps
4、enqueueRender
5、renderComponent

```javascript
buildComponentFromVNode(dom, vnode, context, mountAll)



```

```javascript
//setComponentProps内
enqueueRender()
```