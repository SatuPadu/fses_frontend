<template>
    <v-row>
      <v-col cols="12">
        <v-row>
          <v-col cols="12" lg="8">
            <SalesOverview />
          </v-col>
          <v-col cols="12" lg="4">
            <div class="mb-6">
              <YearlyBreakup />
            </div>
            <div>
              <MonthlyEarning />
            </div>
          </v-col>
          <v-col cols="12" lg="4">
            <RecentTransaction />
          </v-col>
          <v-col cols="12" lg="8">
            <ProductPerformance />
          </v-col>
          <v-col cols="12">
            <ProductCards />
          </v-col>
        </v-row>
      </v-col>
      <v-col class="text-center mt-2">
        <p class="text-muted">Design and Developed by SatuPadu</p>
      </v-col>
    </v-row>
</template>
  
<script setup lang="ts">
/*Call Components*/
import SalesOverview from '@/components/dashboard/SalesOverview.vue';
import YearlyBreakup from '@/components/dashboard/YearlyBreakup.vue';
import MonthlyEarning from '@/components/dashboard/MonthlyEarnings.vue';
import RecentTransaction from '@/components/dashboard/RecentTransaction.vue';
import ProductPerformance from '@/components/dashboard/ProductPerformance.vue';
import ProductCards from '@/components/dashboard/ProductCards.vue';
</script>
