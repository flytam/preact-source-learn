```jsx
// 一个简单的Preact demo
import { h, render, Component } from 'preact';

class Clock extends Component {
	render() {
		let time = new Date().toLocaleTimeString();
		return <span>{ time }</span>;
	}
}

render(<Clock />, document.body);
```

调用了preact的render方法将virtualDOM渲染到真实dom。

```javascript
// render.js
import { diff } from './vdom/diff';
export function render(vnode, parent, merge) {
	return diff(merge, vnode, {}, false, parent, false);
}
```

可见，render方法的第一个参数一个vnode，第二个参数是要挂载到的dom的节点，这里暂时不考虑第三个参数。而render方法实际上又是
去调用/vdom/diff.js下的diff方法

```javascript
//diff函数的定义
export function diff(dom, vnode, context, mountAll, parent, componentRoot) {}
```

render函数使vnode转换成真实dom主要进行了以下操作
- render函数实际上调用了diff方法，diff方法进而调用了idiff。
- idiff方法会返回真实的html。idiff内将vnode分为4大类型进行处理封装在html
- 然后调用diffAttributes，将vnode上的属性值更新到html domnode的属性上。(通过setAccessor)
-  初次render时，下面if条件恒为真，所以真实html就这样被装进了。
```javascript
 if (parent && ret.parentNode !== parent) parent.appendChild(ret);
 ```

这样初次的vnode转化成真实html就完成了

![vnode转化为真实html](/img/vnode转化为真实html.png)

 tips：在diff中会见到很多的```out[ATTR_KEY]```，这个是用来将dom的attributrs数组每一项的name value转化为键值对存进 out[ATTR_KEY]。


 组件的buildComponentFromNode是怎样的？
 
 buildComponentFromNode的定义
 ```javascript
 /** Apply the Component referenced by a VNode to the DOM.
 *	@param {Element} dom	The DOM node to mutate
 *	@param {VNode} vnode	A Component-referencing VNode
 *	@returns {Element} dom	The created/mutated element
 *	@private
 */
export function buildComponentFromVNode(dom, vnode, context, mountAll) {}
 ```

 初次调用时 buildComponentFromNode(undefined,vnode,{},false)。因此，初次render时的buildComponentFromVNode内部只是调用了如下的逻辑（不执行的代码去掉了）

 ```javascript

 export function buildComponentFromVNode(dom, vnode, context, mountAll) {
	let c = dom && dom._component, // undefined
		originalComponent = c,//undefined
		oldDom = dom,// undefined
		isDirectOwner = c && dom._componentConstructor===vnode.nodeName,//undefined
		props = getNodeProps(vnode);// 这个函数除了一般的props获取外，还会加上defaultProps。
		c = createComponent(vnode.nodeName, props, context);// 创建组件
		setComponentProps(c, props, SYNC_RENDER, context, mountAll);
		dom = c.base;
	return dom;
}
 ```

 组件的创建和后续处理，后面讲解