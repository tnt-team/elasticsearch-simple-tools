<template>
<div class="toolWrapper row">
    <div id="exportTool" class="toolFrame col-xs-12 col-md-6">
        <h2>数据导出功能·新</h2>
        <form id="exportFormN" role="form">
            <div id="exportSelectGroupN" class="form-group"></div>
            <div class="form-group">
                <label for="exportRoutingN">routing</label>
                <input type="text" class="form-control" id="exportRoutingN" placeholder="routing">
            </div>
            <button type="submit" class="btn btn-default">导出</button>
        </form>
        <textarea id="exportNResult" cols="70" class="execResult"></textarea>
    </div>
    <div class="toolFrame col-xs-12 col-md-6">
        <h3>usage:</h3>
        <p>选择index和type,点击“查询”可显示该type下所有数据，点击“下载”可下载该数据json文件</p>
    </div>
</div>
</template>
<script>
    // 数据导出·新
    $('#dataExportToggle').on('shown.bs.tab', function(e) {
        console.log('here');
        var sel = $('#exportSelectGroupN');
        if (sel.html().trim() !== '') return;

        var tpl1 = '<div class="checkbox"><label><input class="index-ck" data-index="{{index}}" type="checkbox" value="{{index}}"><b>{{index}}</b></label>{{indexHtml}}</div>';
        var tpl2 = '<label class="checkbox-inline"><input class="type-ck" data-index="{{index}}" type="checkbox" value="{{type}}">{{type}}</label>';
        var innerHtml = '<div class="checkbox"><label><input class="all-ck" type="checkbox" value=""><b>全选</b></label></div>';
        var idx = Object.keys(indices);
        idx.sort();
        idx.forEach(function(index) {
            var indexHtml = '';
            var types = indices[index];
            if (types.length > 0) indexHtml += '&nbsp;&nbsp;&nbsp;&nbsp;';
            types.forEach(function(type) {
                indexHtml += tpl2.replace(/{{index}}/g, index).replace(/{{type}}/g, type);
            });

            innerHtml += tpl1.replace(/{{index}}/g, index).replace(/{{indexHtml}}/g, indexHtml);
        });
        sel.html(innerHtml);

        //events
        sel.find('.all-ck').on('click', function() {
            // console.log('click');
            var isChecked = $(this).is(":checked");
            var selIndex = sel.find('.index-ck');
            var selType = sel.find('.type-ck');
            if (isChecked) {
                selIndex.prop("checked", "checked");
                selType.prop("checked", "checked");
            } else {
                selIndex.removeAttr("checked");
                selType.removeAttr("checked");
            }
        });

        sel.find('.index-ck').on('change', function() {
            // console.log('change');
            var isChecked = $(this).is(":checked");
            var selIndex = sel.find('.index-ck');
            var selIndexChecked = sel.find('.index-ck:checked');
            var index = $(this).attr('data-index');
            var selType = sel.find('.type-ck[data-index=' + index + ']');
            var selTypeChecked = sel.find('.type-ck[data-index=' + index + ']:checked');
            if (isChecked) {
                if (selIndexChecked.length === selIndex.length) sel.find('.all-ck').prop("checked", "checked");
                if (selTypeChecked.length === 0) selType.prop("checked", "checked");
            } else {
                sel.find('.all-ck').removeAttr("checked");
                selType.removeAttr("checked");
            }
        });

        sel.find('.type-ck').on('click', function() {
            // console.log('click');
            var isChecked = $(this).is(":checked");
            var index = $(this).attr('data-index');
            var selIndex = sel.find('.index-ck[data-index=' + index + ']');
            var selTypeChecked = sel.find('.type-ck[data-index=' + index + ']:checked');
            if (isChecked) {
                selIndex.prop("checked", "checked");
                sel.find('.index-ck').trigger("change");
            }
            if (!isChecked && selTypeChecked.length === 0) {
                selIndex.removeAttr("checked");
                sel.find('.index-ck').trigger("change");
            }
        });
    });

    $("#exportFormN").on("submit", function(evt) {

        var exportTotalResult = [];

        evt.preventDefault();
        msgExportNResult("...");

        var routing = $("#exportRoutingN").val().trim();

        var exportTypeQuery = function(index, type, routing) {
            var exportUrl = host + "/" + index + "/" + type + "/_search?scroll=1m";
            var exportResult = {};
            var routingQurey = '';
            if (routing) {
                routingQurey = '{"term":{ "_routing":"' + routing + '"}}';
            }
            var postData = '{"size":10000,"query":{"bool":{"must":[' + routingQurey + '],"must_not":[],' +
                '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}';
            var nr = '...';
            // console.log(routingQurey);
            var ajaxQuery = function(from, scrollId) {
                if (!from) from = 0;
                if (scrollId) {
                    exportUrl = host + '/_search/scroll?scroll=1m&scroll_id=' + scrollId;
                    postData = ''
                }
                $.ajax({
                    type: "POST",
                    url: exportUrl,
                    data: postData,
                    success: function(result) {
                        msgExportNResult(nr);
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
                        msgExportNResult(JSON.stringify(result));
                    }
                });
            }
            ajaxQuery();
        }

        var selTypeChecked = $('#exportSelectGroupN').find('.type-ck:checked');
        selTypeChecked.each(function(ix, selType) {
            selType = $(selType);
            var index = selType.attr('data-index');
            var type = selType.val();
            exportTypeQuery(index, type, routing);
        });

        var timer = setInterval(function() {
            if (exportTotalResult.length === selTypeChecked.length) {
                // console.log(exportTotalResult);
                clearInterval(timer);

                // export file
                var outContent = '// --------------------------------------------------------\n';
                // author
                outContent += '// ------------------ ElasticsearchTool -------------------\n';
                // date
                var cdate = new Date();
                outContent += '// ------- ' + cdate.toString() + ' ---------\n';
                outContent += '// --------------------------------------------------------\n';
                outContent += '\n\n';
                // data
                exportTotalResult.forEach(function(typeData) {
                    outContent += '// --------------------------------------------------------\n';
                    outContent += '// ---------- index:' + typeData.index + '\n// ---------- type: ' + typeData.type + '\n';
                    outContent += 'global.' + typeData.type + ' = \'';
                    outContent += JSON.stringify(typeData.data);
                    outContent += '\'';
                    outContent += '\n';
                    outContent += '// --------------------------------------------------------\n\n';
                });
                // console.log(outContent);
                msgExportNResult(outContent);
                downloadFile('export' + cdate.getTime(), outContent, 'text/plain');
            }
        }, 200);

        return false;
    });
</script>