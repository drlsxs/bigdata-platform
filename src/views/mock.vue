<template>
  <div class="Y_container">
    <div data-v-fae5bece=""  class="headlines childE" style="transform: scale(0.594271); z-index: 1999">
      <h3 data-v-fae5bece="">
        <a href="/" style="color: #09C8E7">星杓大数据平台</a>
      </h3>
    </div>
    <div class="Y-center">
      <div class="warp" ref="warp">
        <!--底部方块 开始-->
        <div class="floor">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        <!--底部方块 结束-->
        <!--主节点 开始-->
        <div class="index-define"
             slot="reference"
             id="center"
        >
          <div class="id-cont-shang">
            <img src="@/assets/outside2/images/dy_di02.png">
            <img src="@/assets/outside2/images/dy_di03.png">
            <img src="@/assets/outside2/images/dy_di02.png">
            <img src="@/assets/outside2/images/dy_di03.png">
          </div>
          <div class="id-cont"></div>
          <div class="id-top">
            <div class="xz-light"></div>
          </div>
          <div class="id-ambox ib-1">
            <span class="ab-guang"></span>
            <span class="ab-xg"></span>
            <span class="ab-img"></span>
            <span class="ab-txt"></span>
          </div>
          <div class="id-ambox ib-2">
            <span class="ab-guang"></span>
            <span class="ab-xg"></span>
            <span class="ab-img"></span>
            <span class="ab-txt"></span>
          </div>
          <div class="id-ambox ib-3" @click="addRow">
            <span class="ab-guang"></span>
            <span class="ab-xg"></span>
            <span class="ab-img"></span>
            <span class="ab-txt"></span>
          </div>
          <div class="id-ambox ib-4">
            <span class="ab-guang"></span>
            <span class="ab-xg"></span>
            <span class="ab-img"></span>
            <span class="ab-txt"></span>
          </div>
        </div>
        <!--主节点 结束-->
        <!--子节点 开始-->
        <div class="inner-ctr">
          <!--todo 先改成3x3后面一圈4x4-->
          <el-row style="height: 100%; position: relative">
            <el-col :span="8" v-for="(item,index) in mokeData" :key="item.uuid" >
              <!--节点容器开始-->
              <div class="node-container" >
                <div class="data-origin" :class="'origin' + index" ref="origin" @click="showList(index)" :id="'node' + index">
                  <div class="do-cont-shang">
                    <img src="@/assets/outside2/images/sjy_di02.png">
                    <img src="@/assets/outside2/images/sjy_di03.png">
                    <img src="@/assets/outside2/images/sjy_di02.png">
                    <img src="@/assets/outside2/images/sjy_di03.png">
                  </div>
                  <div class="do-cont"></div>
                  <div class="do-top">
                    <div class="xz-light"></div>
                  </div>
                  <div class="do-anim" :class="'doAnim'+item.status">
                    <span class="an-guang"></span>
                    <span class="an-guang-sp">
                <img src="@/assets/outside2/images/sjy_top03.png">
                <img src="@/assets/outside2/images/sjy_top03.png">
                <img src="@/assets/outside2/images/sjy_top03.png">
            </span>
                    <span class="an-jiaz"></span>
                    <span class="an-img">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
            </span>
                  </div>
                  <!--节点修改和节点删除开始-->
                  <div class="id-ambox ib-2 Y-ib-2" @click.stop="handleDelete(item)">
                    <span class="ab-guang"></span>
                    <span class="ab-xg"></span>
                    <span class="ab-img"></span>
                    <span class="ab-txt"></span>
                  </div>
                  <div class="id-ambox ib-4 Y-ib-4" @click.stop="handleChange(item)">
                    <span class="ab-guang"></span>
                    <span class="ab-xg"></span>
                    <span class="ab-img"></span>
                    <span class="ab-txt"></span>
                  </div>
                  <div class="id-ambox ib-1 Y-ib-1" @click.stop="handleDetail(item)">
                    <span data-v-628cac8f="" class="ab-guang"></span>
                    <span data-v-628cac8f="" class="ab-xg"></span>
                    <span data-v-628cac8f="" class="ab-img"></span>
                    <span data-v-628cac8f="" class="ab-txt"></span>
                  </div>
                  <!--节点修改和节点删除结束-->
                </div>
              </div>
              <!--节点容器结束-->
            </el-col>
          </el-row>
        </div>
        <div class="inner-ctr2">
          <!--todo 先改成3x3后面一圈4x4-->
          <el-row style="height: 100%; position: relative">
            <el-col :span="6" v-for="(item,index) in mokeData2" :key="item.uuid" >
              <!--节点容器开始-->
              <div class="node-container" >
                <div class="data-origin" :class="'origin' + index" ref="origin" @click="showList(index)" :id="'node' + index">
                  <div class="do-cont-shang">
                    <img src="@/assets/outside2/images/sjy_di02.png">
                    <img src="@/assets/outside2/images/sjy_di03.png">
                    <img src="@/assets/outside2/images/sjy_di02.png">
                    <img src="@/assets/outside2/images/sjy_di03.png">
                  </div>
                  <div class="do-cont"></div>
                  <div class="do-top">
                    <div class="xz-light"></div>
                  </div>
                  <div class="do-anim" :class="'doAnim'+item.status">
                    <span class="an-guang"></span>
                    <span class="an-guang-sp">
                <img src="@/assets/outside2/images/sjy_top03.png">
                <img src="@/assets/outside2/images/sjy_top03.png">
                <img src="@/assets/outside2/images/sjy_top03.png">
            </span>
                    <span class="an-jiaz"></span>
                    <span class="an-img">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
                <img src="@/assets/outside2/images/sjy_top05.png">
            </span>
                  </div>
                  <!--节点修改和节点删除开始-->
                  <div class="id-ambox ib-2 Y-ib-2" @click.stop="handleDelete(item)">
                    <span class="ab-guang"></span>
                    <span class="ab-xg"></span>
                    <span class="ab-img"></span>
                    <span class="ab-txt"></span>
                  </div>
                  <div class="id-ambox ib-4 Y-ib-4" @click.stop="handleChange(item)">
                    <span class="ab-guang"></span>
                    <span class="ab-xg"></span>
                    <span class="ab-img"></span>
                    <span class="ab-txt"></span>
                  </div>
                  <div class="id-ambox ib-1 Y-ib-1" @click.stop="handleDetail(item)">
                    <span data-v-628cac8f="" class="ab-guang"></span>
                    <span data-v-628cac8f="" class="ab-xg"></span>
                    <span data-v-628cac8f="" class="ab-img"></span>
                    <span data-v-628cac8f="" class="ab-txt"></span>
                  </div>
                  <!--节点修改和节点删除结束-->
                </div>
              </div>
              <!--节点容器结束-->
            </el-col>
          </el-row>
        </div>
        <!--子节点 结束-->
        <!--主节点连接子节点的svg线条 开始-->
        <!--<div class="Y_shape" >-->
        <!--  <svg xmlns="http://www.w3.org/2000/svg" width="" height="">-->
        <!--    <rect :style="{-->
        <!--    width:400 +'px',-->
        <!--    height:5,-->
        <!--    x: globalXOffset + 209,-->
        <!--    y: globalYOffset + 8,-->
        <!--    fill: orange-->
        <!--  }"/>-->
        <!--    <rect :style="{-->
        <!--    width:5 +'px',-->
        <!--    height:10 +'vh',-->
        <!--    y: 219,-->
        <!--    x: globalXOffset + 8,-->
        <!--    fill: orange-->
        <!--  }"/>-->
        <!--    <path-->
        <!--      fill="none"-->
        <!--      stroke-width="5"-->
        <!--      :stroke="orange"-->
        <!--      d="M19.5,219.5 v-0 a200,200 0 0 1 199.5,-199.5 h0"-->
        <!--    />-->
        <!--  </svg>-->
        <!--</div>-->
        <!--主节点连接子节点的svg线条 结束-->
      </div>
      <!--新增抽屉-->
      <el-drawer
        :title="drawerTitle"
        :before-close="handleClose"
        :visible.sync="drawer"
        direction="ltr"
        custom-class="demo-drawer"
        ref="drawer"
        :size="drawerSize"
        class="addDrawer"
        :append-to-body="true"
      >
        <!--<div slot="title" class="Y_title">-->
        <!--  <img src="../assets/images/headerpg.png" alt="">-->
        <!--  <span>新增节点</span>-->
        <!--</div>-->
        <div class="demo-drawer__content">
          <el-form ref="form" :model="form" label-width="90px" :title='formTitle'>
            <el-form-item label="ip" prop="ip">
              <el-input v-model="form.url" placeholder="请输入ip"></el-input>
            </el-form-item>
            <el-form-item label="port" prop="port">
              <el-input v-model="form.ip" placeholder="请输入port"></el-input>
            </el-form-item>
          </el-form>
          <div class="demo-drawer__footer">
            <el-button @click="cancelForm">取 消</el-button>
            <el-button type="primary" @click="submitForm" :loading="loading">{{ loading ? '提交中 ...' : '确 定' }}</el-button>
          </div>
        </div>
      </el-drawer>
      <!--列表抽屉-->
      <el-drawer
        :title="drawerTitle"
        :before-close="handleCloseList"
        :visible.sync="drawerList"
        direction="ltr"
        custom-class="demo-drawer"
        ref="drawer"
        :size="drawerSize"
        :append-to-body="true"
      >
        <div class="demo-drawer__content">
          <div class="Y_wrap">
            <div class="flex-inner">
              <!--<ul>-->
              <!--  <li> <span>url</span> &nbsp;{{tableData[tableIndex].url}}</li>-->
              <!--  <li> <span class="x1">操作系统</span> &nbsp;{{tableData[tableIndex].pg_version}}</li>-->
              <!--  <li> <span>创建时间</span> &nbsp;{{tableData[tableIndex].create_time}}</li>-->
              <!--  <li> <span>更新时间</span> &nbsp;{{tableData[tableIndex].update_time}}</li>-->
              <!--  <li> <span>状态</span> &nbsp;{{tableData[tableIndex].status}}</li>-->
              <!--</ul>-->
            </div>
          </div>

          <!--<el-table :data="[tableData[tableIndex]]" stripe style="width: 90%" v-loading="loading">-->
          <!--  <el-table-column-->
          <!--    fixed prop="url"-->
          <!--    label="url"-->
          <!--    width="185">-->
          <!--  </el-table-column>-->
          <!--  <el-table-column-->
          <!--    prop="pg_version"-->
          <!--    label="数据库版本"-->
          <!--    width="160">-->
          <!--  </el-table-column>-->
          <!--  <el-table-column-->
          <!--    prop="os"-->
          <!--    label="操作系统"-->
          <!--    width="160">-->
          <!--  </el-table-column>-->
          <!--  <el-table-column-->
          <!--    prop="create_time"-->
          <!--    label="创建时间"-->
          <!--    width="140">-->
          <!--  </el-table-column>-->
          <!--  <el-table-column-->
          <!--    prop="update_time"-->
          <!--    label="更新时间"-->
          <!--    width="140">-->
          <!--  </el-table-column>-->
          <!--  <el-table-column-->
          <!--    prop="status"-->
          <!--    label="状态"-->
          <!--    width="120" :formatter="statusFormat">-->
          <!--  </el-table-column>-->
          <!--  <el-table-column-->
          <!--    fixed="right"-->
          <!--    label="操作">-->
          <!--  </el-table-column>-->
          <!--</el-table>-->
        </div>
      </el-drawer>
      <!--详情抽屉-->
      <el-drawer
        :title="drawerTitle"
        :before-close="handleCloseDetail"
        :visible.sync="drawerDetail"
        direction="ltr"
        custom-class="demo-drawer"
        ref="drawer"
        :size="drawerSize"
        :append-to-body="true"
      >
        <div class="demo-drawer__content">
          <el-table :data="gridData">
            <el-table-column property="name" label="插件名称"></el-table-column>
            <el-table-column property="extension_version" label="安装版本"></el-table-column>
            <el-table-column property="comment" label="描述"></el-table-column>
          </el-table>
        </div>
      </el-drawer>
      <!--删除抽屉-->
      <el-drawer
        :title="drawerTitle"
        :before-close="handleCloseDelete"
        :visible.sync="drawerDelete"
        direction="ltr"
        custom-class="demo-drawer"
        ref="drawer"
        :size="drawerSize"
        class="delDrawer"
        :append-to-body="true"
      >
        <div class="demo-drawer__content">
          <div class="el-message-box">
            <div class="el-message-box__header">
              <div class="el-message-box__title"><!----><span>警告</span></div>
              <button type="button" aria-label="Close" class="el-message-box__headerbtn">
              </button>
            </div>
            <div class="el-message-box__content">
              <div class="el-message-box__container"><!---->
                <div class="el-message-box__status el-icon-warning"></div>
                <div class="el-message-box__message"><p><span>{{`是否确认删除url为${deleteUrl}的节点?`}} </span></p></div>
              </div>
              <div class="el-message-box__input" style="display: none;">
                <div class="el-input"><!----><input type="text" autocomplete="off" placeholder="" class="el-input__inner"><!----><!---->
                  <!----><!----></div>
                <div class="el-message-box__errormsg" style="visibility: hidden;"></div>
              </div>
            </div>
            <div class="el-message-box__btns">
              <button type="button" class="el-button el-button--default el-button--small" @click="handleCloseDelete"><!----><!----><span>
          取消
        </span></button>
              <button type="button" class="el-button el-button--default el-button--small el-button--primary" @click="delNode"><!----><!----><span>
          确定
        </span></button>
            </div>
          </div>
        </div>
      </el-drawer>
      <!--test-->
      <!--test2-->
    </div>
    <div class="Y_mask" v-show="handVisiable">
      <img class="h1 Y_img" src="@/assets/images/1111.png" alt="">
      <img class="h2 Y_img" src="@/assets/images/222.png" alt="">
      <div class="Y_woText" v-show="jinx">
        <p>握手协议中...</p>
      </div>
      <div class="Y_woText" v-show="jies">
        <p>握手结束，创建子节点成功!</p>
      </div>
    </div>
  </div>

</template>

<script>
// import '@/assets/outside2/js/require'
import '@/assets/outside2/js/eui'
import '@/assets/outside2/js/ping'
import '@/assets/outside2/js/iconfont'
import { listType,getType,delType,updateType,addType } from "@/api/index";
export default {
  name: "Center",
  mounted() {
    // function setJspWaitingDomMsg(msg){var _d = document.getElementById("com.esen.irpt.web.waitingdom.txt");if (_d) _d.innerHTML = msg;}
    function hideJspWaitingDomMsg(){var _d = document.getElementById("com.esen.irpt.web.waitingdom");if (_d) _d.parentNode.removeChild(_d);if(window.detachEvent)window.detachEvent("onload",hideJspWaitingDomMsg);else if(window.removeEventListener)window.removeEventListener("load",hideJspWaitingDomMsg,false);}
    if(window.attachEvent)window.attachEvent("onload",hideJspWaitingDomMsg);else if(window.addEventListener)window.addEventListener("load",hideJspWaitingDomMsg,false);
    this.dispatchLine();
    window.addEventListener("resize", () => {
      const lines = document.querySelectorAll(".line");
      lines.forEach(item => {
        item.remove();
      });

      this.dispatchLine();
    });
    const pl8 = document.querySelectorAll(".el-col-8");
    console.log(pl8);
    pl8.forEach((item, index) => {
      if (0 < index - 3 + 1 < 3) {
        // console.log(item, index, 777);

      }
    });

  },
  updated() {

  },
  data() {
    return {
      title: '',
      formTitle: '', //新增修改的
      id: undefined,
      loading: false,
      tableData: [],
      mokeData: [
        {uuid:1},
        {uuid:2},
        {uuid:3},
        {uuid:4},
        {uuid:5},
        {uuid:6},
        {uuid:7},
        {uuid:8},
      ],
      mokeData2: [
        {uuid:1},
        {uuid:2},
        {uuid:3},
        {uuid:4},
        {uuid:5},
        {uuid:6},
        {uuid:7},
        {uuid:8},
        {uuid:9},
        {uuid:10},
        {uuid:11},
        {uuid:12},
      ],
      gridData: [],
      form: {},
      statusOptions: [
        {dictLabel: "可用", dictValue: "0"}, {dictLabel: "不可用", dictValue: "1"},
      ],
      //控制抽屉的显示隐藏
      drawer: false,
      drawerList: false,
      drawerDetail: false,
      drawerDelete: false,
      // 抽屉的标题
      drawerTitle: '',
      drawerSize: '30%',
      formLabelWidth: '80px',
      timer: null,
      tableIndex: 0,
      deleteUrl: null,
      deleteId: null,
      // 握手动画
      handVisiable: false,
      // 握手进行中
      jinx: false,
      // 握手成功
      jies: false,
      // orange : "#EC9503",
      // globalXOffset : 9.5,
      // globalYOffset: 10
    };
  },
  methods: {
    handleLight() {
      console.log("点击子节点");
    },
    // 分发线条
    dispatchLine() {
      console.log("dispatch");
      const node = document.querySelectorAll(`.data-origin`);
      let centerele = document.getElementById("center");
      let warp = document.querySelector(".warp");
      node.forEach(item => {
        warp.append(this.getLengthAndAngle(centerele, item));
      });
    },
    // 获取每个子节点的角度，连接的长度，
    getLengthAndAngle(startObj, endObj) {
      //起点元素中心坐标
      var y_start =  Math.ceil(startObj.getBoundingClientRect().top + startObj.getBoundingClientRect().height/2);
      var x_start =  Math.ceil(startObj.getBoundingClientRect().left + startObj.getBoundingClientRect().width/2);

      //终点元素中心坐标
      var y_end =  Math.ceil(endObj.getBoundingClientRect().top + endObj.getBoundingClientRect().height/2);
      var x_end =  Math.ceil(endObj.getBoundingClientRect().left + endObj.getBoundingClientRect().width/2);

      //用勾股定律计算出斜边长度及其夹角（即连线的旋转角度）
      var lx = x_end - x_start;
      var ly = y_end - y_start;
      //计算连线长度
      var length = Math.sqrt(lx * lx + ly * ly);
      //弧度值转换为角度值
      var c = 360 * Math.atan2(ly, lx) / (2 * Math.PI);

      //连线中心坐标
      var midX=(x_end+x_start)/2;
      var midY=(y_end+y_start)/2
      var deg = c <= -90 ? (360 + c) : c;  //负角转换为正角
      const returmDom = document.createElement("div");
      returmDom.className = "line";
      returmDom.style.top = `${midY}px`;
      returmDom.style.width = `${length}px`;
      returmDom.style.left = `${midX - length / 2}px`;
      returmDom.style.transform = `rotate(${deg}deg)`;
      for (let i = 0; i < 3; i++) {
        var light = document.createElement("img");
        light.setAttribute("src", "/img/light.89962245.png");
        light.className = 'Y_light';
        light.style.left = `${Math.floor((Math.random()*101))}%`;
        light.style.animationDelay = `${Math.floor((Math.random()*2))}s`
        returmDom.appendChild(light);
      }
      return returmDom;

    },
    //关闭详情抽屉
    handleCloseDetail() {
      this.drawerDetail = false;
    },
    //关闭列表抽屉
    handleCloseList() {
      this.drawerList = false;
    },
    handleCloseDelete() {
      this.drawerDelete = false;
    },
    handleClose() {
      this.drawer = false;
    },
    showList(index) {
      this.drawerTitle = "查看节点";
      this.tableIndex = index;
      this.drawerList = true;
    },
    cancelForm() {
      this.id = undefined;
      this.loading = false;
      this.drawer = false;
      clearTimeout(this.timer);
    },
    getList() {
      this.loading = true;
      listType().then(response => {
          this.tableData = response.data;
          this.loading = false;
        }
      );
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.id !== undefined) {  // 修改
            var data = {
              id: this.id,
              url: this.form.url + ":" + this.form.ip
            }
            updateType(data).then(response => {
              if(response.data.res === 0){
                this.$message({
                  message: '修改成功!',
                  type: 'success'
                });
                this.getList();
              }else{
                this.$message.error('修改失败!'+response.data.msg);
              }
              this.id = undefined
              this.drawer = false;
            })
          } else {
            var data2 = {
              url: this.form.url + ":" + this.form.ip
            };
            addType(data2).then(response => {
              console.log("res-addType:",response);
              if(response.data.res === 0){
                this.handVisiable = true;
                this.jinx = true;
                //防止显示两处文字
                this.jies = false;
                setTimeout(() => {
                  this.jinx = false;
                  this.jies = true;
                }, 1500);
                setTimeout(() => {
                  this.handVisiable = false;
                  this.jies = true;
                }, 3000);
                this.getList();
              }else{
                this.$message.error('添加失败!'+response.data.msg);
              }
              this.drawer = false;
            })
          }
          this.id = undefined
          this.form = {}
        }
      });
    },
    selectDictLabel(datas, value) {
      var actions = [];
      Object.keys(datas).some((key) => {
        if (datas[key].dictValue === ('' + value)) {
          actions.push(datas[key].dictLabel);
          return true;
        }
      })
      return actions.join('');
    },
    statusFormat(row) {
      return this.selectDictLabel(this.statusOptions, row.status);
    },
    //查看详情
    handleDetail(item) {
      this.drawerDetail = true;
      this.drawerTitle = '节点详情'
      console.log(item);
      var data = {
        id:item.uuid,
        url:item.url
      }
      getType(data).then(response => {
        this.gridData = response.data.extensions
      })
    },
    handleDelete(item) {
      this.drawerTitle = '删除节点'
      this.drawerDelete = true;
      this.deleteId = item.uuid;
      this.deleteUrl = item.url;
    },
    delNode() {
      var data = {
        id: this.deleteId,
      }
      delType(data).then((response) => {
        if(response.data.res === 0){
          this.$message({
            message: '删除成功!',
            type: 'success'
          });
          this.getList();
          this.drawerDelete = false;
        }else{
          this.$message.error('删除失败!'+response.data.msg);
        }
      }).catch(function() {});
    },
    addRow(){
      this.drawerTitle = '新增节点';
      this.drawer = true;
    },
    handleChange(item){
      this.drawer = true;
      this.drawerTitle = '修改节点'
      this.id = item.uuid
    },
  },
  created() {
    this.getList();
    this.dispatchLine();
  },
  computed: {
    //计算属性计算出当前的order值
    // order() {
    //   return this.tableData.length;
    // }
  }

}
</script>
<style scoped src="@/assets/outside2/css/eui.css"></style>
<style scoped src="@/assets/outside2/css/animation.css"></style>
<style scoped src="@/assets/outside2/css/esenbase.css"></style>
<style scoped src="@/assets/outside2/css/indexcontent.css"></style>
<style scoped src="@/assets/css/style.css"></style>
<style scoped>
/*控制节点的颜色*/

.doAnim0 {
  background: url(../assets/outside2/images/sjy_top020.png) bottom no-repeat;
}

.doAnim0 .an-guang {
  background: url(../assets/outside2/images/sjy_light0.png) no-repeat;
}

.doAnim0 .an-jiaz {
  background: url(../assets/outside2/images/sjy_top040.png) no-repeat;
}

.doAnim1 {
  background: url(../assets/outside2/images/sjy_top021.png) bottom no-repeat;
}

.doAnim1 .an-guang {
  background: url(../assets/outside2/images/sjy_light1.png) no-repeat;
}

.doAnim1 .an-jiaz {
  background: url(../assets/outside2/images/sjy_top041.png) no-repeat;
}



.Y_container {
  zoom: 1;background: #162878\0;background-image: linear-gradient(180deg, #193b8f 0%, #110450 100%);
}
.Y-center {
  position: relative;
  font-size: 16px;
}
.Y-center .warp {
//transform: scale(0.85);
  height: 1800px;
}

.node-container {
  width: 100%;
  position: absolute;
  left: 50%;
  top: -50px;
  transform: translate(-50%,-50%);
  transition: 1s;

}
/*fixme 对固定的两个元素的宽度是写死的*/
.node-container:nth-child(7),.node-container:nth-child(8) {
  width: 50%;
}
.inner-ctr {
  width: 1000px;
  height: 1000px;
  /* 绝对定位 */
  position: absolute;
  /* 上方和左方为50% */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.inner-ctr2 {
  width: 1800px;
  height: 1800px;
  /* 绝对定位 */
  position: absolute;
  /* 上方和左方为50% */
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.Y_mask {
  position: absolute;
  margin:auto;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 10000;
}

.Y_mask .Y_woText {
  text-align: center;
  color: #28757F;
  position: absolute;
  bottom: 200px;
  left: 50%;
  transform: translateX(-50%);
}

img.Y_img {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 22vw;
}
img.h1 {
  z-index: 100;
  left: 300px;
  animation: h1 3.5s infinite;
}
img.h2 {
  right: 300px;
  animation: h2 3.5s infinite;

}
@keyframes h1 {
  0% {
    transform: scale(0.3);
  }
  25% {
    transform: scale(0.6);
    left: 38%;
  }
  38% {
    transform: scale(1);
    left: 38%;
  }
  50% {
    transform: scale(1);
    left: 38%;
  }
  60% {
    transform: rotateZ(15deg);
    left: 38%;
  }
  70% {
    transform: rotateZ(10deg);
    left: 38%;
  }
  80% {
    transform: rotateZ(15deg);
    left: 38%;
  }
  90% {
    transform: rotateZ(10deg);
    left: 38%;
  }
}
@keyframes h2 {
  0% {
    transform: scale(0.3);
  }
  25% {
    transform: scale(0.6);
    right: 35%;
  }
  38%{
    transform: scale(1);
    right: 35%;
  }
  50% {
    transform: scale(1);
    right: 35%;
  }
  60% {
    transform: rotateZ(-15deg);
    right: 35%;
  }
  70% {
    transform: rotateZ(-10deg);
    right: 35%;
  }
  80% {
    transform: rotateZ(-15deg);
    right: 35%;
  }
  90% {
    transform: rotateZ(-10deg);
    right: 35%;
  }
}

.warp >>>.line {
  height: 3px;
  z-index: 10;
  position: absolute;
  background: yellow;
  border-radius: 30%;
}

.warp >>>.line .Y_light {
  transform: rotate(-55deg);
  width: 100px;
  position: absolute;
  left: 50%;
  top: -48px;
  animation: imgMove 3s infinite;
}

@keyframes imgMove {
  0% {
    left: 0%;

  }
  10% {
    left: 10%;

  }

  50% {
    left: 50%;

  }
  100% {
    left: 80%;
  }

}

</style>

<style>
.el-popover.myPopover {
  background-image: linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%);
  border: #00CBFF 1px solid;
}
.el-drawer {
  position: relative;
  background: transparent;

}

.el-drawer:after{
  content: '';
  display: block;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: url(../assets/images/kaibg.png) no-repeat;
  z-index: -1;
  background-size: cover;
  opacity: 0.4;
}

.el-drawer__header {
  color: #fff !important;
}
.el-drawer__close-btn {
  color: #72767b !important;
}
.el-form-item__label {
  color: #fff !important;
}
.demo-drawer__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  border: 2px solid #016ae0;
  border-radius: 10px;
  overflow: hidden;

}
.addDrawer .demo-drawer__content,.delDrawer .demo-drawer__content {
  border: none;
  border-radius: 0;
}
.el-table--border::after, .el-table--group::after, .el-table::before {
  background: none;
}
.el-drawer__body {
  padding: 20px;
  flex: 1;
  overflow: auto;
}
.demo-drawer__content form {
  flex: 1;
  width: 100%;
}

.demo-drawer__footer {
  display: flex;
  width: 100%;
}

.demo-drawer__footer button {
  flex: 1;
}

.el-col-8 {
  position: relative;
  height: calc(1000px / 3);

}

.el-col-6 {
  position: relative;
  height: calc(1800px / 3);

}

.el-col-6:nth-child(5) {
  position: relative;
  top: -200px;
}

.el-col-6:nth-child(6) {
  position: relative;
  left: -450px;
  top: 200px;
}

.el-col-6:nth-child(7) {
  position: relative;
  top: -200px;
  right: -450px;
}

.el-col-6:nth-child(8) {
  position: relative;
  top: 200px;
}
.inner-ctr2 .node-container {
  top: 17%;
}


.el-col-6:nth-child(8) {

}

.el-col-8:nth-child(4) {
  position: absolute;
  top: 33.3%;
  right: 0%;
}
.el-col-8:nth-child(5) {
  position: absolute;
  top: 66.6%;
  right: 0;
}
.el-col-8:nth-child(6) {
  position: absolute;
  top: 66.6%;
  left: 33.3%;
}
.el-col-8:nth-child(7) {
  position: absolute;
  top: 66.6%;
  left: 0;
}

.el-col-8:nth-child(8) {
  position: absolute;
  top: 33.3%;
  left: 0;
}

.el-loading-mask {
  background-color: rgba(0,0,0,.5) !important;
}
.demo-drawer__content {
  align-items: center;
}
.el-table, .el-table__expanded-cell {
  background: transparent !important;
}
.el-drawer__body .el-message-box {
  width: 80%;
  padding: 20px;
  box-sizing: border-box;
  margin-top: 200px;
}
.el-message-box__message {
  margin-bottom: 10px !important;
}
.el-message-box__title {
  margin-bottom: 5px !important;
}
.el-message-box__message p {
  line-height: 16px;
}
.el-table--fit {
  overflow: auto;
}

/*common*/
.el-table,
.el-table thead {
  color: #23f3ff;
}
.el-table th,
.el-table tr {
  background-color: transparent;
}
td,
th {
  padding: 4px 0;
}
.el-table {
  width: 99.9%;
  color: #a1d3ff;
}
.el-table__body tr:hover > td {
  background-color: #ccebff !important;
}
.el-table__body tr:hover > td .cell {
  color: #000 !important;
}
.el-form-item__content {
  margin-left: 40px;
}
.el-form-item__label {
  width: 40px;
}


/*/el-message/*/
.el-message-box {
  color: #fff;
  background-color: #162374;
  border: 0;
  font-size: 16px;
}
.el-message-box .el-message-box__header {
  color: #fff;
  height: 20px;
  font-weight: bolder;
}
.el-message-box .el-message-box__title {
  color: #fff;
}
.el-message-box .el-message-box__message {
  color: #fff;
  margin-top: 5px;
}
.el-message-box .el-message-box__btns button {
  border: 0;
  color: #fff;
}
.el-message-box .el-message-box__close {
  color: #fff;
  font-size: 16px;
}
.el-message-box .el-message-box__btns button:nth-child(1) {
  background-color: #fff;
  color: #000;
}
.el-message-box .el-message-box__btns button:nth-child(2) {
  background-color: #00A0CC;
}
.demo-drawer__footer .el-button:nth-child(2) {
  background-color: #00A0CC;

}
.el-form-item {
  margin-bottom: 20px !important;
}
.el-drawer__header{
  background: url("../assets/images/headerpg.png") no-repeat 18px -3px;
  background-size: 94% 116%;
  padding: 20px;
}
</style>
