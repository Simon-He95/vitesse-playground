<template>
  <header
    h="54px"
    background-white
    border-bottom="1px solid #ddd"
    box-border
    flex
    justify-between
    items-center
    px5
  >
    <a href="https://github.com/FightingDesign/fighting-design" target="_blank">
      <div flex justify-center items-center cursor-pointer select-none>
        <!-- <f-avatar
          round
          size="mini"
          src="https://tianyuhao.cn/images/fighting-design/FightingDesign.svg"
        /> -->
        <span h="18px" ml="2.5" font-bold font="17px" class="name">Playground</span>
      </div>
    </a>

    <ul class="option" flex justify-around items-center>
      <li class="option-item">
        <a href="https://fighting.tianyuhao.cn/" type="primary" target="_blank"> 官网 </a>
      </li>
      <li class="option-item">
        <a href="https://cn.vuejs.org/" type="primary" target="_blank"> Vue.js </a>
      </li>
      <li class="option-item">
        <a
          href="https://github.com/FightingDesign/fighting-design-playground"
          type="primary"
          target="_blank"
        >
          Github
        </a>
      </li>
    </ul>
  </header>
</template>

<style lang="css" scoped>
.name {
  background: -webkit-linear-gradient(55deg, rgb(57, 92, 227) 10%, rgb(94, 224, 221));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.option-item {
  white-space: nowrap;
  list-style: none;
  margin: 0 10px;
  cursor: pointer;
  user-select: none;
  font-size: 15px;
  color: #333;
  padding: 3px 6px;

}

.option-item:hover {
    transition: 0.3s;
    color: #2d5af1;
    background: rgb(240, 240, 240);
  }
</style>
