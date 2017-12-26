<template>
    <div class="page-container col-xs-12">
        <div class="page-content col-xs-9">
            <div role="form">
                <div class="form-group">
                    <label for="">请在此填入数据</label>
                    <textarea id="importData" class="form-control" rows="5" placeholder="data"></textarea>
                </div>
            </div>
            <button type="button" class="btn btn-default" @click="doImport">开始导入</button>
            <div class="result-panel panel panel-default">
                <div id="importResult" class="execResult panel-body">{{ message }}</div>
            </div>
        </div>
        <div class="page-content col-xs-3">
            <h3>usage:</h3>
            <p>拷贝本工具集“数据查询及导出功能”查询得到的json结果，填入数据，执行“开始导入”即可。</p>
        </div>
    </div>
</template>
<script>
    import $ from 'jquery';
    import utils from '../utils.js';

    export default {
        data(){
            return {
                index:'',
                type:'',
                message:'',
                bulkBody:'',
                types:[],
                indexDict:{},
            }
        },
        methods: {
            doImport(){
                let importData = $("#importData").val().trim();
                if (!importData) {
                    $("#importResult").html("参数为空");
                    return false;
                }

                let importDataObj = JSON.parse(importData);
                let dataBody;
                if (typeof importDataObj.hits === "object" && !(importDataObj.hits instanceof Array) &&
                    typeof importDataObj.hits.hits === "object" && importDataObj.hits.hits instanceof Array) {
                    dataBody = importDataObj.hits.hits;
                } else if (typeof importDataObj.hits === "object" && importDataObj.hits instanceof Array) {
                    dataBody = importDataObj.hits;
                }
                let i, dataItem, dataItemId, dataItemIndex, dataItemType, dataItemRouting, dataItemSource;
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

                let importUrl = utils.getHost() + "/_bulk";
                $.ajax({
                    type: "POST",
                    url: importUrl,
                    data: bulkBody,
                    success: function(result) {
                        $("#importResult").html(format(JSON.stringify(result)), false);
                    },
                    error: function(result) {
                        $("#importResult").html(JSON.stringify(result));
                    }
                });
                return false;
            }
        }
    }
</script>
<style scoped>
    textarea{
        width: 100%;
        resize: none;
    }
</style>