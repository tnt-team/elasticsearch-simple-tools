<template>
    <div class="page-container col-xs-12">
        <div class="page-content col-xs-9">
            <div role="form">
                <div class="form-group">
                    <label for="upgradeFromIndex">起始索引</label>
                    <div class="form-group">
                        <select id="upgradeFromIndex" name="" class="form-control" v-model="index">
                            <option v-for="indexBegin in indices" value="{{index}}">{{ indexBegin }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="upgradeToIndex">目标索引</label>
                    <div>
                        <select id="upgradeToIndex" name="" class="form-control" v-model="index">
                            <option v-for="indexEnd in indices" value="{{index}}">{{ indexEnd }}</option>
                        </select>
                    </div>
                </div>
                <button type="button" class="btn btn-default" @click="moveData">开始迁移</button>
                <div class="result-panel panel panel-default">
                    <div id="upgradeResult" class="execResult panel-body">

                    </div>
                </div>
            </div>
        </div>
        <div class="page-content col-xs-3">
            <h3>usage:</h3>
            <p>迁移索引数据</p>
            <p>将起始索引的数据迁移到目标索引中。（目前只能迁移10000条数据）</p>
        </div>
    </div>
</template>
<script>
    import $ from 'jquery';
    import utils from '../utils';
    export default {
        data(){
            return {
                indices:[],
                index:'',
                types:[],
                message:'',
                type:'',
                indexDict:{}
            }
        },

        watch:{
            index(val){
                this.types=this.indexDict[val];
                if(this.types.length>0){
                    this.type=this.types[0]
                }
            }
        },

        ready() {
            // 索引数据加载好之后处理索引select显示
            $(document).on('dataReady', () => {
                this.indexDict = utils.getState();
                console.log('dataReady', this.indexDict);

                let indices = [];
                Object.keys(this.indexDict).forEach(index => {
                    indices.push(index);
                });
                this.indices = indices;
                if (this.indices.length > 0) {
                    this.index = this.indices[0];
                    this.types = this.indexDict[this.index];

                    if (this.types.length > 0) {
                        this.type = this.types[0];
                    }
                }

            });
        },

        methods: {
            moveData(){
                let upgradeFromIndex = $("#upgradeFromIndex").val().trim();
                let upgradeToIndex = $("#upgradeToIndex").val().trim();
                if (!upgradeFromIndex || !upgradeToIndex) {
                    $("#upgradeResult").html("参数为空");
                    return false;
                }

                let upgradeQuery = function(results) {
                    try {
                        let importDataObj = results;
                        let dataBody;
                        if (typeof importDataObj.hits === "object" && !(importDataObj.hits instanceof Array) &&
                            typeof importDataObj.hits.hits === "object" && importDataObj.hits.hits instanceof Array) {
                            dataBody = importDataObj.hits.hits;
                        } else if (typeof importDataObj.hits === "object" && importDataObj.hits instanceof Array) {
                            dataBody = importDataObj.hits;
                        }
                        let bulkBody = "";
                        let i, dataItem, dataItemId, dataItemIndex, dataItemType, dataItemRouting, dataItemSource;
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

                        let importUrl = utils.getHost() + "/_bulk";
                        $.ajax({
                            type: "POST",
                            url: importUrl,
                            data: bulkBody,
                            success: function(result) {
                                totalSucc += dataBody.length;
                                $("#upgradeResult").html("需要升级总数：" + totalHits + "    已升级：" + totalSucc);
                                if (errMsg.length > 0) $("#upgradeResult").html("升级中发生错误：" + errMsg + "    需要升级总数：" + totalHits + "    已升级：" + totalSucc);
                            },
                            error: function(result) {
                                errMsg += 'ts    ';
                                msgExportNResult(errMsg);
                                console.error('error', ts, e);
                            }
                        });
                    } catch (err) {
                        errMsg += err.message + '    ';
                        $("#upgradeResult").html(errMsg);
                        console.error(err.message, err.stack);
                    }
                };

                let exportUrl = utils.getHost() + "/" + upgradeFromIndex;
                exportUrl += "/_search?scroll=1m";
                let postData = '{"fields":["_parent","_source"],"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
                    '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}';
                let nr = "...";
                let totalHits = NaN;
                let totalFrom = NaN;
                let totalSucc = NaN;
                let errMsg = '';
                let ajaxQuery = function(scrollId) {
                    if (!totalFrom) totalFrom = 0;
                    if (scrollId) {
                        exportUrl = utils.getHost() + '/_search/scroll?scroll=1m&scroll_id=' + scrollId;
                        postData = ''
                    }
                    $.ajax({
                        type: "POST",
                        url: exportUrl,
                        data: postData,
                        success: function(result) {
                            $("#upgradeResult").html(nr);
                            nr += '.';
                            if (!totalHits) {
                                totalHits = result.hits.total;
                                totalSucc = 0;
                                $("#upgradeResult").html("需要升级总数：" + totalHits + "    已升级：" + 0);
                            }
                            if (typeof result.hits.hits === 'object' && result.hits.hits instanceof Array) {
                                // console.log('ret5');
                                // console.log(result.hits.hits.slice(0, 5));
                                // exportResult.hits = exportResult.hits.concat(result.hits.hits);
                                upgradeQuery(result);
                            }
                            if (totalFrom + 10000 < totalHits) {
                                totalFrom += 10000;
                                ajaxQuery(result._scroll_id);
                            }
                        },
                        error: function(xhr, ts, e) {
                            errMsg += 'ts    ';
                            $("#upgradeResult").html(errMsg);
                            console.error('error', ts, e);
                        }
                    });
                };
                ajaxQuery();
                return false;
            }
        }
    }
</script>
<style scoped>


</style>