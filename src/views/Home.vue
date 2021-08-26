<template>
  <div class="Y_home">
    <div class="content topMain zoom" id="content">
      <div class="headlines childE" style="transform: scale(1);">
        <h3>星杓大数据平台V1.0</h3>
      </div>
      <ul class="main childE" style="transform: scale(1);">
        <div class="link-line link-line6">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <div class="link-line link-line3">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgD" data-id="4">
          <div class="lumpA">
            <img class="funDline1" src="@/assets/outside/images/funDline1.png">
            <img class="funDline2" src="@/assets/outside/images/funDline2.png">
            <img class="funDline3" src="@/assets/outside/images/funDline3.png">
            <img class="funDline4" src="@/assets/outside/images/funDline4.png">
          </div>
          <img class="img1" src="@/assets/outside/images/funD-img1.png">
          <img class="img2" src="@/assets/outside/images/funD-img2.png">
          <a class="img3" href="http://abidemo.esensoft.com/abi/eportal/pcportal/portal.do?filepath=/root/products/eportal/pcportal/pages/esp/2021_GNYS/page0.esp" target="_blank" title="亿信ABI-报表分析"></a>
        </li>
        <div class="link-line link-line4">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgE" data-id="5" @click="goCenter($event)">
          <div class="lumpA">
            <img class="funEline1" src="@/assets/outside/images/funEline1.png">
            <img class="funEline2" src="@/assets/outside/images/funEline2.png">
            <img class="funEline3" src="@/assets/outside/images/funEline3.png">
            <img class="funEline4" src="@/assets/outside/images/funEline4.png">

            <img class="img2" src="@/assets/outside/images/funE-img2.png">
            <img class="img3" src="@/assets/outside/images/funE-img3.png">
            <img class="img4" src="@/assets/outside/images/funE-img4.png">
          </div>
          <div class="lumpB">
            <img class="funEshape5" src="@/assets/outside/images/funEshape5.png">
          </div>
          <div class="lumpC">
            <div class="funEpillars funEpillars1"></div>
            <div class="funEpillars funEpillars2"></div>
            <div class="funEpillars funEpillars3"></div>
            <div class="funEpillars funEpillars4"></div>
            <div class="funEpillars funEpillars5"></div>
            <div class="funEpillars funEpillars6"></div>
            <div class="funEpillars funEpillars7"></div>
            <div class="funEpillars funEpillars8"></div>
            <div class="funEpillars funEpillars9"></div>
            <div class="funEpillars funEpillars10"></div>
          </div>
          <a class="img1" href="http://abidemo.esensoft.com/abi/eportal/pcportal/portal.do?filepath=/root/products/eportal/pcportal/pages/esp/2021_GNYS/page4.esp" target="_blank" title="亿信ABI-大屏可视化"></a>
        </li>
        <div class="link-line link-line5">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgF" data-id="6">
          <div class="lumpA">
            <span class="funF-round funF-round1"></span>
            <!--<span class="funF-round funF-round2"></span>-->
            <!--<span class="funF-round funF-round3"></span>-->
            <!--<span class="funF-round funF-round4"></span>-->
            <!--<span class="funF-round funF-round5"></span>-->
            <span class="funF-round funF-round6"></span>
            <span class="funF-round funF-round7"></span>
          </div>
          <div class="lumpB">
            <div class="funF-pillars funF-pillars1">
              <img src="@/assets/outside/images/funF-pillars1.png">
            </div>
            <div class="funF-pillars funF-pillars2">
              <img src="@/assets/outside/images/funF-pillars2.png">
            </div>
            <div class="funF-pillars funF-pillars3">
              <img src="@/assets/outside/images/funF-pillars3.png">
            </div>
            <div class="funF-pillars funF-pillars4">
              <img src="@/assets/outside/images/funF-pillars4.png">
            </div>
            <div class="funF-pillars funF-pillars5">
              <img src="@/assets/outside/images/funF-pillars5.png">
            </div>
          </div>
          <div class="lumpC">
            <div class="funF-mountain2">
              <img src="@/assets/outside/images/funF-img4.png">
            </div>
            <div class="funF-mountain1">
              <div class="funF-lines1"></div>
              <div class="funF-lines2"></div>
            </div>
          </div>
          <img class="img3" src="@/assets/outside/images/funF-img3.png">
          <a class="img1" href="http://abidemo.esensoft.com/abi/eportal/pcportal/portal.do?filepath=/root/products/eportal/pcportal/pages/esp/2021_GNYS/page6.esp" target="_blank" title="亿信ABI-自助式分析"></a>
        </li>
        <li class="listImg listImgC active" data-id="3">
          <img class="img1" src="@/assets/outside/images/funC-img1.png">
          <img class="img2" src="@/assets/outside/images/funC-img2.png">
          <img class="img3" src="@/assets/outside/images/funC-img3.png">
          <a class="img4" href="http://epi.esensoft.com/EPI/eacl/login.do?id=demo&amp;pw=demo" target="_blank" title="亿信ABI-指标管理"></a>
          <div class="lumpA">
            <img class="funCline1" src="@/assets/outside/images/funCline1.png">
            <img class="funCline2" src="@/assets/outside/images/funCline2.png">
            <img class="funCline3" src="@/assets/outside/images/funCline3.png">
            <img class="funCline4" src="@/assets/outside/images/funCline4.png">
            <img class="funCline5" src="@/assets/outside/images/funCline5.png">

            <img class="img5" src="@/assets/outside/images/funC-img5.png">
            <img class="img6" src="@/assets/outside/images/funC-img6.png">
          </div>
        </li>
        <div class="link-line link-line2">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgB" data-id="2">
          <a class="img1" href="http://abidemo.esensoft.com/abi/eportal/pcportal/portal.do?filepath=/root/products/eportal/pcportal/pages/esp/2021_GNYS/page2.esp" target="_blank" title="亿信ABI-数据处理"></a>
          <div class="lumpA">
            <img class="funBline1" src="@/assets/outside/images/funBline1.png">
            <img class="funBline2" src="@/assets/outside/images/funBline2.png">
            <img class="funBline3" src="@/assets/outside/images/funBline3.png">
            <img class="funBline4" src="@/assets/outside/images/funBline4.png">
            <img class="funBline5" src="@/assets/outside/images/funBline5.png">
            <img class="funBline6" src="@/assets/outside/images/funBline6.png">
            <img class="funBline7" src="@/assets/outside/images/funBline7.png">

            <img class="funBclod1" src="@/assets/outside/images/funBclod1.png">
            <img class="funBclod2" src="@/assets/outside/images/funBclod2.png">
            <img class="funBclod3" src="@/assets/outside/images/funBclod3.png">
          </div>
        </li>
        <div class="link-line link-line1">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgA" data-id="1">
          <img class="img1" src="@/assets/outside/images/funA-img1.png">
          <a class="img2" href="http://abidemo.esensoft.com/abi/eportal/pcportal/portal.do?filepath=/root/products/eportal/pcportal/pages/esp/2021_GNYS/page1.esp" target="_blank" title="亿信ABI-数据填报"></a>
          <img class="img3" src="@/assets/outside/images/funA-img3.png">
          <img class="img4" src="@/assets/outside/images/funA-img4.png">
          <img class="img5" src="@/assets/outside/images/funA-img5.png">
          <img class="img6" src="@/assets/outside/images/funA-img6.png">
        </li>
        <li class="listImg listImgJ" data-id="9">
          <img class="img2" src="@/assets/outside/images/funJ-img2.png">
          <img class="img3" src="@/assets/outside/images/funJ-img3.png">
          <div class="lumpA"></div>
          <img class="img4" src="@/assets/outside/images/funJ-img4.png">
          <div class="lumpB">
            <div class="funJ-pillars funJ-pillars1"></div>
            <div class="funJ-pillars funJ-pillars2"></div>
            <div class="funJ-pillars funJ-pillars3"></div>
            <div class="funJ-pillars funJ-pillars4"></div>
            <div class="funJ-pillars funJ-pillars5"></div>
          </div>
          <div class="lumpC">
            <div class="funJ-minorWire funJ-minorWire1">
              <span></span>
            </div>
            <div class="funJ-minorWire funJ-minorWire2">
              <span></span>
            </div>
            <div class="funJ-minorWire funJ-minorWire3">
              <span></span>
            </div>
          </div>
          <div class="lumpD">
            <img class="funJ-line1" src="@/assets/outside/images/funJ-line1.png">
            <img class="funJ-line2" src="@/assets/outside/images/funJ-line2.png">
            <span class="circularDlong circularD1"></span>
            <span class="circularDlong circularD2"></span>
            <span class="circularDlong circularD3"></span>
            <span class="circularDsmall circularD4"></span>
            <span class="circularDsmall circularD5"></span>
            <span class="circularDsmall circularD6"></span>
            <img class="funJ-img6" src="@/assets/outside/images/funJ-img6.png">
          </div>
          <a class="img1" href="http://ask.esensoft.com/eask/eacl/login.do?id=demo&amp;pw=demo" target="_blank" title="亿信ABI-智能分析"></a>
        </li>
        <div class="link-line link-line8">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgH" data-id="8">
          <div class="lumpA">
            <img class="img2" src="@/assets/outside/images/funH-img2.png">
            <img class="img3" src="@/assets/outside/images/funH-img3.png">
            <img class="img4" src="@/assets/outside/images/funH-img4.png">
            <img class="img5" src="@/assets/outside/images/funH-img5.png">
            <img class="img6" src="@/assets/outside/images/funH-img6.png">
          </div>
          <a class="img1" href="http://wdm.esensoft.com/wdm/esmain/login.do?id=demo&amp;pw=demo" target="_blank" title="亿信ABI-数据挖掘"></a>
        </li>
        <div class="link-line link-line7">
          <img class="line1" src="@/assets/outside/images/guang-line1.png">
        </div>
        <li class="listImg listImgG" data-id="7">
          <img class="img2" src="@/assets/outside/images/funG-img2.png">
          <img class="img3" src="@/assets/outside/images/funG-img3.png">
          <a class="img1" href="http://abidemo.esensoft.com/abi/eportal/pcportal/portal.do?filepath=/root/products/eportal/pcportal/pages/esp/2021_GNYS/page5.esp" target="_blank" title="亿信ABI-报告分析"></a>
        </li>
      </ul>
    </div>
    <footer>
      <p>
        Copyright 星杓科技
      </p>
    </footer>
  </div>

</template>
<script>
export default {
  name: "Home",
  mounted() {
    $(function() {
      $('.funNav li[data-att]').each(function(){
        $(this).hover(function() {
          var data= $(this).attr('data-att'),
            show = $('.main').find( $('li[data-id='+data+']') );
          $(this).addClass('active').siblings().removeClass('active');
          $('.main').children('li').removeClass('active').addClass('movePaused');
          show.addClass('active').removeClass('movePaused');
        },function(){
          $('.main').children('li').removeClass('movePaused');
        });
      });

      $('.main li[data-id]').each(function(){
        $(this).hover(function() {
          $(this).addClass('active').siblings().removeClass('active');
        },function(){
          $(this).removeClass('active');
        });
      });

      //针对不同屏幕缩放
      var bodyW = document.body.clientWidth;
      var zoom = bodyW / 1920;

      var screenH = window.screen.height;  //屏幕分辨率的高
      var bodyH = document.body.offsetHeight;  //网页可见区域高(body)
      //一屏可视化高度小于111
      if( screenH - bodyH > 111  ){
        if( bodyH!=818 ){
          document.getElementById('content').classList.add('topMain');
        }
        if(  screenH  - bodyH==143 ){
          document.getElementById('content').classList.add('topMain1');
        }

      }
      console.log( "屏幕高："+screenH );
      console.log( "可书化高："+bodyH );

      //方法二
      var ele = document.querySelectorAll(".childE");
      var i;
      for (i = 0; i < ele.length; i++) {
        ele[i].style.transform = 'scale(' + zoom + ')';
      }
      document.getElementById('content').classList.add('zoom');

      //改变浏览器窗口大小的时候 让页面自动刷新
      $(window).resize( function (){
        location.reload();
      });

    });
  },
  methods: {
    goCenter(e) {
      e.preventDefault();
      this.$router.push({
        path: '/center'
      });
    }
  },
}
</script>

<style scoped src="@/assets/outside/css/function3.css"></style>
<style>



</style>
