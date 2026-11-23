// Configuração pública do acesso ao painel. A chave "anon" do Supabase é pública por natureza:
// ela não dá acesso aos dados; quem protege os dados é a regra do espaço privado (só e-mails @apepi.org logados).
window.CC_ACESSO = {
  supabaseUrl: 'https://biwjscgpbipbglwxacdk.supabase.co',
  supabaseAnonKey: 'PREENCHER',
  bucket: 'painel',
  dominio: 'apepi.org',
  microsoft: false // passa a true quando o login com Microsoft estiver configurado no Supabase
};
