<template>
  <div class="page-container">
    <div class="page-content flex-page col-xs-9">
      <div role="form" id="upgradeForm">
        <div class="form-group">
          <label for="upgradeFromIndex">起始索引</label>
          <div class="form-group">
            <select id="upgradeFromIndex" class="form-control" v-model="indexBeg">
              <option v-for="indexBegin in indices" :value="indexBegin">{{ indexBegin }}</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label for="upgradeToIndex">目标索引</label>
          <div>
            <select id="upgradeToIndex" class="form-control" v-model="indexEd">
              <option v-for="indexEnd in indices" :value="indexEnd">{{ indexEnd }}</option>
            </select>
          </div>
        </div>
        <button type="button" class="btn btn-default" @click="moveData">开始迁移</button>
      </div>
      <div class="result-panel panel panel-default">
        <pre id="upgradeResult" class="execResult panel-body">
          {{msg}}
        </pre>
      </div>
    </div>
    <div class="page-content col-xs-3">
      <h3>usage:</h3>
      <p>迁移索引数据</p>
      <p>将起始索引的数据迁移到目标索引中。</p>
    </div>
  </div>
</template>
<script>
  import $ from 'jquery'
  import utils from '../utils/utils'

  export default {
    data () {
      return {
        indices: [],
        indexBeg: '',
        indexEd: '',
        types: [],
        msg: '',
        type: '',
        indexDict: {}
      }
    },
    watch: {
      indexBeg (valBeg) {
        this.types = this.indexDict[valBeg]
        if (this.types.length > 0) {
          this.type = this.types[0]
        }
      },
      indexEd (valEd) {
        this.types = this.indexDict[valEd]
        if (this.types.length > 0) {
          this.type = this.types[0]
        }
      }
    },
    mounted () {
      // 索引数据加载好之后处理索引select显示
      $(document).on('dataReady', () => {
        this.indexDict = utils.getState()
        console.log('dataReady', this.indexDict)

        let indices = []
        Object.keys(this.indexDict).forEach(index => {
          indices.push(index)
        })
        this.indices = indices
        this.indexBeg = indices[0]
        this.indexEd = indices[0]
        if (this.indices.length > 0) {
          this.index = this.indices[0]
          this.types = this.indexDict[this.index]

          if (this.types.length > 0) {
            this.type = this.types[0]
          }
        }
      })
    },
    methods: {
      moveData () {
        let upgradeFromIndex = this.indexBeg.trim()
        let upgradeToIndex = this.indexEd.trim()
        let that = this

        this.msg = '准备升级...'
        if (!upgradeFromIndex || !upgradeToIndex) {
          this.msg = '参数为空'
          return
        }

        let upgradeQuery = (results) => {
          try {
            let importDataObj = results
            let dataBody
            if (typeof importDataObj.hits === 'object' && !(importDataObj.hits instanceof Array) &&
              typeof importDataObj.hits.hits === 'object' && importDataObj.hits.hits instanceof Array) {
              dataBody = importDataObj.hits.hits
            } else if (typeof importDataObj.hits === 'object' && importDataObj.hits instanceof Array) {
              dataBody = importDataObj.hits
            }
            let bulkBody = ''
            let i, dataItem, dataItemId, dataItemIndex, dataItemType, dataItemRouting, dataItemSource
            for (i = 0; i < dataBody.length; i++) {
              dataItem = dataBody[i]
              dataItemId = dataItem._id
              dataItemIndex = upgradeToIndex
              dataItemType = dataItem._type
              dataItemRouting = dataItem._routing
              dataItemSource = dataItem._source

              if (dataItemRouting) {
                bulkBody = `{"index":{"_index":"${dataItemIndex}","_type":"${dataItemType}","_id":"${dataItemId}","_routing":"${dataItemRouting}"}}\n`
              } else {
                bulkBody = `{"index":{"_index":"${dataItemIndex}","_type":"${dataItemType}","_id":"${dataItemId}"}}\n`
              }
              bulkBody += JSON.stringify(dataItemSource) + '\n'
            }

            let importUrl = utils.getHost() + '/_bulk'
            $.ajax({
              type: 'POST',
              url: importUrl,
              data: bulkBody,
              success (result) {
                totalSucc += dataBody.length
                that.msg = `需要升级总数：${totalHits}  已升级:${totalSucc}`
                if (errMsg.length > 0) that.msg = `升级中发生错误：${errMsg}  需要升级总数：${totalHits}  已升级：${totalSucc}`
              },
              error (result) {
                errMsg += 'ts  '
                that.msg = errMsg
                console.error('error', result)
              }
            })
          } catch (err) {
            errMsg += err.message + '  '
            that.msg = errMsg
            console.error(err.message, err.stack)
          }
        }

        let exportUrl = utils.getHost() + '/' + upgradeFromIndex
        exportUrl += '/_search?scroll=1m'
        let postData = '{"fields":["_parent","_source"],"from":0,"size":10000,"query":{"bool":{"must":[],"must_not":[],' +
          '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}'
        let nr = '...'
        let totalHits = NaN
        let totalFrom = NaN
        let totalSucc = NaN
        let errMsg = ''
        let ajaxQuery = (scrollId) => {
          if (!totalFrom) totalFrom = 0
          if (scrollId) {
            exportUrl = utils.getHost() + '/_search/scroll?scroll=1m&scroll_id=' + scrollId
            postData = ''
          }
          $.ajax({
            type: 'POST',
            url: exportUrl,
            data: postData,
            success (result) {
              that.msg = nr
              nr += '.'
              if (!totalHits) {
                totalHits = result.hits.total
                totalSucc = 0
                that.msg = `需要升级总数：${totalHits}  已升级：${0}`
              }
              if (typeof result.hits.hits === 'object' && result.hits.hits instanceof Array) {
                upgradeQuery(result)
              }
              if (totalFrom + 10000 < totalHits) {
                totalFrom += 10000
                ajaxQuery(result._scroll_id)
              }
            },
            error (xhr, ts, e) {
              errMsg += 'ts  '
              that.msg = errMsg
              console.error('error', ts, e)
            }
          })
        }
        ajaxQuery()
      }
    }
  }
</script>
<style scoped>


</style>
