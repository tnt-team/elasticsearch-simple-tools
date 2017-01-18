console.log("usage:");
console.log("1.copy this file to /usr/local/elasticsearch-2.2.0/plugins/head/_site/");
console.log("2.visit [host]:9200/_plugin/head/ElasticsearchTool.html");

// var host = getHost();
var host=getHost();

$(function () {



    //页面设置高度
    setHeight();

    setAllIndex();


    //
    // $("#esConnect").on('click',function () {
    //     var ip = $("#es-port").val();
    //      if(!ip.trim()){
    //          alert('所填地址为空，请重新填写！');
    //          return false;
    //      }
    //     setAllIndex(host);
    // });

    /**
     * 导出
     */
    $("#exportForm").on("submit", function (evt) {
        evt.preventDefault();
        msgExportResult("...");
        var _index = $("#exportIndex").val().trim();
        var exportType = $("#exportType").val().trim();
        if (!_index) {
            msgExportResult("参数为空");
            return false;
        }
        var exportUrl = host + "/" + _index;
        if (exportType) exportUrl += "/" + exportType;
        exportUrl += "/_search";
        $.ajax({
            type: "POST",
            url: exportUrl,
            data: '{"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
            '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}',
            success: function (result) {
                var json = format(JSON.stringify(result), false);
                msgExportResult(json);
            },
            error: function (result) {
                msgExportResult(JSON.stringify(result));
            }
        });
        return false;
    });


    /**
     * 索引改变事件
     */
    $("._index").on("change", function () {
        var index = $(this).val();
        console.log(index);
        setTypes(index);

    });


    //导出文件
    $(".exportJson").on("click", function () {
        var content = $("#exportResult").text();
        if (!content.trim()) {
            alert('内容为空，请点击Submit!');
            return;
        }
        var fileName = $("#exportIndex").val() + "-" + $("#exportType").val() + ".json";
        downloadFile(fileName, content);
    });


    /**
     * 从文件中导入数据
     */
    $(".import-btn").on("click", function () {
        alert('待后续完成...');


    });


    /**
     * 导入
     */
    $("#importForm").on("submit", function (evt) {
        evt.preventDefault();
        msgImportResult("...");
        var importData = $("#importData").val().trim();
        if (!importData) {
            msgImportResult("参数为空");
            return false;
        }

        var importDataObj = JSON.parse(importData);
        var dataBody;
        if (typeof importDataObj.hits === "object" && !(importDataObj.hits instanceof Array)
            && typeof importDataObj.hits.hits === "object" && importDataObj.hits.hits instanceof Array) {
            dataBody = importDataObj.hits.hits;
        } else if (typeof importDataObj.hits === "object" && importDataObj.hits instanceof Array) {
            dataBody = importDataObj.hits;
        }
        var bulkBody = "";
        var i, dataItem, dataItemId, dataItemIndex, dataItemType, dataItemRouting, dataItemSource;
        for (i = 0; i < dataBody.length; i++) {
            dataItem = dataBody[i];
            dataItemId = dataItem._id;
            dataItemIndex = dataItem._index;
            dataItemType = dataItem._type;
            dataItemRouting = dataItem._routing;
            dataItemSource = dataItem._source;

            if (dataItemRouting) {
                bulkBody += '{"index":{"_index":"' + dataItemIndex + '","_type":"' + dataItemType + '","_id":"'
                    + dataItemId + '","_routing":"' + dataItemRouting + '"}}\n';
            } else {
                bulkBody += '{"index":{"_index":"' + dataItemIndex + '","_type":"' + dataItemType + '","_id":"'
                    + dataItemId + '"}}\n';
            }
            bulkBody += JSON.stringify(dataItemSource) + '\n';
        }

        var importUrl = host + "/_bulk";
        $.ajax({
            type: "POST",
            url: importUrl,
            data: bulkBody,
            success: function (result) {
                msgImportResult(format(JSON.stringify(result)), false);
            },
            error: function (result) {
                msgImportResult(JSON.stringify(result));
            }
        });
        return false;
    });


    /**
     * 删除
     */
    $("#bulkDeleteForm").on("submit", function (evt) {
        evt.preventDefault();
        msgBulkDeleteResult("...");

        var bulkDeleteIndex = $("#bulkDeleteIndex").val().trim();
        var bulkDeleteType = $("#bulkDeleteType").val().trim();
        var bulkDeleteRouting = $("#bulkDeleteRouting").val().trim();
        var bulkDeleteData = $("#bulkDeleteData").val();
        if (!bulkDeleteIndex || !bulkDeleteType) {
            msgBulkDeleteResult("参数为空");
            return false;
        }
        //如果id值为空，发起查询请求
        var bulkDeleteUrl = host + "/" + bulkDeleteIndex + "/" + bulkDeleteType + "/_bulk";

        if (!bulkDeleteData) {
            var index = $("#bulkDeleteIndex").val();
            var type = $("#bulkDeleteType").val();
            var searchUrl = host + "/" + index + "/" + type + "/_search";
            $.ajax({
                type: "POST",
                url: searchUrl,
                data: '{"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
                '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}',
                success: function (result) {
                    bulkDelete(bulkDeleteUrl,result);
                    return false;

                },
                error: function (result) {
                    msgBulkDeleteResult(JSON.stringify(result));
                    return false;
                }
            });
        }else{
            bulkDelete(bulkDeleteUrl,JSON.parse(bulkDeleteData));

        }

    });

    $("#deleteFlyBtn").on('click',function () {
        var text = $("#deleteFlyVersion").val();
        var searchUrl = host + '/flyway/flywayInfo/_search';
        $.ajax({
            type: "POST",
            url: searchUrl,
            data: '{"query": {"term": {"fVersion": "'+text+'"}}}',
            success: function (result) {
               console.log(result);

                return false;

            },
            error: function (result) {
                msgBulkDeleteResult(JSON.stringify(result));
                return false;
            }
        });
    });


});


function msgExportResult(msg) {
    $("#exportResult").html(msg);
}

// type import
function msgImportResult(msg) {
    $("#importResult").text(msg);
}

// bulk delete
function msgBulkDeleteResult(msg) {
    $("#bulkDeleteResult").html(msg);
}

function setHeight() {
    var th = $(window).height() - 69 - 41 - 5;
    $(".toolWrapper").height(Math.max(th, 755));
    $(".toolFrame").height($(".toolWrapper").height() - 12);


    // type export
    $("#exportResult").height($(".toolFrame").height() - 356 + 75);
    $("#importResult").height($(".toolFrame").height() - 356 + 75);

    $("#bulkDeleteResult").height($(".toolFrame").height() - 356 + 75 - 74 * 3);


}

/**
 * 获取所有索引
 */
function setAllIndex() {
    var url = host + "/_cat/indices";
    var indices = [];
    var firstIndex = '';

    $.ajax({
        type: "GET",
        url: url,
        success: function (data) {
            console.log(data);
            var indices_text = data.split("\n");
            indices_text.pop();

            indices_text.forEach(function (e) {
                var arr = e.split(" ");
                if (!firstIndex) {
                    firstIndex = arr[2];
                }
                indices.push("<option value='" + arr[2] + "'>" + arr[2] + "</option>");
            });
            $("._index").append(indices.toString());
            if (firstIndex) {
                setTypes(firstIndex);
            }
        },
        error: function (result) {
            msgBulkDeleteResult(JSON.stringify(result));
            return false;
        }
    });


}

/**
 * 根据索引设置类型
 */
function setTypes(index) {
    var url = host + "/" + index + "/_mapping";
    $.get(url, function (data) {
        var mapping = data[index].mappings;
        var types = Object.keys(mapping);
        $("._type").html(" ");
        types.forEach(function (type) {
            $("._type").append("<option value='" + type + "'>" + type + "</option>");
        });

    });
}

/**
 * 批量删除ES数据
 * @param deleteUrl  删除url
 * @param bulkDeleteObj  要删除的数据
 * @param routing  路由
 * @returns {boolean}
 */
function  bulkDelete(deleteUrl,bulkDeleteObj,routing) {

    var dataBody='',bulkBody='';
    try {
        if (typeof bulkDeleteObj.hits === "object" && !(bulkDeleteObj.hits instanceof Array)
            && typeof bulkDeleteObj.hits.hits === "object" && bulkDeleteObj.hits.hits instanceof Array) {
            dataBody = bulkDeleteObj.hits.hits;
        } else if (typeof bulkDeleteObj.hits === "object" && bulkDeleteObj.hits instanceof Array) {
            dataBody = bulkDeleteObj.hits;
        }
        console.log(dataBody);
    } catch (err) {
        console.error(err.message, err.stack);
    }
    for (var i = 0; i < dataBody.length; i++) {
        if (routing) {
            bulkBody += '{"delete":{"_id":"' + dataBody[i]._id.trim() + '","_routing":"' + routing + '"}}\n';
        } else {
            bulkBody += '{"delete":{"_id":"' + dataBody[i]._id.trim() + '"}}\n';
        }
    }
    if(!dataBody||(dataBody.length<=0)){
        msgBulkDeleteResult('该类型下没有数据');
        return false;
    }

    $.ajax({
        type: "POST",
        url: deleteUrl,
        data: bulkBody,
        success: function (result) {
            msgBulkDeleteResult(format(JSON.stringify(result),false));
        },
        error: function (result) {
            msgBulkDeleteResult(format(JSON.stringify(result),false));
        }
    });
    return false;
}

/**
 * 获取请求地址
 * @returns {string}
 */
function getHost() {

    var protocol = window.location.protocol;
    var hostname = window.location.hostname;
    return protocol + "//" + hostname + ":9200";

    // return 'http://192.168.30.60:9200';

}

/**
 * 文件下载
 * @param fileName
 * @param content
 */
function downloadFile(fileName, content){
    var a = document.createElement('a');
    var blob = new Blob([content],
        {type : 'application/json'});
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
}


// 格式化json
function format(txt,compress/*是否为压缩模式*/){/* 格式化JSON源码(对象转换为JSON文本) */
    var indentChar = '    ';
    if(/^\s*$/.test(txt)){
        alert('数据为空,无法格式化! ');
        return;
    }
    try{var data=eval('('+txt+')');}
    catch(e){
        alert('数据源语法错误,格式化失败! 错误信息: '+e.description,'err');
        return;
    };
    var draw=[],last=false,This=this,line=compress?'':'\n',nodeCount=0,maxDepth=0;

    var notify=function(name,value,isLast,indent/*缩进*/,formObj){
        nodeCount++;/*节点计数*/
        for (var i=0,tab='';i<indent;i++ )tab+=indentChar;/* 缩进HTML */
        tab=compress?'':tab;/*压缩模式忽略缩进*/
        maxDepth=++indent;/*缩进递增并记录*/
        if(value&&value.constructor==Array){/*处理数组*/
            draw.push(tab+(formObj?('"'+name+'":'):'')+'['+line);/*缩进'[' 然后换行*/
            for (var i=0;i<value.length;i++)
                notify(i,value[i],i==value.length-1,indent,false);
            draw.push(tab+']'+(isLast?line:(','+line)));/*缩进']'换行,若非尾元素则添加逗号*/
        }else   if(value&&typeof value=='object'){/*处理对象*/
            draw.push(tab+(formObj?('"'+name+'":'):'')+'{'+line);/*缩进'{' 然后换行*/
            var len=0,i=0;
            for(var key in value)len++;
            for(var key in value)notify(key,value[key],++i==len,indent,true);
            draw.push(tab+'}'+(isLast?line:(','+line)));/*缩进'}'换行,若非尾元素则添加逗号*/
        }else{
            if(typeof value=='string')value='"'+value+'"';
            draw.push(tab+(formObj?('"'+name+'":'):'')+value+(isLast?'':',')+line);
        };
    };
    var isLast=true,indent=0;
    notify('',data,isLast,indent,false);
    return draw.join('');
}