import 'assets/css/index.scss'
import { App } from 'vue'
import { useElementPlus } from './element-plus'
import Main from './Main/index.vue'
import Sidebar from './Sidebar/index.vue'
import Search from './SearchBar/SearchContainer.vue'
import AuthNavigation from './Navigation/AuthenticationNav.vue'
import Footer from './Footer/index.vue'
import BreadCrumb from './BreadCrumb/index.vue'
import SearchBar from './SearchBar/index.vue'
import Pagination from './Pagination/index.vue'
import Header from './Header/index.vue'
import CentralLogo from './CentralLogo/index.vue'
import Dropdown from 'components/Dropdown/index.vue'
import PopoverMenu from 'components/PopOverMenu/index.vue'
import MenuUserAccount from 'components/MenuUserAccount/index.vue'
import Button from 'components/Button/index.vue'
import SubHeader from 'components/SubHeader/index.vue'
export default {
  install: (app: App) => {
    // Register it globally
    app.component('Main', Main)
    app.component('Sidebar', Sidebar)
    app.component('Search', Search)
    app.component('AuthNavigation', AuthNavigation)
    app.component('Footer', Footer)
    app.component('BreadCrumb', BreadCrumb)
    app.component('SearchBar', SearchBar)
    app.component('Pagination', Pagination)
    app.component('Header', Header)
    app.component('CentralLogo', CentralLogo)
    app.component('Dropdown', Dropdown)
    app.component('PopoverMenu', PopoverMenu)
    app.component('MenuUserAccount', MenuUserAccount)
    app.component('Button', Button)
    app.component('SubHeader', SubHeader)

    // Element Plus
    useElementPlus(app)
  },
}
