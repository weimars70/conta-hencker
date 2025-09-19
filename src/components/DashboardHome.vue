<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const stats = ref([
  {
    title: 'Accesos Configurados',
    value: '89',
    icon: 'security',
    color: 'accent',
    trend: '+5%',
    trendUp: true
  },
  {
    title: 'Reportes Generados',
    value: '456',
    icon: 'assessment',
    color: 'positive',
    trend: '+18%',
    trendUp: true
  }
]);

const recentActivities = ref([
  {
    title: 'Nuevo usuario registrado',
    description: 'Juan Pérez se registró en el sistema',
    time: 'Hace 2 minutos',
    icon: 'person_add',
    color: 'positive'
  },
  {
    title: 'Acceso modificado',
    description: 'Permisos actualizados para Ana Gómez',
    time: 'Hace 1 hora',
    icon: 'edit',
    color: 'warning'
  }
]);

const quickActions = ref([
  {
    title: 'Crear Usuario',
    description: 'Agregar nuevo usuario al sistema',
    icon: 'person_add',
    color: 'primary',
    route: '/usuarios'
  },
  {
    title: 'Configurar Accesos',
    description: 'Gestionar permisos de usuario',
    icon: 'security',
    color: 'accent',
    route: '/accesos'
  }
]);
</script>

<template>
  <q-page class="dashboard-home">
    <!-- Hero Section -->
    <div class="hero-section">
      <div class="hero-content">
        <div class="welcome-text">
          <h1 class="hero-title">
            ¡Bienvenido, {{ authStore.user?.nombre || 'Usuario' }}! 👋
          </h1>
          <p class="hero-subtitle">
            Gestiona tu sistema ERP de manera eficiente y elegante
          </p>
        </div>
        <div class="hero-stats">
          <div class="current-time">
            {{ new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) }}
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-section">
        <h2 class="section-title">Estadísticas del Sistema</h2>
        <div class="stats-grid">
          <q-card
            v-for="stat in stats"
            :key="stat.title"
            class="stat-card"
            :class="`stat-card--${stat.color}`"
          >
            <q-card-section class="stat-card-content">
              <div class="stat-icon">
                <q-icon :name="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-trend" :class="{ 'trend-up': stat.trendUp }">
                  <q-icon :name="stat.trendUp ? 'trending_up' : 'trending_down'" />
                  {{ stat.trend }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="actions-section">
        <h2 class="section-title">Acciones Rápidas</h2>
        <div class="actions-grid">
          <q-card
            v-for="action in quickActions"
            :key="action.title"
            class="action-card"
            clickable
            v-ripple
            @click="$router.push(action.route)"
          >
            <q-card-section class="action-card-content">
              <div class="action-icon" :class="`action-icon--${action.color}`">
                <q-icon :name="action.icon" />
              </div>
              <div class="action-info">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-description">{{ action.description }}</div>
              </div>
              <q-icon name="arrow_forward" class="action-arrow" />
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Recent Activities -->
      <div class="activities-section">
        <h2 class="section-title">Actividad Reciente</h2>
        <q-card class="activities-card">
          <q-list separator>
            <q-item
              v-for="activity in recentActivities"
              :key="activity.title"
              class="activity-item"
            >
              <q-item-section avatar>
                <q-avatar :color="activity.color" text-color="white" size="40px">
                  <q-icon :name="activity.icon" />
                </q-avatar>
              </q-item-section>
              <q-item-section>
                <q-item-label class="activity-title">{{ activity.title }}</q-item-label>
                <q-item-label caption class="activity-description">
                  {{ activity.description }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-item-label caption class="activity-time">
                  {{ activity.time }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style lang="scss" scoped>
.dashboard-home {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%);
  padding: 3rem 2rem;
  color: white;
  margin-bottom: 2rem;
  
  .hero-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    @media (max-width: 768px) {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }
  }
  
  .hero-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    
    @media (max-width: 768px) {
      font-size: 2rem;
    }
  }
  
  .hero-subtitle {
    font-size: 1.2rem;
    opacity: 0.9;
    margin: 0;
    font-weight: 300;
  }
  
  .current-time {
    font-size: 1rem;
    opacity: 0.8;
    text-transform: capitalize;
  }
}

.dashboard-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin: 0 0 1.5rem 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--q-primary);
  }
  
  &--primary::before { background: var(--q-primary); }
  &--secondary::before { background: var(--q-secondary); }
  &--accent::before { background: var(--q-accent); }
  &--positive::before { background: var(--q-positive); }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
}

.stat-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  line-height: 1;
}

.stat-title {
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0.25rem 0;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  
  &.trend-up {
    color: var(--q-positive);
  }
}

.actions-section {
  margin-bottom: 3rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.action-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
}

.action-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  
  &--primary { background: var(--q-primary); }
  &--secondary { background: var(--q-secondary); }
  &--accent { background: var(--q-accent); }
  &--positive { background: var(--q-positive); }
}

.action-info {
  flex: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
}

.action-description {
  font-size: 0.85rem;
  color: #7f8c8d;
}

.action-arrow {
  color: #bdc3c7;
  transition: all 0.3s ease;
}

.action-card:hover .action-arrow {
  color: var(--q-primary);
  transform: translateX(4px);
}

.activities-section {
  margin-bottom: 2rem;
}

.activities-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.activity-item {
  padding: 1rem 1.5rem;
  
  &:hover {
    background: rgba(102, 126, 234, 0.05);
  }
}

.activity-title {
  font-weight: 600;
  color: #2c3e50;
}

.activity-description {
  color: #7f8c8d;
  margin-top: 0.25rem;
}

.activity-time {
  color: #95a5a6;
  font-size: 0.8rem;
}

@media (max-width: 768px) {
  .dashboard-content {
    padding: 0 1rem 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-section {
    padding: 2rem 1rem;
  }
}
</style>