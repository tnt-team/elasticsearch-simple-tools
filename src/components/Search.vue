<html>
<div class="toolWrapper row">
    <div id="exportTool" class="toolFrame col-xs-12 col-md-6">
        <h2>数据查询及导出功能</h2>
        <form id="exportForm" role="form">
            <div class="form-group">
                <label for="exportIndex">index</label>
                <div class="form-group">
                    <select class="form-control _index" id="exportIndex">
                                </select>
                </div>
            </div>
            <div class="form-group">
                <label for="exportType">type</label>
                <div class="form-group">
                    <select class="form-control _type" id="exportType">
                                </select>
                </div>
            </div>
            <div class="form-group">
                <label for="exportRouting">routing</label>
                <input type="text" class="form-control" id="exportRouting" placeholder="routing">
            </div>
            <button type="submit" class="btn btn-default">查询</button>
            <button type="button" class="btn btn-default exportJson">下载</button>
        </form>
        <textarea id="exportResult" cols="70" class="execResult"></textarea>
    </div>
    <div class="toolFrame col-xs-12 col-md-6">
        <h3>usage:</h3>
        <p>选择index和type,点击“查询”可显示该type下所有数据，点击“下载”可下载该数据json文件</p>
    </div>
</div>

</html>
<script>
    /**
     * 导入
     */
    $("#importForm").on("submit", function(evt) {
        evt.preventDefault();
        msgImportResult("...");
        var importData = $("#importData").val().trim();
        if (!importData) {
            msgImportResult("参数为空");
            return false;
        }

        var importDataObj = JSON.parse(importData);
        var dataBody;
        if (typeof importDataObj.hits === "object" && !(importDataObj.hits instanceof Array) &&
            typeof importDataObj.hits.hits === "object" && importDataObj.hits.hits instanceof Array) {
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
                bulkBody += '{"index":{"_index":"' + dataItemIndex + '","_type":"' + dataItemType + '","_id":"' +
                    dataItemId + '","_routing":"' + dataItemRouting + '"}}\n';
            } else {
                bulkBody += '{"index":{"_index":"' + dataItemIndex + '","_type":"' + dataItemType + '","_id":"' +
                    dataItemId + '"}}\n';
            }
            bulkBody += JSON.stringify(dataItemSource) + '\n';
        }

        var importUrl = host + "/_bulk";
        $.ajax({
            type: "POST",
            url: importUrl,
            data: bulkBody,
            success: function(result) {
                msgImportResult(format(JSON.stringify(result)), false);
            },
            error: function(result) {
                msgImportResult(JSON.stringify(result));
            }
        });
        return false;
    });
</script>
<style>
</style>