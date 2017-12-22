<template>
    <div class="main-container container-fluid">
        <h1>Elasticsearch实用工具集</h1>

        <ul class="main-nav nav nav-pills">
            <li role="presentation" class="active"><a href="#" v-link="{name: 'index'}">数据查询与导出</a></li>
            <li role="presentation"><a href="#">数据导入</a></li>
            <li role="presentation"><a href="#">数据迁移</a></li>
            <li role="presentation"><a href="#">批量删除</a></li>
            <li role="presentation"><a href="#">flyway删除</a></li>
            <li role="presentation"><a href="#">删除路由</a></li>
            <li role="presentation"><a href="#">数据导出·新</a></li>
        </ul>

        <div class="main-panel panel panel-default">
            <div class="panel-body">
                <router-view transition="fade" transition-mode="out-in" keep-alive></router-view>
            </div>
        </div>
    </div>
</template>

<script>
import utils from './utils';

export default {
    created() {
        utils.fetchState().then(() => {
            $(document).triggerHandler('dataReady');
        }).catch((reason) => {
            console.log('fetchState rejected reason: ' + reason);
        });
    },
    ready() {
        $('.main-panel').height($(window).height() - 141);
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
    }

    .main-panel > .panel-body {
        height: 100%;
        padding: 0;
    }

    .result-panel {
        width: 100%;
        margin-top: 15px;
    }
    .result-panel .execResult {
        overflow: auto;
    }
</style>
