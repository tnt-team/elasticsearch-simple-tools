<template>
    <div id="bulkDelete" class="page-container">
        <div id="bulkDeleteTool" class="page-content flex-page col-xs-9">
            <div id="bulkDeleteForm" role="form">
                <div class="form-group">
                    <label for="bulkDeleteIndex">index</label>
                    <div class="form-group">
                        <select class="form-control _index" id="bulkDeleteIndex" v-model="index">
                            <option v-for="index in indices" :value="index">{{ index }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="bulkDeleteType">type</label>
                    <div class="form-group">
                        <select class="form-control _type" id="bulkDeleteType" v-model="tp">
                            <option v-for="tp in types" :value="tp">{{ tp }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="bulkDeleteRouting">routing</label>
                    <input type="text" v-model="routing" class="form-control" id="bulkDeleteRouting" placeholder="routing,为空表示删除所有路由下该类型数据">
                </div>
                <div class="form-group">
                    <label for="bulkDeleteData">data</label>
                    <textarea id="bulkDeleteData" class="form-control" rows="4" placeholder="请填写要删除数据的id集合，以逗号分隔。为空表示全部删除"></textarea>
                </div>
                <button class="btn btn-default" @click="doDelete">删除</button>
            </div>
             <div class="result-panel panel panel-default">
                <pre id="exportResult" class="execResult panel-body">{{message}}</pre>
            </div>
        </div>
    </div>

</template>
<script>
import $ from 'jquery'
import utils from '../utils/utils'

export default {
  data () {
    return {
      indexDict: {},
      indices: [],
      types: [],
      message: '',
      // form data
      index: '',
      tp: '',
      routing: ''
    }
  },
  watch: {
    index (val) {
      this.types = this.indexDict[val]
      if (this.types && this.types.length > 0) {
        this.tp = this.types[0]
      }
    }
  },
  mounted () {
    $(document).on('dataReady', () => {
      this.indexDict = utils.getState()
      console.log('dataReady', this.indexDict)
      this.setSelects()
    })
    this.$nextTick(() => {
      // 视图渲染之后需要处理索引select的显示
      let indexDict = utils.getState()
      if (indexDict) {
        this.indexDict = indexDict
        this.setSelects()
      }
    })
  },
  methods: {
    setSelects () {
      let indices = []
      Object.keys(this.indexDict).forEach(index => {
        indices.push(index)
      })
      this.indices = indices
      if (this.indices && this.indices.length > 0) {
        this.index = this.indices[0]
        this.types = this.indexDict[this.index]
        if (this.types && this.types.length > 0) {
          this.tp = this.types[0]
        }
      }
    },
    doDelete () {
      let that = this
      var bulkDeleteIndex = $('#bulkDeleteIndex').val().trim()
      var bulkDeleteType = $('#bulkDeleteType').val().trim()
      var bulkDeleteRouting = $('#bulkDeleteRouting').val().trim()
      var bulkDeleteData = $('#bulkDeleteData').val()

      if (!bulkDeleteIndex || !bulkDeleteType) {
        that.message = '索引和类型不能为空'
        return
      }
      var bulkDeleteUrl = utils.getHost() + '/' + bulkDeleteIndex + '/' + bulkDeleteType + '/_bulk'
      // 如果data值为空，发起查询请求
      if (!bulkDeleteData) {
        if (!confirm('确认删除该类型全部下的数据吗？')) {
          return
        }
        var searchUrl = utils.getHost() + '/' + bulkDeleteIndex + '/' + bulkDeleteType + '/_search'

        if (bulkDeleteRouting) {
          searchUrl += '?routing=' + bulkDeleteRouting
        }
        var searchParam = {
          'from': 0,
          'size': 10000
        }

        $.ajax({
          type: 'POST',
          url: searchUrl,
          data: JSON.stringify(searchParam),
          success (result) {
            let r = bulkDelete(bulkDeleteUrl, result, (msg) => {
              if (msg) {
                that.message = '批量删除失败:' + msg
              } else {
                that.message = '批量删除成功！共删除' + result.hits.total + '条数据'
              }
            })
            if (r) {
              that.message = '批量删除失败:' + r
            }
          },
          error (err) {
            that.message = '批量删除失败:' + JSON.stringify(err)
          }
        })
      } else {
        var delIds = bulkDeleteData.split(',')
        let r = bulkDeleteByIds(bulkDeleteUrl, bulkDeleteIndex, bulkDeleteType, bulkDeleteRouting, delIds, (err, delLength) => {
          if (err) {
            that.message = '批量删除失败:' + JSON.stringify(err)
          } else {
            that.message = '批量删除成功！共删除' + delLength + '条数据'
          }
        })
        if (r) {
          that.message = '批量删除失败：' + r
        }
      }
    }
  }
}

/* 批量删除ES数据
 * @param deleteUrl  删除url
 * @param bulkDeleteObj  要删除的数据
 * @param routing  路由
 */
function bulkDelete (deleteUrl, bulkDeleteObj, cb, routing) {
  var dataBody = ''
  var bulkBody = ''
  try {
    if (typeof bulkDeleteObj.hits === 'object' && !(bulkDeleteObj.hits instanceof Array) &&
      typeof bulkDeleteObj.hits.hits === 'object' && bulkDeleteObj.hits.hits instanceof Array) {
      dataBody = bulkDeleteObj.hits.hits
    } else if (typeof bulkDeleteObj.hits === 'object' && bulkDeleteObj.hits instanceof Array) {
      dataBody = bulkDeleteObj.hits
    }
  } catch (err) {
    console.error(err.message, err.stack)
  }
  for (var i = 0; i < dataBody.length; i++) {
    var _index = dataBody[i]._index
    var _type = dataBody[i]._type
    routing = dataBody[i]._routing || routing
    if (routing) {
      bulkBody += '{"delete":{"_index":"' + _index + '","_type":"' + _type + '","_id":"' + dataBody[i]._id.trim() + '","_routing":"' + routing + '"}}\n'
    } else {
      bulkBody += '{"delete":{"_index":"' + _index + '","_type":"' + _type + '","_id":"' + dataBody[i]._id.trim() + '"}}\n'
    }
  }
  if (!dataBody || (dataBody.length <= 0)) {
    return '该类型下没有数据'
  }
  $.ajax({
    type: 'POST',
    url: deleteUrl,
    data: bulkBody,
    success (result) {
      cb(null, result)
      // msgBulkDeleteResult(format(JSON.stringify(result), false))
    },
    error (err) {
      cb(err, null)
      // msgBulkDeleteResult(format(JSON.stringify(result), false))
    }
  })
}
 /**
 * 根据id数组批量删除数据
 */
function bulkDeleteByIds (deleteUrl, index, type, routing, idArr, cb) {
  if (!idArr || idArr.length <= 0) {
    return '没有可删除的数据'
  }
  var length = idArr.length
  var bulkBody = ''
  for (var i = 0; i < length; i++) {
    if (routing) {
      bulkBody += '{"delete":{"_index":"' + index + '","_type":"' + type + '","_id":"' + idArr[i].trim() + '","_routing":"' + routing + '"}}\n'
    } else {
      bulkBody += '{"delete":{"_index":"' + index + '","_type":"' + type + '","_id":"' + idArr[i].trim() + '"}}\n'
    }
  }
  $.ajax({
    type: 'POST',
    url: deleteUrl,
    data: bulkBody,
    success (result) {
      cb(null, result.items.length)
    },
    error (err) {
      cb(err, null)
    }
  })
}
</script>
<style scoped>

</style>
