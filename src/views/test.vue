<template>
  <div>
    test
    <svg xmlns="http://www.w3.org/2000/svg" width="100vw" height="100vh">
      <rect :style="{
        width:400 +'px',
        height:20,
        x: globalXOffset + 209,
        y: globalYOffset,
        fill: darkRed
      }"/>
      <rect :style="{
        width:20 +'px',
        height:10 +'vh',
        y: 219,
        x: globalXOffset,
        fill: darkRed
      }"/>
      <path
        fill="none"
        stroke-width="20"
        :stroke="darkRed"
        d="M19.5,219.5 v-0 a200,200 0 0 1 199.5,-199.5 h0"
      />
    </svg>

  </div>
</template>

<script>
export default {
  data() {
    return {
      darkRed : "#990700",
      lightRed : "#DB3400",
      orange : "#EC9503",
      cream : "#E5E3A8",
      brown : "#302D28",
      globalXOffset : 9.5,
      globalYOffset: 10
    };
  },
  created() {


  },
  mounted() {

  },
  methods: {}
};
</script>

<style scoped lang="less">

</style>
