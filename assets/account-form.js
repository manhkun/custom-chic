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
  

class AccountFormCustom extends HTMLElement {
  constructor() {
    super()

    this.form = this.querySelector('form')
    this.buttonSubmit = this.querySelector('button')
    this.attachEvent()
  }

  formToObject = (form) => {
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
  
  setCookie = (name, value, days) => {
    let expires = ''
    if (days) {
      const date = new Date()
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
      expires = '; expires=' + date.toUTCString()
    }
    document.cookie = name + '=' + (value || '') + expires + '; path=/'
  }
  

  async handleAccessToken () {
    const formObject = this.formToObject(this.form)
    const data = {
      email: formObject.customer.email,
      password: formObject.customer.password
    }
    const customer = await this.getCustomerAccessToken(data)
    console.log('customer', customer);
    const { customerAccessToken } = customer.data.customerAccessTokenCreate

    if (customerAccessToken) {
      this.setCookie('customerAccessToken', customerAccessToken.accessToken, 1)
    }
  }

  async getCustomerAccessToken ({ email, password }) {
    const variables = {
      input: {
        email,
        password
      }
    }
    const query = this.getQueryCustomerAccessToken()

    const res = await executeGraphQlQuery({ query, variables })
    const data = await res.json()
    return data
  }

  getQueryCustomerAccessToken () {
    return `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          code
          field
          message
        }
      }
    }`
  }

  attachEvent() {
    this.buttonSubmit.addEventListener('click', (e) => {
      e.preventDefault()
      this.handleAccessToken()
      this.form.submit()
    })
  }
}

customElements.define('account-form', AccountFormCustom)