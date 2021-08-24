<template>
    <div>
      <el-form
        ref="ruleForm"
        class="ruleForm"
        :rules="init.rules"
        :model="ruleForm"
        :label-width="init.labelWidth || '140px'"
        :disabled="isDisabled">
        <div
          v-for="(item, index) in init.itemList"
          :key="index"
          :style="{
        width: item.width || '100%',
        boxSizing: 'border-box',
      }"
        >
          <el-form-item :label="item.label" :prop="item.prop" v-if="!item.itemSlot">
            <slot :name="item.key">
              <el-input
                :placeholder="item.placeholder"
                :type="item.type"
                v-model="ruleForm[item.key]">
                <template slot="suffix" v-if="item.suffix">
                  <slot>{{item.suffix}}</slot>
                </template>
              </el-input>
            </slot>
          </el-form-item>
        </div>
      </el-form>
    </div>
</template>
<script>
export default {
    props:{
        init: {
            type: Object,
            default: () => {
                return {};
            },
        },
        // 是否禁用
        isDisabled: {
            type: Boolean,
            default: false,
        },
        test: {
              type: Number,
              default: 0,
          },
      myObj: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    data(){
        return{
          ruleForm: this.init.ruleForm,
        }
    },
    methods:{
        // 表单方法
        // 提交表单
        submitForm() {
            let flag;
            this.$refs["ruleForm"].validate((valid) => {
                if (valid) {
                console.log("验证成功");
                flag = this.ruleForm;
                } else {
                console.log("验证失败");
                flag = false;
                return false;
                }
            });
            return flag;
        },
        // 重置表单
        resetForm() {
            this.$refs["ruleForm"].resetFields();
            // 防止element只清空有prop验证的参数
            Object.keys(this.init.ruleForm).forEach((key) => {
                let type = this.getDataType(this.ruleForm[key]);
                switch (type) {
                case "Array":
                    this.ruleForm[key] = [];
                    break;
                case "boolean":
                    this.ruleForm[key] = false;
                    break;
                default:
                    this.ruleForm[key] = "";
                    break;
                }
            });
        },
        // 获取对象数据类型
        getDataType(obj) {
            let type = typeof obj;
            if (type != "object") {
                return type;
            }
            return Object.prototype.toString
                .call(obj)
                .replace(/^\[object (\S+)\]$/, "$1");
        },
    },
  watch: {

  }
}
</script>
<style scoped>
.ruleForm {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
}
/deep/.el-input__inner{
    color: #000!important;
    background: rgb(255, 255, 255)!important;
}
/deep/.el-form-item__label{
    font-size: 16px;
    color: #000;
}
</style>
