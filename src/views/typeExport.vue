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
                            <option v-for="tp in types" value="{{tp}}">{{ tp }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="exportRouting">routing</label>
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
import $ from 'jquery';
import utils from '../utils';

export default {
    data() {
        return {
            indexDict: {},
            indices: [],
            types: [],
            message: '',
            // form data
            index: '',
            type: '',
            routing: ''
        }
    },
    watch: {
        index(val) {
            this.types = this.indexDict[val];
            if (this.types.length > 0) {
                this.type = this.types[0];
            }
        }
    },
    ready() {
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
        doQuery() {
            this.message = '...';

            let routingQurey = '';
            if (this.routing) {
                routingQurey = '{"term":{ "_routing":"' + this.routing + '"}}';
            }
            let exportUrl = utils.getHost() + "/" + this.index + "/" + this.type + "/_search";

            let that = this;
            $.ajax({
                type: "POST",
                url: exportUrl,
                data: '{"from":0,"size":10000,"query":{"bool":{"must":[' + routingQurey + '],"must_not":[],' +
                '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}',
                success(result) {
                    that.message = utils.format(JSON.stringify(result), false);
                },
                error(err) {
                    that.message = JSON.stringify(err);
                }
            });
        },
        doExport() {
            if (!this.message) {
                alert('内容为空，请点击Submit!');
                return;
            }
            let fileName = this.index + "-" + this.type + ".json";
            utils.downloadFile(fileName, this.message);
        }
    }
}
</script>

<style>

</style>