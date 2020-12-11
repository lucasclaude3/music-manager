import Vue from 'vue';
import VueRouter from 'vue-router';
import YoutubeWindow from '@/components/YoutubeWindow';

Vue.use(VueRouter);

export default new VueRouter({
  routes: [
    {
      path: '/youtube-window',
      name: 'youtube-window',
      component: YoutubeWindow,
    },
  ],
});
