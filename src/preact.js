import { h, h as createElement } from './h';
import { cloneElement } from './clone-element';
import { Component } from './component';
import { render } from './render';
import { rerender } from './render-queue';
import options from './options';
/**
 * h函数和createElement函数是同一个
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