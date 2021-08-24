<template>
  <div>
    <div class="Y_button">
      <el-button @click="openDialog('add','新增')">新增</el-button>
    </div>
    <div class="Y_table">
      <my-table
        ref="table"
        :tableData="tableData"
        :init="tableInit"
        @handleCommand="handleCommand"
      >
      </my-table>
    </div>
    <div class="Y_pageNation">
      <el-pagination
        background
        layout="total,prev, pager, next, sizes"
        :total="pageParams.total"
        :page-size="pageParams.pageSize"
        :current-page="pageParams.pageNum"
        :page-sizes="[2, 5, 10]"
        @size-change="sizeChange"
        @current-change="currentChange">
      </el-pagination>
    </div>
    <fire-dialog ref="Dialog" @success='selectData'></fire-dialog>
  </div>
</template>

<script>
import MyTable from "@/components/MyTable";
import fireDialog from "./dialog";
import {deleteList, selectList} from "@/api/index";
export default {
  name: "index",
  components: {MyTable,fireDialog},
  data() {
    return {
      //表格数据
      tableData: [],
      //表格配置
      tableInit:{
        options:[
          {
            label:'extension_id',
            prop:'extension_id',
          },
          {
            label:'create_time',
            prop:'create_time',
          },
          {
            label:'extension_version',
            prop:'extension_version',
          },
          {
            label:'id',
            prop:'id',
          },
          {
            label:'slave_id',
            prop:'slave_id',
          },
        ],
        config:{
          selection:{},
          rowClassName(row){
            if((row.rowIndex + 1) % 2 === 0){
              return 'evenCows'
            }else {
              return 'oddCows'
            }
          },
          height:"300px",
          buttons: {
            list: [
              {key: 'edit', label: "修改", size: "small"},
              {key: 'delete', label: "删除", size: "small",type:'danger'}
            ]
          }
        },

      },
      //分页配置
      pageParams:{
        total:0,
        pageNum:1,
        pageSize:2
      },
      /////////////////// 简单查询
      tname: "xs_slave_extension_copy1",	//表名
    };
  },
  created() {
    this.selectData();
  },
  methods: {
    openDialog(type,title,row){
      let obj = {type,title,row}
      this.$refs.Dialog.openDialog(obj);
    },
    handleCommand(e,row,index){
      console.log(e, row, index);
      if (e === "delete") {
        this.deleteData(row);
      } else {
        this.openDialog(e, '编辑', row);
      }
    },
    selectData() {
      let {pageNum: page, pageSize: rows} = this.pageParams;
      var data = {
        type: "select",
        tname: this.tname,
        page,
        rows
      };
      selectList(data).then(response => {
        this.tableData = response.data.table;
        this.pageParams.total = response.data.total;
        this.$refs.table.loading = false;
      });
    },

    deleteData(row) {
      var data = {
        type: "delete",
        tname: this.tname,
        conditions: {
          extension_id: row.extension_id
        }
      };
      this.$confirm(`此操作将永久删除${row.extension_id}文件, 是否继续?`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteList(data).then(response => {
          if (response.data.res >= 1) {
            this.$message({
              type: 'success',
              message: '删除成功!'
            });
            this.selectData();
          } else {
            this.$message.error('删除失败!'+response.data.msg);
          }
        });
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    // 分页方法
    sizeChange(val) {
      this.pageParams.pageNum = 1;
      this.pageParams.pageSize = val;
    },
    currentChange(val) {
      this.pageParams.pageNum = val;
    },

  },
  watch:{
    pageParams:{
      handler() {
        this.selectData();
      },
      deep:true
    },
    "pageParams.total":{
      handler() {
        if (this.pageParams.total === (this.pageParams.pageNum - 1) * this.pageParams.pageSize) {
          this.pageParams.pageNum--;
          this.selectData();
        }
      }
    }
  }
}
</script>

<style scoped>
.Y_pageNation{
  width: 100%;
  height: 50px;
  background: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
