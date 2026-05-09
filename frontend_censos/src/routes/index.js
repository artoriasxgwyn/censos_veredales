import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

// Layouts
const MainLayout = () => import('@/components/MainLayout.vue')

// Auth views
const LoginView = () => import('@/views/auth/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const PublicRegisterView = () => import('@/views/auth/PublicRegisterView.vue')
const ForgotPasswordView = () => import('@/views/auth/ForgotPasswordView.vue')
const ResetPasswordView = () => import('@/views/auth/ResetPasswordView.vue')
const ResidentRegisterView = () => import('@/views/auth/ResidentRegisterView.vue')

// Dashboard views
const AdminDashboardView = () => import('@/views/dashboard/AdminDashboardView.vue')
const ResidentDashboardView = () => import('@/views/dashboard/ResidentDashboardView.vue')
const CensistaDashboardView = () => import('@/views/dashboard/CensistaDashboardView.vue')

// Community views
const CommunityListView = () => import('@/views/communities/CommunityListView.vue')
const CommunityDetailView = () => import('@/views/communities/CommunityDetailView.vue')
const CommunityCreateView = () => import('@/views/communities/CommunityCreateView.vue')
const CommunityEditView = () => import('@/views/communities/CommunityEditView.vue')
const MyCommunityView = () => import('@/views/communities/MyCommunityView.vue')

// Dwelling views
const DwellingListView = () => import('@/views/dwellings/DwellingListView.vue')
const DwellingDetailView = () => import('@/views/dwellings/DwellingDetailView.vue')
const DwellingCreateView = () => import('@/views/dwellings/DwellingCreateView.vue')
const DwellingEditView = () => import('@/views/dwellings/DwellingEditView.vue')
const MyDwellingView = () => import('@/views/dwellings/MyDwellingView.vue')

// Resident views
const ResidentListView = () => import('@/views/residents/ResidentListView.vue')
const ResidentDetailView = () => import('@/views/residents/ResidentDetailView.vue')
const ResidentCreateView = () => import('@/views/residents/ResidentCreateView.vue')
const ResidentEditView = () => import('@/views/residents/ResidentEditView.vue')

// Letter views
const LetterListView = () => import('@/views/letters/LetterListView.vue')
const MyLettersView = () => import('@/views/letters/MyLettersView.vue')
const LetterRequestView = () => import('@/views/letters/LetterRequestView.vue')
const LetterDetailView = () => import('@/views/letters/LetterDetailView.vue')
const LetterVerifyView = () => import('@/views/letters/LetterVerifyView.vue')

// Announcement views
const AnnouncementListView = () => import('@/views/announcements/AnnouncementListView.vue')
const AnnouncementDetailView = () => import('@/views/announcements/AnnouncementDetailView.vue')
const AnnouncementCreateView = () => import('@/views/announcements/AnnouncementCreateView.vue')
const AnnouncementEditView = () => import('@/views/announcements/AnnouncementEditView.vue')

// User views
const UserListView = () => import('@/views/users/UserListView.vue')
const UserDetailView = () => import('@/views/users/UserDetailView.vue')
const UserProfileView = () => import('@/views/users/UserProfileView.vue')

// President views
const ApprovalsView = () => import('@/views/president/ApprovalsView.vue')
const RoleManagementView = () => import('@/views/president/RoleManagementView.vue')
const AuditLogsView = () => import('@/views/president/AuditLogsView.vue')
const QRScannerView = () => import('@/views/president/QRScannerView.vue')

// Public verification page
const LetterVerifyPublicView = () => import('@/views/letters/LetterVerifyPublicView.vue')

const adminRoles = ['president', 'tesorero', 'secretario']
const residentRoles = ['residente']
const censistaRoles = ['censista']

const routes = [
  // Public routes
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/public-register',
    name: 'PublicRegister',
    component: PublicRegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register-resident',
    name: 'ResidentRegister',
    component: ResidentRegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: ForgotPasswordView,
    meta: { requiresGuest: true }
  },
  {
    path: '/reset-password/:token?',
    name: 'ResetPassword',
    component: ResetPasswordView,
    meta: { requiresGuest: true }
  },
  {
    path: '/verify-letter/:qrCodigo',
    name: 'LetterVerifyPublic',
    meta: { requiresAuth: false }
  },

  // Protected routes with MainLayout - Admin (accesible por permisos)
  {
    path: '/admin',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: AdminDashboardView,
        meta: { requiresPermission: { module: 'dashboard', action: 'access' } }
      },
      // Communities
      {
        path: 'communities',
        name: 'CommunityList',
        component: CommunityListView,
        meta: { requiresPermission: { module: 'community', action: 'read' } }
      },
      {
        path: 'communities/:id',
        name: 'CommunityDetail',
        component: CommunityDetailView,
        meta: { requiresPermission: { module: 'community', action: 'read' } }
      },
      {
        path: 'communities/create',
        name: 'CommunityCreate',
        component: CommunityCreateView,
        meta: { requiresPermission: { module: 'community', action: 'create' } }
      },
      {
        path: 'communities/:id/edit',
        name: 'CommunityEdit',
        component: CommunityEditView,
        meta: { requiresPermission: { module: 'community', action: 'update' } }
      },
      {
        path: 'my-community',
        name: 'MyCommunity',
        component: MyCommunityView,
        meta: { requiresPermission: { module: 'community', action: 'read' } }
      },
      // Dwellings
      {
        path: 'dwellings',
        name: 'DwellingList',
        component: DwellingListView,
        meta: { requiresPermission: { module: 'dwelling', action: 'read' } }
      },
      {
        path: 'dwellings/:id',
        name: 'DwellingDetail',
        component: DwellingDetailView,
        meta: { requiresPermission: { module: 'dwelling', action: 'read' } }
      },
      {
        path: 'dwellings/create',
        name: 'DwellingCreate',
        component: DwellingCreateView,
        meta: { requiresPermission: { module: 'dwelling', action: 'create' } }
      },
      {
        path: 'dwellings/:id/edit',
        name: 'DwellingEdit',
        component: DwellingEditView,
        meta: { requiresPermission: { module: 'dwelling', action: 'update' } }
      },
      // Residents
      {
        path: 'residents',
        name: 'ResidentList',
        component: ResidentListView,
        meta: { requiresPermission: { module: 'resident', action: 'read' } }
      },
      {
        path: 'residents/:id',
        name: 'ResidentDetail',
        component: ResidentDetailView,
        meta: { requiresPermission: { module: 'resident', action: 'read' } }
      },
      {
        path: 'residents/create',
        name: 'ResidentCreate',
        component: ResidentCreateView,
        meta: { requiresPermission: { module: 'resident', action: 'create' } }
      },
      {
        path: 'residents/:id/edit',
        name: 'ResidentEdit',
        component: ResidentEditView,
        meta: { requiresPermission: { module: 'resident', action: 'update' } }
      },
      // Letters
      {
        path: 'letters',
        name: 'LetterList',
        component: LetterListView,
        meta: { requiresPermission: { module: 'letter', action: 'read' } }
      },
      {
        path: 'letters/:id',
        name: 'LetterDetail',
        component: LetterDetailView,
        meta: { requiresPermission: { module: 'letter', action: 'read' } }
      },
      {
        path: 'verify-letter/:qrCode',
        name: 'LetterVerify',
        component: LetterVerifyView,
        meta: { requiresPermission: { module: 'letter', action: 'verifyQr' } }
      },
      // Announcements
      {
        path: 'announcements',
        name: 'AnnouncementList',
        component: AnnouncementListView,
        meta: { requiresPermission: { module: 'announcement', action: 'read' } }
      },
      {
        path: 'announcements/create',
        name: 'AnnouncementCreate',
        component: AnnouncementCreateView,
        meta: { requiresPermission: { module: 'announcement', action: 'create' } }
      },
      {
        path: 'announcements/:id',
        name: 'AnnouncementDetail',
        component: AnnouncementDetailView,
        meta: { requiresPermission: { module: 'announcement', action: 'read' } }
      },
      {
        path: 'announcements/:id/edit',
        name: 'AnnouncementEdit',
        component: AnnouncementEditView,
        meta: { requiresPermission: { module: 'announcement', action: 'update' } }
      },
      // Users
      {
        path: 'users',
        name: 'UserList',
        component: UserListView,
        meta: { requiresPermission: { module: 'user', action: 'read' } }
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: UserDetailView,
        meta: { requiresPermission: { module: 'user', action: 'read' } }
      },
      // My Dwelling
      {
        path: 'my-dwelling',
        name: 'MyDwellingAdmin',
        component: MyDwellingView,
        meta: { requiresPermission: { module: 'dwelling', action: 'read' } }
      }
    ]
  },
  // Profile route - accessible to ALL authenticated users
  {
    path: '/profile',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'UserProfileUniversal',
        component: UserProfileView
      }
    ]
  },

  // Rutas de administración (accesible por roles con permisos)
  {
    path: '/president',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'PresidentDashboard',
        component: AdminDashboardView,
        meta: { requiresPermission: { module: 'dashboard', action: 'access' } }
      },
      {
        path: 'approvals',
        name: 'PresidentApprovals',
        component: ApprovalsView,
        meta: { requiresPermission: { module: 'resident', action: 'update' } }
      },
      {
        path: 'roles',
        name: 'PresidentRoleManagement',
        component: RoleManagementView,
        meta: { requiresPermission: { module: 'role', action: 'read' } }
      },
      {
        path: 'audit-logs',
        name: 'PresidentAuditLogs',
        component: AuditLogsView,
        meta: { requiresPermission: { module: 'dashboard', action: 'access' } }
      },
      {
        path: 'qr-scanner',
        name: 'PresidentQRScanner',
        component: QRScannerView,
        meta: { requiresPermission: { module: 'letter', action: 'verifyQr' } }
      }
    ]
  },
  // Protected routes with MainLayout - Resident (accesible por permisos)
  {
    path: '/resident',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'ResidentDashboard',
        component: ResidentDashboardView,
        meta: { requiresPermission: { module: 'dashboard', action: 'access' } }
      },
      // My Letters
      {
        path: 'letters',
        name: 'MyLetters',
        component: MyLettersView,
        meta: { requiresPermission: { module: 'letter', action: 'read' } }
      },
      {
        path: 'letters/request',
        name: 'LetterRequest',
        component: LetterRequestView,
        meta: { requiresPermission: { module: 'letter', action: 'generateNormal' } }
      },
      {
        path: 'my-dwelling',
        name: 'MyDwelling',
        component: MyDwellingView,
        meta: { requiresPermission: { module: 'dwelling', action: 'read' } }
      },
      {
        path: 'letters/:id',
        name: 'ResidentLetterDetail',
        component: LetterDetailView,
        meta: { requiresPermission: { module: 'letter', action: 'read' } }
      },
      // Announcements
      {
        path: 'announcements',
        name: 'ResidentAnnouncementList',
        component: AnnouncementListView,
        meta: { requiresPermission: { module: 'announcement', action: 'read' } }
      },
      {
        path: 'announcements/:id',
        name: 'ResidentAnnouncementDetail',
        component: AnnouncementDetailView,
        meta: { requiresPermission: { module: 'announcement', action: 'read' } }
      },
      // Profile
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfileView
      },
      // QR Scanner
      {
        path: 'qr-scanner',
        name: 'ResidentQRScanner',
        component: QRScannerView,
        meta: { requiresPermission: { module: 'letter', action: 'verifyQr' } }
      }
    ]
  },
  // Protected routes with MainLayout - Censista (accesible por permisos)
  {
    path: '/censista',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'CensistaDashboard',
        component: CensistaDashboardView,
        meta: { requiresPermission: { module: 'dashboard', action: 'access' } }
      },
      {
        path: 'dwellings/new',
        name: 'CensistaDwellingCreate',
        component: DwellingCreateView,
        meta: { requiresPermission: { module: 'dwelling', action: 'create' } }
      },
      {
        path: 'residents/new',
        name: 'CensistaResidentCreate',
        component: ResidentCreateView,
        meta: { requiresPermission: { module: 'resident', action: 'create' } }
      },
      {
        path: 'qr-scanner',
        name: 'CensistaQRScanner',
        component: QRScannerView,
        meta: { requiresPermission: { module: 'letter', action: 'verifyQr' } }
      }
    ]
  },
  // 404 - Must be last
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from) => {
  const authStore = useAuthStore()

  console.log('[Router Guard] START - to:', to.fullPath, 'from:', from.fullPath)

  try {
    // Rutas públicas - siempre permitir
    if (!to.meta.requiresAuth) {
      console.log('[Router Guard] Ruta pública, permitiendo')
      return true
    }

    // Verificar token en localStorage (fuente de verdad)
    const token = localStorage.getItem('access_token')

    // No token - redirect a login
    if (!token) {
      console.log('[Router Guard] No token, redirect a login')
      return { name: 'Login' }
    }

    // Cargar usuario si no existe
    if (!authStore.user) {
      console.log('[Router Guard] Cargando usuario desde fetchUser...')
      const user = await authStore.fetchUser()
      if (!user) {
        // Token inválido - limpiar y redirect
        console.log('[Router Guard] Usuario inválido, logout')
        authStore.logout()
        return { name: 'Login', replace: true }
      }
    }

    // Obtener rol del usuario
    const userRole = authStore.userRole
    console.log('[Router Guard] userRole:', userRole)
    console.log('[Router Guard] authStore.user:', authStore.user?.fullName)
    console.log('[Router Guard] to.path:', to.path)
    console.log('[Router Guard] to.meta.roles:', to.meta.roles)

    // Cargar permisos si no están cargados (excepto presidente)
    // O si la ruta requiere permisos y los actuales podrían estar desactualizados
    if (userRole !== 'president' && !authStore.isFetchingPermissions) {
      if (!authStore.permissionsLoaded || !authStore.permissionsLoadFailed) {
        console.log('[Router Guard] Cargando permisos por primera vez...')
        await authStore.fetchPermissions()
      } else if (to.meta.requiresPermission) {
        // Si ya están cargados pero la ruta requiere permisos, verificar
        const { module, action } = to.meta.requiresPermission
        if (!authStore.hasPermission(module, action)) {
          console.log('[Router Guard] Permiso no concedido, recargando permisos forzado...')
          // Forzar recarga para obtener permisos actualizados
          await authStore.fetchPermissions(true)
        }
      }
    }

    // Si es ruta de guest y ya está logueado, redirect a su dashboard
    if (to.meta.requiresGuest) {
      console.log('[Router Guard] Es ruta guest, usuario ya logueado')
      if (userRole === 'president') return { name: 'PresidentDashboard', replace: true }
      if (userRole === 'tesorero' || userRole === 'secretario') return { name: 'AdminDashboard', replace: true }
      if (userRole === 'censista') return { name: 'CensistaDashboard', replace: true }
      if (userRole === 'residente') return { name: 'ResidentDashboard', replace: true }
      return { name: 'Login', replace: true }
    }

    // Verificar rol si la ruta lo requiere
    if (to.meta.roles && !to.meta.roles.includes(userRole)) {
      console.log('[Router Guard] Rol no permitido, redirect')
      if (userRole === 'president') return { name: 'PresidentDashboard', replace: true }
      if (userRole === 'tesorero' || userRole === 'secretario') return { name: 'AdminDashboard', replace: true }
      if (userRole === 'censista') return { name: 'CensistaDashboard', replace: true }
      if (userRole === 'residente') return { name: 'ResidentDashboard', replace: true }
      return { name: 'Login', replace: true }
    }

    // Verificar permisos si la ruta lo requiere
    if (to.meta.requiresPermission && userRole !== 'president') {
      const { module, action } = to.meta.requiresPermission
      if (!authStore.hasPermission(module, action)) {
        console.log('[Router Guard] Sin permisos, redirect')
        if (userRole === 'tesorero' || userRole === 'secretario') return { name: 'AdminDashboard', replace: true }
        if (userRole === 'censista') return { name: 'CensistaDashboard', replace: true }
        if (userRole === 'residente') return { name: 'ResidentDashboard', replace: true }
        return { name: 'Login', replace: true }
      }
    }

    console.log('[Router Guard] Todo OK, permitiendo navegación')
    return true
  } catch (error) {
    console.error('[Router Guard] ERROR:', error)
    // Error crítico - limpiar auth y redirect
    authStore.logout()
    return { name: 'Login', replace: true }
  }
})

// AfterEach para debug
router.afterEach((to, from, failure) => {
  console.log('[Router AfterEach] to:', to.fullPath, 'from:', from.fullPath, 'failure:', failure)
})
