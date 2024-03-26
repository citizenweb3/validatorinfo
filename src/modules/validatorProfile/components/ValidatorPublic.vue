<template>
  <div class="w-full">
      <div class='title'>Public Good</div>
      <div class='text-white'>
        What is Lorem Ipsum?<br/>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
      </div>
    <el-tabs class="tabs" stretch>
      <el-tab-pane label="Infrastructure" name='infrastructure'>
        <ValidatorInfrastructure />
      </el-tab-pane>
      <el-tab-pane label="Community" name='community'>
        <ValidatorCommunity />
      </el-tab-pane>
      <el-tab-pane label="Media" name="media">
        <ValidatorMedia />
      </el-tab-pane>
      <el-tab-pane label="Tools" name='tools'>
        <ValidatorTools />
      </el-tab-pane>
      <el-tab-pane label="Other" name='other'>
        <ValidatorOther />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue'
import ValidatorCommunity from 'modules/validatorProfile/components/publicGood/ValidatorCommunity.vue'
import ValidatorInfrastructure from 'modules/validatorProfile/components/publicGood/ValidatorInfrastructure.vue'
import ValidatorMedia from 'modules/validatorProfile/components/publicGood/ValidatorMedia.vue'
import ValidatorTools from 'modules/validatorProfile/components/publicGood/ValidatorTools.vue'
import ValidatorOther from 'modules/validatorProfile/components/publicGood/ValidatorOther.vue'

const activeName = ref('media')

</script>
