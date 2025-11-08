import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { env } from '@/config/env';
import { logger } from '@/utils/logger';

class EmailService {
  private transporter: Transporter;
  private templatesDir: string;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
    });

    this.templatesDir = path.join(__dirname, '../templates/emails');
    this.ensureTemplatesDir();
  }

  private ensureTemplatesDir() {
    if (!fs.existsSync(this.templatesDir)) {
      fs.mkdirSync(this.templatesDir, { recursive: true });
    }
  }

  private async loadTemplate(templateName: string, data: any): Promise<string> {
    try {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      const templateSource = fs.readFileSync(templatePath, 'utf-8');
      const template = handlebars.compile(templateSource);
      return template(data);
    } catch (error) {
      logger.error(`Error loading email template ${templateName}:`, error);
      throw error;
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const mailOptions = {
        from: `${env.SMTP_FROM_NAME} <${env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent successfully to ${to}`);
    } catch (error) {
      logger.error(`Error sending email to ${to}:`, error);
      throw error;
    }
  }

  async sendOTP(email: string, otp: string, name: string): Promise<void> {
    const subject = 'Verify Your Email - OneFlow';
    const html = await this.loadTemplate('otp', { name, otp });
    
    await this.sendEmail(email, subject, html);
    logger.info(`OTP email sent to ${email}`);
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const html = await this.loadTemplate('welcome', { name });
    await this.sendEmail(to, 'Welcome to OneFlow!', html);
  }

  async sendPasswordResetEmail(to: string, name: string, resetLink: string): Promise<void> {
    const html = await this.loadTemplate('password-reset', { name, resetLink });
    await this.sendEmail(to, 'Reset Your Password - OneFlow', html);
  }

  async sendNewUserCredentials(
    to: string,
    name: string,
    email: string,
    password: string,
    role: string
  ): Promise<void> {
    const html = await this.loadTemplate('new-user-credentials', {
      name,
      email,
      password,
      role,
      loginUrl: `${env.FRONTEND_URL}/login`,
    });
    await this.sendEmail(to, 'Your OneFlow Account Credentials', html);
  }

  async sendProjectAssignment(
    to: string,
    name: string,
    projectName: string,
    startDate: Date,
    endDate?: Date,
    deadline?: Date,
    budget?: number,
    clientName?: string
  ): Promise<void> {
    const formatDate = (date: Date) => new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .detail-row { margin: 10px 0; }
          .label { font-weight: bold; color: #4F46E5; }
          .button { background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New Project Assignment</h1>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>You have been assigned as the <strong>Project Manager</strong> for a new project.</p>
            
            <div class="details">
              <h3>Project Details:</h3>
              <div class="detail-row"><span class="label">Project Name:</span> ${projectName}</div>
              <div class="detail-row"><span class="label">Start Date:</span> ${formatDate(startDate)}</div>
              ${endDate ? `<div class="detail-row"><span class="label">End Date:</span> ${formatDate(endDate)}</div>` : ''}
              ${deadline ? `<div class="detail-row"><span class="label">Deadline:</span> ${formatDate(deadline)}</div>` : ''}
              ${budget ? `<div class="detail-row"><span class="label">Budget:</span> $${budget.toLocaleString()}</div>` : ''}
              ${clientName ? `<div class="detail-row"><span class="label">Client:</span> ${clientName}</div>` : ''}
              <div class="detail-row"><span class="label">Your Email:</span> ${to}</div>
            </div>
            
            <p><strong>Your Responsibilities:</strong></p>
            <ul>
              <li>Lead and coordinate the project team</li>
              <li>Ensure project milestones are met on time</li>
              <li>Manage project budget and resources</li>
              <li>Communicate progress to stakeholders</li>
              <li>Resolve any project-related issues</li>
            </ul>
            
            <center>
              <a href="${env.FRONTEND_URL}/projects" class="button">View Project Dashboard</a>
            </center>
            
            <p>If you have any questions or concerns, please contact your administrator.</p>
            
            <p>Best regards,<br>The OneFlow Team</p>
          </div>
          <div class="footer">
            <p>This is an automated email from OneFlow. Please do not reply to this message.</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    await this.sendEmail(to, `You've been assigned to manage: ${projectName}`, html);
  }

  async sendProjectInvitation(
    to: string,
    name: string,
    projectName: string,
    invitedBy: string
  ): Promise<void> {
    const html = await this.loadTemplate('project-invitation', {
      name,
      projectName,
      invitedBy,
      projectUrl: `${env.FRONTEND_URL}/projects`,
    });
    await this.sendEmail(to, `You've been added to ${projectName}`, html);
  }

  async sendTaskAssignment(
    to: string,
    name: string,
    taskTitle: string,
    projectName: string,
    dueDate?: string
  ): Promise<void> {
    const html = await this.loadTemplate('task-assignment', {
      name,
      taskTitle,
      projectName,
      dueDate,
      tasksUrl: `${env.FRONTEND_URL}/tasks`,
    });
    await this.sendEmail(to, `New Task Assigned: ${taskTitle}`, html);
  }

  async sendInvoiceNotification(
    to: string,
    customerName: string,
    invoiceNumber: string,
    amount: number,
    dueDate: string
  ): Promise<void> {
    const html = await this.loadTemplate('invoice-notification', {
      customerName,
      invoiceNumber,
      amount,
      dueDate,
    });
    await this.sendEmail(to, `Invoice ${invoiceNumber} - OneFlow`, html);
  }

  async sendExpenseApproval(
    to: string,
    name: string,
    expenseDescription: string,
    amount: number,
    status: 'approved' | 'rejected'
  ): Promise<void> {
    const html = await this.loadTemplate('expense-approval', {
      name,
      expenseDescription,
      amount,
      status,
    });
    await this.sendEmail(
      to,
      `Expense ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      html
    );
  }
}

export const emailService = new EmailService();
