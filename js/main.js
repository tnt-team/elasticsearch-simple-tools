console.log("usage:");
console.log("1.copy this file to /usr/local/elasticsearch-2.2.0/plugins/head/_site/");
console.log("2.visit [host]:9200/_plugin/head/ElasticsearchTool.html");

var host = getHost();

$(function () {



    //页面设置高度
    setHeight();

    setAllIndex();
    // setTypes();

    /**
     * 导出
     */
    $("#exportForm").on("submit", function (evt) {
        evt.preventDefault();
        msgExportResult("...");
        var exportIndex = $("#exportIndex").val().trim();
        var exportType = $("#exportType").val().trim();
        if (!exportIndex) {
            msgExportResult("参数为空");
            return false;
        }
        var exportUrl = host + "/" + exportIndex;
        if (exportType) exportUrl += "/" + exportType;
        exportUrl += "/_search";
        $.ajax({
            type: "POST",
            url: exportUrl,
            data: '{"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
            '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}',
            success: function (result) {
                msgExportResult(JSON.stringify(result));
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
    $("#exportIndex").on("change", function () {
        var index = $(this).val();
        console.log(index);
        setTypes(index);

    });


    //导出文件
    $(".exportJson").on("click",function () {
        var content =$("#exportResult").text();
        var fileName = $("#exportIndex").val()+"-"+$("#exportType")+".json";
        downloadFile(fileName,content);
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
                msgImportResult(JSON.stringify(result));
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
        var bulkDelete = $("#bulkDeleteData").val();
        if (!bulkDeleteIndex || !bulkDeleteType || !bulkDelete) {
            msgBulkDeleteResult("参数为空");
            return false;
        }

        if (bulkDelete.lastIndexOf(',') === bulkDelete.length - 1) {
            bulkDelete = bulkDelete.slice(0, -1);
        }

        var dataBody;
        try {
            var bulkDeleteObj = JSON.parse(bulkDelete);
            console.log(bulkDeleteObj);
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

        if (dataBody) {
            var i;
            var ids = [];
            for (i = 0; i < dataBody.length; i++) {
                ids.push(dataBody[i]._id);
            }
            bulkDelete = ids.join(',');

        }
        console.log(bulkDelete);

        var bulkDeleteArray = bulkDelete.split(",");
        var bulkBody = "";
        for (var i = 0; i < bulkDeleteArray.length; i++) {
            if (bulkDeleteRouting) {
                bulkBody += '{"delete":{"_id":"' + bulkDeleteArray[i].trim() + '","_routing":"' + bulkDeleteRouting + '"}}\n';
            } else {
                bulkBody += '{"delete":{"_id":"' + bulkDeleteArray[i].trim() + '"}}\n';
            }
        }

        var bulkDeleteUrl = host + "/" + bulkDeleteIndex + "/" + bulkDeleteType + "/_bulk";
        $.ajax({
            type: "POST",
            url: bulkDeleteUrl,
            data: bulkBody,
            success: function (result) {
                msgBulkDeleteResult(JSON.stringify(result));
            },
            error: function (result) {
                msgBulkDeleteResult(JSON.stringify(result));
            }
        });
        return false;
    });

});


function msgExportResult(msg) {
    $("#exportResult").text(msg);
}

// type import
function msgImportResult(msg) {
    $("#importResult").text(msg);
}

// bulk delete
function msgBulkDeleteResult(msg) {
    $("#bulkDeleteResult").text(msg);
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
    $.get(url, function (data) {
        // data = JSON.parse(data);
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
        $("#exportIndex").append(indices.toString());
        if (firstIndex) {
            setTypes(firstIndex);
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
        $("#exportType").html(" ");
        types.forEach(function (type) {
            $("#exportType").append("<option value='" + type + "'>" + type + "</option>");
        });

    });
}

/**
 * 获取请求地址
 * @returns {string}
 */
function getHost() {

    var protocol = window.location.protocol;
    var hostname = window.location.hostname;
    return protocol + "//" + hostname + ":9200";


}

/**
 * 文件下载
 * @param fileName
 * @param content
 */
function downloadFile(fileName, content){
    var aLink = document.createElement('a');
    var blob = new Blob([content]);
    var evt = document.createEvent("HTMLEvents");
    evt.initEvent("click", false, false);//initEvent 不加后两个参数在FF下会报错, 感谢 Barret Lee 的反馈
    aLink.download = fileName;
    aLink.href = URL.createObjectURL(blob);
    aLink.dispatchEvent(evt);
}