import { sendEmail } from '@/config/email';
import { logger } from '@/utils/logger';
import fs from 'fs';
import path from 'path';
import Handlebars from 'handlebars';

interface ApprovalEmailData {
  employeeName: string;
  employeeEmail: string;
  documentNumber: string;
  documentType: string;
  amount: string;
  projectName: string;
  approvedBy: string;
  remark?: string;
  dashboardUrl: string;
}

export class EmailNotificationService {
  private loadTemplate(templateName: string): string {
    const templatePath = path.join(__dirname, '../templates/email', `${templateName}.html`);
    return fs.readFileSync(templatePath, 'utf-8');
  }

  async sendApprovalNotification(data: ApprovalEmailData): Promise<void> {
    try {
      const template = this.loadTemplate('expense-approval');
      const compiledTemplate = Handlebars.compile(template);
      
      const html = compiledTemplate({
        ...data,
        approvedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      });

      await sendEmail({
        to: data.employeeEmail,
        subject: `✅ Expense Approved - ${data.documentNumber}`,
        html,
      });

      logger.info(`Approval email sent to ${data.employeeEmail} for ${data.documentNumber}`);
    } catch (error) {
      logger.error('Failed to send approval email:', error);
      throw error;
    }
  }

  async sendRejectionNotification(data: ApprovalEmailData): Promise<void> {
    try {
      const template = this.loadTemplate('expense-rejection');
      const compiledTemplate = Handlebars.compile(template);
      
      const html = compiledTemplate({
        ...data,
        rejectedDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        rejectedBy: data.approvedBy, // Reuse the field
      });

      await sendEmail({
        to: data.employeeEmail,
        subject: `❌ Expense Rejected - ${data.documentNumber}`,
        html,
      });

      logger.info(`Rejection email sent to ${data.employeeEmail} for ${data.documentNumber}`);
    } catch (error) {
      logger.error('Failed to send rejection email:', error);
      throw error;
    }
  }
}

export const emailNotificationService = new EmailNotificationService();
