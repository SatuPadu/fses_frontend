import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useAuthStore } from '~/composables/useAuth';
import type { User } from '~/types/global';

export const usePgamStore = defineStore(
  'pgam',
  () => {
    const pgamUser = ref<User | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);

    const getHeaders = () => {
      const authStore = useAuthStore();
      const token = authStore.token;
      if (!token) {
        throw new Error('Authentication token is not available.');
      }
      return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    };

    const fetchPgamUser = async () => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch(`${import.meta.env.API_BASE_URL}/roles/pgam/users`, {
          method: 'GET',
          headers: getHeaders(),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error || 'Failed to fetch PGAM user');
        }

        pgamUser.value = data.data || null;
      } catch (e: any) {
        error.value = e.message || 'Failed to fetch PGAM user';
        // If the user is not found (404) or there's no PGAM, we can treat it as null
        if (e.response && e.response.status === 404) {
          pgamUser.value = null;
        } else {
          console.error(e);
        }
      } finally {
        loading.value = false;
      }
    };

    const assignPgam = async (userId: number) => {
      loading.value = true;
      error.value = null;
      try {
        const response = await fetch(`${import.meta.env.API_BASE_URL}/roles/assign-pgam?user_id=${userId}`, {
          method: 'POST',
          headers: getHeaders(),
        });

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error || 'Failed to assign PGAM role');
        }

        // After assigning, refetch the PGAM user to update the state
        await fetchPgamUser();

      } catch (e: any) {
        error.value = e.message || 'Failed to assign PGAM role';
        throw e;
      } finally {
        loading.value = false;
      }
    };

    return {
      pgamUser,
      loading,
      error,
      fetchPgamUser,
      assignPgam,
    };
  },
  {
    persist: true,
  }
); 