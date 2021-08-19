<template>
  <div class="Y-center">
    <div class="aaa"></div>
    <div class="warp" ref="warp" @click="eui($event)">
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
      <!--指标定义 开始-->
      <div class="index-define"
           slot="reference"
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
      <!--指标定义 结束-->
      <!--数据源 开始-->
      <!--节点容器开始-->
      <div class="node-container" v-for="(item,index) in tableData" :key="item.uuid">
          <div class="data-origin" ref="origin" @click="showList(index)">
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
            <div class="do-anim">
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
            <div class="id-ambox ib-2 Y-ib-2" @click="delNode(item)">
              <span class="ab-guang"></span>
              <span class="ab-xg"></span>
              <span class="ab-img"></span>
              <span class="ab-txt"></span>
            </div>
            <div class="id-ambox ib-4 Y-ib-4" @click="handleChange(item)">
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
      <!--至于箭头,可以这么做先定义箭头开始：-->
      <!--<svg>-->
      <!--  <defs>-->
      <!--    <marker id="arrow" markerUnits="strokeWidth" markerWidth="12" markerHeight="12" viewBox="0 0 12 12" refX="6" refY="6" orient="auto">-->
      <!--      <path xmlns="http://www.w3.org/2000/svg" d="M2,2 L10,6 L2,10 L6,6 L2,2" style="fill: #ff00ff;" />-->
      <!--    </marker>-->
      <!--  </defs>-->
      <!--</svg>-->
      <!--至于箭头,可以这么做先定义箭头结束：-->
    </div>
    <!-- 详情的对话框 -->
    <el-dialog :title="title" :visible.sync="visible" width="1000px">
      <div id="header">
      </div>
      <el-table :data="gridData">
        <el-table-column property="name" label="插件名称" width="230"></el-table-column>
        <el-table-column property="extension_version" label="安装版本" width="130"></el-table-column>
        <el-table-column property="comment" label="描述"></el-table-column>
      </el-table>
    </el-dialog>
    <!--新增抽屉-->
    <el-drawer
      :title="drawerTitle"
      :before-close="handleClose"
      :visible.sync="drawer"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer"
      :size="drawerSize"
    >
      <div class="demo-drawer__content">
        <el-form ref="form" :model="form" label-width="90px" :title='formTitle'>
          <el-form-item label="url" prop="url">
            <el-input v-model="form.url" placeholder="请输入url"></el-input>
          </el-form-item>
        </el-form>
        <div class="demo-drawer__footer">
          <el-button @click="cancelForm">取 消</el-button>
          <el-button type="primary" @click="$refs.drawer.closeDrawer()" :loading="loading">{{ loading ? '提交中 ...' : '确 定' }}</el-button>
        </div>
      </div>
    </el-drawer>
    <!--列表抽屉-->
    <el-drawer
      :title="drawerTitle"
      :before-close="handleCloseList"
      :visible.sync="drawerList"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer"
      :size="drawerSize"
    >
      <div class="demo-drawer__content">
        <el-table :data="[tableData[tableIndex]]" stripe style="width: 90%" v-loading="loading">
          <el-table-column fixed prop="url" label="url" width="185"></el-table-column>
          <el-table-column
            prop="pg_version"
            label="数据库版本"
            width="160">
          </el-table-column>
          <el-table-column
            prop="os"
            label="操作系统"
            width="160">
          </el-table-column>
          <el-table-column
            prop="create_time"
            label="创建时间"
            width="140">
          </el-table-column>
          <el-table-column
            prop="update_time"
            label="更新时间"
            width="140">
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="120" :formatter="statusFormat">
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>
    <!--详情抽屉-->
    <el-drawer
      :title="drawerTitle"
      :before-close="handleCloseDetail"
      :visible.sync="drawerDetail"
      direction="rtl"
      custom-class="demo-drawer"
      ref="drawer"
      :size="drawerSize"
    >
      <div class="demo-drawer__content">
        <el-table :data="gridData">
          <el-table-column property="name" label="插件名称" width="230"></el-table-column>
          <el-table-column property="extension_version" label="安装版本" width="130"></el-table-column>
          <el-table-column property="comment" label="描述"></el-table-column>
        </el-table>
      </div>
    </el-drawer>
  </div>

</template>

<script>
import '@/assets/outside2/js/jquery.min'
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
    this.$nextTick(function () {
      const childList = document.getElementsByClassName("data-origin");
      console.log(childList, 888);
      Array.from(childList).forEach(item => {
        console.log(item, 4455);
      });
    })
  },
  data() {
    return {
      title: '',
      formTitle: '', //新增修改的
      id: undefined,
      loading: true,
      tableData: [],
      gridData: [],
      form: {},
      statusOptions: [
        {dictLabel: "可用", dictValue: "0"}, {dictLabel: "不可用", dictValue: "1"},
      ],
      //添加的DOM元素编排的顺序
      order: 0,
      //添加的dom元素的定位
      xPosition: 280 + 'px',
      yPosition: 18 + 'px',
      //控制抽屉的显示隐藏
      drawer: false,
      drawerList: false,
      drawerDetail: false,
      // 抽屉的标题
      drawerTitle: '',
      drawerSize: '30%',
      formLabelWidth: '80px',
      timer: null,
      tableIndex: null,
    };
  },
  methods: {
    //关闭详情抽屉
    handleCloseDetail() {
      this.drawerDetail = false;
    },
    //关闭列表抽屉
    handleCloseList() {
      this.drawerList = false;
    },
    showList(index) {
      this.drawerSize = "30%";
      this.drawerTitle = "查看节点";
      this.tableIndex = index;
      this.drawerList = true;
    },
    handleClose(done) {
      this.loading = true;
      if (this.loading) {
        return;
      }
      this.timer = setTimeout(() => {
        done();
        // 动画关闭需要一定的时间
        setTimeout(() => {
          this.loading = false;
          this.drawer = false;
        }, 400);
      }, 2000);
    },
    cancelForm() {
      this.loading = false;
      this.drawer = false;
      clearTimeout(this.timer);
    },

    eui() {

    },
    getList() {
      this.loading = true;
      listType().then(response => {
          console.log("查询所有的res",response);
          this.tableData = response.data;
          this.loading = false;
          console.log("tabledata:",this.tableData);
        }
      );
    },
    submitForm: function() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          console.log("this.form添加orderItem后:",this.form);
          if (this.id !== undefined) {  // 修改
            var data = {
              id:this.id,
              url:this.form.url
            }
            updateType(data).then(response => {
              console.log("res-updateType:",response);
              if(response.data.res === 0){
                this.$message({
                  message: '修改成功!',
                  type: 'success'
                });
                this.getList()

              }else{
                this.$message.error('修改失败!'+response.data.msg);
              }
              this.id = undefined
            })
          } else {
            addType(this.form).then(response => {
              console.log("res-addType:",response);
              if(response.data.res === 0){
                this.$message({
                  message: '添加成功!',
                  type: 'success'
                });
                this.getList()
              }else{
                this.$message.error('添加失败!'+response.data.msg);
              }
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
        if (datas[key].dictValue == ('' + value)) {
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
      this.drawerSize = "30%";
      this.drawerTitle = '查看 '+item.url+' 的详情'
      console.log(item);
      var data = {
        id:item.uuid,
        url:item.url
      }
      getType(data).then(response => {
        this.gridData = response.data.extensions
      })
    },
    delNode(item) {
      var data = {
        id:item.uuid,
      }
      this.$confirm('是否确认删除url为"' + item.url + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function() {
        return delType(data)
      }).then((response) => {
        console.log("res-del",response);
        if(response.data.res === 0){
          this.$message({
            message: '删除成功!',
            type: 'success'
          });
          this.getList()
        }else{
          this.$message.error('删除失败!'+response.data.msg);
        }
      }).catch(function() {});
    },
    addRow(){
      this.drawerTitle = '新增节点';
      this.drawer = true;
      this.drawerSize = '20%';
    },
    handleChange(item){
      this.id = item.uuid
      this.formTitle = '原url为：'+item.url
    },
    //克隆子节点
    cloneNode() {
      const modeling = this.$refs.origin;
      const cloneEle = modeling.cloneNode(true);
      cloneEle.classList.add(`clone${this.order}`);
      this.order++;
      this.$refs.warp.append(cloneEle);
      // this.locationNode();
    },
    //定位生成每个子节点的位置
    locationNode() {
      const childList = document.getElementsByClassName("data-origin");
      console.log(childList, 888);
      this.$nextTick(() => {
        Array.from(childList).forEach(item => {
          console.log(item, 4455);
        });
      });

    }
  },
  created() {
    this.getList();
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
<style scoped>
.Y-center {
}
.Y-center .warp {
  zoom: 1;background: #162878\0;background-image: linear-gradient(180deg, #193b8f 0%, #110450 100%);
}
.node-container {
  width: 25%;
  position: relative;
  /*fixme 高度以写死*/
  height: 33.3vh;
  float: left;
  transition: 1s;

}
/*fixme 对固定的两个元素的宽度是写死的*/
.node-container:nth-child(7),.node-container:nth-child(8) {
  width: 50%;
}


</style>

<style>



.el-popover.myPopover {
  background-image: linear-gradient(-225deg, #22E1FF 0%, #1D8FE1 48%, #625EB1 100%);
  border: #00CBFF 1px solid;

}
.el-drawer {
  background-color: rgba(29, 31, 32, 0.9);
}
.demo-drawer__content {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.el-drawer__body {
  padding: 20px;
  flex: 1;
  overflow: auto;
}
.demo-drawer__content form {
  flex: 1;
}

.demo-drawer__footer {
  display: flex;
}

.demo-drawer__footer button {
  flex: 1;
}
</style>
