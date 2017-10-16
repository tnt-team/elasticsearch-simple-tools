<template>
<div class="toolWrapper row">
        <div class="toolFrame col-xs-12 col-md-6">
            <h2>flyway 删除</h2>
            <form role="form">
                <div class="form-group">
                    <label for="bulkDeleteIndex">版本号</label>
                    <div class="form-group">
                        <div class="form-group">
                            <input class="form-control" id="deleteFlyVersion" />
                        </div>
                    </div>
                </div>

                <button type="button" id="deleteFlyBtn" class="btn btn-default">删除</button>
            </form>
            <textarea id="flywayResult" cols="70" class="execResult"></textarea>

        </div>
        <div class="toolFrame col-xs-12 col-md-6">
            <h3>usage:</h3>
            <p> 根据版本号删除flyway一条信息</p>
        </div>
    </div>
</template>
<script>
    // flyway删除
    $("#deleteFlyBtn").on('click', function() {
        var text = $("#deleteFlyVersion").val();
        var searchUrl = host + '/flyway/flywayInfo/_search';
        $.ajax({
            type: "POST",
            url: searchUrl,
            data: '{"query": {"term": {"fVersion": "' + text + '"}}}',
            success: function(result) {
                if (!(result && result.hits.hits[0] && result.hits.hits[0]._id)) {
                    console.log('查询没有结果');
                    $("#flywayResult").text('查询没有结果');
                    return;
                }
                var id = result.hits.hits[0]._id;
                var deleteUrl = host + '/flyway/flywayInfo/' + id;
                $.ajax({
                    type: 'DELETE',
                    url: deleteUrl,
                    success: function(data) {

                        if (data && data.found) {
                            console.log('删除成功');
                            $("#flywayResult").text('删除成功');
                        }
                    },
                    error: function(data) {
                        console.log(data);
                    }
                });
                return false;
            },
            error: function(result) {
                msgBulkDeleteResult(JSON.stringify(result));
                return false;
            }
        });
    });
</script>