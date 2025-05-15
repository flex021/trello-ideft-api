const SibApiV3SDk = require('@getbrevo/brevo')

import { env } from '~/config/environment'


let apiInstance = new SibApiV3SDk.TransactionalEmailsApi()
let apiKey = apiInstance.authentications['apiKey']
apiKey.apiKey = env.BREVO_API_KEY

const sendEmail = async (recipientEmail, customSubject, htmlContent) => {
  let sendSmtEmail = new SibApiV3SDk.SendSmtpEmail()

  sendSmtEmail.sender = { email: env.ADMIN_EMAIL_ADDRESS, name: env.ADMIN_EMAIL_NAME }

  sendSmtEmail.to = [{ email: recipientEmail }]

  sendSmtEmail.subject = customSubject

  sendSmtEmail.htmlContent = htmlContent

  return apiInstance.sendTransacEmail(sendSmtEmail)
}

export const BrevoProvider = {
  sendEmail
}