<template>
  <div class="page-container">
    <div class="page-content flex-page col-xs-9">
      <h2>flyway 删除</h2>
      <form role="form">
        <div class="form-group">
          <label for="bulkDeleteIndex">版本号</label>
          <div class="form-group">
            <div class="form-group">
              <input class="form-control" id="deleteFlyVersion" v-model="deleteFlyVersion">
            </div>
          </div>
        </div>
        <button type="button" id="deleteFlyBtn" class="btn btn-default" @click="deleteFly">删除</button>
      </form>
      <div class="result-panel panel panel-default">
        <pre id="flywayResult" class="execResult panel-body">{{flywayResult}}</pre>
      </div>
    </div>
    <div class="page-content col-xs-3">
      <h3>usage:</h3>
      <p> 根据版本号删除flyway一条信息</p>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import $ from 'jquery'
  import utils from '../utils/utils'

  export default {
    data () {
      return {
        deleteFlyVersion: '',
        flywayResult: ''
      }
    },
    methods: {
      deleteFly () {
        let text = this.deleteFlyVersion
        let that = this
        let searchUrl = utils.getHost() + '/flyway/flywayInfo/_search'
        $.ajax({
          type: 'POST',
          url: searchUrl,
          data: '{"query": {"term": {"fVersion": "' + text + '"}}}',
          success (result) {
            if (!(result && result.hits.hits[0] && result.hits.hits[0]._id)) {
              console.log('查询没有结果')
              that.flywayResult = '查询没有结果'
              return
            }
            let id = result.hits.hits[0]._id
            let deleteUrl = utils.getHost() + '/flyway/flywayInfo/' + id
            $.ajax({
              type: 'DELETE',
              url: deleteUrl,
              success (data) {
                if (data && data.found) {
                  console.log('删除成功')
                  that.flywayResult = '删除成功'
                }
              },
              error (data) {
                console.log(data)
                that.flywayResult = JSON.stringify(data)
              }
            })
          },
          error (result) {
            that.flywayResult = JSON.stringify(result)
          }
        })
      }
    }
  }
</script>
<style>
  .row {
    margin-right: 0;
    margin-left: 0;
  }

  .toolFrame {
    border: 1px #efefef solid;
    padding: 5px;
  }
  .panel{
    border:none;
    webkit-box-shadow:none;
    box-shadow: none;
  }
  .execResult {
    margin-top: 15px;
    border: 1px #efefef solid;
    padding: 5px;
    word-break: break-all;
    word-wrap: break-word;
    overflow-y: auto;
    user-select: text;
    -moz-user-select: text;
    -webkit-user-select: text;
    -ms-user-select: text;
  }
</style>
