class OrderList extends HTMLElement {
  constructor () {
    super()

    this.currentPage = 1
    this.buttonLoadmore = this.querySelector('.js-button-loadmore')
    this.orderItems = this.querySelector('.js-order-items')
    this.maxPages = +this.dataset.totalPages
    this.state = {
      isLoading: false
    }

    this.attachEvents()
  }

  attachEvents () {
    if (this.buttonLoadmore) {
      this.buttonLoadmore.addEventListener('click', this.handleLoadmore.bind(this))
    }
  }

  handleLoadmore (e) {
    e.preventDefault()

    this.buttonLoadmore.classList.add('is-loading')
    this.currentPage++
    fetch(window.location.pathname + '?section_id=order-items&page=' + this.currentPage)
      .then(res => res.text())
      .then((text) => {
        const html = new DOMParser().parseFromString(text, 'text/html')

        const orderItems = html.querySelectorAll('.account-order__item')

        orderItems.forEach(item => {
          this.orderItems.innerHTML += item.outerHTML
        })
        this.buttonLoadmore.classList.remove('is-loading')
            
        if (this.currentPage >= this.maxPages) {
          this.buttonLoadmore.style.display = 'none'
          this.buttonLoadmore.removeEventListener('click', this.handleLoadmore.bind(this))
        }
      })
  }
}

if (!customElements.get('order-list')) {
  customElements.define('order-list', OrderList)
}