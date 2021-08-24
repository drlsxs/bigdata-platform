<template>
  <el-table
    ref="tableData"
    style="width: 100%"
    v-loading="loading"
    :height="init.config.height ? init.config.height : '100%'"
    :data="tableData"
    :size="init.config.size"
    :show-header="
      init.config.showHeader !== undefined ? init.config.showHeader : true
    "
    :stripe="init.config.stripe"
    :border="init.config.border"
    :header-cell-style="headerCellStyle"
    :header-row-class-name="headerRowClassName"
    :row-class-name="rowClassName"
    :cell-class-name="cellClassName"
    :header-cell-class-name="headerCellClassName"
    :cell-style="cellStyle"
    :row-key="init.config.rowKey"
    :default-sort="init.config.defaultSort"
    @row-click="rowClick"
    @row-dblclick="rowDblclick"
    @cell-click="cellClick"
    @cell-dblclick="cellDblclick"
    @header-click="headerClick"
    @selection-change="handleSelectionChange"
  >
    <!-- 表格前部插槽 -->
    <slot name="prepend"> 表格头附加内容 </slot>
    <!-- 多选 -->
    <el-table-column
      type="selection"
      :reserve-selection="
        init.config.reserveSelect ? init.config.reserveSelect : false
      "
      v-if="init.config.selection"
      :fixed="init.config.selection.fixed"
      :width="init.config.selection.width"
      :align="
        init.config.selection.align ? init.config.selection.align : 'left'
      "
    >
    </el-table-column>
    <!-- 索引 -->
    <el-table-column
      type="index"
      v-if="init.config.index"
      :width="init.config.index.width ? init.config.index.width : '70px'"
      :fixed="init.config.index.fixed"
      :align="init.config.index.align ? init.config.index.align : 'left'"
      :label="init.config.index.label ? init.config.index.label : '序号'"
      :index="(index) => init.config.index.method(index)"
    >
    </el-table-column>
    <!-- 表格 -->
    <el-table-column
      v-for="(item, index) in init.options"
      :key="index"
      :prop="item.prop"
      :label="item.label"
      :width="item.width"
      :fixed="item.fixed"
      :align="item.align ? item.align : 'left'"
      :sortable="item.sortable"
      :show-overflow-tooltip="
        item.overflowTooltip !== undefined ? item.overflowTooltip : true
      "
    >
      <template slot-scope="scope">
        <!-- 插槽,插槽名为对应prop,不使用可不写插槽 -->
        <slot
          :name="item.prop"
          :index="scope.$index"
          :column="scope.column"
          :row="scope.row"
        >
          {{ item.format ? item.format(scope.row) : scope.row[item.prop] }}
        </slot>
      </template>
    </el-table-column>
    <!-- 下拉菜单 -->
    <el-table-column
      v-if="init.config.dropdown"
      :label="init.config.dropdown.label ? init.config.dropdown.label : '操作'"
      :align="init.config.dropdown.align ? init.config.dropdown.align : 'left'"
      :width="init.config.dropdown.width"
    >
      <template slot-scope="scope">
        <el-dropdown
          trigger="click"
          @command="handleCommand($event, scope.row)"
        >
          <span class="el-dropdown-link">{{ init.config.dropdown.text }}</span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item
              v-for="(item, index) in init.config.dropdown.list"
              :key="index"
              :command="item.key"
              :icon="item.icon ? item.icon : ''"
              >{{ item.label }}</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </template>
    </el-table-column>
    <!-- 按钮组 -->
    <el-table-column
      v-if="init.config.buttons"
      :label="init.config.buttons.label ? init.config.buttons.label : '操作'"
      :align="init.config.buttons.align ? init.config.buttons.align : 'left'"
      :width="init.config.buttons.width"
    >
      <template slot-scope="scope">
        <el-button
          v-for="(btn, index) in init.config.buttons.list"
          :key="index"
          :type="btn.type || 'primary'"
          :size="btn.size"
          @click.stop="handleCommand(btn.key, scope.row, scope.$index)"
        >
          {{ btn.label }}
        </el-button>
      </template>
    </el-table-column>
    <!-- 表格尾部插槽 -->
    <slot name="append"> 表格尾部附加内容 </slot>
    <!-- 暂无数据提示 -->
    <template slot="empty">
      <slot name="empty"> 暂无数据 </slot>
    </template>
  </el-table>
</template>

<script>
export default {
  props: {
    //表格数据
    tableData: {
      type: Array,
      default: () => [],
    },
    //表格初始
    init: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  watch: {
    tableData: {
      // eslint-disable-next-line no-unused-vars
      handler(newVal, oldVal) {
        this.doLayout();
      },
      deep: true,
    },
  },
  data() {
    return {
      loading: true
    };
  },
  methods: {
    //操作
    handleCommand(e, row, index) {
      this.$emit("handleCommand", e, row, index);
    },
    // 行点击
    rowClick(row, column, event) {
      this.$emit("rowClick", row, column, event);
    },
    // 行双击
    rowDblclick(row, column, event) {
      this.$emit("rowDblclick", row, column, event);
    },
    // 单元格点击
    cellClick(row, column, cell, event) {
      this.$emit("cellClick", row, column, cell, event);
    },
    // 单元格双击
    cellDblclick(row, column, cell, event) {
      this.$emit("cellDblclick", row, column, cell, event);
    },
    // 单元格双击
    headerClick(column, event) {
      this.$emit("headerClick", column, event);
    },
    // 多选
    handleSelectionChange(val) {
      this.$emit("handleSelectionChange", val);
    },
    // 行类名
    rowClassName(row) {
      if (this.init.config.rowClassName)
        return this.init.config.rowClassName(row);
    },
    // 行类名
    // eslint-disable-next-line no-unused-vars
    cellClassName({ row, column, rowIndex, columnIndex }) {
      if (this.init.config.cellClassName) {
        return this.init.config.cellClassName({
          row,
          column,
          rowIndex,
          columnIndex,
        });
      } else {
        return "common_cell_class";
      }
    },
    // 表头类名
    // eslint-disable-next-line no-unused-vars
    headerRowClassName({ row, rowIndex }) {
      if (this.init.config.headerRowClassName)
        return this.init.config.headerRowClassName(row, rowIndex);
      else return "header_row_class";
    },
    // 表头类名
    // eslint-disable-next-line no-unused-vars
    headerCellClassName({ row, column, rowIndex, columnIndex }) {
      if (this.init.config.headerCellClassName) {
        return this.init.config.headerCellClassName({
          row,
          column,
          rowIndex,
          columnIndex,
        });
      } else {
        return "header_cell_class";
      }
    },
    // 表头单元格样式
    headerCellStyle({ row, column, rowIndex, columnIndex }) {
      if (this.init.config.headerCellStyle)
        return this.init.config.headerCellStyle({
          row,
          column,
          rowIndex,
          columnIndex,
        });
    },
    // 单元格样式
    cellStyle({ row, column, rowIndex, columnIndex }) {
      if (this.init.config.cellStyle)
        return this.init.config.cellStyle({
          row,
          column,
          rowIndex,
          columnIndex,
        });
    },
    //重新布局
    doLayout() {
      this.$refs.tableData.doLayout();
    },
    // 设置选中
    toggleRowSelection(row) {
      this.$nextTick(() => {
        this.$refs.tableData.toggleRowSelection(row);
      });
    },
  },
};
</script>

<style scoped>
.el-dropdown-link {
  cursor: pointer;
}
</style>
