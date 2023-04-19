/* global GM_STATE */

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

    this.showResetPass = this.querySelector('#reset_password_checkbox')
    this.resetPasswordForm = this.querySelector('.reset_password_form')
    this.form = this.querySelector('form')
    this.inputAll = this.form.querySelectorAll('.input')
    this.buttonSubmit = this.form.querySelector('button')
    // this.handleAccessToken()

    this.showResetPass.addEventListener('click', () => {
      if (this.showResetPass.checked) {
        this.resetPasswordForm.style.display = 'block';
      } else {
        this.resetPasswordForm.style.display = 'none';
      }
    })

    this.inputAll.forEach(item => {
      item.addEventListener('input', () => {
        let allFilled = true
        this.inputAll.forEach(item => {
          if (item.value === '') {
            allFilled = false
          }
        })
        this.buttonSubmit.disabled = !allFilled
      })
    })

    this.form.addEventListener('submit', this.onFormSubmit.bind(this))
  }

  changeAccountInfo (customerAccessToken, customerData) {
    console.log(customerData)
    const variables = {
      customerAccessToken,
      customer: {
        ...customerData.customer,
        password: customerData.new_password
      }
    }

    const query = this.getQueryCustomerUpdate()

    executeGraphQlQuery({ query, variables })
      .then(res => res.json())
      .then(data => {
        console.log(data)
      })
  }

  getQueryCustomerUpdate () {
    return `mutation customerUpdate($customerAccessToken: String!, $customer: CustomerUpdateInput!) {
      customerUpdate(customerAccessToken: $customerAccessToken, customer: $customer) {
        customer {
          email
          name
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
    const formObject = this.formToObject(this.form)
    // const accessToken = getCookie('customerAccessToken')
    const accessToken = await this.handleAccessToken()
    this.changeAccountInfo(accessToken, formObject)
  }

  async handleAccessToken () {
    const formObject = this.formToObject(this.form)
    const data = {
      email: formObject.customer.email,
      password: formObject.customer.password
    }
    console.log(data)
    const customer = await this.getCustomerAccessToken(data)
    const { customerAccessToken } = customer.data.customerAccessTokenCreate
    return customerAccessToken
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
