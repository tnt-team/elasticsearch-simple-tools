<template>
<div class="toolWrapper row">
    <div class="toolFrame col-xs-12 col-md-6">
        <h2>路由删除功能</h2>
        <form role="form">
            <div class="form-group">
                <label for="routingDeleteValue">路由值</label>
                <div class="form-group">
                    <div class="form-group">
                        <input class="form-control" id="routingDeleteValue" />
                    </div>
                </div>
            </div>

            <button type="button" id="deleteRoutingBtn" class="btn btn-default">删除</button>
        </form>
        <textarea id="routingDelResult" cols="70" class="execResult"></textarea>

    </div>
    <div class="toolFrame col-xs-12 col-md-6">
        <h3>usage:</h3>
        <p> 根据路由值删除该路由下所有数据（请谨慎操作！）</p>
    </div>
</div>

</template>

<script>
    //    删除路由
    $("#deleteRoutingBtn").on('click', function() {
        var routing = $("#routingDeleteValue").val();
        var searchUrl = host + '/_search';
        var bulkDelRoutingUrl = host + "/_bulk";

        $.ajax({
            url: searchUrl,
            type: "POST",
            data: '{"from":0,"size":10000,"query": {"term": {"_routing": "' + routing + '"}}}',
            success: function(result) {
                if (!(result && result.hits.hits[0] && result.hits.hits[0]._id)) {
                    console.log('查询没有结果');
                    $("#routingDelResult").text('查询没有结果');
                    return;
                }
                bulkDelete(bulkDelRoutingUrl, result, function(err) {
                    $("#routingDelResult").text('删除成功！共删除' + result.hits.hits.length + "条数据。");
                    return false;
                }, routing);
            },
            error: function(err) {
                $("#routingDelResult").text('获取路由下数据失败' + err);

            }
        });
    });
</script>