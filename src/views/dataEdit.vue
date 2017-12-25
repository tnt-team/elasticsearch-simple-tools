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
            <div class="result-panel panel panel-default">
                <div id="exportResult" class="execResult panel-body">{{message}}</div>
            </div>
        </div>
        <div class="page-content col-xs-12 col-md-6">
            <h2>数据修改</h2>
            <!-- 数据修改 -->
            <form class="form">
                <input type="hidden" id="editIndexUpdate" />
                <input type="hidden" id="editTypeUpdate" />
                <div id="form-edit-field" v-for="item in editFields">
                    <div class="input-group margin-top">
                        <div class="input-group-btn">
                            <button type="button" class="btn btn-default dropdown-toggle edit-field-name" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                {{item.tip}}
                                <span class="caret"></span>
                            </button>
                            <ul class="dropdown-menu">
                                <li v-for="i in fields" v-model="item.name" value="{{i}}">
                                    <a href="#">{{i}}</a>
                                </li>
                            </ul>
                        </div>
                        <input type="text" class="form-control edit-field-value" v-model="item.value" placeholder="请填写对应修改值">
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="button">删除</button>
                        </span>
                    </div>
                </div>
            </form>
            <span id="edit-add-field" class="glyphicon glyphicon-plus-sign  icon-lg margin-top" @click="addEditField"></span>
            <div class="margin-top">
                <button type="submit" id="editDataBtn" class="btn btn-default">修改</button>
            </div>
            <div>
                <textarea id="editResult" cols="50" class="execResult"> </textarea>
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
      // form data
      index: "",
      routing: "",
      dataId: "",
      searchFields: [
        { name: "", value: "", tip: "请输入字段名", tipValue: "请输入字段值" }
      ],
      eidtFields: [{ name: "", value: "", tip: "请输入字段名", tipValue: "请输入字段值" }]
    };
  },
  watch: {},
  ready() {
    $(document).on("dataReady", () => {
      this.indexDict = utils.getState();
      console.log("dataReady", this.indexDict);
      let indices = ["所有索引"];
      Object.keys(this.indexDict).forEach(index => {
        indices.push(index);
      });
      this.indices = indices;
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
      this.eidtFields.push({
        name: "",
        value: "",
        tip: "请输入字段名"
      });
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
          _this.message = utils.format(JSON.stringify(result), false);
        },
        error: err => {
          _this.message = utils.format(JSON.stringify(err), false);
        }
      });
    }
  }
};
</script>
<style scoped>
.margin-top {
  margin-top: 20px;
}

.icon-lg {
  font-size: 30px;
}
</style>