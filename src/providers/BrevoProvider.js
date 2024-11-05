const brevo = require('@getbrevo/brevo');
import { env } from '~/config/environment';
let apiInstance = new brevo.TransactionalEmailsApi();
let apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = env.BREVO_API_KEY;

const sendEmail = async (toEmail, custumSubject, htmlContent) => {
  // khỏi tạo sendSmtpEmail
  let sendSmtpEmail = new brevo.SendSmtpEmail();
  //   Tài khoản gửi mail là tài khoản tạo trên brevo
  sendSmtpEmail.sender = {
    email: env.ADMIN_EMAIL_ADDRESS,
    name: env.ADMIN_EMAIL_NAME,
  };

  //   những tài khoản nhận email
  // 'to' phải là 1 array để sau chúng ta có thể tùy biến  gửi 1 email tới nhiều user
  sendSmtpEmail.to = [{ email: toEmail }];

  // tiêu đề
  sendSmtpEmail.subject = custumSubject;
  // nội dung
  sendSmtpEmail.htmlContent = htmlContent;

  // Gọi hành động gửi mail
  return apiInstance.sendTransacEmail(sendSmtpEmail); // trả về promise
};

export const BrevoProvider = {
  sendEmail,
};
