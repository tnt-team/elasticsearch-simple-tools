<template>
  <div id="dataMultiExport" class="page-container">
    <div class="page-content flex-page col-xs-12 col-md-9">
      <div id="dataMultiExportForm" role="form">
        <div id="exportSelectGroup" class="form-group">
          <div class="checkbox"><label><input class="all-ck" type="checkbox" value="" @click="allCheck"><b>全选</b></label></div>
          <div class="checkbox" v-for="(types, index) in indexDict">
            <label><input class="index-ck" :data-index="index" type="checkbox" :value="index" @change="indexChange"><b>{{index}}</b></label>
            &nbsp;&nbsp;&nbsp;&nbsp;
            <label class="checkbox-inline" v-for="tp in types"><input class="type-ck" :data-index="index" type="checkbox" :value="tp" @click="typeCheck">{{tp}}</label>
          </div>
        </div>
        <div class="form-group">
          <label for="exportRoutingN">routing</label>
          <input type="text" class="form-control" id="exportRoutingN" placeholder="routing" v-model="routing">
        </div>
        <button type="submit" class="btn btn-default" @click="doExport">导出</button>
      </div>
      <div class="result-panel panel panel-default">
        <pre id="exportResult" class="execResult panel-body">{{ message }}</pre>
      </div>
    </div>
    <div class="page-content col-xs-12 col-md-3">
      <h3>usage:</h3>
      <p>选择index和type,点击“查询”可显示该type下所有数据，点击“下载”可下载该数据json文件</p>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import utils from '../utils/utils'

export default {
  name: 'DataExport',
  data () {
    return {
      indexDict: {},
      message: '',
      // form
      routing: ''
    }
  },
  attached () {
    // 视图渲染之后需要处理索引select的显示
    let indexDict = utils.getState()
    if (indexDict) {
      this.indexDict = indexDict
    }
  },
  mounted () {
    // 索引数据加载好之后处理索引select显示
    $(document).on('dataReady', () => {
      this.indexDict = utils.getState()
      console.log('dataReady', this.indexDict)
    })
    this.$nextTick(() => {
      // 视图渲染之后需要处理索引select的显示
      let indexDict = utils.getState()
      if (indexDict) {
        this.indexDict = indexDict
      }
    })
  },
  methods: {
    allCheck (evt) {
      let sel = $('#exportSelectGroup')
      let isChecked = $(evt.target).is(':checked')
      let selIndex = sel.find('.index-ck')
      let selType = sel.find('.type-ck')
      if (isChecked) {
        selIndex.prop('checked', 'checked')
        selType.prop('checked', 'checked')
      } else {
        selIndex.removeAttr('checked')
        selType.removeAttr('checked')
      }
    },
    indexChange (evt) {
      let sel = $('#exportSelectGroup')
      let isChecked = $(evt.target).is(':checked')
      let selIndex = sel.find('.index-ck')
      let selIndexChecked = sel.find('.index-ck:checked')
      let index = $(evt.target).attr('data-index')
      let selType = sel.find('.type-ck[data-index=' + index + ']')
      let selTypeChecked = sel.find('.type-ck[data-index=' + index + ']:checked')
      if (isChecked) {
        if (selIndexChecked.length === selIndex.length) sel.find('.all-ck').prop('checked', 'checked')
        if (selTypeChecked.length === 0) selType.prop('checked', 'checked')
      } else {
        sel.find('.all-ck').removeAttr('checked')
        selType.removeAttr('checked')
      }
    },
    typeCheck (evt) {
      let sel = $('#exportSelectGroup')
      let isChecked = $(evt.target).is(':checked')
      let index = $(evt.target).attr('data-index')
      let selIndex = sel.find('.index-ck[data-index=' + index + ']')
      let selTypeChecked = sel.find('.type-ck[data-index=' + index + ']:checked')
      if (isChecked) {
        selIndex.prop('checked', 'checked')
        sel.find('.index-ck').trigger('change')
      }
      if (!isChecked && selTypeChecked.length === 0) {
        selIndex.removeAttr('checked')
        sel.find('.index-ck').trigger('change')
      }
    },
    doExport () {
      let that = this
      this.message = '...'

      let exportMessageDict = {}

      let updateProcessMessage = () => {
        let msg = ''
        Object.keys(exportMessageDict).forEach((key) => {
          let index = key.split('#')[0]
          let type = key.split('#')[1]
          let total = exportMessageDict[key]['totalHits']
          let succ = exportMessageDict[key]['succHits']
          msg += `index-${index} type-${type}: total ${total} succ ${succ}\n`
        })
        that.message = msg
      }

      let exportTotalResult = []
      let routing = this.routing
      let exportTypeQuery = (index, type, routing) => {
        let exportUrl = utils.getHost() + '/' + index + '/' + type + '/_search'
        let routingQurey = ''
        if (routing) {
          routingQurey = '{"term":{ "_routing":"' + routing + '"}}'
        }
        let postData = '{"size":10000,"query":{"bool":{"must":[' + routingQurey + '],"must_not":[],' +
          '"should":[{"match_all":{}}]}},"sort":[],"aggs":{},"version":true}'

        let key = index + '#' + type

        utils.scrollQuery(exportUrl, postData, (th, r) => {
          if (!exportMessageDict[key]) {
            exportMessageDict[key] = {}
          }
          if (!exportMessageDict[key]['totalHits']) {
            exportMessageDict[key]['totalHits'] = th
            exportMessageDict[key]['succHits'] = 0
          }
          exportMessageDict[key]['succHits'] += r.hits.hits.length
          updateProcessMessage()
        }).then((res) => {
          exportTotalResult.push({
            index: index,
            type: type,
            data: res
          })
        }).catch((reason) => {
          console.error('fetchState rejected reason: ' + reason)
          that.message = JSON.stringify(reason)
        })
      }

      let selTypeChecked = $('#exportSelectGroup').find('.type-ck:checked')
      selTypeChecked.each((ix, selType) => {
        selType = $(selType)
        let index = selType.attr('data-index')
        let type = selType.val()
        exportTypeQuery(index, type, routing)
      })

      let timer = setInterval(() => {
        if (exportTotalResult.length === selTypeChecked.length) {
          // console.log(exportTotalResult)
          clearInterval(timer)

          // export file
          let outContent = '// --------------------------------------------------------\n'
          // author
          outContent += '// ------------------ ElasticsearchTool -------------------\n'
          // date
          let cdate = new Date()
          outContent += '// ------- ' + cdate.toString() + ' ---------\n'
          outContent += '// --------------------------------------------------------\n'
          outContent += '\n\n'
          // data
          exportTotalResult.forEach((typeData) => {
            outContent += '// --------------------------------------------------------\n'
            outContent += '// ---------- index:' + typeData.index + '\n// ---------- type: ' + typeData.type + '\n'
            outContent += 'global.' + typeData.type + ' = \''
            outContent += JSON.stringify(typeData.data)
            outContent += '\''
            outContent += '\n'
            outContent += '// --------------------------------------------------------\n\n'
          })
          // console.log(outContent)
          that.message += '生成数据文件'
          utils.downloadFile('export' + cdate.getTime(), outContent, 'text/plain')
        }
      }, 200)
    }
  }
}
</script>

<style scoped>
  #exportSelectGroup {
    border: 1px #efefef solid;
    max-height: 200px;
    padding-left: 10px;
    overflow-y: auto;
  }
  .checkbox-inline+.checkbox-inline {
    margin-left: 20px;
  }
</style>
