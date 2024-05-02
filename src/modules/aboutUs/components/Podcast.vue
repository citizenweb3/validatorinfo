<template>
  <div class="titleWrapper">
    <p class="title">{{ data.title }}</p>
  </div>
  <div class="contentWrapper mt-4">
    <div v-for="(item, index) in data.data.main" :key="index" class="contentItem mt-5">
      <ContentItem :label="item.label" :content="item.content" />
    </div>
    <div class="playerWrapper">
      <iframe
        src="https://player.fireside.fm/v2/7d8ZfYhp/latest?theme=dark"
        width="740"
        height="200"
      ></iframe>
    </div>
    <div>
      <div class="footer-label">{{ data.data.footer.label }}</div>
      <div class="footer-content">{{ data.data.footer.content1 }}</div>
      <div class="footer-content">{{ data.data.footer.content2 }}</div>
      <div class="footer-links">
        <div v-for="(link, name) in data.data.footer.links" :key="name">
          <a :href="link" target="_blank">{{ name }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import useStore from 'store'
import { GeneralInfo, PodcastInfo } from 'modules/aboutUs/store/types'
import ContentItem from 'modules/aboutUs/components/ContentItem.vue'
const store = useStore()

export default defineComponent({
  name: 'AboutUsPodcast',
  components: {
    ContentItem,
  },
  props: {
    title: {
      type: String,
      default: 'Podcast tabs',
    },
  },
  setup() {
    const data: PodcastInfo = store.aboutUs.podcast

    return {
      data,
    }
  },
})
</script>

<style scoped lang="scss">
.title {
  color: theme('colors.americanYellow');
  font-size: 24px;
  border-bottom: 1px solid theme('colors.blackOlive');
  width: fit-content;
}
.contentItem {
  border: none;

  &:not(:first-of-type) {
    border-top: 1px solid theme('colors.blackOlive');
  }
}

.playerWrapper {
  margin: 40px auto;
  display: flex;
  justify-content: center;
  align-items: center;
}

.footer-label {
  font-weight: bold;
  color: theme('colors.white');
  margin-bottom: 20px;
}

.footer-content {
  margin-bottom: 10px;
  color: theme('colors.white');
}

.footer-links {
  list-style: none;
  padding: 0;
  color: theme('colors.americanYellow');
  margin-bottom: 5px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.footer-links a {
  text-decoration: none;
}
</style>
