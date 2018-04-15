
jsx要转化成virtualDOM，首先经过babel，再经过h函数的调用形成virtualDOM。具体如下 

源码链接 [src/h.js](./src/h.js)

相当于react得createElement()，jsx经过babel转码后是h的循环调用，生成virtualDOM。
```jsx
// jsx
<div>
<span className="sss" fpp="xxx">123</span>
<Hello/>
<span>xxx</span>
</div>

// h结果
h(
  "div",
  null,
  h(
    "span",
    { className: "sss", fpp: "xxx" },
    "123"
  ),
h(Hello, null),
  h(
    "span",
    null,
    "xxx"
  )
);
```
通过源码中h的函数定义也可以看见。h的函数第一个参数是标签名（如果是组件类型的化就是组件名）、第二个参数是属性值的key-value对象，后面的参数是所有子组件。

vnode的结构


h函数会根据子组件的不同类型进行封装，具体如下
- bool 返回 null
- null 返回 ""
- number 返回 String(number)

最后赋值给child变量并存进childdren数组中，再封装成下面的vnode结构并返回

```javascript
{
    nodeName:"div",//标签名
    children:[],//子组件组成的数组，每一项也是一个vnode
    key:"",//key
    attributes:{}//jsx的属性
}
```

流程图：
