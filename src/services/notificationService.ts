import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export interface WebhookConfig {
  url: string;
  enabled: boolean;
  notifyOnClientSignup: boolean;
  notifyOnT3Approval: boolean;
  adminEmail: string;
}

const DEFAULT_WEBHOOK_CONFIG: WebhookConfig = {
  url: '',
  enabled: true,
  notifyOnClientSignup: true,
  notifyOnT3Approval: true,
  adminEmail: 'crial0810@gmail.com',
};

const STORAGE_KEY = 'nataraja_webhook_config';

export const notificationService = {
  async getWebhookConfig(): Promise<WebhookConfig> {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('value')
          .eq('key', 'notification_webhook')
          .maybeSingle();

        if (data && !error && data.value) {
          return {
            url: data.value.url || '',
            enabled: data.value.enabled ?? true,
            notifyOnClientSignup: data.value.notify_on_client_signup ?? true,
            notifyOnT3Approval: data.value.notify_on_t3_approval ?? true,
            adminEmail: data.value.admin_email || 'crial0810@gmail.com',
          };
        }
      } catch (err) {
        console.warn('Could not fetch webhook config from Supabase:', err);
      }
    }

    // LocalStorage fallback
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}

    return DEFAULT_WEBHOOK_CONFIG;
  },

  async saveWebhookConfig(config: WebhookConfig): Promise<{ success: boolean; message: string }> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));

      if (isSupabaseConfigured) {
        const { error } = await supabase.from('system_settings').upsert({
          key: 'notification_webhook',
          value: {
            url: config.url,
            enabled: config.enabled,
            notify_on_client_signup: config.notifyOnClientSignup,
            notify_on_t3_approval: config.notifyOnT3Approval,
            admin_email: config.adminEmail,
          },
          updated_at: new Date().toISOString(),
          updated_by: 'webadmin',
        });

        if (error) throw error;
      }

      return { success: true, message: 'Configuración de Webhook guardada exitosamente.' };
    } catch (err: any) {
      console.error('Error saving webhook config:', err);
      return { success: false, message: err.message || 'Error al guardar la configuración' };
    }
  },

  async notifyClientSignup(clientData: {
    name: string;
    email: string;
    userId: string;
  }): Promise<{ dispatched: boolean; message?: string }> {
    const config = await this.getWebhookConfig();

    if (!config.enabled || !config.notifyOnClientSignup || !config.url.trim()) {
      return { dispatched: false, message: 'Webhook inactivo o URL no configurada' };
    }

    const payload = {
      event: 'NUEVO_CLIENTE_REGISTRADO',
      timestamp: new Date().toISOString(),
      recipient: config.adminEmail,
      title: '🔔 Nuevo Cliente Registrado en N. Studios OS',
      message: `El usuario ${clientData.name} (${clientData.email}) se ha registrado como cliente y requiere vinculación de marca.`,
      data: {
        userId: clientData.userId,
        name: clientData.name,
        email: clientData.email,
        role: 'cliente',
        adminDashboardUrl: window.location.origin + '/admin',
      },
    };

    try {
      await fetch(config.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors', // Supports Google Apps Script / Discord / Webhook endpoints
        body: JSON.stringify(payload),
      });

      return { dispatched: true, message: 'Notificación despachada al Webhook del WebAdmin' };
    } catch (err: any) {
      console.warn('Webhook dispatch error:', err);
      return { dispatched: false, message: err.message };
    }
  },

  async testWebhook(testUrl?: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getWebhookConfig();
    const targetUrl = testUrl || config.url;

    if (!targetUrl.trim()) {
      return { success: false, message: 'Por favor ingresa una URL de Webhook válida.' };
    }

    const testPayload = {
      event: 'TEST_WEBHOOK_NOTIFICACION',
      timestamp: new Date().toISOString(),
      recipient: config.adminEmail,
      title: '🧪 Prueba de Notificación — N. Studios OS',
      message: 'Este es un mensaje de prueba para verificar la conexión con tu Webhook.',
      data: {
        platform: 'N. Studios OS',
        status: 'online',
        testedBy: 'WebAdmin Global',
      },
    };

    try {
      await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'no-cors',
        body: JSON.stringify(testPayload),
      });

      return { success: true, message: '¡Petición de prueba enviada con éxito al Webhook!' };
    } catch (err: any) {
      return { success: false, message: 'Error al enviar webhook: ' + err.message };
    }
  },
};
