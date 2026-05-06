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

  // Protected routes with MainLayout - Admin
  {
    path: '/admin',
    component: MainLayout,
    meta: { requiresAuth: true, roles: adminRoles },
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
        meta: { requiresPermission: { module: 'letter', action: 'read' } }
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

  // President-only routes (tambien accesible por roles con permisos)
  {
    path: '/president',
    component: MainLayout,
    meta: { requiresAuth: true, roles: ['president'] },
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
        meta: { requiresPermission: { module: 'user', action: 'manageRoles' } }
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
        meta: { requiresPermission: { module: 'letter', action: 'qrScan' } }
      }
    ]
  },
  // Protected routes with MainLayout - Resident
  {
    path: '/resident',
    component: MainLayout,
    meta: { requiresAuth: true, roles: residentRoles },
    children: [
      {
        path: 'dashboard',
        name: 'ResidentDashboard',
        component: ResidentDashboardView
      },
      // My Letters
      {
        path: 'letters',
        name: 'MyLetters',
        component: MyLettersView
      },
      {
        path: 'letters/request',
        name: 'LetterRequest',
        component: LetterRequestView
      },
      {
        path: 'my-dwelling',
        name: 'MyDwelling',
        component: MyDwellingView
      },
      {
        path: 'letters/:id',
        name: 'ResidentLetterDetail',
        component: LetterDetailView
      },
      // Announcements
      {
        path: 'announcements',
        name: 'ResidentAnnouncementList',
        component: AnnouncementListView
      },
      {
        path: 'announcements/:id',
        name: 'ResidentAnnouncementDetail',
        component: AnnouncementDetailView
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
        component: QRScannerView
      }
    ]
  },
  // Protected routes with MainLayout - Censista
  {
    path: '/censista',
    component: MainLayout,
    meta: { requiresAuth: true, roles: censistaRoles },
    children: [
      {
        path: 'dashboard',
        name: 'CensistaDashboard',
        component: CensistaDashboardView
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
        meta: { requiresPermission: { module: 'letter', action: 'qrScan' } }
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

  // Check if user is authenticated
  const hasToken = !!authStore.accessToken

  // If no token, allow only guest routes
  if (!hasToken) {
    if (to.meta.requiresAuth) {
      return '/login'
    }
    return
  }

  // User has token - ensure user data is loaded
  if (!authStore.user) {
    const user = await authStore.fetchUser()
    // If fetch failed, redirect to login
    if (!user) {
      return '/login'
    }
  }

  // Asegurar que los permisos estén cargados (excepto para presidente)
  if (!authStore.permissions && authStore.userRole !== 'president') {
    await authStore.fetchPermissions()
  }

  const userRole = authStore.userRole

  // If route requires guest but user is authenticated
  // Allow reset-password even if authenticated (user might want to change password)
  if (to.meta.requiresGuest && to.name !== 'ResetPassword') {
    if (userRole === 'president') {
      return '/president/dashboard'
    } else if (userRole === 'tesorero' || userRole === 'secretario') {
      return '/admin/dashboard'
    } else if (userRole === 'censista') {
      return '/censista/dashboard'
    } else {
      return '/resident/dashboard'
    }
  }

  // Check role restrictions for protected routes
  if (to.meta.roles && !to.meta.roles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === 'president') {
      return '/president/dashboard'
    } else if (userRole === 'tesorero' || userRole === 'secretario') {
      return '/admin/dashboard'
    } else if (userRole === 'censista') {
      return '/censista/dashboard'
    } else {
      return '/resident/dashboard'
    }
  }

  // Check permissions if route requires specific permission
  if (to.meta.requiresPermission) {
    const { module, action } = to.meta.requiresPermission

    // Presidente tiene todos los permisos
    if (userRole !== 'president') {
      // Verificar si el usuario tiene el permiso requerido
      const hasPerm = authStore.hasPermission(module, action)
      if (!hasPerm) {
        // Redirigir al dashboard apropiado si no tiene permisos
        if (userRole === 'tesorero' || userRole === 'secretario') {
          return '/admin/dashboard'
        } else if (userRole === 'censista') {
          return '/censista/dashboard'
        } else {
          return '/resident/dashboard'
        }
      }
    }
  }
})
