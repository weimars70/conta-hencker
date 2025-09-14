<template>
  <q-btn-dropdown
    flat
    round
    dense
    :icon="themeIcon"
    class="theme-selector-btn"
    dropdown-icon="arrow_drop_down"
  >
    <q-list>
      <q-item
        v-for="(themeData, themeName) in themes"
        :key="themeName"
        clickable
        v-close-popup
        @click="setTheme(themeName)"
        :active="currentTheme === themeName"
        active-class="bg-primary text-white"
      >
        <q-item-section avatar>
          <q-icon :name="getThemeIcon(themeName)" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ capitalize(themeName) }}</q-item-label>
        </q-item-section>
      </q-item>

      <q-separator />

      <q-item
        clickable
        v-close-popup
        @click="setTheme('system')"
        :active="currentTheme === 'system'"
        active-class="bg-primary text-white"
      >
        <q-item-section avatar>
          <q-icon name="brightness_auto" />
        </q-item-section>
        <q-item-section>
          <q-item-label>Sistema</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-btn-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from '../../composables/useTheme';

const { theme: currentTheme, themes, setTheme } = useTheme();

const themeIcon = computed(() => {
  if (currentTheme.value === 'dark') return 'dark_mode';
  if (currentTheme.value === 'light') return 'light_mode';
  return 'brightness_auto';
});

const getThemeIcon = (themeName: string) => {
  switch (themeName) {
    case 'light': return 'light_mode';
    case 'dark': return 'dark_mode';
    case 'ocean': return 'waves';
    case 'sunset': return 'wb_sunny';
    default: return 'palette';
  }
};

const capitalize = (s: string) => {
  if (typeof s !== 'string') return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
};
</script>

<style lang="scss" scoped>
.theme-selector-btn {
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-left: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.95);
    background: rgba(255, 255, 255, 0.3);
  }

  .q-icon {
    color: white;
    font-size: 20px;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  }
}
</style>