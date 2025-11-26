# Variáveis de Ambiente

Copie estas variáveis para seu arquivo `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tcfypdzedtibmngmazbn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjZnlwZHplZHRpYm1uZ21hemJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3NDM2MTQsImV4cCI6MjA3OTMxOTYxNH0.Bv_s2EqwKn3j9mw1R_6UPiFAu322cpkX-jk8OKFFPMY

# Resend API Key (obrigatório para envio real de emails)
# Obtenha em: https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Email remetente (opcional, padrão: onboarding@resend.dev)
FROM_EMAIL=noreply@seudominio.com

# Nome da aplicação (opcional, padrão: Echo88)
APP_NAME=Echo88

# URL da aplicação
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

