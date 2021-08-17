<template>
  <div>
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

    <!-- 修改按钮的form -->
    <el-dialog :title="formTitle" :visible.sync="visibleChange" width="700px">
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

    <el-button id="button"
               type="primary"
               icon="el-icon-plus"
               size="small"
               @click="addRow"
    >新增</el-button>
  </div>

</template>

<script>
import { listType,getType,delType,updateType,addType } from "@/api/index";
export default {
  name: "test",
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
    };
  },
  created() {
    this.getList();
  },
  methods: {
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
          if (this.id != undefined) {  // 修改
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
    }
  }
}
</script>

<style scoped>

</style>
