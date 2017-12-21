<template>
    <div class="main-container container-fluid">
        <h1>Elasticsearch实用工具集</h1>

        <ul class="nav nav-tabs" role="tablist">
            <li role="presentation" class="active"><a href="#">数据查询与导出</a></li>
            <li role="presentation"><a href="#">数据导入</a></li>
            <li role="presentation"><a href="#">数据迁移</a></li>
            <li role="presentation"><a href="#">批量删除</a></li>
            <li role="presentation"><a href="#">flyway删除</a></li>
            <li role="presentation"><a href="#">删除路由</a></li>
            <li role="presentation"><a href="#">数据导出·新</a></li>
        </ul>

        <router-view transition="fade" transition-mode="out-in" keep-alive></router-view>
    </div>
</template>

<script>
export default {
  ready () {

  },
}
</script>

<style>
    body {
        user-select: none;
        -moz-user-select: none;
        -webkit-user-select: none;
        -ms-user-select: none;
    }

    .main-container > .page-container {
        padding: 15px 0 15px 0;
    }
</style>
