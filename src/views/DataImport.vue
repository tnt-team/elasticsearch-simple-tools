<template>
    <div class="page-container col-xs-12">
        <div class="page-content col-xs-9">
            <div role="form">
                <div class="form-group">
                    <label for="">请在此填入数据</label>
                    <textarea class="form-control" rows="10" placeholder="data"></textarea>
                </div>
            </div>
            <button type="button" class="btn btn-default">开始导入</button>
            <div class="result-panel panel panel-default">
                <div id="exportResult" class="execResult panel-body">{{ message }}</div>
            </div>
        </div>
        <div class="page-content col-xs-3">
            <h3>usage:</h3>
            <p>拷贝本工具集“数据查询及导出功能”查询得到的json结果，填入数据，执行“开始导入”即可。</p>
        </div>
    </div>
</template>
<script>
    export default {
        data(){
            return {}
        },
        computed: {},
        components: {},
        methods: {}
    }
</script>
<style scoped>
    textarea{
        width: 100%;
        resize: none;
    }
</style>