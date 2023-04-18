class AccountInformation extends HTMLElement {
  constructor() {
    super()

    this.showResetPass = this.querySelector('#reset_password_checkbox')
    this.resetPasswordForm = this.querySelector('.reset_password_form')
    this.form = this.querySelector('form')
    this.inputAll = this.form.querySelectorAll('.input')
    this.buttonSubmit = this.form.querySelector('button')

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

    on('click', this.onFormSubmit.bind(this), this.buttonSubmit)
  }

  changeAccountInfo (customerAccessToken, customerData) {
    const variables = {
      customerAccessToken,
      customer: {
        ...customerData.customer,
        acceptsMarketing: this.markettingCheckbox.checked
      }
    }

    const query = this.getQueryCustomerUpdate()

    executeGraphQlQuery({ query, variables })
      .then(res => res.json())
      .then(data => {
        if (data.errors) {
          globalEvents.emit(eventProps.notice.global, {
            type: 'error',
            content: noticeContent.error
          })
        } else {
          globalEvents.emit(eventProps.notice.global, {
            type: 'success',
            content: noticeContent.success
          })
        }
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
    this.changeAccountInfo(accessToken, formObject)
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
