<template>
  <div id="bulkDelete" class="page-container">
    <div id="bulkDeleteTool" class="toolFrame col-xs-12 col-md-6">
      <h2>数据查询</h2>
      <form id="bulkDeleteForm" role="form">
        <div class="input-group">
          <span class="input-group-addon">index</span>
          <select class="form-control _index" id="dataSearchIndex" v-model="index">
            <option v-for="index in indices" value="{{index}}">{{ index }}</option>
          </select>
        </div>
        <div class="input-group margin-top">
          <span class="input-group-addon">id</span>
          <input type="text" class="form-control" v-model="dataId" id="editIdUpdate">
        </div>
        <div class="input-group margin-top">
          <span class="input-group-addon">routing</span>
          <input type="text" class="form-control" v-model="routing" id="editIdUpdate">
        </div>
        <div class="form-search-field" v-for="item in searchFields">
          <div class="form-inline margin-top">
            <div class="form-group">
              <input type="text" class="form-control" v-model="item.name" placeholder="{{item.tip}}">
            </div>
            <div class="form-group">
              <input type="text" class="form-control" v-model="item.value" placeholder="{{item.tipValue}}">
            </div>
            <span id="edit-add-field" class="glyphicon glyphicon-minus icon-lg" v-on:click="subSearchField($index)"></span>
          </div>
        </div>
        <span id="edit-add-field" class="glyphicon glyphicon-plus-sign  icon-lg margin-top" v-on:click="addSearchField"></span>
        <div>
          <button class="btn btn-default margin-top" @click="onSearch">查询</button>
        </div>
      </form>
      <div class="panel panel-default margin-top">
        <div class="panel-heading">输出结果</div>
        <div class="panel-body">
          {{message}}
        </div>
      </div>
    </div>
    <div class="page-content col-xs-12 col-md-6">
      <h2>数据修改</h2>
      <form class="form">
        <input type="hidden" id="editIndexUpdate" />
        <input type="hidden" id="editTypeUpdate" />
        <div id="form-edit-field" v-for="it in editFields">
          <div class="input-group margin-top">
            <div class="input-group-btn">
              <button type="button" class="btn btn-default dropdown-toggle edit-field-name" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                {{it.tip}}
                <span class="caret"></span>
              </button>
              <ul class="dropdown-menu">
                <li value="{{it.name}}" @click="it.tip = fn" :value="fn" v-for="fn in fieldNames">
                  <a>{{fn}}</a>
                </li>
              </ul>
            </div>
            <input type="text" class="form-control edit-field-value" v-model="it.value" placeholder="请填写对应修改值">
            <span class="input-group-btn">
              <button class="btn btn-default" @click="subEditField" type="button">删除</button>
            </span>
          </div>
        </div>
      </form>
      <span id="edit-add-field" class="glyphicon glyphicon-plus-sign  icon-lg margin-top" @click="addEditField"></span>
      <div class="margin-top">
        <button type="submit" id="editDataBtn" @click="onEdit" class="btn btn-default">修改</button>
      </div>
      <div class="panel panel-default margin-top">
        <div class="panel-heading">输出结果</div>
        <div class="panel-body">
          {{updateMsg}}
        </div>
      </div>

    </div>

</template>
<script>
import $ from "jquery";
import utils from "../utils";
export default {
  data() {
    return {
      indexDict: {},
      indices: [],
      message: "",
      updateMsg: "",
      index: "",
      routing: "",
      dataId: "",
      searchFields: [
        { name: "", value: "", tip: "请输入字段名", tipValue: "请输入字段值" }
      ],
      editFields: [{ name: "请输入字段名", value: "", tip: "请输入字段名" }],
      fieldNames: ["请输入字段名"],
      searchIndex: "",
      searchType: "",
      searchRouting: "",
      searchIdList: []
    };
  },
  watch: {},

  attached() {
    // 视图渲染之后需要处理索引select的显示
    let indexDict = utils.getState();
    if (indexDict) {
      this.indexDict = indexDict;

      let indices = [];
      Object.keys(this.indexDict).forEach(index => {
        indices.push(index);
      });
      this.indices = indices;
      if (this.indices.length > 0) {
        this.index = this.indices[0];
      }
    }
  },
  ready() {
    $(document).on("dataReady", () => {
      this.indexDict = utils.getState();
      console.log("dataReady", this.indexDict);
      let indices = ["所有索引"];
      Object.keys(this.indexDict).forEach(index => {
        indices.push(index);
      });
      this.indices = indices;
      if (this.indices.length > 0) {
        this.index = this.indices[0];
      }
    });
  },
  methods: {
    addSearchField() {
      this.searchFields.push({
        name: "",
        value: "",
        tip: "请输入字段名"
      });
    },
    subSearchField(index) {
      this.searchFields.splice(index, 1);
    },
    addEditField() {
      this.editFields.push({
        name: "",
        value: "",
        tip: "请输入字段名"
      });
    },
    subEditField(index) {
      this.editFields.splice(index, 1);
    },
    onSearch() {
      let index = this.index;
      let routing = this.routing;
      let id = this.dataId;
      var searchParam = {};

      //id和字段2选1
      if (id) {
        let param = {
          query: {
            term: {
              _id: id
            }
          },
          size: 1
        };
        searchParam = param;
      } else {
        let musts = [];
        this.searchFields.forEach(function(each) {
          let term = {};
          term[each.name.trim()] = each.value.trim();
          musts.push({ term });
        });
        let param = {
          query: {
            bool: {
              must: musts,
              must_not: [],
              should: []
            }
          },
          from: 0,
          size: 1000
        };
        searchParam = param;
      }
      var searchUrl = utils.getHost();
      if (index && index !== "所有索引") {
        searchUrl += "/" + index;
      }
      searchUrl += "/_search";
      if (routing) {
        searchUrl += "?routing=" + routing;
      }
      var paramJson = JSON.stringify(searchParam);
      var _this = this;
      $.ajax({
        type: "POST",
        url: searchUrl,
        data: paramJson,
        success: result => {
          let fieldArr = [];
          _this.message = utils.format(JSON.stringify(result), false);
          _this.searchIndex = result.hits.hits[0]._index;
          _this.searchType = result.hits.hits[0]._type;
          _this.searchRouting = result.hits.hits[0]._routing;
          let idList = [];
          result.hits.hits.forEach(function(each) {
            idList.push(each._id);
          });
          _this.searchIdList = idList;
          let fields = result.hits.hits[0]._source;
          Object.keys(fields).forEach(function(f) {
            fieldArr.push(f);
          });
          this.fieldNames = fieldArr;
        },
        error: err => {
          _this.message = utils.format(JSON.stringify(err), false);
        }
      });
    },
    onEdit() {
      let _this = this;
      let index = this.searchIndex;
      let type = this.searchType;
      let idList = this.searchIdList;
      let routing = this.searchRouting;
      if (!index || !type || !idList) {
        alert("请先查询");
      }
      let updateObj = this.editFields;
      let updateFd = {};
      updateObj.forEach(function(obj) {
        if (obj.value) {
          updateFd[obj.tip] = obj.value;
        }
      });
      let doc = {
        "doc": updateFd
      };
      let updateUrl = utils.getHost();
      updateUrl += "/" + index + "/" + type + "/_bulk";
      let bulkBody = "";
      for (let i = 0; i < idList.length; i++) {
        if (routing) {
          bulkBody += `{"update":{"_index":"${index}","_type":"${type}","_id":"${idList[i]}","_routing":"${routing}"}}\n`;
        } else {
          bulkBody += `{"update":{"_index":"${index}","_type":"${type}","_id":"${idList[i]}"}}\n`;
        }
        bulkBody += JSON.stringify(doc) + "\n";
      }
      $.ajax({
        type: "POST",
        url: updateUrl,
        data: bulkBody,
        success: result => {
          let num = result.items.length;
          _this.updateMsg = '已成功更新'+num+'条数据';
        },
        error: err => {
          _this.updateMsg = utils.format(JSON.stringify(err), false);
        }
      });
    }
  }
};
</script>
<style scoped>
.panel {
  user-select: text;
  -moz-user-select: text;
  -webkit-user-select: text;
  -ms-user-select: text;
}

.margin-top {
  margin-top: 20px;
}

.icon-lg {
  font-size: 30px;
}
</style>