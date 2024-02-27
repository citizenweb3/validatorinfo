import {
  ViewGridIcon,
  CursorClickIcon,
  DocumentTextIcon,
  StarIcon,
  HomeIcon,
  ViewBoardsIcon,
  BellIcon,
  LocationMarkerIcon,
  UserIcon,
  ColorSwatchIcon
} from '@heroicons/vue/outline'

import {
  CreditCardIcon,
} from '@heroicons/vue/solid'

const Login = () => import('modules/auth/views/login.vue')
const Register = () => import('modules/auth/views/register.vue')
const ForgotPassword = () => import('modules/auth/views/forgot-password.vue')
const NotFound = () => import('modules/pages/views/404.vue')

const ValidatorInfo = () => import('modules/validators/views/ValidatorInfo.vue')
const ValidatorsList = () => import('modules/validators/components/ValidatorsList.vue')
const ValidatorProfilePage = () => import('modules/validatorProfile/index.vue')

const NetworksList = () => import('modules/networks/views/NetworksList.vue')
const NetworkProfile = () => import('modules/network/index.vue')

const Table = () => import('modules/table/views/index.vue')
const Grid = () => import('modules/grid/views/index.vue')
const Notification = () => import('modules/notification/views/index.vue')
const Button = () => import('modules/buttons/views/index.vue')
const Tags = () => import('modules/tags/views/index.vue')
const Typography = () => import('modules/typography/views/index.vue')
const Card = () => import('modules/cards/views/index.vue')
const Icons = () => import('modules/icons/views/index.vue')
const Profile = () => import('modules/profile/views/index.vue')
const Map = () => import('modules/map/views/index.vue')

const ComponentLayout = () => import('components/ComponentLayout/index.vue')

const routes = [
  // {
  //   path: '/',
  //   component: Validators,
  //   name: 'Validators',
  //   meta: {
  //     title: 'Validators',
  //     icon: HomeIcon,
  //     color: 'text-indigo-410',
  //     requiresAuth: false,
  //     parentPath: 'Validators'
  //   }
  // },
  {
    path: '/',
    component: ValidatorInfo,
    name: 'ValidatorInfo',
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/validators',
    component: ValidatorsList,
    name: 'Validators',
    meta: {
      icon: HomeIcon,
      title: 'Validators',
      parentPath: 'Validators',
      color: 'text-indigo-410',
      requiresAuth: false
    }
  },
  {
    path: '/validators/:id?',
    name: 'ValidatorProfilePage',
    component: ValidatorProfilePage,
    meta: {
      requiresAuth: false,
      parentPath: 'Validators',
    },
  },
  {
    path: '/networks',
    component: NetworksList,
    name: 'NetworksList',
    meta: {
      title: 'Networks',
      icon: HomeIcon,
      color: 'text-indigo-410',
      requiresAuth: false,
      parentPath: 'Networks',
    },
  },
  {
    path: '/networks/:id',
    name: 'NetworkProfile',
    component: NetworkProfile,
    meta: {
      requiresAuth: false,
      parentPath: 'Networks',
    },
  },
  {
    name: "Metrics",
    path: '/metrics',
    component: ComponentLayout,
    meta: {
      title: 'Metrics',
      icon: ColorSwatchIcon,
      color: 'text-info',
    }
  },
  {
    path: '/staking-calculator',
    name: 'StakingCalculator',
    component: Button,
    meta: {
      title: 'Staking calculator',
      icon: CursorClickIcon,
      color: 'text-danger-50',
      requiresAuth: true,
      subOffset: true,
    },
  },
  {
    path: '/library',
    component: Profile,
    name: 'Library',
    meta: {
      title: 'Library',
      icon: UserIcon,
      color: 'text-success-50',
      isDarkBackground: true,
      isFullWidthLayout: true,
      requiresAuth: true,
      parentPath: 'Library'
    },
  },
  {

    path: '/about-us',
    component: ValidatorsList,
    name: 'AboutUs',
    meta: {
      title: 'About us',
      icon: UserIcon,
      requiresAuth: false,
    },
  },
  {

    path: '/login',
    component: Login,
    name: 'login',
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound,
    name: 'NotFound',
    meta: {
      requiresAuth: false,
    },
  },
]

export default routes
