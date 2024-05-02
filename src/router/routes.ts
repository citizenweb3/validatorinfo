import { CursorClickIcon, HomeIcon, UserIcon, ColorSwatchIcon } from '@heroicons/vue/outline'

const Login = () => import('modules/auth/views/login.vue')
// const Register = () => import('modules/auth/views/register.vue')
// const ForgotPassword = () => import('modules/auth/views/forgot-password.vue')
const NotFound = () => import('modules/pages/views/404.vue')

const ValidatorInfo = () => import('modules/validators/views/ValidatorInfo.vue')
const ShortcutTabs = () => import('modules/shortcutTabs/index.vue')
const ValidatorsList = () => import('modules/validators/components/ValidatorsList.vue')
const ValidatorProfilePage = () => import('modules/validatorProfile/index.vue')

const ValidatorNetworksTable = () =>
  import('modules/validatorProfile/components/ValidatorNetworksTable.vue')
const ValidatorRevenue = () => import('modules/validatorProfile/components/ValidatorRevenue.vue')
const ValidatorMetrics = () => import('modules/validatorProfile/components/ValidatorMetrics.vue')
const ValidatorPublic = () => import('modules/validatorProfile/components/ValidatorPublic.vue')
const ValidatorGovernance = () =>
  import('modules/validatorProfile/components/ValidatorGovernance.vue')

const NetworksList = () => import('modules/networks/views/NetworksList.vue')
const NetworkProfile = () => import('modules/networkProfile/index.vue')

const NetworkDevInfo = () => import('modules/networkProfile/components/NetworkDevInfo.vue')
const NetworkGovernance = () => import('modules/networkProfile/components/NetworkGovernance.vue')
const NetworkInfo = () => import('modules/networkProfile/components/NetworkInfo.vue')
const NetworkLiveliness = () => import('modules/networkProfile/components/NetworkLiveliness.vue')
const NetworkStatistics = () => import('modules/networkProfile/components/NetworkStatistics.vue')

const AboutUs = () => import('modules/aboutUs/index.vue')
const AboutUsGeneral = () => import('modules/aboutUs/components/General.vue')
const AboutUsStaking = () => import('modules/aboutUs/components/Staking.vue')
const AboutUsContacts = () => import('modules/aboutUs/components/Contacts.vue')
const AboutUsPartners = () => import('modules/aboutUs/components/Partners.vue')
const AboutUsPodcast = () => import('modules/aboutUs/components/Podcast.vue')

const ComponentLayout = () => import('components/ComponentLayout/index.vue')

const routes = [
  {
    path: '/',
    component: ValidatorInfo,
    name: 'ValidatorInfo',
    meta: {
      requiresAuth: false,
    },
  },
  {
    path: '/',
    component: ShortcutTabs,
    name: 'ShortcutTabs',
    meta: {
      requiresAuth: false,
    },
    children: [
      {
        name: 'ValidatorsList',
        path: 'validators',
        meta: {
          icon: HomeIcon,
          title: 'Validators'
        },
        component: ValidatorsList,
      },
      {
        name: 'NetworksList',
        path: 'networks',
        meta: {
          icon: HomeIcon,
          title: 'Networks'
        },
        component: NetworksList,
      },
      {
        name: 'Metrics',
        path: 'metrics',
        meta: {
          icon: HomeIcon,
          title: 'Metrics'
        },
        component: NotFound,
      }
    ]
  },
  {
    path: '/validators/:id',
    name: 'ValidatorProfilePage',
    component: ValidatorProfilePage,
    redirect: (to: any) => { // default to networks
      return { path: 'networks', params: to.params.id }
    },
    meta: {
      requiresAuth: false,
      parentPath: {
        title: 'Validators',
        href: '/validators'
      },
      title: ':id',
    },
    children: [
      {
        name: 'ValidatorNetworkProfile',
        path: ':validatorNetworkId',
        meta: {
          title: ':validatorNetworkId'
        },
        component: NotFound,
      },
      {
        name: 'ValidatorNetworksTable',
        path: 'networks',
        component: ValidatorNetworksTable,
      },
      {
        name: 'ValidatorRevenue',
        path: 'revenue',
        component: ValidatorRevenue,
      },
      {
        name: 'ValidatorMetrics',
        path: 'metrics',
        component: ValidatorMetrics,
      },
      {
        name: 'ValidatorPublic',
        path: 'public-goods',
        component: ValidatorPublic,
      },
      {
        name: 'ValidatorGovernance',
        path: 'governance',
        component: ValidatorGovernance,
      },
    ],
  },
  {
    path: '/networks/:id',
    name: 'NetworkProfile',
    component: NetworkProfile,
    meta: {
      requiresAuth: false,
      parentPath: {
        title: 'Networks',
        href: '/networks'
      },
      title: ':id',
    },
    redirect: (to: any) => { // default to info
      return { path: 'info', params: to.params.id }
    },
    children: [
      {
        name: 'NetworkInfo',
        path: 'info',
        component: NetworkInfo,
      },
      {
        name: 'NetworkStatistics',
        path: 'stats',
        component: NetworkStatistics,
      },
      {
        name: 'NetworkGovernance',
        path: 'governance',
        component: NetworkGovernance,
      },
      {
        name: 'NetworkDevInfo',
        path: 'developers',
        component: NetworkDevInfo,
      },
      {
        name: 'NetworkLiveliness',
        path: 'liveliness',
        component: NetworkLiveliness,
      },
    ],
  },
  {
    path: '/staking-calculator',
    name: 'StakingCalculator',
    component: ComponentLayout,
    meta: {
      title: 'Staking calculator',
      icon: CursorClickIcon,
      color: 'text-danger-50',
    },
  },
  {
    path: '/library',
    component: ComponentLayout,
    name: 'Library',
    meta: {
      title: 'Library',
      icon: UserIcon,
      color: 'text-success-50',
      isDarkBackground: true,
      isFullWidthLayout: true,
      requiresAuth: true,
      parentPath: 'Library',
    },
  },
  {
    path: '/citizen-web3/info',
    component: AboutUs,
    name: 'AboutUs',
    meta: {
      title: 'About',
      icon: UserIcon,
      requiresAuth: false,
      parentPath: 'AboutUs',
    },
    children: [
      {
        name: 'AboutUsGeneral',
        path: 'info',
        component: AboutUsGeneral,
      },
      {
        name: 'AboutUsStaking',
        path: 'staking',
        component: AboutUsStaking,
      },
      {
        name: 'AboutUsPartners',
        path: 'partners',
        component: AboutUsPartners,
      },
      {
        name: 'AboutUsContacts',
        path: 'contacts',
        component: AboutUsContacts,
      },
      {
        name: 'AboutUsPodcast',
        path: 'podcast',
        component: AboutUsPodcast,
      },
    ],
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
