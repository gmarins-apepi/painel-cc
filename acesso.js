// Camada de acesso do painel fora do Claude. O código do painel (painel_cc.html) não é alterado:
// 1) login com e-mail @apepi.org (link de acesso por e-mail ou conta Microsoft), pelo Supabase;
// 2) os arquivos dados/... e relatorios/... passam a vir do espaço privado do Supabase, com o login;
// 3) os botões PDF e Planilha usam o download normal do navegador, com os mesmos arquivos de hoje.
(function () {
  var C = window.CC_ACESSO, fetchOriginal = window.fetch.bind(window);
  var dominioOk = function (email) { return !!email && email.toLowerCase().slice(-(C.dominio.length + 1)) === '@' + C.dominio; };
  var sb = window.supabase.createClient(C.supabaseUrl, C.supabaseAnonKey, { global: { fetch: fetchOriginal }, auth: { persistSession: true, detectSessionInUrl: true, flowType: 'implicit' } });
  var liberar, pronto = new Promise(function (r) { liberar = r; });

  // Downloads: o painel pede window.claude.use('downloads') e chama save({ filename, data }).
  window.claude = { use: function (nome) {
    if (nome !== 'downloads') return Promise.reject(new Error('indisponível'));
    return Promise.resolve({ save: function (o) {
      var blob = o.data instanceof Blob ? o.data : new Blob([o.data], { type: /\.xlsx$/i.test(o.filename) ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' : 'application/octet-stream' });
      var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = o.filename;
      document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
      return Promise.resolve();
    } });
  } };

  // Arquivos do painel: lidos do espaço privado, depois do login.
  window.fetch = function (input, init) {
    var u = typeof input === 'string' ? input : (input && input.url) || '';
    var caminho = u.replace(location.origin + location.pathname.replace(/[^/]*$/, ''), '');
    if (!/^(dados|relatorios)\//.test(caminho)) return fetchOriginal(input, init);
    return pronto.then(function () { return sb.storage.from(C.bucket).download(caminho); }).then(function (res) {
      if (res.error || !res.data) return new Response('', { status: 404 });
      return new Response(res.data, { status: 200 });
    });
  };

  var tela = document.createElement('div');
  tela.id = 'cc-login';
  tela.innerHTML = '<style>#cc-login{position:fixed;inset:0;z-index:9999;background:var(--bg,#e9eee2);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Calibri,"Segoe UI",Arial,sans-serif;color:#26232b}' +
    '#cc-login .cx{background:#fbfcf8;border-radius:18px;max-width:440px;width:100%;overflow:hidden;box-shadow:0 2px 14px rgba(0,0,0,.08)}#cc-login img{display:block;width:100%}' +
    '#cc-login .in{padding:18px 20px 22px;display:flex;flex-direction:column;gap:10px}#cc-login h1{font-family:Candara,"Trebuchet MS",sans-serif;color:#3f6600;font-size:22px;margin:0}' +
    '#cc-login p{margin:0;font-size:14px;color:#667060}#cc-login input{font:inherit;font-size:15px;padding:9px 12px;border-radius:10px;border:1px solid #dbe3d1}' +
    '#cc-login button{font:inherit;font-size:15px;font-weight:700;padding:9px 12px;border-radius:10px;border:0;cursor:pointer;background:#453068;color:#fff}#cc-login button.sec{background:#fff;color:#453068;border:1px solid #453068}' +
    '#cc-login .msg{font-size:13px;min-height:1em;color:#453068}@media (prefers-color-scheme:dark){#cc-login{background:#151816}}</style>' +
    '<div class="cx"><img src="assets/cabecalho_cc.png" alt="Cuidado Continuado"><div class="in"><h1>Indicadores do Cuidado Continuado</h1>' +
    '<p>Acesso para a equipe da APEPI. Entre com o seu e-mail @' + C.dominio + '.</p>' +
    (C.microsoft ? '<button type="button" id="cc-ms">Entrar com a conta Microsoft da APEPI</button><p style="text-align:center">ou receba um link por e-mail</p>' : '') +
    '<input type="email" id="cc-email" placeholder="nome@' + C.dominio + '" autocomplete="email"><button type="button" id="cc-link" class="' + (C.microsoft ? 'sec' : '') + '">Enviar link de acesso</button>' +
    '<div class="msg" id="cc-msg" role="status"></div></div></div>';

  function mostrarTela(msg) {
    if (!document.body) return document.addEventListener('DOMContentLoaded', function () { mostrarTela(msg); });
    if (!tela.isConnected) document.body.appendChild(tela);
    document.getElementById('cc-msg').textContent = msg || '';
    document.getElementById('cc-link').onclick = function () {
      var e = document.getElementById('cc-email').value.trim();
      if (!dominioOk(e)) { document.getElementById('cc-msg').textContent = 'Use o seu e-mail @' + C.dominio + '.'; return; }
      document.getElementById('cc-msg').textContent = 'Enviando...';
      sb.auth.signInWithOtp({ email: e, options: { emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
        document.getElementById('cc-msg').textContent = r.error ? 'Não foi possível enviar agora. Tente de novo em alguns minutos.' : 'Pronto. Abra o link que chegou no seu e-mail.';
      });
    };
    var ms = document.getElementById('cc-ms');
    if (ms) ms.onclick = function () { sb.auth.signInWithOAuth({ provider: 'azure', options: { scopes: 'email', redirectTo: location.origin + location.pathname } }); };
  }

  function avaliar(sessao) {
    if (sessao && dominioOk(sessao.user && sessao.user.email)) { if (tela.isConnected) tela.remove(); liberar(); return; }
    if (sessao) { sb.auth.signOut(); mostrarTela('Este painel é só para e-mails @' + C.dominio + '.'); return; }
    mostrarTela('');
  }
  sb.auth.getSession().then(function (r) { avaliar(r.data && r.data.session); });
  sb.auth.onAuthStateChange(function (ev, sessao) { if (ev === 'SIGNED_IN') avaliar(sessao); });
})();
