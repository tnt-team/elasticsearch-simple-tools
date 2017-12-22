'use strict'
import $ from 'jquery';

var indices = null;

exports.getHost = () => {
    let protocol = window.location.protocol;
    let hostname = window.location.hostname;
    return protocol + "//" + hostname + ":9200";
};

exports.fetchState = () => {
    return new Promise((resolve, reject) => {

        if (indices) {
            resolve(indices);
            return;
        }

        let url = exports.getHost() + "/_cluster/state";

        $.ajax({
            type: "GET",
            url: url,
            success(data) {
                if (typeof data.metadata !== 'object') {
                    console.error('fetchState error: data not correct!');
                    reject('fetchState error: data not correct!');
                    return;
                }
                // console.log(data);
                indices = {};
                let data_indices = data.metadata.indices;
                Object.keys(data_indices).forEach(index => {
                    let index_data = data_indices[index];
                    let index_mappings = index_data.mappings;

                    indices[index] = Object.keys(index_mappings);
                });
                console.log(indices);
                resolve(indices);
            },
            error(err) {
                console.error('fetchState error: ', err);
                reject(err);
            }
        });
    });
};

exports.getState = () => {
    return indices;
};

/**
 * 格式化JSON源码(对象转换为JSON文本)
 * @param txt
 * @param compress 格式化JSON源码(对象转换为JSON文本)
 * @returns {string}
 */
exports.format = (txt, compress) => {
    let indentChar = '    ';
    if (/^\s*$/.test(txt)) {
        alert('数据为空,无法格式化! ');
        return '';
    }
    let data = null;
    try {
        data = eval('(' + txt + ')');
    } catch (e) {
        alert('数据源语法错误,格式化失败! 错误信息: ' + e.description);
        return '';
    }
    let draw = [],
        last = false,
        This = this,
        line = compress ? '' : '\n',
        nodeCount = 0,
        maxDepth = 0;

    /**
     *
     * @param name
     * @param value
     * @param isLast
     * @param indent 缩进
     * @param formObj
     */
    var notify = (name, value, isLast, indent, formObj) => {
        // 节点计数
        nodeCount++;
        // 缩进HTML
        let tab = '';
        for (let i = 0; i < indent; i++) tab += indentChar;
        // 压缩模式忽略缩进
        tab = compress ? '' : tab;
        // 缩进递增并记录
        maxDepth = ++indent;
        // 处理数组
        if (value && value.constructor == Array) {
            // 缩进'[' 然后换行
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + '[' + line);
            for (let i = 0; i < value.length; i++)
                notify(i, value[i], i == value.length - 1, indent, false);
            // 缩进']'换行,若非尾元素则添加逗号
            draw.push(tab + ']' + (isLast ? line : (',' + line)));
        }
        // 处理对象
        else if (value && typeof value == 'object') {
            // 缩进'{' 然后换行
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + '{' + line);
            let len = 0,
                i = 0;
            for (let key in value) len++;
            for (let key in value) notify(key, value[key], ++i == len, indent, true);
            // 缩进'}'换行,若非尾元素则添加逗号
            draw.push(tab + '}' + (isLast ? line : (',' + line)));
        } else {
            if (typeof value == 'string') value = '"' + value + '"';
            draw.push(tab + (formObj ? ('"' + name + '":') : '') + value + (isLast ? '' : ',') + line);
        }
    };
    let isLast = true,
        indent = 0;
    notify('', data, isLast, indent, false);
    return draw.join('');
};

exports.downloadFile = (fileName, content, ext) => {
    let a = document.createElement('a');
    let defaultType = {
        type: 'application/json'
    };
    if (ext) defaultType.type = ext;
    let blob = new Blob([content], {
        type: defaultType
    });
    let url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};