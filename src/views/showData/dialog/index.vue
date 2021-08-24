<template>
  <div>
    <div class="Y_form">
      <el-dialog
        class="dialog-containers"
        :close-on-click-modal='dialogConfig.disabled'
        :title="dialogConfig.title"
        @close="close"
        :visible.sync="dialogConfig.createDialog"
        :width="dialogConfig.width">
        <div class="container">
          <slot class="container">
            <my-form
              ref="processFormItem"
              :init='initFormItem'>
            </my-form>
          </slot>
        </div>
        <div class="footer">
          <slot name="footer">
            <el-button
              class="common_btn"
              @click="save">保存</el-button>
          </slot>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import MyForm from "@/components/MyForm";
import {insertList, updateList} from "@/api/index";
export default {
  name: "index",
  components: {
    MyForm
  },
  data() {
    return {
      //模态框配置
      dialogConfig:{
        width: "50%",
        createDialog: false,
        disabled: false,
        title: null
      },
      //表单配置
      initFormItem:{
        itemList:[
          {
            label:"extension_version",
            placeholder:"请输入extension_version",
            key:"extension_version",
            prop:"extension_version",
            width: "50%"
          }, {
            label:"extension_id：",
            placeholder:"请输入extension_id",
            key:"extension_id",
            prop:"extension_id",
            width: "50%"
          }, {
            label:"slave_id：",
            placeholder:"请输入slave_id",
            key:"slave_id",
            prop:"slave_id",
            width: "50%"
          },
        ],
        rules:{
          extension_version: [
            {required: true, message: '请输入extension_version', trigger: 'blur'}
          ], extension_id: [
            {required: true, message: '请输入extension_id', trigger: 'blur'}
          ], slave_id: [
            {required: true, message: '请输入slave_id', trigger: 'blur'}
          ],
        },
        ruleForm:{
          extension_version: "",
          extension_id: "",
          slave_id: ""
        },
        labelWidth:'200px',
      },
      type: undefined,
      tname: "xs_slave_extension_copy1",	//表名
      extension_id: undefined,
    };
  },
  methods:{
    openDialog(obj){
      const {type,title,row} = obj
      console.log(row, 888);
      this.type = type;
      this.dialogConfig.title = title
      this.dialogConfig.createDialog = true
      if(type === 'edit'){
        this.handleRow(row);
        this.extension_id = row.extension_id;
      }
    },
    handleRow(row){
      for(let key in this.initFormItem.ruleForm){
        this.initFormItem.ruleForm[key] = row[key];
      }
    },
    save(){
      let formItems = this.$refs.processFormItem.submitForm();
      if(!formItems) return false;
      if (this.type === 'add') {
        this.insertData();
      } else {
        this.updateData();
      }
    },
    close(){
      this.$refs.processFormItem.resetForm();
      this.dialogConfig.createDialog = false;
    },
    //表格数据新增
    insertData() {
      var data = {
        type: 'insert',
        tname: this.tname,
        values: this.initFormItem.ruleForm
      };
      try {
        insertList(data).then(response => {
          if (response.data.res >= 1) {
            this.$message({
              message: '新增成功!',
              type: 'success'
            });
            this.$emit("success");
            this.dialogConfig.createDialog = false;
          } else {
            this.$message.error('新增失败!' + response.data.msg);
          }
        });
      }catch (error) {
        this.$message.warning(`新增失败${error}`);
      }

    },
    //表格数据修改
    updateData() {
      var data = {
        type: 'update',
        tname: this.tname,
        values: this.initFormItem.ruleForm,
        conditions:{                        	//修改条件
          extension_id: this.extension_id
        }
      };
      updateList(data).then(response => {
        if (response.data.res >= 1) {
          this.$message({
            message: '修改成功!',
            type: 'success'
          });
          this.$emit("success");
          this.dialogConfig.createDialog = false;
        } else {
          this.$message.error('修改失败!' + response.data.msg);
        }
      });
    },
  }
}
</script>

<style scoped>

</style>
