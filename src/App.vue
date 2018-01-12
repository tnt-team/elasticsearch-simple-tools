<template>
  <div id="app" class="main-container container-fluid">
        <h1>Elasticsearch实用工具集</h1>

        <ul class="main-nav nav nav-pills">
            <router-link role="presentation" to="typeExport" tag="li"><a href="#">数据查询与导出</a></router-link>
            <router-link role="presentation" to="dataImport" tag="li"><a href="#">数据导入</a></router-link>
            <router-link role="presentation" to="dataMigration" tag="li"><a href="#">数据迁移</a></router-link>
            <router-link role="presentation" to="bulkDelete" tag="li"><a href="#">批量删除</a></router-link>
            <router-link role="presentation" to="flyway" tag="li"><a href="#">flyway删除</a></router-link>
            <router-link role="presentation" to="routerDelete" tag="li"><a href="#">删除路由</a></router-link>
            <router-link role="presentation" to="dataMultiExport" tag="li"><a href="#">数据多表导出</a></router-link>
            <router-link role="presentation" to="dataEdit" tag="li"><a href="#">数据查询与修改</a></router-link>
        </ul>

        <div class="main-panel panel panel-default">
            <div class="panel-body">
                <router-view transition="fade" transition-mode="out-in" keep-alive></router-view>
            </div>
        </div>
    </div>
</template>

<script>
import $ from 'jquery'
import utils from './utils/utils'

export default {
  name: 'app',
  created () {
    // 获取es索引信息，成功触发dataReady事件，需要用es索引信息的地方需要监听此事件
    utils.fetchState().then(() => {
      $(document).triggerHandler('dataReady')
    }).catch((reason) => {
      console.error('fetchState rejected reason: ' + reason)
    })
  },
  mounted () {
    this.$nextTick(() => {
      $('.main-panel').height($(window).height() - 141)
    })
  }
}
</script>

<style>
    .fade-transition {
        transition: opacity .1s ease;
    }
    .fade-enter, .fade-leave {
        opacity: 0;
    }

    body {
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }

    .main-container .page-container {
        padding: 0;
        width: 100%;
        height: 100%;
        position: relative;
    }

    .main-container .page-container > .page-content {
        padding-top: 20px;
        height: 100%;
        position: relative;
    }

    .main-panel {
        margin-top: 15px;
        margin-bottom: 10px;
        border-radius: 0;
        position: relative;
    }

    .main-panel > .panel-body {
        height: 100%;
        padding: 0;
    }

    .flex-page {
        display: -webkit-flex;
        display: flex;
        flex-direction: column;
    }

    .flex-page > div {
        flex-shrink: 0;
    }

    .result-panel {
        width: 100%;
        margin-top: 15px;
        position: relative;
    }
    .result-panel .execResult {
        overflow: auto;
        padding: 15px;
        min-height: 115px;
        border-radius: 5px;
        border: 1px solid #ccc;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
    }

    .flex-page > .result-panel {
        flex-grow: 1;
    }
</style>
