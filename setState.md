#### setState发生了什么

```javascript
setState(state, callback) {
    let s = this.state;
    if (!this.prevState) this.prevState = extend({}, s);
    extend(s, typeof state==='function' ? state(s, this.props) : state);// 语句3
    if (callback) (this._renderCallbacks = (this._renderCallbacks || [])).push(callback);
    enqueueRender(this);
},
```

setState的定义如上，代码逻辑很容易看出

1、prevState若不存在，将要更新的state合并到prevState上

2、可以看出Preact中setState参数也是可以接收函数作为参数的。将要更新的state合并到当前的state

3、如果提供了回调函数，则将回调函数放进```_renderCallbacks```队列

4、调用enqueueRender进行组件更新

why？我刚看到setState的第2、3行代码的时候也是一脸蒙蔽。为什么它要这样又搞一个```this.prevState```又搞一个```this.state```，又有个```state```呢？WTF。
这个```prevState```主要是保留原先的state，在```shouldComponentUpdate```和```componentWillUpdate```中通过```this.state```使用的（因为下面会分析到state的值在setState时就会被改变了，区别与react）。props同理。

```javascript
// 例如这里的handleClick是绑定click事件

handleClick = () =>{
    // 注意，preact中setState后state的值是会马上更新的
    this.setState({a:this.state.a+1});
    console.log(this.state.a);
    this.setState({a:this.state.a+1});
    console.log(this.state.a);
} 
```

基本上每一个学react的人，都知道上述代码函数在react中执行之后a的值只会加一，but!!!!在Preact中是加2的！！！！通过分析Preact的setState可以解释这个原因。
在上面的语句3，extend函数调用后，当前的state值已经改变了。但是即使state的值改变了，但是多次setState仍然是会只进行一次组件的更新（通过setTimeout把更新操作放在当前事件循环的最后），以最新的state为准。所以，这里的prevState应该是用于记录当前setState之前的上一次state的值，用于后面的diff计算。在enqueueRender执行diff时比较prevState和当前state的值


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


在renderComponent中将会执行的代码。只列出和初次渲染时有区别的主要部分

```javascript
export function renderComponent(component, opts=undefined, mountAll=undefined, isChild=undefined) {
    ....
    if (isUpdate) {
        component.props = previousProps;
        component.state = previousState;
        component.context = previousContext;
        if (opts !== FORCE_RENDER && // FORCE_RENDER是在调用组件的forceUpdate时设置的状态位
            component.shouldComponentUpdate &&
            component.shouldComponentUpdate(props, state, context) === false) {
            skip = true;// 如果shouldComponentUpdate返回了false，设置skip标志为为true，后面的渲染部分将会被跳过
        } else if (component.componentWillUpdate) {
            component.componentWillUpdate(props, state, context);//执行componentWillUpdate生命周期函数
        }

        // 更新组件的props state context。因为componentWillUpdate里面有可能再次去修改它们的值
        component.props = props;
        component.state = state;
        component.context = context;
    }
    ....
    component._dirty = false;
    ....
    // 省略了diff渲染和dom更新部分代码
    ...
    if (!skip) {
        if (component.componentDidUpdate) {
            //componentDidUpdate生命周期函数
            component.componentDidUpdate(previousProps, previousState, previousContext);
        }
    }

    if (component._renderCallbacks != null) {
        // 执行setState的回调
        while (component._renderCallbacks.length) component._renderCallbacks.pop().call(component);
    }
}
```

逻辑看代码注释就很清晰了。先```shouldComponentUpdate```生命周期，根据返回值决定是都否更新（通过skip标志位）。然后将组件的_dirty设置为true表明已经更新了该组件。然后diff组件更新，执行```componentDidUpdate```生命周期，最后执行setState传进的callback。


流程图如下：

![setState](/img/setState.png)


组件的原型上除了```setState```外，还有一个方法就是```forceUpdate```。该方法的作用是强制组件更新，直接执行```renderComponent```并会跳过
```shouldComponentUpdate```生命周期。该方法和setState类似可以接收一个回调函数作为参数
```javascript
    forceUpdate(callback) {
        if (callback)(this._renderCallbacks = (this._renderCallbacks || [])).push(callback);
        renderComponent(this, FORCE_RENDER);
    },
```

下一步，就是研究组件执行setState进行更新时的diff算法做了什么操作