<template>
<div class="toolWrapper row">
        <div id="upgradeTool" class="toolFrame col-xs-12 col-md-6">
            <h2>数据迁移</h2>
            <form id="upgradeForm" role="form">
                <!--<div class="form-group">
                    <label for="upgradeFromIndex">from index</label>
                    <input type="text" class="form-control" id="upgradeFromIndex" placeholder="from index">
                </div>-->
                <div class="form-group">
                    <label for="upgradeFromIndex">起始索引</label>
                    <div class="form-group">
                        <select class="form-control _index" id="upgradeFromIndex">
                    </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="upgradeToIndex">目标索引</label>
                    <div class="form-group">
                        <select class="form-control _index" id="upgradeToIndex">
                    </select>
                    </div>
                </div>
                <!--<div class="form-group">
                    <label for="upgradeToIndex">目标索引</label>
                    <input type="text" class="form-control" id="upgradeToIndex" placeholder="to index">
                </div>-->
                <button type="submit" class="btn btn-default">开始迁移</button>
            </form>
            <p id="upgradeResult" class="execResult"></p>
        </div>
        <div class="toolFrame col-xs-12 col-md-6">
            <h3>usage:</h3>
            <p>迁移索引数据。</p>
            <p>将起始索引的数据迁移到目标索引中。（目前只能迁移10000条数据）</p>
        </div>
    </div>
</template>
<script>
    $("#upgradeForm").on("submit", function(evt) {
        evt.preventDefault();
        msgUpgradeResult("...");
        var upgradeFromIndex = $("#upgradeFromIndex").val().trim();
        var upgradeToIndex = $("#upgradeToIndex").val().trim();
        if (!upgradeFromIndex || !upgradeToIndex) {
            msgUpgradeResult("参数为空");
            return false;
        }
        var upgradeUrl = host + "/" + upgradeFromIndex;
        upgradeUrl += "/_search";
        $.ajax({
            type: "POST",
            url: upgradeUrl,
            data: '{"fields":["_parent","_source"],"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
                '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}',
            success: function(result) {
                msgUpgradeResult('升级中...');
                try {
                    var importDataObj = result;
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
                        dataItemIndex = upgradeToIndex;
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
                            msgUpgradeResult(JSON.stringify(result));
                        },
                        error: function(result) {
                            msgUpgradeResult(JSON.stringify(result));
                        }
                    });
                } catch (err) {
                    console.error(err.message, err.stack);
                }
            },
            error: function(result) {
                msgUpgradeResult(JSON.stringify(result));
            }
        });
        return false;
    });
</script>
<style>

</style>