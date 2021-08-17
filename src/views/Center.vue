<template>
  <div class="Y-center">
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

      <!--数据源 开始-->
      <div class="data-origin">
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
      </div>
      <!--数据源 结束-->

      <!--指标定义 开始-->
      <div class="index-define"
           @click="cloneNode"
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
        <div class="id-ambox ib-3">
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
      <div class="gd-01">
      </div>
      <div class="gd-02">
      </div>
      <!--指标建模 开始-->
      <div ref="modeling"  class="index-modeling">
        <div class="im-cont-shang">
          <img src="@/assets/outside2/images/jm_di02.png">
          <img src="@/assets/outside2/images/jm_di03.png">
          <img src="@/assets/outside2/images/jm_di02.png">
          <img src="@/assets/outside2/images/jm_di03.png">
          <img src="@/assets/outside2/images/jm_di02.png">
          <img src="@/assets/outside2/images/jm_di03.png">
        </div>
        <div class="im-cont"></div>
        <div class="im-top">
          <div class="xz-light"></div>
        </div>
        <div class="im-anim">
            <span class="im-gaizi">
                <img src="@/assets/outside2/images/jm_top05.png">
                <img src="@/assets/outside2/images/jm_top05.png">
                <img src="@/assets/outside2/images/jm_top05.png">
            </span>
          <span class="im-quan"></span>
        </div>
      </div>
      <!--指标建模 结束-->
      <div class="gd-03">
      </div>
      <div class="light-flow">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
        <img src="@/assets/outside2/images/light.png">
      </div>
    </div>
    <!--新增节点模态框开始-->
    <!-- 修改按钮的form -->
    <el-dialog :append-to-body="true" :title="formTitle" :visible.sync="visibleChange" width="700px">
      <el-form ref="form" :model="form" label-width="90px" :title='formTitle'>
        <el-form-item label="url" prop="url">
          <el-input v-model="form.url" placeholder="请输入url"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="visibleChange = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>
    <!--新增节点模态框结束-->
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
  },
  data() {
    return {
      title:'',
      formTitle:'', //新增修改的
      id:undefined,
      loading: true,
      visibleChange:false,
      visible:false,
      tableData: [],
      gridData:[],
      form:{},
      statusOptions:[
        {dictLabel:"可用",dictValue:"0"},{dictLabel:"不可用",dictValue:"1"},
      ],
      order: 0,
      //添加的DOM元素编排的顺序
    };
  },
  methods: {
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
              this.visibleChange = false
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
                this.visibleChange = false
              }else{
                this.$message.error('添加失败!'+response.data.msg);
              }
            })
          }
          this.id = undefined
          this.form = {}
          // this.visibleChange = false
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
    handleDetail(row) {
      this.visible = true
      console.log(row);
      var data = {
        id:row.uuid,
        url:row.url
      }
      getType(data).then(response => {
        this.gridData = response.data.extensions
        this.title = '查看 '+row.url+' 的详情'
        // console.log("res-detail:",response);
      })
    },
    handleDelete(row) {
      var data = {
        id:row.uuid,
      }
      this.$confirm('是否确认删除url为"' + row.url + '"的数据项?', "警告", {
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
      this.visibleChange = true
      this.formTitle = '新增节点'
    },
    handleChange(row){
      this.visibleChange = true
      this.id = row.uuid
      this.formTitle = '原url为：'+row.url
    },
    cloneNode() {
      const modeling = this.$refs.modeling;
      console.log(modeling, 888);
      const cloneEle = modeling.cloneNode(true);
      cloneEle.classList.add(`clone${this.order}`);
      this.order++;
      cloneEle.style.right = 200 + 'px';
      cloneEle.style.bottom = 118 + 'px';
      this.$refs.warp.append(cloneEle);
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
.Y-center {position: fixed;top: 0;left: 0;width: 100%;height: 100%;z-index: -10;zoom: 1;background: #162878\0;background-image: linear-gradient(180deg, #193b8f 0%, #110450 100%);}
</style>
