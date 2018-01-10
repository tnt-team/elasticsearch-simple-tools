<template>
    <div id="dataMultiExport" class="page-container">
        <div class="page-content col-xs-12 col-md-9">
            <div id="dataMultiExportForm" role="form">
                <div id="exportSelectGroup" class="form-group">
                    <div class="checkbox"><label><input class="all-ck" type="checkbox" value="" @click="allCheck"><b>全选</b></label></div>
                    <div class="checkbox" v-for="(index, types) in indexDict">
                        <label><input class="index-ck" data-index="{{index}}" type="checkbox" value="{{index}}" @change="indexChange"><b>{{index}}</b></label>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <label class="checkbox-inline" v-for="tp in types"><input class="type-ck" data-index="{{index}}" type="checkbox" value="{{tp}}" @click="typeCheck">{{tp}}</label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="exportRoutingN">routing</label>
                    <input type="text" class="form-control" id="exportRoutingN" placeholder="routing" v-model="routing">
                </div>
                <button type="submit" class="btn btn-default" @click="doExport">导出</button>
            </div>
            <div class="result-panel panel panel-default">
                <pre id="exportResult" class="execResult panel-body">{{ message }}</pre>
            </div>
        </div>
        <div class="page-content col-xs-12 col-md-3">
            <h3>usage:</h3>
            <p>选择index和type,点击“查询”可显示该type下所有数据，点击“下载”可下载该数据json文件</p>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
import utils from '../utils';

export default {
    data() {
        return {
            indexDict: {},
            message: '',
            // form
            routing: ''
        }
    },
    attached() {
        // 视图渲染之后需要处理索引select的显示
        let indexDict = utils.getState();
        if (indexDict) {
            this.indexDict = indexDict;
        }
    },
    ready() {
        // 索引数据加载好之后处理索引select显示
        $(document).on('dataReady', () => {
            this.indexDict = utils.getState();
            console.log('dataReady', this.indexDict);
        });
    },
    methods: {
        allCheck(evt) {
            let sel = $('#exportSelectGroup');
            let isChecked = $(evt.target).is(":checked");
            let selIndex = sel.find('.index-ck');
            let selType = sel.find('.type-ck');
            if (isChecked) {
                selIndex.prop("checked", "checked");
                selType.prop("checked", "checked");
            } else {
                selIndex.removeAttr("checked");
                selType.removeAttr("checked");
            }
        },
        indexChange(evt) {
            let sel = $('#exportSelectGroup');
            let isChecked = $(evt.target).is(":checked");
            let selIndex = sel.find('.index-ck');
            let selIndexChecked = sel.find('.index-ck:checked');
            let index = $(evt.target).attr('data-index');
            let selType = sel.find('.type-ck[data-index=' + index + ']');
            let selTypeChecked = sel.find('.type-ck[data-index=' + index + ']:checked');
            if (isChecked) {
                if (selIndexChecked.length === selIndex.length) sel.find('.all-ck').prop("checked", "checked");
                if (selTypeChecked.length === 0) selType.prop("checked", "checked");
            } else {
                sel.find('.all-ck').removeAttr("checked");
                selType.removeAttr("checked");
            }
        },
        typeCheck(evt) {
            let sel = $('#exportSelectGroup');
            let isChecked = $(evt.target).is(":checked");
            let index = $(evt.target).attr('data-index');
            let selIndex = sel.find('.index-ck[data-index=' + index + ']');
            let selTypeChecked = sel.find('.type-ck[data-index=' + index + ']:checked');
            if (isChecked) {
                selIndex.prop("checked", "checked");
                sel.find('.index-ck').trigger("change");
            }
            if (!isChecked && selTypeChecked.length === 0) {
                selIndex.removeAttr("checked");
                sel.find('.index-ck').trigger("change");
            }
        },
        doExport() {
            let that = this;
            this.message = '...';

            let exportTotalResult = [];
            let routing = this.routing;
            let exportTypeQuery = (index, type, routing) => {
                let exportUrl = utils.getHost() + "/" + index + "/" + type + "/_search?scroll=1m";
                let exportResult = {};
                let routingQurey = '';
                if (routing) {
                    routingQurey = '{"term":{ "_routing":"' + routing + '"}}';
                }
                let postData = '{"size":10000,"query":{"bool":{"must":[' + routingQurey + '],"must_not":[],' +
                    '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}';
                let nr = '...';
                // console.log(routingQurey);
                let ajaxQuery = (from, scrollId) => {
                    if (!from) from = 0;
                    if (scrollId) {
                        exportUrl = utils.getHost() + '/_search/scroll?scroll=1m&scroll_id=' + scrollId;
                        postData = ''
                    }
                    $.ajax({
                        type: "POST",
                        url: exportUrl,
                        data: postData,
                        success(result) {
                            that.message = nr;
                            nr += '.';
                            if (typeof exportResult.total !== 'number') {
                                exportResult.total = result.hits.total;
                                exportResult.hits = [];
                            }
                            if (typeof result.hits.hits === 'object' && result.hits.hits instanceof Array) {
                                // console.log('ret5');
                                // console.log(result.hits.hits.slice(0, 5));
                                exportResult.hits = exportResult.hits.concat(result.hits.hits);
                            }
                            if (from + 10000 < exportResult.total) ajaxQuery(from + 10000, result._scroll_id);
                            else exportTotalResult.push({
                                index: index,
                                type: type,
                                data: exportResult
                            });
                        },
                        error: function(result) {
                            that.message = 'JSON.stringify(result)';
                        }
                    });
                };
                ajaxQuery();
            };

            let selTypeChecked = $('#exportSelectGroup').find('.type-ck:checked');
            selTypeChecked.each(function(ix, selType) {
                selType = $(selType);
                let index = selType.attr('data-index');
                let type = selType.val();
                exportTypeQuery(index, type, routing);
            });

            let timer = setInterval(() => {
                if (exportTotalResult.length === selTypeChecked.length) {
                    // console.log(exportTotalResult);
                    clearInterval(timer);

                    // export file
                    let outContent = '// --------------------------------------------------------\n';
                    // author
                    outContent += '// ------------------ ElasticsearchTool -------------------\n';
                    // date
                    let cdate = new Date();
                    outContent += '// ------- ' + cdate.toString() + ' ---------\n';
                    outContent += '// --------------------------------------------------------\n';
                    outContent += '\n\n';
                    // data
                    exportTotalResult.forEach((typeData) => {
                        outContent += '// --------------------------------------------------------\n';
                        outContent += '// ---------- index:' + typeData.index + '\n// ---------- type: ' + typeData.type + '\n';
                        outContent += 'global.' + typeData.type + ' = \'';
                        outContent += JSON.stringify(typeData.data);
                        outContent += '\'';
                        outContent += '\n';
                        outContent += '// --------------------------------------------------------\n\n';
                    });
                    // console.log(outContent);
                    that.message = outContent;
                    utils.downloadFile('export' + cdate.getTime(), outContent, 'text/plain');
                }
            }, 200);
        }
    }
}
</script>

<style scoped>
    #exportSelectGroup {
        border: 1px #efefef solid;
        max-height: 400px;
        padding-left: 10px;
        overflow-y: auto;
    }
    .checkbox-inline+.checkbox-inline {
        margin-left: 20px;
    }
</style>