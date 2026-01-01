/**
 * SES email utility functions
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION || 'eu-central-1' });

const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@philocom.co';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@philocom.co';

export const sendContactNotification = async (contactData) => {
  const params = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [ADMIN_EMAIL],
    },
    Message: {
      Subject: {
        Data: `New Contact Form Submission from ${contactData.name}`,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
                .field { margin-bottom: 15px; }
                .label { font-weight: bold; color: #555; }
                .value { margin-top: 5px; padding: 10px; background: white; border-left: 3px solid #667eea; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h2>🎉 New Contact Form Submission</h2>
                </div>
                <div class="content">
                  <div class="field">
                    <div class="label">Name:</div>
                    <div class="value">${contactData.name}</div>
                  </div>
                  <div class="field">
                    <div class="label">Email:</div>
                    <div class="value">${contactData.email}</div>
                  </div>
                  ${contactData.phone ? `
                    <div class="field">
                      <div class="label">Phone:</div>
                      <div class="value">${contactData.phone}</div>
                    </div>
                  ` : ''}
                  ${contactData.company ? `
                    <div class="field">
                      <div class="label">Company:</div>
                      <div class="value">${contactData.company}</div>
                    </div>
                  ` : ''}
                  <div class="field">
                    <div class="label">Message:</div>
                    <div class="value">${contactData.message}</div>
                  </div>
                  <div class="field">
                    <div class="label">Submitted At:</div>
                    <div class="value">${new Date(contactData.submittedAt).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendNewsletterWelcome = async (email) => {
  const params = {
    Source: SENDER_EMAIL,
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Subject: {
        Data: 'Welcome to Philocom Newsletter! 🚀',
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f9f9f9; padding: 40px; border-radius: 0 0 8px 8px; }
                .cta-button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 Welcome to Philocom!</h1>
                </div>
                <div class="content">
                  <h2>Thank you for subscribing! </h2>
                  <p>We're excited to have you join our community. You'll receive updates about:</p>
                  <ul>
                    <li>🚀 Latest technology innovations</li>
                    <li>💡 Industry insights and best practices</li>
                    <li>🔐 Cybersecurity tips and alerts</li>
                    <li>📱 New product launches</li>
                  </ul>
                  <p>Stay tuned for amazing content!</p>
                  <a href="https://philocom.co" class="cta-button">Visit Our Website</a>
                </div>
              </div>
            </body>
            </html>
          `,
          Charset: 'UTF-8',
        },
      },
    },
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failures
    return { success: false, error: error.message };
  }
};
