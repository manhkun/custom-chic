const selectors = {
  sidebarCurrentClass: '.js-sidebar-current',
  sidebarCurrentTextClass: '.js-sidebar-current-text',
  sidebarNavClass: '.js-sidebar-nav',
  sidebarItemClass: '.js-sidebar-item',
  sidebarItemActiveClass: '.js-sidebar-item.active',
  closeNav: '.account-sidebar__close-mobile',
  stickySidebar: '.js-sidebar-sticky'
}

class AccountSidebar extends HTMLElement {
  constructor() {
    super()

    this.navEl = this.querySelector(selectors.sidebarNavClass)
    this.currentEl = this.querySelector(selectors.sidebarCurrentClass)
    this.currentTextEl = this.querySelector(selectors.sidebarCurrentTextClass)
    this.currentTitleEl = this.querySelector(selectors.sidebarMobileTitleClass)
    this.itemActiveEl = this.querySelector(selectors.sidebarItemActiveClass)
    this.closeNav = this.querySelector(selectors.closeNav)
    this.stickySidebar = document.querySelector(selectors.stickySidebar)

    if (this.currentEl && this.navEl) {
      this.setEvents()
      this.setCurrentItem()
    }

    this.closeNav.addEventListener('click', () => {
        this.navEl.classList.remove('active')
        this.currentEl.classList.remove('hidden')
    })

    this.lastScroll = 0
    window.addEventListener('scroll', () => {
      const st = window.pageYOffset
      if (st < this.lastScroll) {
        this.stickySidebar.classList.remove('sidebar-sticky-hidden')
      } else {
        this.stickySidebar.classList.add('sidebar-sticky-hidden')
      }
      this.lastScroll = st <= 0 ? 0 : st
    })
  }

  setEvents() {
    this.currentEl.addEventListener('click', 
      () => {
        this.navEl.classList.add('active')
        this.currentEl.classList.add('hidden')
      },
    )
  }

  setCurrentItem() {
    this.currentTextEl.innerHTML = this.itemActiveEl.innerHTML
  }
}

if (!customElements.get('account-sidebar')) {
  customElements.define('account-sidebar', AccountSidebar)
}
