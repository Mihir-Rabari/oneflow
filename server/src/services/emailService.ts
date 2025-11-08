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
    // In development, skip actual email sending and just log the OTP
    if (env.NODE_ENV === 'development') {
      logger.info(` [DEV MODE] OTP for ${email}: ${otp}`);
      logger.info(`Copy this OTP to verify your email: ${otp}`);
      return;
    }
    
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
