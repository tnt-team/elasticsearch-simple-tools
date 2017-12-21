<template>
    <div id="typeExport" class="page-container">
        <div id="exportTool" class="toolFrame col-xs-12 col-md-6">
            <h2>数据查询及导出功能</h2>
            <form id="exportForm" role="form">
                <div class="form-group">
                    <label for="exportIndex">index</label>
                    <div class="form-group">
                        <select class="form-control _index" id="exportIndex">
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="exportType">type</label>
                    <div class="form-group">
                        <select class="form-control _type" id="exportType">
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="exportRouting">routing</label>
                    <input type="text" class="form-control" id="exportRouting" placeholder="routing">
                </div>
                <button type="submit" class="btn btn-default">查询</button>
                <button type="button" class="btn btn-default exportJson">下载</button>
            </form>
            <textarea id="exportResult" cols="70" class="execResult"></textarea>
        </div>
        <div class="toolFrame col-xs-12 col-md-6">
            <h3>usage:</h3>
            <p>选择index和type,点击“查询”可显示该type下所有数据，点击“下载”可下载该数据json文件</p>
        </div>
    </div>
</template>

<script>
import $ from 'jquery';
//import utils from '../utils';

export default {

  data() {
    return {
//      city: '北京',
//      cityCode: '110100',
//      filter: '2',
//      loading: false,
//      hasMore: true,
//      members: [],
//      scrollTop: 0,
//      shuffledPageNums: []
    }
  },
  computed: {
//    scale() {
//      return document.body.clientWidth > 375 ? document.body.clientWidth / 375 : 1;
//    },
//    imageHeight() {
//      // return { height: parseInt(document.body.clientWidth * 0.65) + 'px' };
//      return { height: document.body.clientWidth + 'px' };
//    },
//    nameMaxWidth() {
//      return { maxWidth: parseInt(document.body.clientWidth - 8 * 20 * this.scale) + 'px' };
//    }
  },
  ready() {
//    $.init();
  },
  attached() {
//    $('.content').scrollTop(this.scrollTop);
  },
  route: {
    data(transition) {
//      if (sessionStorage.index && sessionStorage.indexCity){
//        let index = JSON.parse(sessionStorage.index);
//        let indexCity = JSON.parse(sessionStorage.indexCity);
//        this.city = indexCity.city;
//        this.cityCode = indexCity.cityCode;
//        this.filter = search.filter;
//        this.loading = false;
//        this.hasMore = search.hasMore;
//        this.members = search.members;
//        this.scrollTop = search.scrollTop;
//        this.shuffledPageNums = search.shuffledPageNums;
//      } else {
//        if (localStorage.indexParam) {
//          let indexParam = JSON.parse(localStorage.indexParam);
//          this.city = indexParam.city;
//          this.cityCode = indexParam.cityCode;
//          this.filter = indexParam.filter;
//        }
//        this.getMembers();
//      }
//
//      if(transition.from.name === 'city'){
//        let cityChosen = JSON.parse(sessionStorage.cityChosen);
//        if (this.city !== cityChosen.city) {
//          this.city = cityChosen.city;
//          this.cityCode = cityChosen.cityCode;
//          this.getMembers();
//        }
//      }
    },
    activate(transition) {
//      let token = this.getToken();
//      if (token) {
//        localStorage.token = token;
//        transition.abort();
//        window.location.replace(window.location.origin);
//      } else if (!localStorage.token) {
//        transition.redirect('404');
//      }
//      token = localStorage.token;
//      // console.log(token);
//      $.ajaxSettings.headers = { 'access': token };
//      $.ajaxSettings.dataType = 'json';
//      $.ajaxSettings.error = (xhr, type) => {
//        console.error(type + ' ' + xhr.response);
//        ga('send', 'exception', { 'exDescription': xhr.responseURL + ' ' + type + ' ' + xhr.response, 'exFatal': false });
//        ga('send', 'event', '错误', xhr.responseURL + ' ' + type + ' ' + xhr.response, '', 1);
//        this.loading = false;
//        if (this.members.length > 0) {
//          $.hidePreloader();
//        }
//      };
//      if (!localStorage[token]) {
//        localStorage.uid = '';
//        this.getUid(token);
//      }
//      transition.next();
    },
    deactivate(transition){
//      let index = {
//        filter: this.filter,
//        hasMore: this.hasMore,
//        members: this.members,
//        scrollTop: $('.content').scrollTop(),
//        shuffledPageNums: this.shuffledPageNums
//      };
//      let indexCity = { city: this.city, cityCode: this.cityCode };
//      sessionStorage.index = JSON.stringify(search);
//      sessionStorage.indexCity = JSON.stringify(indexCity);
//
//      let indexParam = {};
//      if (localStorage.indexParam) {
//        indexParam = JSON.parse(localStorage.indexParam);
//      }
//      indexParam.city = this.city;
//      indexParam.cityCode = this.cityCode;
//      indexParam.filter = this.filter;
//      localStorage.indexParam = JSON.stringify(indexParam);
//
//      if (transition.to.name === 'detail') {
//        let id = transition.to.params.id;
//        for (let i = 0; i < this.members.length; i++) {
//          let member = this.members[i];
//          if (id !== member.id + '') continue;
//          sessionStorage.indexMember = JSON.stringify(member);
//          // console.log(sessionStorage.indexMember);
//          break;
//        }
//      }
//
//      transition.next();
    }
  },
  methods: {
//    showFilter() {
//      $.popup('.popup');
//      $('.popup-overlay').css('z-index', '-1');
//    },
//    hideFilter() {
//      $.closeModal('.popup');
//      this.getMembers();
//    },
//    filterFemale() {
//      this.filter = '2';
//      this.hideFilter();
//    },
//    filterMale() {
//      this.filter = '1';
//      this.hideFilter();
//    },
//    getToken() {
//      let key = 'r';
//      let reg = new RegExp('(^|&)' + key + '=([^&]*)(&|$)', 'i');
//      let val = window.location.search.substr(1).match(reg);
//      // console.log('search: ' + window.location.search);
//      return val !== null ? unescape(val[2]) : null;
//    },
//    getUid(token) {
//      $.get(window.location.origin + '/user/getUid.json', (data, status, xhr) => {
//          let jsonr = data;
//          if (jsonr.code !== '001') {
//            console.error(jsonr.code);
//            ga('send', 'exception', { 'exDescription': xhr.responseURL + ' ' + jsonr.code, 'exFatal': false });
//            ga('send', 'event', '错误', xhr.responseURL + ' ' + jsonr.code, '', 1);
//            return;
//          }
//          let uid = jsonr.data;
//          localStorage.uid = uid;
//          localStorage[token] = uid;
//      });
//    },
  }
}
</script>

<style>

</style>