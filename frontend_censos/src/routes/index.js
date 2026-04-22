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

// Community views
const CommunityListView = () => import('@/views/communities/CommunityListView.vue')
const CommunityDetailView = () => import('@/views/communities/CommunityDetailView.vue')
const CommunityCreateView = () => import('@/views/communities/CommunityCreateView.vue')
const CommunityEditView = () => import('@/views/communities/CommunityEditView.vue')

// Dwelling views
const DwellingListView = () => import('@/views/dwellings/DwellingListView.vue')
const DwellingDetailView = () => import('@/views/dwellings/DwellingDetailView.vue')
const DwellingCreateView = () => import('@/views/dwellings/DwellingCreateView.vue')
const DwellingEditView = () => import('@/views/dwellings/DwellingEditView.vue')

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

// Public verification page
const LetterVerifyPublicView = () => import('@/views/letters/LetterVerifyPublicView.vue')

const adminRoles = ['president', 'tesorero', 'secretario']
const residentRoles = ['residente', 'censista']

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
    path: '/reset-password',
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
        component: AdminDashboardView
      },
      // Communities
      {
        path: 'communities',
        name: 'CommunityList',
        component: CommunityListView
      },
      {
        path: 'communities/:id',
        name: 'CommunityDetail',
        component: CommunityDetailView
      },
      {
        path: 'communities/create',
        name: 'CommunityCreate',
        component: CommunityCreateView
      },
      {
        path: 'communities/:id/edit',
        name: 'CommunityEdit',
        component: CommunityEditView
      },
      // Dwellings
      {
        path: 'dwellings',
        name: 'DwellingList',
        component: DwellingListView
      },
      {
        path: 'dwellings/:id',
        name: 'DwellingDetail',
        component: DwellingDetailView
      },
      {
        path: 'dwellings/create',
        name: 'DwellingCreate',
        component: DwellingCreateView
      },
      {
        path: 'dwellings/:id/edit',
        name: 'DwellingEdit',
        component: DwellingEditView
      },
      // Residents
      {
        path: 'residents',
        name: 'ResidentList',
        component: ResidentListView
      },
      {
        path: 'residents/:id',
        name: 'ResidentDetail',
        component: ResidentDetailView
      },
      {
        path: 'residents/create',
        name: 'ResidentCreate',
        component: ResidentCreateView
      },
      {
        path: 'residents/:id/edit',
        name: 'ResidentEdit',
        component: ResidentEditView
      },
      // Letters
      {
        path: 'letters',
        name: 'LetterList',
        component: LetterListView
      },
      {
        path: 'letters/:id',
        name: 'LetterDetail',
        component: LetterDetailView
      },
      {
        path: 'verify-letter/:qrCode',
        name: 'LetterVerify',
        component: LetterVerifyView
      },
      // Announcements
      {
        path: 'announcements',
        name: 'AnnouncementList',
        component: AnnouncementListView
      },
      {
        path: 'announcements/create',
        name: 'AnnouncementCreate',
        component: AnnouncementCreateView
      },
      {
        path: 'announcements/:id',
        name: 'AnnouncementDetail',
        component: AnnouncementDetailView
      },
      {
        path: 'announcements/:id/edit',
        name: 'AnnouncementEdit',
        component: AnnouncementEditView
      },
      // Users
      {
        path: 'users',
        name: 'UserList',
        component: UserListView
      },
      {
        path: 'users/:id',
        name: 'UserDetail',
        component: UserDetailView
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Check if user is authenticated
  const isAuthenticated = !!authStore.accessToken

  // If user is not authenticated and route requires auth
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
    return
  }

  // If user is authenticated and route requires guest
  if (to.meta.requiresGuest && isAuthenticated) {
    // Redirect based on role
    const role = authStore.userRole
    if (role === 'president' || role === 'tesorero' || role === 'secretario') {
      next('/admin/dashboard')
    } else {
      next('/resident/dashboard')
    }
    return
  }

  // Check role restrictions
  if (to.meta.roles && isAuthenticated) {
    const userRole = authStore.userRole
    if (!to.meta.roles.includes(userRole)) {
      // Redirect to appropriate dashboard
      if (userRole === 'president' || userRole === 'tesorero' || userRole === 'secretario') {
        next('/admin/dashboard')
      } else {
        next('/resident/dashboard')
      }
      return
    }
  }

  // Fetch user if not loaded
  if (isAuthenticated && !authStore.user) {
    await authStore.fetchUser()
  }

  next()
})
