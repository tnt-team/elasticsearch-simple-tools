<template>
  <div class="page-container">
    <div class="page-content flex-page col-xs-9">
      <div role="form" >
        <div class="form-group">
          <label for="routingDeleteValue">路由值</label>
          <div class="form-group">
            <input type="text" class="form-control" id="routingDeleteValue" v-model="routingDeleteValue">
          </div>
        </div>
        <button id="deleteRoutingBtn" type="button" class="btn btn-default" @click="routerDelete">删除</button>
      </div>
      <div class="result-panel panel panel-default">
          <pre id="routingDelResult" class="execResult panel-body">
            {{routingDelResult}}
          </pre>
      </div>
    </div>
    <div class="page-content col-xs-3">
      <h3>usage:</h3>
      <p>根据路由值删除该路由下所有数据（请谨慎操作！）</p>
    </div>
  </div>
</template>
<script >
  import $ from 'jquery'
  import utils from '../utils/utils'

  export default {
    name: 'RouterDelete',
    data () {
      return {
        routingDeleteValue: '',
        routingDelResult: ''
      }
    },
    methods: {
      routerDelete () {
        let routing = this.routingDeleteValue.trim()
        let searchUrl = utils.getHost() + '/_search'
//        let bulkDelRoutingUrl = utils.getHost() + '/_bulk'
        let that = this

        $.ajax({
          url: searchUrl,
          type: 'POST',
          data: `{"from":0,"size":10000,"query": {"term": {"_routing": "${routing}"}}}`,
          success (result) {
            if (!(result && result.hits.hits[0] && result.hits.hits[0]._id)) {
              console.log('查询没有结果')
              that.routingDelResult = '查询没有结果'
//              return
            }
            /* bulkDelete(bulkDelRoutingUrl, result, (err) => {
              that.routingDelResult = `删除成功！共删除'${result.hits.hits.length}条数据。`
              return false
            }, routing) */
          },
          error (err) {
            that.routingDelResult = '获取路由下数据失败' + err
          }
        })
      }
    }
  }
</script>
<style scoped>


</style>
