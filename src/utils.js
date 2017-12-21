'use strict'
import $ from 'jquery';

exports.shuffle = arr => {
  for (let i = arr.length - 1; i >= 0; i--) { 
    let randomIndex = Math.floor(Math.random() * (i + 1)); 
    let itemAtIndex = arr[randomIndex]; 
    arr[randomIndex] = arr[i]; 
    arr[i] = itemAtIndex; 
  }
  return arr; 
};

exports.imgUrlParse = imgUrl => {
  let endl = imgUrl.indexOf('(#)');
  let src = imgUrl.slice(0, endl);
  let dim = imgUrl.slice(endl + 3);
  let ix = dim.indexOf('x');
  let w = parseInt(dim.slice(0, ix));
  let h = parseInt(dim.slice(ix + 1));
  // console.log({ src: src, width: w, height: h });
  return { src: src, width: w, height: h };
};
