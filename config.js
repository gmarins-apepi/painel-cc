// Configuração pública do acesso ao painel. A chave "anon" do Supabase é pública por natureza:
// ela não dá acesso aos dados; quem protege os dados é a regra do espaço privado (só e-mails @apepi.org logados).
window.CC_ACESSO = {
  supabaseUrl: 'https://biwjscgpbipbglwxacdk.supabase.co',
  supabaseAnonKey: 'sb_publishable_OcygLYbRigJuXiCy2DH3Nw_hH6fRVuJ',
  bucket: 'painel',
  dominio: 'apepi.org',
  microsoft: true // login com a conta Microsoft da APEPI (app "Painel Cuidado Continuado" no Azure; segredo vence em 11/2028)
};
