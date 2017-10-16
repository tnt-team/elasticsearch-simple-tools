<html>
<div class="toolWrapper row">
    <div id="bulkDeleteTool" class="toolFrame col-xs-12 col-md-6">
        <h2>以type为单位删除数据</h2>
        <form id="bulkDeleteForm" role="form">
            <div class="form-group">
                <label for="bulkDeleteIndex">index</label>
                <div class="form-group">
                    <select class="form-control _index" id="bulkDeleteIndex">
                            </select>
                </div>
                <!--<input type="text" class="form-control" id="bulkDeleteIndex" placeholder="index">-->
            </div>
            <div class="form-group">
                <label for="bulkDeleteType">type</label>
                <!--<input type="text" class="form-control _type" id="bulkDeleteType" placeholder="type">-->
                <div class="form-group">
                    <select class="form-control _type" id="bulkDeleteType">
                            </select>
                </div>
            </div>
            <div class="form-group">
                <label for="bulkDeleteRouting">routing</label>
                <input type="text" class="form-control" id="bulkDeleteRouting" placeholder="routing,为空表示删除所有路由下该类型数据">
            </div>
            <div class="form-group">
                <label for="bulkDeleteData">data</label>
                <textarea id="bulkDeleteData" class="form-control" rows="4" placeholder="请填写要删除数据的id集合，以逗号分隔。为空表示全部删除"></textarea>
            </div>
            <button type="submit" class="btn btn-default">Submit</button>
        </form>
        <textarea id="bulkDeleteResult" cols="70" class="execResult"></textarea>
    </div>
    <div class="toolFrame col-xs-12 col-md-6">
        <h3>usage:</h3>
        <p>批量删除
        </p>
    </div>
</div>

</html>
<script>
    /**
     * 删除
     */
    $("#bulkDeleteForm").on("submit", function(evt) {
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

        var bulkDeleteUrl = host + "/" + bulkDeleteIndex + "/" + bulkDeleteType + "/_bulk";

        //如果data值为空，发起查询请求
        if (!bulkDeleteData) {
            if (!confirm('确认删除该类型全部下的数据吗？')) {
                return false;
            }
            var searchUrl = host + "/" + bulkDeleteIndex + "/" + bulkDeleteType + "/_search";
            if (bulkDeleteRouting) {
                searchUrl += '?routing=' + bulkDeleteRouting;
            }
            $.ajax({
                type: "POST",
                url: searchUrl,
                data: '{"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
                    '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}',
                success: function(result) {
                    bulkDelete(bulkDeleteUrl, result, function(err) {
                        msgBulkDeleteResult("删除完成！共删除" + result.hits.hits.length + "条数据。");
                    });
                    return false;
                },
                error: function(err) {
                    msgBulkDeleteResult(JSON.stringify(err));
                    return false;
                }
            });
        } else {
            var delIds = bulkDeleteData.split(',');
            bulkDeleteByIds(bulkDeleteUrl, bulkDeleteIndex, bulkDeleteType, bulkDeleteRouting, delIds, function(err, delLength) {
                if (err) {
                    msgBulkDeleteResult("删除失败！" + err);
                } else {
                    msgBulkDeleteResult("删除成功，共删除" + delLength + '条数据');
                }
            });
        }
    });

    /**
     * 批量删除ES数据
     * @param deleteUrl  删除url
     * @param bulkDeleteObj  要删除的数据
     * @param routing  路由
     */
    function bulkDelete(deleteUrl, bulkDeleteObj, callback, routing) {

        var dataBody = '',
            bulkBody = '';
        try {
            if (typeof bulkDeleteObj.hits === "object" && !(bulkDeleteObj.hits instanceof Array) &&
                typeof bulkDeleteObj.hits.hits === "object" && bulkDeleteObj.hits.hits instanceof Array) {
                dataBody = bulkDeleteObj.hits.hits;
            } else if (typeof bulkDeleteObj.hits === "object" && bulkDeleteObj.hits instanceof Array) {
                dataBody = bulkDeleteObj.hits;
            }
        } catch (err) {
            console.error(err.message, err.stack);
        }
        for (var i = 0; i < dataBody.length; i++) {
            var _index = dataBody[i]._index;
            var _type = dataBody[i]._type;
            routing = dataBody[i]._routing || routing
            if (routing) {
                bulkBody += '{"delete":{"_index":"' + _index + '","_type":"' + _type + '","_id":"' + dataBody[i]._id.trim() + '","_routing":"' + routing + '"}}\n';
            } else {
                bulkBody += '{"delete":{"_index":"' + _index + '","_type":"' + _type + '","_id":"' + dataBody[i]._id.trim() + '"}}\n';
            }
        }
        if (!dataBody || (dataBody.length <= 0)) {
            callback('该类型下没有数据', null);
            // msgBulkDeleteResult('该类型下没有数据');
            return false;
        }
        $.ajax({
            type: "POST",
            url: deleteUrl,
            data: bulkBody,
            success: function(result) {
                callback(null);
                // msgBulkDeleteResult(format(JSON.stringify(result), false));
            },
            error: function(err) {
                callback(err, null);
                // msgBulkDeleteResult(format(JSON.stringify(result), false));
            }
        });
        return false;
    }

    /**
     * 根据id数组批量删除数据
     */
    function bulkDeleteByIds(deleteUrl, index, type, routing, idArr, callback) {
        if (!idArr || idArr.length <= 0) {
            callback('没有可删除的数据', null);
            return false;
        }
        var length = idArr.length;
        var bulkBody = '';
        for (var i = 0; i < length; i++) {
            if (routing) {
                bulkBody += '{"delete":{"_index":"' + index + '","_type":"' + type + '","_id":"' + idArr[i].trim() + '","_routing":"' + routing + '"}}\n';
            } else {
                bulkBody += '{"delete":{"_index":"' + index + '","_type":"' + type + '","_id":"' + idArr[i].trim() + '"}}\n';
            }
        }
        $.ajax({
            type: "POST",
            url: deleteUrl,
            data: bulkBody,
            success: function(result) {
                callback(null, result.items.length);
            },
            error: function(err) {
                callback(err, null);
            }
        });
    }
</script>