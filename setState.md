#### setState发生了什么

```javascript
setState(state, callback) {
    let s = this.state;
    if (!this.prevState) this.prevState = extend({}, s);
    extend(s, typeof state==='function' ? state(s, this.props) : state);
    if (callback) (this._renderCallbacks = (this._renderCallbacks || [])).push(callback);
    enqueueRender(this);
},
```

setState的定义如上，代码逻辑很容易看出

1、prevState若不存在，将要更新的state合并到prevState上

2、可以看出Preact中setState参数也是可以接收函数作为参数的。将要更新的state合并到当前的state

3、如果提供了回调函数，则将回调函数放进```_renderCallbacks```队列

4、调用enqueueRender进行组件更新

关于enqueueRender的相关定义

```javascript
let items = [];

export function enqueueRender(component) {
	// dirty 为true表明这个组件重新渲染
    if (!component._dirty && (component._dirty = true) && items.push(component) == 1) {//语句1
        // 只会执行一遍
        (options.debounceRendering || defer)(rerender); // 相当于setTimeout render 语句2
    }
}

export function rerender() {
    let p, list = items;
    items = [];
    while ((p = list.pop())) {
        if (p._dirty) renderComponent(p);
    }
}
```
enqueueRender的逻辑主要是

1、语句1： 将调用了```setState```的组件的```_dirty```属性设置为false。通过这段代码我们还可以发现，
如果在一次流程中，调用了多次setState，rerender函数实际上还是只执行了一遍（通过判断component._dirty的值来保证一个组件内的多次setState只执行一遍rerender和判断```items.push(component) == 1```确保如果存在父组件调用setState，然后它的子组件也调用了setState，还是只会执行一次rerender）。items队列是用来存放当前所有dirty组件。

2、语句2。可以看作是```setTimeout```，将```rerender```函数放在本次事件循环结束后执行。```rerender```函数对所有的dirty组件执
行```renderComponent```进行组件更新。

流程图如下：

![setState](/img/setState.png)

下一步，就是研究setState组件进行更新时的diff算法干了啥