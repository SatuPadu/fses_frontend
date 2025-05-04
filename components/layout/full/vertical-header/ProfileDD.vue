<template>
  <v-menu :close-on-content-click="true">
    <template #activator="{ props }">
      <v-btn
        class="profileBtn custom-hover-primary"
        variant="text"
        v-bind="props"
        icon
      >
        <v-avatar size="35">
          <img :src="userAvatar" height="35" alt="user" />
        </v-avatar>
      </v-btn>
    </template>

    <v-sheet rounded="md" width="200" elevation="10" class="mt-2">
      <v-list class="py-0" lines="one" density="compact">
        <template v-for="item in menuItems" :key="item.value">
          <NuxtLink 
            v-if="item.to"
            :to="item.to" 
            class="text-decoration-none"
            style="color: inherit;"
          >
            <v-list-item 
              :value="item.value" 
              class="gap-3" 
              color="primary"
            >
              <template #prepend>
                <component 
                  :is="item.icon"
                  stroke-width="1.5" 
                  size="20" 
                  :style="item.isActive ? activeIconStyle : {}"
                />
              </template>
              <v-list-item-title 
                class="text-body-1" 
                :class="{ 'text-primary': item.isActive }"
              >
                {{ item.title }}
              </v-list-item-title>
            </v-list-item>
          </NuxtLink>

          <v-list-item 
            v-else
            :value="item.value" 
            color="primary"
          >
            <template #prepend>
              <component 
                :is="item.icon"
                stroke-width="1.5" 
                size="20"
              />
            </template>
            <v-list-item-title class="pl-4 text-body-1">
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>

      <div class="pt-4 pb-4 px-5 text-center">
        <v-btn
          color="primary"
          variant="outlined"
          block
          @click="handleLogout"
        >
          <LogoutIcon stroke-width="1.5" size="16" class="mr-2" />
          Logout
        </v-btn>
      </div>
    </v-sheet>
  </v-menu>
</template>

<script>
import { UserIcon, MailIcon, ListCheckIcon, LogoutIcon } from 'vue-tabler-icons';
import { useAuth } from '@/composables/useAuth';

export default {
  name: 'UserProfileDropdown',
  
  components: {
    UserIcon,
    MailIcon,
    ListCheckIcon,
    LogoutIcon,
  },
  
  data() {
    return {
      auth: useAuth(),
      activeIconStyle: { color: 'rgb(var(--v-theme-primary))' },
      menuConfig: [
        {
          to: '/profile',
          icon: 'UserIcon',
          title: 'My Profile',
          value: 'item1',
        },
        {
          icon: 'MailIcon',
          title: 'My Account',
          value: 'item2',
        },
        {
          icon: 'ListCheckIcon',
          title: 'My Task',
          value: 'item3',
        },
      ],
    };
  },
  
  computed: {
    userAvatar() {
      return this.auth.user?.avatar || '/images/users/avatar-1.jpg';
    },
    
    menuItems() {
      return this.menuConfig.map(item => ({
        ...item,
        icon: this.$options.components[item.icon],
        isActive: item.to === this.$route.path,
      }));
    },
  },
  
  methods: {
    async handleLogout() {
      try {
        await this.auth.logoutAndRedirect();
      } catch (error) {
        console.error('Error during logout:', error);
      }
    },
  },
};
</script>