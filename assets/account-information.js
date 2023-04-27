/**
 * @returns { {
   *    'Content-Type': 'application/json',
   *    Accept: 'application/json',
   *    'X-Shopify-Storefront-Access-Token': string
   * } }
   */
  function getGraphQlHeaders() {
    return {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Shopify-Storefront-Access-Token': globalVar.apis.storefrontAccessToken
    }
  }
  
  /**
   * Returns graphql request with no callback
   * @param { {
   *  query: string
   *  variables?: unknown
   * } } param0
   * @returns { fetch }
   */
  function executeGraphQlQuery({ query, variables }) {
    const url = globalVar.apis.graphQlEndpoint
  
    // remove line breaks and double space for legibility
    const cleanQuery = query.replace(/\n/g, ' ').replace(/ {2}/g, '')
  
    const config = {
      method: 'post',
      headers: getGraphQlHeaders(),
      body: JSON.stringify({
        query: cleanQuery,
        // only add variables if they actually exist
        ...(variables ? { variables } : {})
      })
    }
  
    return fetch(url, config)
  }
  
class AccountInformation extends HTMLElement {
  constructor() {
    super()

    this.form = this.querySelector('form')
    this.inputAll = this.form.querySelectorAll('.input')
    this.buttonSubmit = this.form.querySelector('button')

    this.inputAll.forEach(item => {
      item.addEventListener('input', (e) => {
        let allFilled = true
        const isValid = e.target.reportValidity();
        e.target.setAttribute('aria-invalid', !isValid);
        this.inputAll.forEach(item => {
          if (!item.value) {
            allFilled = false
          }
        })
        this.buttonSubmit.disabled = !allFilled
      })
    })

    this.buttonSubmit && this.buttonSubmit.addEventListener('click', this.onFormSubmit.bind(this))
   }

  getCookie = (name) => {
    const pair = document.cookie.match(new RegExp(name + '=([^;]+)'))
    return pair ? pair[1] : null
  }

  changeAccountInfo (customerAccessToken, customerData) {
    const variables = {
      customerAccessToken,
      customer: {
        ...customerData.customer
      }
    }
    const query = this.getQueryCustomerUpdate()

    this.buttonSubmit.classList.add('is-loading')
    executeGraphQlQuery({ query, variables })
      .then(res => res.json())
      .then(data => {
        if (data.errors || data.data.customerUpdate.userErrors.length > 0) {
          const msg = data.data.customerUpdate.userErrors.map(error => error.message)
          alert(msg.join(" and "))
        } else {
          location.reload();
        }
        this.buttonSubmit.classList.remove('is-loading')
      })
  }

  getQueryCustomerUpdate () {
    return `mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          firstName
          lastName
          email
          phone
        }
        customerAccessToken {
          accessToken
          expiresAt
        }
        userErrors {
          field
          message
        }
      }
    }`
  }

  async onFormSubmit(e) {
    e.preventDefault()
    if (this.form.checkValidity()) {
      const formObject = this.formToObject(this.form)
      const accessToken = this.getCookie('customerAccessToken')
      this.changeAccountInfo(accessToken, formObject)
    }
  }

  formToObject(form)  {
    const formData = new FormData(form)
    const formObject = {}
  
    for (const [key, value] of formData.entries()) {
      const keys = key.split('[').map((k) => k.replace(']', ''))
      let obj = formObject
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i]
        obj[k] = obj[k] || {}
        obj = obj[k]
      }
      const k = keys[keys.length - 1]
      obj[k] = value
    }
  
    return formObject
  }
}

if (!customElements.get('account-information')) {
  customElements.define('account-information', AccountInformation)
}
