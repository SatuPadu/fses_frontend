<script setup lang="ts">
import { UserIcon, MailIcon, ListCheckIcon, LogoutIcon } from 'vue-tabler-icons';
import { useUserStore } from '~/stores/modules/user';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();

const handleLogout = async () => {
  try {
    const result = await userStore.logout();
    if (result.success) {
      // Navigate to login page after successful logout
      router.push('/auth/login');
    } else {
      console.error('Logout failed:', result.error);
    }
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
</script>

<template>
    <!-- ---------------------------------------------- -->
    <!-- User Profile Dropdown -->
    <!-- ---------------------------------------------- -->
    <v-menu :close-on-content-click="true">
        <template v-slot:activator="{ props }">
            <v-btn class="profileBtn custom-hover-primary" variant="text" v-bind="props" icon>
                <v-avatar size="35">
                    <img 
                      v-if="userStore.currentUser?.avatar" 
                      :src="userStore.currentUser.avatar" 
                      height="35" 
                      alt="user" 
                    />
                    <img v-else src="/images/users/avatar-1.jpg" height="35" alt="user" />
                </v-avatar>
            </v-btn>
        </template>
        <v-sheet rounded="md" width="200" elevation="10" class="mt-2">
            <v-list class="py-0" lines="one" density="compact">
                <v-list-item value="item1" color="primary" >
                    <template v-slot:prepend>
                        <UserIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">
                        <NuxtLink to="/profile" class="text-decoration-none text-body-1">My Profile</NuxtLink>
                    </v-list-item-title>
                </v-list-item>
                <v-list-item value="item2" color="primary">
                    <template v-slot:prepend>
                        <MailIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Account</v-list-item-title>
                </v-list-item>
                <v-list-item value="item3" color="primary"> 
                    <template v-slot:prepend>
                        <ListCheckIcon stroke-width="1.5" size="20"/>
                    </template>
                    <v-list-item-title class="pl-4 text-body-1">My Task</v-list-item-title>
                </v-list-item>
            </v-list>
            <div class="pt-4 pb-4 px-5 text-center">
                <v-btn 
                  color="primary" 
                  variant="outlined" 
                  block
                  @click="handleLogout"
                >
                  <LogoutIcon stroke-width="1.5" size="16" class="mr-2"/>
                  Logout
                </v-btn>
            </div>
        </v-sheet>
    </v-menu>
</template>