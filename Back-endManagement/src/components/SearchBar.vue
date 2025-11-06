<template >
    <div class="search-container">
        <!--  -->
    <el-input 
      v-model="searchKeywords" 
      placeholder="搜索用户名/兴趣标签" 
      class= "search-input" 
      prefix-icon="Search"
      @keyup.enter="handleSearch"  支持回车键搜索 
    />

    <!-- 搜索按钮 -->
    <el-button type="primary" class="search-btn" @click="handleSearch">
      搜索
    </el-button>
    
    <!-- 重置按钮 -->
    <el-button type="default" class="reset-btn" @click="resetSearch">
      重置
    </el-button>
        
    </div>
</template>
<script setup>
    import { ref, defineEmits } from 'vue'

    // 定义发送给父组件的事件
    const emit = defineEmits(['search'])

    // 搜索关键词
    const searchKeywords = ref('')

    // 搜索按钮点击
    const handleSearch = () => {
    emit('search', searchKeywords.value.trim())
    }

    // 重置搜索
    const resetSearch = () => {
    searchKeywords.value = ''
    emit('search', '')  // 发送空字符串，显示所有数据
    }
</script>
<style scoped>
.search-container {
    display: flex;
    gap: 10px;  /* 按钮之间的间距 */
    padding: 15px 0;
}

.search-input {
  width: 300px;
}

.search-btn {
  background-color: #165dff;
}
</style>