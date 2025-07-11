<script setup lang="ts">
import { ref, computed } from "vue";
import sidebarItems from "@/components/layout/full/vertical-sidebar/sidebarItem";
import { Menu2Icon } from "vue-tabler-icons";
import { usePermissions } from "~/composables/usePermissions";

const { hasPermission, isInitialized, userRoles } = usePermissions();

// Filter sidebar items based on permissions and roles
const sidebarMenu = computed(() => {
  const filteredItems: typeof sidebarItems = [];
  let lastHeader: string | null = null;
  let hasVisibleItemsInCurrentSection = false;

  for (let i = 0; i < sidebarItems.length; i++) {
    const item = sidebarItems[i];
    
    // Check if this item should be visible
    let shouldShowItem = false;
    
    if (item.header) {
      // For headers, we need to check if there are any visible items in the next section
      shouldShowItem = false; // We'll determine this after checking the next items
    } else {
      // For regular items
      if (!item.requiredPermission && !item.requiredRole && !item.requiredRoles) {
        shouldShowItem = true;
      } else if (item.requiredPermission === "dashboard:view") {
        shouldShowItem = true;
      } else if (!isInitialized.value) {
        shouldShowItem = false;
      } else {
        // Check permissions
        let hasPermissionAccess = true;
        if (item.requiredPermission) {
          const [module, action] = item.requiredPermission.split(':');
          hasPermissionAccess = hasPermission(module, action);
        }
        
        // Check roles
        let hasRoleAccess = true;
        if (item.requiredRole) {
          hasRoleAccess = userRoles.value.some(role => role.role_name === item.requiredRole);
        } else if (item.requiredRoles) {
          hasRoleAccess = userRoles.value.some(role => item.requiredRoles!.includes(role.role_name));
        }
        
        shouldShowItem = hasPermissionAccess && hasRoleAccess;
      }
    }

    if (item.header) {
      // Store the header for later processing
      lastHeader = item.header;
      hasVisibleItemsInCurrentSection = false;
    } else if (shouldShowItem) {
      // If this item is visible and we have a pending header, add the header first
      if (lastHeader && !hasVisibleItemsInCurrentSection) {
        filteredItems.push({ header: lastHeader });
        lastHeader = null;
      }
      hasVisibleItemsInCurrentSection = true;
      filteredItems.push(item);
    }
  }

  return filteredItems;
});

const sDrawer = ref(true);
</script>

<template>
  <!------Sidebar-------->
  <v-navigation-drawer
    left
    elevation="0"
    app
    class="leftSidebar"
    v-model="sDrawer"
    width="270"
  >
    <!---Logo part -->
    <div >
      <LayoutFullLogoDark />
    </div>
    <!-- ---------------------------------------------- -->
    <!---Navigation -->
    <!-- ---------------------------------------------- -->
    <div>
      <perfect-scrollbar class="scrollnavbar">
        <v-list class="pa-6">
          <!---Menu Loop -->
          <template v-for="(item, i) in sidebarMenu">
            <!---Item Sub Header -->
            <LayoutFullVerticalSidebarNavGroup
              :item="item"
              v-if="item.header"
              :key="item.title"
            />

            <!---If Has Child -->
            <LayoutFullVerticalSidebarNavCollapse
              class="leftPadding"
              :item="item"
              :level="0"
              v-else-if="item.children"
            />

            <!---Single Item-->
            <LayoutFullVerticalSidebarNavItem
              :item="item"
              v-else
              class="leftPadding"
            />
            <!---End Single Item-->
          </template>
        </v-list>
      </perfect-scrollbar>
    </div>
  </v-navigation-drawer>
  <!------Header-------->
  <v-app-bar elevation="0" height="70" class="top-header">
    <div class="d-flex align-center justify-space-between w-100">
      <div>
        <v-btn
          class="hidden-lg-and-up ms-md-3 ms-sm-5 ms-3 text-muted"
          @click="sDrawer = !sDrawer"
          icon
          variant="flat"
          size="small"
        >
          <Menu2Icon size="20" stroke-width="1.5" />
        </v-btn>
      </div>
      <div>
        <!-- User Profile -->
        <LayoutFullVerticalHeaderProfileDD />
      </div>
    </div>
  </v-app-bar>
</template>
