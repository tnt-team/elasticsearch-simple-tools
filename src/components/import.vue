<html>
<div class="toolWrapper row">

    <div id="importTool" class="toolFrame col-xs-12 col-md-6">
        <h2>数据导入功能</h2>
        <form id="importForm" role="form">
            <div class="form-group">
                <label for="importData">请在此填入数据</label>
                <textarea id="importData" class="form-control" rows="4" placeholder="data"></textarea>
            </div>
            <button type="submit" class="btn btn-default">开始导入</button>
        </form>
        <textarea id="importResult" cols="70" class="execResult"></textarea>
    </div>
    <div class="toolFrame col-xs-12 col-md-6">
        <h3>usage:</h3>
        <p>拷贝本工具集“数据查询及导出功能”查询得到的json结果,填入数据，执行“开始导入”即可。</p>
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
<style lang="">

</style>