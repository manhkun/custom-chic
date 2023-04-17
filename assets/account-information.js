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
  }
}

if (!customElements.get('account-information')) {
  customElements.define('account-information', AccountInformation)
}
