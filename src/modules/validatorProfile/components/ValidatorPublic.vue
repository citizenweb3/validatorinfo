<template>
  <div class="w-full">
      <div class='title'>Public Good</div>
      <div class='text-white'>
        What is Lorem Ipsum?<br/>
        Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
      </div>
    <div class="flex justify-between px-5 mt-5">
      <router-link :to="{ name: 'ValidatorInfrastructure' }" @click.prevent.native="handleClick(0)">
        <Button :text="'Infrastructure'" :tabs="true" :index="0" :active-button-index="activeButtonIndex" />
      </router-link>
      <router-link :to="{ name: 'ValidatorCommunity' }" @click.prevent.native="handleClick(1)">
        <Button :text="'Community'" :tabs="true" :index="1" :active-button-index="activeButtonIndex" />
      </router-link>
      <router-link :to="{ name: 'ValidatorMedia' }" @click.prevent.native="handleClick(2)">
        <Button
          :text="'Media'"
          :tabs="true"
          :index="2"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
      <router-link :to="{ name: 'ValidatorTools' }" @click.prevent.native="handleClick(3)">
        <Button
          :text="'Tools'"
          :tabs="true"
          :index="3"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
      <router-link :to="{ name: 'ValidatorOther' }" @click.prevent.native="handleClick(4)">
        <Button
          :text="'Other'"
          :tabs="true"
          :index="4"
          :active-button-index="activeButtonIndex"
        />
      </router-link>
    </div>
    <router-view/>
  </div>
</template>

<script lang='ts' setup>
import { ref } from 'vue';
const activeButtonIndex = ref(2)
const handleClick = (index: number) => {
  activeButtonIndex.value = index
}
</script>
