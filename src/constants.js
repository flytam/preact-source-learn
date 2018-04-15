// 4种渲染模式
export const NO_RENDER = 0;
export const SYNC_RENDER = 1;
export const FORCE_RENDER = 2;
export const ASYNC_RENDER = 3;


export const ATTR_KEY = '__preactattr_';

// DOM properties that should NOT have "px" added when numeric
// DOM 的属性值是数字类型的时候不应该有px
export const IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;