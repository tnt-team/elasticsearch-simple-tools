<template>
    <div id="index" class="page-container">
        <div id="exportTool" class="page-content col-xs-12 col-md-9">
            <div id="exportForm" role="form">
                <div class="form-group">
                    <label for="exportIndex">index</label>
                    <div class="form-group">
                        <select id="exportIndex" class="form-control" v-model="index">
                            <option v-for="index in indices" value="{{index}}">{{ index }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="exportType">type</label>
                    <div class="form-group">
                        <select id="exportType" class="form-control" v-model="type">
                            <option v-for="t in types" value="{{t}}">{{ t }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="exportRouti/*  */ng">routing</label>
                    <input id="exportRouting" type="text" class="form-control" placeholder="routing" v-model="routing">
                </div>
                <button type="submit" class="btn btn-default" @click="doQuery">查询</button>
                <button type="button" class="btn btn-default exportJson" @click="doExport">下载</button>
            </div>
            <div class="result-panel panel panel-default">
                <div id="exportResult" class="execResult panel-body">{{ message }}</div>
            </div>
        </div>
        <div class="page-content col-xs-12 col-md-3">
            <h3>usage:</h3>
            <p>选择index和type,点击“查询”可显示该type下所有数据，点击“下载”可下载该数据json文件</p>
        </div>
    </div>

</template>
<script>
</script>
<style>

</style>