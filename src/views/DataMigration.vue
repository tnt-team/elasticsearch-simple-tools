<template>
    <div class="page-container col-xs-12">
        <div class="page-content col-xs-9">
            <div role="form">
                <div class="form-group">
                    <label for="">起始索引</label>
                    <div class="form-group">
                        <select name="" class="form-control" v-model="index">
                            <option v-for="index in indices" value="{{index}}">{{index}}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="">目标索引</label>
                    <div>
                        <select name="" class="form-control">
                            <option value="">hello world</option>
                        </select>
                    </div>
                </div>
                <button type="button" class="btn btn-default">开始迁移</button>
                <div class="result-panel panel panel-default">
                    <div class="execResult panel-body">

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
    import utils from '../utils';
    export default {
        data(){
            return {
                indices:[],
                index:'',
            }
        },
        computed: {},
        components: {},
        methods: {}
    }
</script>
<style scoped>


</style>