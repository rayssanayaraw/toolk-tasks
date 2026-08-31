/**
 * ═══════════════════════════════════════
 *  Toolk Tasks — Sistema de Chamados
 *  app.js — Toda a lógica da aplicação
 * ═══════════════════════════════════════
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════ */
  const SK = {
    tickets: 'taskflow_tickets',
    columns: 'taskflow_columns',
    counter: 'taskflow_counter',
    theme: 'taskflow_theme',
    authSession: 'taskflow_auth_session',
  };

  const SB_URL = 'https://izqmuktylbixzldbkzod.supabase.co/rest/v1/';
  const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cW11a3R5bGJpeHpsZGJrem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTUwNDgsImV4cCI6MjEwMzE3MTA0OH0.kP9uN9ZASnjZBoDd_Lhv-H0aXan7hZOqH-_NAVF8oyM';

  const COLORS = [
    { id: 'slate', hex: '#64748b' },
    { id: 'blue', hex: '#3b82f6' },
    { id: 'indigo', hex: '#6366f1' },
    { id: 'purple', hex: '#8b5cf6' },
    { id: 'pink', hex: '#ec4899' },
    { id: 'red', hex: '#ef4444' },
    { id: 'orange', hex: '#f97316' },
    { id: 'amber', hex: '#f59e0b' },
    { id: 'yellow', hex: '#eab308' },
    { id: 'lime', hex: '#84cc16' },
    { id: 'green', hex: '#22c55e' },
    { id: 'emerald', hex: '#10b981' },
    { id: 'teal', hex: '#14b8a6' },
    { id: 'cyan', hex: '#06b6d4' },
    { id: 'sky', hex: '#0ea5e9' },
    { id: 'rose', hex: '#f43f5e' },
  ];

  const DEFCOLS = [
    { id: 'backlog', name: 'Backlog', color: '#64748b' },
    { id: 'progress', name: 'Em Progresso', color: '#3b82f6' },
    { id: 'testing', name: 'Em Teste', color: '#f59e0b' },
    { id: 'done', name: 'Concluído', color: '#10b981' },
  ];

  const MAX_FILE_SIZE = 1 * 1024 * 1024;
  const MAX_FILES = 5;

  const MODULE_LIST = [
    'App - MOBILE', 'Configurações', 'Administração', 'Avaliação de Perfil',
    'Recrutamento e Seleção', 'Desempenho e Competências', 'PDI',
    'Feedbacks', 'One-on-One', 'UCT', 'Qualidade de Vida',
    'Toolk Forms', 'Meu R.H', 'Consulta Certificação',
    'Premiação', 'Organograma', 'Outro'
  ];

  const CLIENT_LIST = [
    'ACEVILLE', 'ACONCHEGO', 'ANALI SUPERMERCADO', 'ARAMEBRAS', 'ARAMEPAR',
    'AUTOR CAPACITACAO', 'BDR', 'BIG SERVICE', 'BIO PARQUE', 'BOMPEL',
    'CODIL', 'CONCEITO BRASIL ENGENHARIA', 'EXPRESSO SUL', 'FLOW', 'GESTRAN',
    'GIDION', 'AÇOS', 'CAVALCA', 'EVL', 'IMPAR', 'INTERNACIONAL', 'ITAMEDI',
    'LEGACY', 'LUMINA', 'MAXUP', 'PARQUE BRASIL', 'PASSEBUS', 'PRIMAVERAS',
    'PSV SOLUTIONS', 'QUARTETTO', 'RAMO BH', 'RCE', 'RIZA', 'SEDA', 'SEKALOG',
    'SERT GROUP', 'SOLUÇÕES SELANTES', 'TIME LIONS', 'TOOLK', 'TRANSGOBBI',
    'TRANSTUSA', 'TRELITELAS', 'VEXILOM', 'VIAÇÃO VERDES MARES', 'WOEU', 'Outro'
  ];

  /* ═══════════════════════════════════════
     STATE
  ═══════════════════════════════════════ */
  let user = null;
  let authSession = null;
  let tickets = [];
  let columns = [];
  let filter = 'all';
  let moduleFilter = 'all';
  let clientFilter = 'all';
  let searchQuery = '';
  let dateFrom = '';
  let dateTo = '';
  let tkId = null;
  let selType = null;
  let selColor = null;
  let editColId = null;
  let tkCtr = 1;
  let dragId = null;
  let columnDragId = null;
  let delColId = null;
  let pendingAttachments = [];
  let pendingCommentAttachments = [];
  let editMode = false;
  let deleteTicketId = null;
  let deleteCommentId = null;
  let editingCommentId = null;

  /* ═══════════════════════════════════════
     DOM REFERENCES
  ═══════════════════════════════════════ */
  const $ = (id) => document.getElementById(id);
  const D = {
    loginScreen: $('loginScreen'),
    loginName: $('loginName'),
    passwordGroup: $('passwordGroup'),
    loginPassword: $('loginPassword'),
    loginError: $('loginError'),
    btnLogin: $('btnLogin'),
    app: $('app'),
    userAvatar: $('userAvatar'),
    userName: $('userName'),
    roleTag: $('roleTag'),
    themeToggle: $('themeToggle'),
    btnLogout: $('btnLogout'),
    headerStats: $('headerStats'),
    btnNewTicket: $('btnNewTicket'),
    btnManageColumns: $('btnManageColumns'),
    btnManageUsers: $('btnManageUsers'),
    btnExport: $('btnExport'),
    moduleFilter: $('moduleFilter'),
    clientFilter: $('clientFilter'),
    searchInput: $('searchInput'),
    searchClear: $('searchClear'),
    dateFrom: $('dateFrom'),
    dateTo: $('dateTo'),
    clearAllFilters: $('clearAllFilters'),
    board: $('board'),
    detailModal: $('detailModal'),
    modalId: $('modalId'),
    modalTitle: $('modalTitle'),
    modalDescription: $('modalDescription'),
    modalDetails: $('modalDetails'),
    modalClose: $('modalClose'),
    btnEditTicket: $('btnEditTicket'),
    btnDeleteTicket: $('btnDeleteTicket'),
    adminControls: $('adminControls'),
    statusButtons: $('statusButtons'),
    commentsList: $('commentsList'),
    commentInput: $('commentInput'),
    btnSendComment: $('btnSendComment'),
    commentAttachInput: $('commentAttachInput'),
    commentAttachPreviews: $('commentAttachPreviews'),
    attachSection: $('attachmentsSection'),
    attachGrid: $('attachmentsGrid'),
    newTicketModal: $('newTicketModal'),
    newTicketClose: $('newTicketClose'),
    typeBug: $('typeBug'),
    typeImprovement: $('typeImprovement'),
    ticketTitle: $('ticketTitle'),
    ticketDesc: $('ticketDesc'),
    ticketModule: $('ticketModule'),
    ticketClient: $('ticketClient'),
    ticketPriority: $('ticketPriority'),
    btnSubmitTicket: $('btnSubmitTicket'),
    attachZone: $('attachZone'),
    attachInput: $('attachInput'),
    attachPreviews: $('attachPreviews'),
    columnModal: $('columnModal'),
    columnModalTitle: $('columnModalTitle'),
    columnModalClose: $('columnModalClose'),
    columnName: $('columnName'),
    colorPicker: $('colorPicker'),
    btnSubmitColumn: $('btnSubmitColumn'),
    userModal: $('userModal'),
    userModalClose: $('userModalClose'),
    newUserName: $('newUserName'),
    newUserEmail: $('newUserEmail'),
    newUserPassword: $('newUserPassword'),
    newUserRole: $('newUserRole'),
    userFormError: $('userFormError'),
    btnSubmitUser: $('btnSubmitUser'),
    registeredUsersList: $('registeredUsersList'),
    confirmDialog: $('confirmDialog'),
    confirmTitle: $('confirmTitle'),
    confirmText: $('confirmText'),
    confirmCancel: $('confirmCancel'),
    confirmOk: $('confirmOk'),
    toastContainer: $('toastContainer'),
    lightbox: $('lightbox'),
    lightboxImg: $('lightboxImg'),
    lightboxClose: $('lightboxClose'),
        // Password recovery / change
    loginForm: $('loginForm'),
    recoveryForm: $('recoveryForm'),
    recoveryEmail: $('recoveryEmail'),
    btnSendRecovery: $('btnSendRecovery'),
    backToLogin: $('backToLogin'),
    recoveryMessage: $('recoveryMessage'),
    forgotPasswordLink: $('forgotPasswordLink'),
    resetScreen: $('resetScreen'),
    resetNewPassword: $('resetNewPassword'),
    resetConfirmPassword: $('resetConfirmPassword'),
    btnResetPassword: $('btnResetPassword'),
    resetMessage: $('resetMessage'),
    btnChangePassword: $('dropdownChangePassword'),
    changePasswordModal: $('changePasswordModal'),
    changePasswordClose: $('changePasswordClose'),
    changeNewPassword: $('changeNewPassword'),
    changeConfirmPassword: $('changeConfirmPassword'),
    changePasswordError: $('changePasswordError'),
    btnSavePassword: $('btnSavePassword'),

    userMenuWrapper: $('userMenuWrapper'),
    userMenuTrigger: $('userMenuTrigger'),
    userDropdown: $('userDropdown'),
    dropdownThemeToggle: $('dropdownThemeToggle'),
    dropdownManageUsers: $('dropdownManageUsers'),
    dropdownManageColumns: $('dropdownManageColumns'),
    dropdownExport: $('dropdownExport'),
    dropdownLogout: $('dropdownLogout'),
  };

  /* ═══════════════════════════════════════
     UTILITIES
  ═══════════════════════════════════════ */
  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function cap(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  function genId() {
    return 'col_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function toast(m, t = 'info') {
    const e = document.createElement('div');
    e.className = `toast ${t}`;
    e.textContent = m;
    D.toastContainer.appendChild(e);
    setTimeout(() => {
      e.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => e.remove(), 300);
    }, 3000);
  }

    function applyTheme(theme) {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';

    // Atualizar label se existir
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = isLight ? 'Modo escuro' : 'Modo claro';
  }

  function generateOptions(list, selected) {
    return list.map(item =>
      `<option value="${esc(item)}" ${item === selected ? 'selected' : ''}>${esc(item)}</option>`
    ).join('');
  }

  /* ═══════════════════════════════════════
     DATA PERSISTENCE
  ═══════════════════════════════════════ */
  const SB_API = SB_URL.endsWith('/') ? SB_URL : `${SB_URL}/rest/v1/`;
  const SB_PROJECT_URL = SB_URL.replace(/\/rest\/v1\/?$/, '');
  const SB_AUTH_API = `${SB_PROJECT_URL}/auth/v1`;
  const SB_FUNCTIONS_API = `${SB_PROJECT_URL}/functions/v1`;

  async function sbRequest(path, options = {}) {
    const response = await fetch(`${SB_API}${path}`, {
      ...options,
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${authSession?.access_token || SB_KEY}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      throw new Error(`Supabase ${response.status}: ${await response.text()}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
  }

  async function signIn(email, password) {
  const response = await fetch(`${SB_AUTH_API}/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: SB_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error_description || 'E-mail ou senha inválidos.');
  }

  const session = await response.json();
  
  // Atualiza a variável em memória E o localStorage
  authSession = session; 
  localStorage.setItem(SK.authSession, JSON.stringify(session));
  
  return session;
}

  async function signOut() {
    if (authSession?.access_token) await fetch(`${SB_AUTH_API}/logout`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${authSession.access_token}`,
      },
    }).catch(() => {});
    localStorage.removeItem(SK.authSession);
  }

    /* ═══════════════════════════════════════
     PASSWORD RECOVERY
  ═══════════════════════════════════════ */
  async function sendRecoveryEmail() {
    const email = D.recoveryEmail.value.trim();
    if (!email) {
      D.recoveryMessage.textContent = 'Informe seu e-mail.';
      D.recoveryMessage.className = 'login-error';
      return;
    }

    D.btnSendRecovery.disabled = true;
    D.recoveryMessage.textContent = '';
    D.recoveryMessage.className = 'login-error';

    try {
      const redirectTo = window.location.origin + window.location.pathname;
      const response = await fetch(`${SB_AUTH_API}/recover`, {
        method: 'POST',
        headers: {
          apikey: SB_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, redirect_to: redirectTo }),
      });

      // Sempre mostra sucesso (nao revela se o email existe)
      D.recoveryMessage.textContent =
        'Se o e-mail estiver cadastrado, você receberá um link de redefinição em alguns minutos.';
      D.recoveryMessage.className = 'login-success';
      D.recoveryEmail.value = '';
    } catch (error) {
      D.recoveryMessage.textContent = 'Erro ao enviar. Tente novamente.';
      D.recoveryMessage.className = 'login-error';
    } finally {
      D.btnSendRecovery.disabled = false;
    }
  }

  async function handleRecoveryCallback() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('type=recovery')) return false;

    const params = new URLSearchParams(hash.substring(1));
    const type = params.get('type');
    const accessToken = params.get('access_token');

    if (type === 'recovery' && accessToken) {
      authSession = { access_token: accessToken };

      // Limpa o hash da URL
      history.replaceState(null, '', window.location.pathname);

      // Mostra tela de redefinicao
      D.loginScreen.classList.add('hidden');
      D.app.classList.remove('active');
      D.resetScreen.classList.remove('hidden');

      return true;
    }

    return false;
  }

  async function resetPassword() {
    const newPwd = D.resetNewPassword.value;
    const confirmPwd = D.resetConfirmPassword.value;

    if (!newPwd || newPwd.length < 6) {
      D.resetMessage.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
      D.resetMessage.className = 'login-error';
      return;
    }
    if (newPwd !== confirmPwd) {
      D.resetMessage.textContent = 'As senhas não coincidem.';
      D.resetMessage.className = 'login-error';
      return;
    }

    D.btnResetPassword.disabled = true;
    D.resetMessage.textContent = '';

    try {
      const response = await fetch(`${SB_AUTH_API}/user`, {
        method: 'PUT',
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${authSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPwd }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.msg || err.error_description || 'Não foi possível redefinir a senha.');
      }

      D.resetMessage.textContent = 'Senha redefinida com sucesso! Redirecionando...';
      D.resetMessage.className = 'login-success';
      D.resetNewPassword.value = '';
      D.resetConfirmPassword.value = '';

      authSession = null;

      setTimeout(() => {
        D.resetScreen.classList.add('hidden');
        D.loginScreen.classList.remove('hidden');
        D.loginError.textContent = '';
        D.loginError.className = 'login-error';
      }, 2000);
    } catch (error) {
      D.resetMessage.textContent = error.message;
      D.resetMessage.className = 'login-error';
    } finally {
      D.btnResetPassword.disabled = false;
    }
  }

  /* ═══════════════════════════════════════
     CHANGE PASSWORD (LOGGED IN)
  ═══════════════════════════════════════ */
  function openChangePasswordModal() {
    D.changeNewPassword.value = '';
    D.changeConfirmPassword.value = '';
    D.changePasswordError.textContent = '';
    D.changePasswordModal.classList.add('active');
  }

  async function saveNewPassword() {
    const newPwd = D.changeNewPassword.value;
    const confirmPwd = D.changeConfirmPassword.value;

    if (!newPwd || newPwd.length < 6) {
      D.changePasswordError.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }
    if (newPwd !== confirmPwd) {
      D.changePasswordError.textContent = 'As senhas não coincidem.';
      return;
    }

    D.btnSavePassword.disabled = true;
    D.changePasswordError.textContent = '';

    try {
      const response = await fetch(`${SB_AUTH_API}/user`, {
        method: 'PUT',
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${authSession.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPwd }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.msg || err.error_description || 'Não foi possível alterar a senha.');
      }

      D.changePasswordModal.classList.remove('active');
      toast('Senha alterada com sucesso!', 'success');
    } catch (error) {
      D.changePasswordError.textContent = error.message;
    } finally {
      D.btnSavePassword.disabled = false;
    }
  }

  async function restoreSession() {
    const storedSession = localStorage.getItem(SK.authSession);
    if (!storedSession) return false;

    try {
      authSession = JSON.parse(storedSession);
      const response = await fetch(`${SB_AUTH_API}/user`, {
        headers: {
          apikey: SB_KEY,
          Authorization: `Bearer ${authSession.access_token}`,
        },
      });
      if (!response.ok && authSession.refresh_token) {
        const refreshResponse = await fetch(`${SB_AUTH_API}/token?grant_type=refresh_token`, {
          method: 'POST',
          headers: {
            apikey: SB_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: authSession.refresh_token }),
        });
        if (!refreshResponse.ok) throw new Error('Sessão expirada.');
        authSession = await refreshResponse.json();
        localStorage.setItem(SK.authSession, JSON.stringify(authSession));
      } else if (!response.ok) {
        throw new Error('Sessão expirada.');
      }

      const profiles = await sbRequest(
        `profiles?id=eq.${encodeURIComponent(authSession.user.id)}&select=name,role`
      );
      const profile = profiles[0];
      if (!profile) throw new Error('Perfil de usuário não encontrado.');

            user = { name: profile.name, email: authSession.user.email };
      return true;
    } catch (error) {
      console.error(error);
      authSession = null;
      user = null;
      localStorage.removeItem(SK.authSession);
      return false;
    }
  }

  async function createUserByAdmin(name, email, password) {
    const response = await fetch(`${SB_FUNCTIONS_API}/create-user`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role: 'admin' }),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || 'Não foi possível cadastrar o colaborador.');
    return result;
  }

  async function load() {
    try {
      const [remoteColumns, remoteTickets, remoteComments, remoteAttachments] = await Promise.all([
        sbRequest('columns?select=*&order=position.asc'),
        sbRequest('tickets?select=*'),
        sbRequest('comments?select=*'),
        sbRequest('attachments?select=id,ticket_id,comment_id,name'),
      ]);

      columns = remoteColumns.length ? remoteColumns : [...DEFCOLS];
      tickets = remoteTickets.map((ticket) => ({
        id: ticket.id,
        type: ticket.type,
        title: ticket.title,
        description: ticket.description,
        module: ticket.module || '',
        client: ticket.client || '',
        priority: ticket.priority,
        status: ticket.status,
        author: ticket.author,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        comments: remoteComments
          .filter((comment) => comment.ticket_id === ticket.id)
          .map((comment) => ({
            id: comment.id,
            author: comment.author,
            text: comment.text,
            createdAt: comment.created_at,
            attachments: remoteAttachments
              .filter((attachment) => attachment.comment_id === comment.id)
              .map((attachment) => ({ name: attachment.name, data: attachment.url })),
          })),
        attachments: remoteAttachments
          .filter((attachment) => attachment.ticket_id === ticket.id && !attachment.comment_id)
          .map((attachment) => ({ name: attachment.name, data: attachment.url })),
      }));

      tkCtr = tickets.reduce((max, ticket) => Math.max(max, parseInt(ticket.id, 10) || 0), 0) + 1;
    } catch (error) {
      console.error(error);
      tickets = [];
      columns = [...DEFCOLS];
      tkCtr = 1;
      toast('Não foi possível carregar os dados do Supabase.', 'error');
    }
  }

  async function saveT() {
    if (!tickets.length) return;
    await sbRequest('tickets?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(
        tickets.map((ticket) => ({
          id: ticket.id,
          type: ticket.type,
          title: ticket.title,
          description: ticket.description,
          module: ticket.module || null,
          client: ticket.client || null,
          priority: ticket.priority,
          status: ticket.status,
          author: ticket.author,
          author_role: 'admin',
          created_at: ticket.createdAt,
          updated_at: ticket.updatedAt,
        }))
      ),
    });
  }

  async function saveSingleTicket(ticket) {
    await sbRequest('tickets?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: ticket.id,
        type: ticket.type,
        title: ticket.title,
        description: ticket.description,
        module: ticket.module || null,
        client: ticket.client || null,
        priority: ticket.priority,
        status: ticket.status,
        author: ticket.author,
        author_role: 'admin',
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
      }),
    });
  }

  async function saveC() {
    await sbRequest('columns?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify(columns),
    });
  }

  async function uploadToStorage(file, folder) {
    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const response = await fetch(`${SB_PROJECT_URL}/storage/v1/object/attachments/${fileName}`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${authSession.access_token}`,
        'Content-Type': file.type || 'image/jpeg',
      },
      body: file,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Upload error:', response.status, err);
      throw new Error(`Upload failed: ${response.status}`);
    }

    return `${SB_PROJECT_URL}/storage/v1/object/public/attachments/${fileName}`;
  }

  async function saveAttachments(ticket) {
    if (!ticket.attachments?.length) return;

    for (const attachment of ticket.attachments) {
      let url = attachment.data;

      if (attachment.file) {
        try {
          url = await uploadToStorage(attachment.file, `tickets/${ticket.id}`);
        } catch (err) {
          console.error('[ATTACH] Upload FALHOU:', err);
          toast('Erro no upload da imagem: ' + err.message, 'error');
          continue;
        }
      }

      try {
        await sbRequest('attachments', {
          method: 'POST',
          body: JSON.stringify({
            ticket_id: ticket.id,
            comment_id: null,
            name: attachment.name,
            url: url,
          }),
        });
      } catch (err) {
        console.error('[ATTACH] Erro ao salvar no banco:', err);
        toast('Erro ao salvar anexo no banco: ' + err.message, 'error');
      }
    }
  }

  async function saveComment(ticket, comment) {
    const savedComments = await sbRequest('comments', {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        ticket_id: ticket.id,
        author: comment.author,
        role: 'admin',
        text: comment.text,
        created_at: comment.createdAt,
      }),
    });

    const savedComment = savedComments[0];
    if (savedComment && comment.attachments?.length) {
      for (const attachment of comment.attachments) {
        let url = attachment.data;
        if (attachment.file) {
          url = await uploadToStorage(attachment.file, `tickets/${ticket.id}/comments`);
        }
        await sbRequest('attachments', {
          method: 'POST',
          body: JSON.stringify({
            ticket_id: ticket.id,
            comment_id: savedComment.id,
            name: attachment.name,
            url: url,
          }),
        });
      }
    }

    return savedComment;
  }

  async function updateCommentInDB(commentId, newText) {
    await sbRequest(`comments?id=eq.${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text: newText }),
    });
  }

  async function deleteCommentFromDB(commentId) {
    await sbRequest(`attachments?comment_id=eq.${commentId}`, {
      method: 'DELETE',
    });
    await sbRequest(`comments?id=eq.${commentId}`, {
      method: 'DELETE',
    });
  }

  async function deleteTicketFromDB(ticketId) {
    await sbRequest(`attachments?ticket_id=eq.${ticketId}`, {
      method: 'DELETE',
    });
    await sbRequest(`comments?ticket_id=eq.${ticketId}`, {
      method: 'DELETE',
    });
    await sbRequest(`tickets?id=eq.${ticketId}`, {
      method: 'DELETE',
    });
  }

  /* ═══════════════════════════════════════
     ATTACHMENT HANDLING
  ═══════════════════════════════════════ */
  function processFiles(files, target = pendingAttachments, preview = renderAttachPreviews) {
    const remaining = MAX_FILES - target.length;
    if (remaining <= 0) {
      toast(`Máximo de ${MAX_FILES} imagens.`, 'error');
      return;
    }

    const toProcess = Array.from(files).slice(0, remaining);

    toProcess.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast(`"${file.name}" não é imagem.`, 'error');
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast(`"${file.name}" excede 1MB.`, 'error');
        return;
      }

      target.push({ name: file.name, file, data: URL.createObjectURL(file) });
      preview();
    });
  }

  function renderAttachPreviews() {
    D.attachPreviews.innerHTML = pendingAttachments
      .map(
        (a, i) =>
          `<div class="attach-preview">
            <img src="${a.data}" alt="${esc(a.name)}">
            <button class="attach-preview-remove" data-idx="${i}" title="Remover">✕</button>
          </div>`
      )
      .join('');

    D.attachPreviews.querySelectorAll('.attach-preview-remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        pendingAttachments.splice(parseInt(btn.dataset.idx), 1);
        renderAttachPreviews();
      });
    });
  }

  function renderCommentAttachPreviews() {
    D.commentAttachPreviews.innerHTML = pendingCommentAttachments
      .map(
        (attachment, index) =>
          `<div class="attach-preview">
            <img src="${attachment.data}" alt="${esc(attachment.name)}">
            <button class="attach-preview-remove" data-comment-idx="${index}" title="Remover">✕</button>
          </div>`
      )
      .join('');

    D.commentAttachPreviews.querySelectorAll('[data-comment-idx]').forEach((button) => {
      button.addEventListener('click', () => {
        pendingCommentAttachments.splice(parseInt(button.dataset.commentIdx, 10), 1);
        renderCommentAttachPreviews();
      });
    });
  }

  function setupAttachZone() {
    const zone = D.attachZone;
    const input = D.attachInput;

    zone.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
      processFiles(input.files);
      input.value = '';
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-hover');
    });

    zone.addEventListener('dragleave', () => {
      zone.classList.remove('drag-hover');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-hover');
      processFiles(e.dataTransfer.files);
    });
  }

  /* ═══════════════════════════════════════
     LOGIN
  ═══════════════════════════════════════ */
  async function handleLogin() {
    const email = D.loginName.value.trim();

    if (!email) {
      D.loginError.textContent = 'Informe seu e-mail.';
      return;
    }

    if (!D.loginPassword.value) {
      D.loginError.textContent = 'Informe a senha';
      return;
    }

    D.btnLogin.disabled = true;
    D.loginError.textContent = '';

    try {
      authSession = await signIn(email, D.loginPassword.value);
      const profiles = await sbRequest(`profiles?id=eq.${encodeURIComponent(authSession.user.id)}&select=name,role`);
      const profile = profiles[0];

      if (!profile) {
        await signOut();
        authSession = null;
        D.loginError.textContent = 'Perfil de usuário não encontrado.';
        return;
      }

            user = { name: profile.name, email: authSession.user.email };
    } catch (error) {
      authSession = null;
      D.loginError.textContent = error.message === 'Invalid login credentials'
        ? 'Senha incorreta. Acesso negado'
        : error.message;
      return;
    } finally {
      D.btnLogin.disabled = false;
    }

    D.loginError.textContent = '';
    D.loginScreen.classList.add('hidden');
    D.app.classList.add('active');
    await load();

    setupUI();
    
    renderBoard();
    handleTicketHash();
  }

    function setupUI() {
    const ini = user.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    D.userAvatar.textContent = ini;
    D.userName.textContent = user.name;

    // Dropdown header
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownUserName = document.getElementById('dropdownUserName');
    const dropdownUserEmail = document.getElementById('dropdownUserEmail');

    if (dropdownAvatar) {
      dropdownAvatar.textContent = ini;
    }
    if (dropdownUserName) {
      dropdownUserName.textContent = user.name;
    }
    if (dropdownUserEmail) {
      dropdownUserEmail.textContent = user.email || '';
    }

    updateThemeLabel();
  }

  function updateThemeLabel() {
    const isDark = document.documentElement.dataset.theme !== 'light';
    const label = document.getElementById('themeLabel');
    if (label) label.textContent = isDark ? 'Modo claro' : 'Modo escuro';
  }

  async function loadRegisteredUsers() {
    D.registeredUsersList.innerHTML = '<p class="registered-users-empty">Carregando colaboradores...</p>';
    try {
      const profiles = await sbRequest('profiles?select=id,name,role&order=name.asc');
      if (!profiles.length) {
        D.registeredUsersList.innerHTML = '<p class="registered-users-empty">Nenhum colaborador cadastrado.</p>';
        return;
      }
      D.registeredUsersList.innerHTML = profiles
        .map(
          (profile) =>
            `<div class="registered-user">
              <span class="registered-user-name">${esc(profile.name)}</span>
            </div>`
        )
        .join('');
    } catch (error) {
      console.error(error);
      D.registeredUsersList.innerHTML = '<p class="registered-users-empty">Não foi possível carregar os colaboradores.</p>';
    }
  }

  async function openUserModal() {
    D.newUserName.value = '';
    D.newUserEmail.value = '';
    D.newUserPassword.value = '';
    D.userFormError.textContent = '';
    D.userModal.classList.add('active');
    await loadRegisteredUsers();
  }

  async function submitNewUser() {
    const name = D.newUserName.value.trim();
    const email = D.newUserEmail.value.trim();
    const password = D.newUserPassword.value;

    if (!name || !email || !password) {
      D.userFormError.textContent = 'Preencha todos os campos.';
      return;
    }
    if (password.length < 6) {
      D.userFormError.textContent = 'A senha precisa ter pelo menos 6 caracteres.';
      return;
    }

    D.btnSubmitUser.disabled = true;
    D.userFormError.textContent = '';
    try {
      await createUserByAdmin(name, email, password);
      D.userModal.classList.remove('active');
      await loadRegisteredUsers();
      toast('Colaborador cadastrado com sucesso!', 'success');
    } catch (error) {
      D.userFormError.textContent = error.message;
    } finally {
      D.btnSubmitUser.disabled = false;
    }
  }

  /* ═══════════════════════════════════════
     FILTERS
  ═══════════════════════════════════════ */
  function handleFilter(e) {
    document
      .querySelectorAll('.filter-btn')
      .forEach((b) => b.classList.remove('active', 'active-bug', 'active-improvement'));

    filter = e.currentTarget.dataset.filter;

    if (filter === 'all') e.currentTarget.classList.add('active');
    else if (filter === 'bug') e.currentTarget.classList.add('active-bug');
    else e.currentTarget.classList.add('active-improvement');

    renderBoard();
  }

  /* ═══════════════════════════════════════
     RENDER BOARD
  ═══════════════════════════════════════ */
  function renderBoard() {
    D.board.innerHTML = '';

    columns.forEach((col, idx) => {
      const all = tickets.filter((t) => t.status === col.id);
      const q = (searchQuery || '').trim().toLowerCase();
      const f = all.filter((ticket) => {
        const baseFilter =
          (filter === 'all' || ticket.type === filter) &&
          (moduleFilter === 'all' || ticket.module === moduleFilter) &&
          (clientFilter === 'all' || ticket.client === clientFilter);
        if (!baseFilter) return false;

        if (dateFrom || dateTo) {
          const ticketDate = new Date(ticket.createdAt);
          ticketDate.setHours(0, 0, 0, 0);
          if (dateFrom) {
            const from = new Date(dateFrom + 'T00:00:00');
            if (ticketDate < from) return false;
          }
          if (dateTo) {
            const to = new Date(dateTo + 'T23:59:59');
            if (ticketDate > to) return false;
          }
        }

        if (!q) return true;
        const fields = `${ticket.title || ''} ${ticket.description || ''} ${ticket.author || ''}`.toLowerCase();
        const words = q.split(/\s+/).filter(Boolean);
        return words.every((w) => fields.includes(w));
      });

      const el = document.createElement('div');
      el.className = 'column';
      el.style.animationDelay = idx * 0.05 + 's';
      el.innerHTML =
        colHeader(col, all.length) +
        `<div class="column-body" data-status="${col.id}"></div>`;
      D.board.appendChild(el);

      const body = el.querySelector('.column-body');
      renderBody(body, f);
      setupDrop(body);
      setupColumnDrag(el, col);
      bindColActs(el, col);
    });

    // Sempre mostra o botao de adicionar coluna
    const add = document.createElement('div');
    add.className = 'add-column-card';
    add.innerHTML = `
      <div class="add-column-inner">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <line x1="12" y1="8" x2="12" y2="16"/>
          <line x1="8" y1="12" x2="16" y2="12"/>
        </svg>
        <span>Adicionar Coluna</span>
      </div>`;
    add.addEventListener('click', openColNew);
    D.board.appendChild(add);

    renderStats();
  }

  function colHeader(c, n) {
    return `
      <div class="column-header">
        <div class="column-title-group">
          <div class="column-indicator" style="background:${c.color}"></div>
          <span class="column-title">${esc(c.name)}</span>
        </div>
        <span class="column-count">${n}</span>
        <div class="column-actions">
          <button class="col-action-btn edit-col" data-id="${c.id}" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
          <button class="col-action-btn delete delete-col" data-id="${c.id}" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M3 6h18"/>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>`;
  }

  function setupColumnDrag(element, column) {
    const header = element.querySelector('.column-header');
    header.draggable = true;
    header.title = 'Arraste para reorganizar a coluna';

    header.addEventListener('dragstart', (event) => {
      columnDragId = column.id;
      element.classList.add('column-dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', column.id);
    });

    header.addEventListener('dragend', () => {
      columnDragId = null;
      document.querySelectorAll('.column').forEach((item) => {
        item.classList.remove('column-dragging', 'column-drop-target');
      });
    });

    element.addEventListener('dragover', (event) => {
      if (!columnDragId || columnDragId === column.id) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      element.classList.add('column-drop-target');
    });

    element.addEventListener('dragleave', () => {
      element.classList.remove('column-drop-target');
    });

    element.addEventListener('drop', (event) => {
      event.preventDefault();
      element.classList.remove('column-drop-target');
      if (!columnDragId || columnDragId === column.id) return;

      const fromIndex = columns.findIndex((item) => item.id === columnDragId);
      const toIndex = columns.findIndex((item) => item.id === column.id);
      if (fromIndex < 0 || toIndex < 0) return;

      const [movedColumn] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, movedColumn);
      columns.forEach((item, index) => {
        item.position = index;
      });

      saveC()
        .then(() => toast('Ordem das colunas atualizada!', 'success'))
        .catch((error) => {
          console.error(error);
          toast('Não foi possível salvar a ordem das colunas.', 'error');
        });
      columnDragId = null;
      renderBoard();
    });
  }

  function renderBody(body, f) {
    if (!f.length) {
      body.innerHTML = `
        <div class="empty-column">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
          </svg>
          <p>Sem chamados aqui</p>
        </div>`;
      return;
    }

    f.forEach((t, i) => body.insertAdjacentHTML('beforeend', cardHTML(t, i)));

    body.querySelectorAll('.card').forEach((c) => {
      c.addEventListener('click', () => openDetail(c.dataset.id));
      // Drag sempre habilitado
      c.setAttribute('draggable', 'true');
      c.addEventListener('dragstart', onDragStart);
      c.addEventListener('dragend', onDragEnd);
    });
  }

  function cardHTML(t, i) {
    const d = new Date(t.createdAt).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    });
    const cc = (t.comments || []).length;
    const ac = (t.attachments || []).length;
    const attachIcon =
      ac > 0
        ? `<div class="card-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
            </svg>
            ${ac}
          </div>`
        : '';

    return `
      <div class="card" data-id="${t.id}" style="animation-delay:${i * 0.05}s">
        <div class="card-top">
          <span class="card-id">#${t.id}</span>
          <span class="card-type ${t.type}">${t.type === 'bug' ? 'Bug' : 'Melhoria'}</span>
        </div>
        <div class="card-title">${esc(t.title)}</div>
        <div class="card-module">${esc(t.module || 'Módulo não informado')}</div>
        <div class="card-module">${esc(t.client || 'Cliente não informado')}</div>
        <div class="card-desc">${esc(t.description)}</div>
        <div class="card-footer">
          <div class="card-meta">
            <div class="card-meta-item">
              <div class="card-priority ${t.priority}"></div>
              ${cap(t.priority)}
            </div>
            <div class="card-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              ${cc}
            </div>
            ${attachIcon}
            <div class="card-meta-item">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="3" y="4" width="18" height="18" rx="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${d}
            </div>
          </div>
          <span class="card-author">${esc(t.author)}</span>
        </div>
      </div>`;
  }

  function renderStats() {
    D.headerStats.innerHTML = columns
      .map((c) => {
        const n = tickets.filter((t) => t.status === c.id).length;
        return `<div class="stat-item">
          <div class="stat-dot" style="background:${c.color}"></div>
          ${esc(c.name)}
          <span class="stat-count">${n}</span>
        </div>`;
      })
      .join('');
  }

  function bindColActs(el, col) {
    el.querySelector('.edit-col')?.addEventListener('click', (e) => {
      e.stopPropagation();
      openColEdit(col.id);
    });
    el.querySelector('.delete-col')?.addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDel(col.id);
    });
  }

  /* ═══════════════════════════════════════
     DRAG & DROP
  ═══════════════════════════════════════ */
  function onDragStart(e) {
    dragId = e.currentTarget.dataset.id;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
  }

  function onDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document
      .querySelectorAll('.column-body')
      .forEach((c) => c.classList.remove('drag-over'));
    dragId = null;
  }

  function setupDrop(body) {
    body.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      body.classList.add('drag-over');
    });

    body.addEventListener('dragleave', () => {
      body.classList.remove('drag-over');
    });

    body.addEventListener('drop', (e) => {
      e.preventDefault();
      body.classList.remove('drag-over');
      if (!dragId) return;

      const ns = body.dataset.status;
      const t = tickets.find((x) => x.id === dragId);

      if (t && t.status !== ns) {
        t.status = ns;
        t.updatedAt = new Date().toISOString();
        saveSingleTicket(t);
        renderBoard();
        const colName = columns.find((c) => c.id === ns)?.name || ns;
        toast(`Chamado #${t.id} → "${colName}"`, 'success');
      }
    });
  }

  /* ═══════════════════════════════════════
     NEW TICKET
  ═══════════════════════════════════════ */
  function openNew() {
    selType = null;
    D.ticketTitle.value = '';
    D.ticketDesc.value = '';
    D.ticketModule.value = '';
    D.ticketClient.value = '';
    D.ticketPriority.value = 'media';
    D.typeBug.className = 'type-option';
    D.typeImprovement.className = 'type-option';
    pendingAttachments = [];
    D.attachPreviews.innerHTML = '';
    D.attachInput.value = '';
    D.newTicketModal.classList.add('active');
  }

  function selT(t) {
    selType = t;
    D.typeBug.className = t === 'bug' ? 'type-option selected-bug' : 'type-option';
    D.typeImprovement.className =
      t === 'improvement' ? 'type-option selected-improvement' : 'type-option';
  }

  function submitTk() {
    const title = D.ticketTitle.value.trim();
    const desc = D.ticketDesc.value.trim();
    const module = D.ticketModule.value;
    const client = D.ticketClient.value;
    const pri = D.ticketPriority.value;

    if (!selType) {
      toast('Selecione o tipo.', 'error');
      return;
    }
    if (!title) {
      toast('Informe um título.', 'error');
      return;
    }
    if (!desc) {
      toast('Informe uma descrição.', 'error');
      return;
    }
    if (!module) {
      toast('Selecione um módulo.', 'error');
      return;
    }
    if (!client) {
      toast('Selecione um cliente.', 'error');
      return;
    }

    D.btnSubmitTicket.disabled = true;
    D.btnSubmitTicket.textContent = 'Salvando...';

    const tk = {
      id: String(tkCtr++).padStart(3, '0'),
      type: selType,
      title,
      description: desc,
      module,
      client,
      priority: pri,
      status: columns[0]?.id || 'backlog',
      author: user.name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      comments: [],
      attachments: [...pendingAttachments],
    };

    tickets.unshift(tk);
    saveSingleTicket(tk)
      .then(() => saveAttachments(tk))
      .catch((error) => {
        console.error(error);
        toast('Não foi possível salvar o chamado no Supabase.', 'error');
      })
      .finally(() => {
        D.btnSubmitTicket.disabled = false;
        D.btnSubmitTicket.textContent = 'Criar Chamado';
      });
    renderBoard();
    D.newTicketModal.classList.remove('active');
    pendingAttachments = [];
    toast(`Chamado #${tk.id} criado!`, 'success');
  }

  /* ═══════════════════════════════════════
     EDIT TICKET
  ═══════════════════════════════════════ */
  function enterEditMode() {
    const t = tickets.find(x => x.id === tkId);
    if (!t) return;
    editMode = true;

    D.modalTitle.innerHTML = '';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.id = 'editTitle';
    titleInput.className = 'edit-input-title';
    titleInput.value = t.title;
    D.modalTitle.appendChild(titleInput);

    D.modalDescription.innerHTML = '';
    const descTa = document.createElement('textarea');
    descTa.id = 'editDesc';
    descTa.className = 'edit-textarea';
    descTa.value = t.description;
    D.modalDescription.appendChild(descTa);

    const col = columns.find(c => c.id === t.status);
    D.modalDetails.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Tipo</span>
        <div class="detail-value">
          <select id="editType" class="edit-select">
            <option value="bug" ${t.type === 'bug' ? 'selected' : ''}>🐛 Bug</option>
            <option value="improvement" ${t.type === 'improvement' ? 'selected' : ''}>✨ Melhoria</option>
          </select>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Prioridade</span>
        <div class="detail-value">
          <select id="editPriority" class="edit-select">
            <option value="baixa" ${t.priority === 'baixa' ? 'selected' : ''}>🟢 Baixa</option>
            <option value="media" ${t.priority === 'media' ? 'selected' : ''}>🟡 Média</option>
            <option value="alta" ${t.priority === 'alta' ? 'selected' : ''}>🔴 Alta</option>
          </select>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Módulo</span>
        <div class="detail-value">
          <select id="editModule" class="edit-select">
            <option value="">Selecione o módulo</option>
            ${generateOptions(MODULE_LIST, t.module)}
          </select>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Cliente</span>
        <div class="detail-value">
          <select id="editClient" class="edit-select">
            <option value="">Selecione o cliente</option>
            ${generateOptions(CLIENT_LIST, t.client)}
          </select>
        </div>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status</span>
        <span class="detail-value">${esc(col?.name || t.status)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Criado por</span>
        <span class="detail-value">${esc(t.author)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Criado em</span>
        <span class="detail-value">${new Date(t.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Atualizado em</span>
        <span class="detail-value">${new Date(t.updatedAt).toLocaleString('pt-BR')}</span>
      </div>
    `;

    let editActions = document.getElementById('editActions');
    if (editActions) editActions.remove();
    editActions = document.createElement('div');
    editActions.className = 'edit-actions';
    editActions.id = 'editActions';
    editActions.innerHTML = `
      <button class="btn-edit-cancel" id="btnEditCancel">Cancelar</button>
      <button class="btn-edit-save" id="btnEditSave">Salvar Alterações</button>
    `;
    D.modalDetails.after(editActions);

    document.getElementById('btnEditSave').addEventListener('click', saveTicketEdit);
    document.getElementById('btnEditCancel').addEventListener('click', () => openDetail(tkId));

    if (D.btnEditTicket) D.btnEditTicket.style.display = 'none';
    if (D.btnDeleteTicket) D.btnDeleteTicket.style.display = 'none';
    const shareBtn = D.detailModal.querySelector('.btn-share-ticket');
    if (shareBtn) shareBtn.style.display = 'none';       

    titleInput.focus();
    titleInput.select();
  }

  function saveTicketEdit() {
    const t = tickets.find(x => x.id === tkId);
    if (!t) return;

    const titleEl = document.getElementById('editTitle');
    const descEl = document.getElementById('editDesc');
    const typeEl = document.getElementById('editType');
    const priorityEl = document.getElementById('editPriority');
    const moduleEl = document.getElementById('editModule');
    const clientEl = document.getElementById('editClient');

    const title = titleEl.value.trim();
    const desc = descEl.value.trim();

    if (!title) { toast('Informe um título.', 'error'); titleEl.focus(); return; }
    if (!desc) { toast('Informe uma descrição.', 'error'); descEl.focus(); return; }
    if (!moduleEl.value) { toast('Selecione um módulo.', 'error'); moduleEl.focus(); return; }
    if (!clientEl.value) { toast('Selecione um cliente.', 'error'); clientEl.focus(); return; }

    t.title = title;
    t.description = desc;
    t.type = typeEl.value;
    t.priority = priorityEl.value;
    t.module = moduleEl.value;
    t.client = clientEl.value;
    t.updatedAt = new Date().toISOString();

    const saveBtn = document.getElementById('btnEditSave');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Salvando...';

    saveSingleTicket(t)
      .then(() => {
        toast('Chamado atualizado com sucesso!', 'success');
        renderBoard();
        openDetail(tkId);
      })
      .catch(err => {
        console.error(err);
        toast('Erro ao salvar alterações.', 'error');
      })
      .finally(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Salvar Alterações';
      });
  }

  /* ═══════════════════════════════════════
     DELETE TICKET
  ═══════════════════════════════════════ */
  function confirmDeleteTicket() {
    const t = tickets.find(x => x.id === tkId);
    if (!t) return;

    deleteTicketId = tkId;
    deleteCommentId = null;

    D.confirmTitle.textContent = `Excluir chamado #${t.id}?`;
    D.confirmText.textContent = `Tem certeza que deseja excluir "${t.title}"? Esta ação não pode ser desfeita.`;
    D.confirmOk.textContent = 'Excluir';
    D.confirmOk.className = 'btn-confirm-delete';

    D.confirmDialog.classList.add('active');
  }

  async function handleDeleteTicket() {
    if (!deleteTicketId) return;

    const id = deleteTicketId;
    const t = tickets.find(x => x.id === id);
    const title = t?.title || id;

    tickets = tickets.filter(x => x.id !== id);

    D.confirmDialog.classList.remove('active');
    D.detailModal.classList.remove('active');
    clearTicketHash();

    renderBoard();
    deleteTicketId = null;
    toast(`Chamado #${id} "${title}" excluído.`, 'info');

    try {
      await deleteTicketFromDB(id);
    } catch (error) {
      console.error('Erro ao excluir do Supabase:', error);
      toast('Erro ao excluir do servidor. Recarregue a página.', 'error');
    }
  }

  /* ═══════════════════════════════════════
     DETAIL MODAL
  ═══════════════════════════════════════ */
  async function openDetail(id) {
    tkId = id;
    editMode = false;
    editingCommentId = null;
    deleteTicketId = null;
    deleteCommentId = null;
    const t = tickets.find((x) => x.id === id);
if (!t) return;

// ── Link compartilhável ──
setTicketHash(id);
addShareButtonToModal(id);

    const col = columns.find((c) => c.id === t.status);

    D.modalId.textContent = `#${t.id}`;
    D.modalTitle.textContent = t.title;
    D.modalDescription.textContent = t.description;

    D.modalDetails.innerHTML = `
      <div class="detail-item">
        <span class="detail-label">Tipo</span>
        <span class="detail-value">
          <span class="card-type ${t.type}">${t.type === 'bug' ? 'Bug' : 'Melhoria'}</span>
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Prioridade</span>
        <span class="detail-value">
          <div class="card-priority ${t.priority}"></div> ${cap(t.priority)}
        </span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Módulo</span>
        <span class="detail-value">${esc(t.module || 'Não informado')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Cliente</span>
        <span class="detail-value">${esc(t.client || 'Não informado')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Status</span>
        <span class="detail-value">${esc(col?.name || t.status)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Criado por</span>
        <span class="detail-value">${esc(t.author)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Criado em</span>
        <span class="detail-value">${new Date(t.createdAt).toLocaleString('pt-BR')}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Atualizado em</span>
        <span class="detail-value">${new Date(t.updatedAt).toLocaleString('pt-BR')}</span>
      </div>`;

    const oldActions = document.getElementById('editActions');
    if (oldActions) oldActions.remove();

    // Sempre mostra editar e excluir
    if (D.btnEditTicket) D.btnEditTicket.style.display = 'flex';
    if (D.btnDeleteTicket) D.btnDeleteTicket.style.display = 'flex';
    // Mostrar botão de compartilhar
    const shareBtn = D.detailModal.querySelector('.btn-share-ticket');
    if (shareBtn) shareBtn.style.display = 'flex';

    D.attachSection.style.display = 'block';
    D.attachGrid.innerHTML = '<p style="font-size:0.85rem;color:var(--text-muted)">Carregando anexos...</p>';

    try {
      const allAttachments = await sbRequest(
        `attachments?ticket_id=eq.${id}&select=id,ticket_id,comment_id,name,url`
      );

      t.attachments = allAttachments
        .filter((a) => !a.comment_id)
        .map((a) => ({ name: a.name, data: a.url }));

      if (t.comments) {
        t.comments.forEach((comment) => {
          comment.attachments = allAttachments
            .filter((a) => a.comment_id === comment.id)
            .map((a) => ({ name: a.name, data: a.url }));
        });
      }
    } catch (error) {
      console.error('Erro ao carregar anexos:', error);
    }

    if (t.attachments && t.attachments.length > 0) {
      D.attachSection.style.display = 'block';
      D.attachGrid.innerHTML = t.attachments
        .map(
          (a, i) =>
            `<div class="attach-thumb" data-idx="${i}">
              <img src="${a.data}" alt="${esc(a.name)}">
            </div>`
        )
        .join('');

      D.attachGrid.querySelectorAll('.attach-thumb').forEach((th) => {
        th.addEventListener('click', () => {
          openLightbox(t.attachments[parseInt(th.dataset.idx)].data);
        });
      });
    } else {
      D.attachSection.style.display = 'none';
      D.attachGrid.innerHTML = '';
    }

    // Sempre mostra os botoes de status
    D.adminControls.classList.add('visible');
    D.statusButtons.innerHTML = columns
      .map((c) => {
        const cur = t.status === c.id;
        return `<button class="status-btn ${cur ? 'current' : ''}" data-status="${c.id}"
          style="${cur ? `border-color:${c.color};color:${c.color};background:${c.color}20` : ''}">
          ${esc(c.name)}
        </button>`;
      })
      .join('');

    D.statusButtons.querySelectorAll('.status-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const ns = btn.dataset.status;
        if (t.status !== ns) {
          t.status = ns;
          t.updatedAt = new Date().toISOString();
          saveSingleTicket(t);
          renderBoard();
          openDetail(id);
          const cn = columns.find((c) => c.id === ns)?.name || ns;
          toast(`Status → "${cn}"`, 'success');
        }
      });
    });

    renderComments(t);
    D.detailModal.classList.add('active');
  }

  /* ═══════════════════════════════════════
     LIGHTBOX
  ═══════════════════════════════════════ */
  function openLightbox(src) {
    if (!D.lightbox || !D.lightboxImg) return;
    D.lightboxImg.src = src;
    D.lightbox.classList.add('active');
  }

  function closeLightbox() {
    D.lightbox.classList.remove('active');
    D.lightboxImg.src = '';
  }

  /* ═══════════════════════════════════════
     COMMENTS
  ═══════════════════════════════════════ */
  function renderComments(t) {
    if (!t.comments || !t.comments.length) {
      D.commentsList.innerHTML =
        '<p style="font-size:0.85rem;color:var(--text-muted);text-align:center;padding:16px 0;">Nenhum comentário ainda.</p>';
      return;
    }

    D.commentsList.innerHTML = t.comments
      .map((c, cIdx) => {
        const ini = c.author
          .split(' ')
          .map((w) => w[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        const time = new Date(c.createdAt).toLocaleString('pt-BR', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        });

        const isEditing = String(editingCommentId) === String(c.id);

        // Sempre mostra botoes de editar/excluir
        const actionsHTML = !isEditing
          ? `<div class="comment-actions">
              <button class="comment-action-btn comment-edit-btn" data-cid="${c.id}" title="Editar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                </svg>
              </button>
              <button class="comment-action-btn comment-delete-btn" data-cid="${c.id}" title="Excluir">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M3 6h18"/>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                </svg>
              </button>
            </div>`
          : '';

        const textHTML = isEditing
          ? `<div class="comment-edit-area">
              <textarea class="comment-edit-textarea" data-cid="${c.id}">${esc(c.text)}</textarea>
              <div class="comment-edit-actions">
                <button class="btn-comment-edit-cancel" data-cid="${c.id}">Cancelar</button>
                <button class="btn-comment-edit-save" data-cid="${c.id}">Salvar</button>
              </div>
            </div>`
          : `<p class="comment-text">${esc(c.text)}</p>`;

        return `
          <div class="comment ${isEditing ? 'comment-editing' : ''}">
            <div class="comment-avatar">${ini}</div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">${esc(c.author)}</span>
                <span class="comment-time">${time}</span>
                ${actionsHTML}
              </div>
              ${textHTML}
              ${
                c.attachments?.length && !isEditing
                  ? `<div class="comment-attachments">${c.attachments
                      .map(
                        (attachment, attachmentIndex) =>
                          `<img src="${attachment.data}" alt="${esc(attachment.name)}" title="${esc(attachment.name)}" data-comment-index="${cIdx}" data-attachment-index="${attachmentIndex}">`
                      )
                      .join('')}</div>`
                  : ''
              }
            </div>
          </div>`;
      })
      .join('');

    D.commentsList.querySelectorAll('[data-comment-index]').forEach((image) => {
      image.addEventListener('click', () => {
        const comment = t.comments[parseInt(image.dataset.commentIndex, 10)];
        const attachment = comment?.attachments?.[parseInt(image.dataset.attachmentIndex, 10)];
        if (attachment) openLightbox(attachment.data);
      });
    });

    const editTa = D.commentsList.querySelector('.comment-edit-textarea');
    if (editTa) {
      editTa.focus();
      editTa.setSelectionRange(editTa.value.length, editTa.value.length);
      editTa.style.height = 'auto';
      editTa.style.height = Math.min(editTa.scrollHeight, 150) + 'px';
      editTa.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 150) + 'px';
      });
      editTa.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveCommentEdit(editTa.dataset.cid);
        }
        if (e.key === 'Escape') {
          editingCommentId = null;
          const tk = tickets.find(x => x.id === tkId);
          if (tk) renderComments(tk);
        }
      });
    }
  }

  function setupCommentDelegation() {
    D.commentsList.addEventListener('click', (e) => {
      const editBtn = e.target.closest('.comment-edit-btn');
      const deleteBtn = e.target.closest('.comment-delete-btn');
      const saveBtn = e.target.closest('.btn-comment-edit-save');
      const cancelBtn = e.target.closest('.btn-comment-edit-cancel');

      if (editBtn) {
        e.preventDefault();
        e.stopPropagation();
        startEditComment(editBtn.dataset.cid);
      } else if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        confirmDeleteComment(deleteBtn.dataset.cid);
      } else if (saveBtn) {
        e.preventDefault();
        e.stopPropagation();
        saveCommentEdit(saveBtn.dataset.cid);
      } else if (cancelBtn) {
        e.preventDefault();
        e.stopPropagation();
        editingCommentId = null;
        const t = tickets.find(x => x.id === tkId);
        if (t) renderComments(t);
      }
    });
  }

  function startEditComment(commentId) {
    editingCommentId = String(commentId);
    const t = tickets.find(x => x.id === tkId);
    if (t) renderComments(t);
  }

  function saveCommentEdit(commentId) {
    const t = tickets.find(x => x.id === tkId);
    if (!t) return;

    const comment = t.comments.find(c => String(c.id) === String(commentId));
    if (!comment) {
      console.error('[EDIT] Comentário não encontrado:', commentId);
      toast('Comentário não encontrado.', 'error');
      return;
    }

    const textarea = D.commentsList.querySelector('.comment-edit-textarea');
    if (!textarea) return;

    const newText = textarea.value.trim();
    if (!newText) {
      toast('O comentário não pode ficar vazio.', 'error');
      textarea.focus();
      return;
    }

    if (newText === comment.text) {
      editingCommentId = null;
      renderComments(t);
      return;
    }

    comment.text = newText;
    editingCommentId = null;

    updateCommentInDB(commentId, newText)
      .then(() => toast('Comentário atualizado!', 'success'))
      .catch(err => {
        console.error(err);
        toast('Erro ao atualizar no servidor.', 'error');
      });

    renderComments(t);
    renderBoard();
  }

  function confirmDeleteComment(commentId) {
    const t = tickets.find(x => x.id === tkId);
    if (!t) return;

    const comment = t.comments.find(c => String(c.id) === String(commentId));
    if (!comment) {
      console.error('[DELETE] Comentário não encontrado:', commentId);
      return;
    }

    deleteCommentId = String(commentId);
    deleteTicketId = null;
    delColId = null;

    D.confirmTitle.textContent = 'Excluir comentário?';
    D.confirmText.textContent = `Comentário de ${comment.author}: "${comment.text.substring(0, 80)}${comment.text.length > 80 ? '...' : ''}"`;
    D.confirmOk.textContent = 'Excluir';
    D.confirmOk.className = 'btn-confirm-delete';

    D.confirmDialog.classList.add('active');
  }

  async function handleDeleteComment() {
    if (!deleteCommentId) return;

    const t = tickets.find(x => x.id === tkId);
    if (!t) return;

    const commentId = deleteCommentId;
    const commentIdx = t.comments.findIndex(c => String(c.id) === String(commentId));
    if (commentIdx < 0) {
      console.error('[DELETE] Comentário não encontrado no array:', commentId);
      D.confirmDialog.classList.remove('active');
      deleteCommentId = null;
      return;
    }

    t.comments.splice(commentIdx, 1);
    t.updatedAt = new Date().toISOString();

    D.confirmDialog.classList.remove('active');
    deleteCommentId = null;

    renderComments(t);
    renderBoard();
    toast('Comentário excluído.', 'info');

    try {
      await deleteCommentFromDB(commentId);
      await saveSingleTicket(t);
    } catch (error) {
      console.error('Erro ao excluir comentário do Supabase:', error);
      toast('Erro ao excluir do servidor. Recarregue a página.', 'error');
    }
  }

  function submitComment() {
    const text = D.commentInput.value.trim();
    if (!text || !tkId) return;

    const t = tickets.find((x) => x.id === tkId);
    if (!t) return;

    if (!t.comments) t.comments = [];

    const newCommentData = {
      id: 'temp_' + Date.now(),
      author: user.name,
      text,
      createdAt: new Date().toISOString(),
      attachments: [...pendingCommentAttachments],
    };

    t.comments.push(newCommentData);
    t.updatedAt = new Date().toISOString();

    saveComment(t, newCommentData)
      .then((savedComment) => {
        if (savedComment && savedComment.id) {
          newCommentData.id = savedComment.id;
        }
        return saveSingleTicket(t);
      })
      .catch((error) => {
        console.error(error);
        toast('Não foi possível salvar o comentário no Supabase.', 'error');
      });

    renderComments(t);
    renderBoard();

    D.commentInput.value = '';
    D.commentInput.style.height = 'auto';
    pendingCommentAttachments = [];
    D.commentAttachInput.value = '';
    D.commentAttachPreviews.innerHTML = '';
    toast('Comentário adicionado!', 'success');
  }

  /* ═══════════════════════════════════════
     COLUMN MODAL
  ═══════════════════════════════════════ */
  function openColNew() {
    editColId = null;
    selColor = COLORS[1].hex;
    D.columnModalTitle.textContent = 'Nova Coluna';
    D.columnName.value = '';
    D.btnSubmitColumn.textContent = 'Criar Coluna';
    renderPicker();
    D.columnModal.classList.add('active');
  }

  function openColEdit(id) {
    const c = columns.find((x) => x.id === id);
    if (!c) return;
    editColId = id;
    selColor = c.color;
    D.columnModalTitle.textContent = 'Editar Coluna';
    D.columnName.value = c.name;
    D.btnSubmitColumn.textContent = 'Salvar Alterações';
    renderPicker();
    D.columnModal.classList.add('active');
  }

  function renderPicker() {
    D.colorPicker.innerHTML = COLORS.map(
      (c) =>
        `<div class="color-swatch ${c.hex === selColor ? 'selected' : ''}"
          data-color="${c.hex}" style="background:${c.hex}"></div>`
    ).join('');

    D.colorPicker.querySelectorAll('.color-swatch').forEach((s) => {
      s.addEventListener('click', () => {
        selColor = s.dataset.color;
        D.colorPicker
          .querySelectorAll('.color-swatch')
          .forEach((x) => x.classList.remove('selected'));
        s.classList.add('selected');
      });
    });
  }

  function submitCol() {
    const name = D.columnName.value.trim();

    if (!name) {
      toast('Informe o nome.', 'error');
      return;
    }
    if (!selColor) {
      toast('Selecione uma cor.', 'error');
      return;
    }

    if (editColId) {
      const c = columns.find((x) => x.id === editColId);
      if (c) {
        c.name = name;
        c.color = selColor;
        saveC();
        renderBoard();
        toast(`"${name}" atualizada!`, 'success');
      }
    } else {
      columns.push({ id: genId(), name, color: selColor, position: columns.length });
      saveC();
      renderBoard();
      toast(`"${name}" criada!`, 'success');
    }

    D.columnModal.classList.remove('active');
  }

  /* ═══════════════════════════════════════
     DELETE COLUMN
  ═══════════════════════════════════════ */
  function confirmDel(id) {
    const c = columns.find((x) => x.id === id);
    if (!c) return;

    const n = tickets.filter((t) => t.status === id).length;
    delColId = id;
    deleteTicketId = null;
    deleteCommentId = null;

    D.confirmTitle.textContent = `Excluir "${c.name}"?`;
    D.confirmText.textContent =
      n > 0
        ? `Coluna com ${n} chamado(s). Eles serão movidos para a primeira coluna.`
        : 'Ação irreversível.';

    D.confirmOk.textContent = 'Excluir';
    D.confirmOk.className = 'btn-confirm-delete';

    D.confirmDialog.classList.add('active');
  }

  function handleDel() {
    if (!delColId) return;

    const id = delColId;
    const c = columns.find((x) => x.id === id);
    const name = c?.name || id;
    const rem = columns.filter((x) => x.id !== id);
    const fb = rem[0]?.id || 'backlog';

    tickets.forEach((t) => {
      if (t.status === id) {
        t.status = fb;
        t.updatedAt = new Date().toISOString();
      }
    });

    columns = columns.filter((x) => x.id !== id);
    saveC();
    saveT();
    renderBoard();

    D.confirmDialog.classList.remove('active');
    delColId = null;
    toast(`"${name}" excluída.`, 'info');
  }


  /* ═══════════════════════════════════════
   SHAREABLE TICKET LINK
═══════════════════════════════════════ */
function getTicketUrl(id) {
  return `${window.location.origin}${window.location.pathname}#ticket/${id}`;
}

function setTicketHash(id) {
  history.replaceState(null, '', `#ticket/${id}`);
}

function clearTicketHash() {
  if (window.location.hash.startsWith('#ticket/')) {
    history.replaceState(null, '', window.location.pathname);
  }
}

function copyTicketLink(id) {
  const url = getTicketUrl(id);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => toast('Link copiado para a área de transferência!', 'success'))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;opacity:0;left:-9999px';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    toast('Link copiado!', 'success');
  } catch {
    prompt('Copie o link do chamado:', text);
  }
  ta.remove();
}

function handleTicketHash() {
  const hash = window.location.hash;
  if (!hash || !hash.startsWith('#ticket/')) return false;

  const ticketId = hash.replace('#ticket/', '');
  const ticket = tickets.find(t => String(t.id) === ticketId);

  if (ticket) {
    setTimeout(() => openDetail(ticketId), 250);
    return true;
  }

  toast('Chamado #' + ticketId + ' não encontrado.', 'error');
  clearTicketHash();
  return false;
}

function addShareButtonToModal(ticketId) {
  // Remove botão anterior se existir
  const existing = D.detailModal.querySelector('.btn-share-ticket');
  if (existing) existing.remove();

  const shareBtn = document.createElement('button');
  shareBtn.className = 'btn-share-ticket';
  shareBtn.title = 'Copiar link do chamado';
  shareBtn.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>`;
  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    copyTicketLink(ticketId);
  });

  // Insere antes do botão de fechar
  if (D.modalClose && D.modalClose.parentElement) {
    D.modalClose.parentElement.insertBefore(shareBtn, D.modalClose);
  }
}

  /* ═══════════════════════════════════════
     EVENTS
  ═══════════════════════════════════════ */
  function exportCSV() {
    if (!tickets.length) {
      toast('Nenhum chamado para exportar.', 'error');
      return;
    }

    const headers = [
      'ID', 'Tipo', 'Título', 'Descrição', 'Módulo', 'Cliente',
      'Prioridade', 'Status', 'Autor', 'Criado em', 'Atualizado em',
      'Comentários', 'Anexos'
    ];

    const rows = tickets.map((t) => {
      const col = columns.find((c) => c.id === t.status);
      const statusName = col?.name || t.status;
      const typeName = t.type === 'bug' ? 'Bug' : 'Melhoria';
      const commentsCount = (t.comments || []).length;
      const attachmentsCount = (t.attachments || []).length;

      return [
        t.id,
        typeName,
        t.title,
        t.description,
        t.module || '',
        t.client || '',
        t.priority,
        statusName,
        t.author,
        new Date(t.createdAt).toLocaleString('pt-BR'),
        new Date(t.updatedAt).toLocaleString('pt-BR'),
        commentsCount,
        attachmentsCount,
      ];
    });

    function escapeCSV(val) {
      const str = String(val ?? '');
      if (str.includes('"') || str.includes(';') || str.includes('\n')) {
        return '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    }

    const csvContent =
      '\uFEFF' +
      headers.join(';') + '\n' +
      rows.map((row) => row.map(escapeCSV).join(';')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    link.href = url;
    link.download = `toolk-tasks-${date}.csv`;
    link.click();

    URL.revokeObjectURL(url);
    toast(`Exportado ${tickets.length} chamado(s)!`, 'success');
  }

      function bind() {
    applyTheme(localStorage.getItem(SK.theme) || 'dark');

    // ═══ Login ═══
    D.btnLogin.addEventListener('click', async () => {
  const email = D.loginName.value.trim();
  const password = D.loginPassword.value;

  try {
    await signIn(email, password);
    
    // Recarrega a página automaticamente após salvar a sessão no localStorage
    window.location.reload();

  } catch (err) {
    D.loginError.textContent = err.message;
  }
});
    D.loginName.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
    D.loginPassword.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });

    // ═══ Forgot password ═══
    D.forgotPasswordLink?.addEventListener('click', (e) => {
      e.preventDefault();
      D.loginForm.classList.add('hidden');
      D.recoveryForm.classList.remove('hidden');
      D.recoveryEmail.focus();
    });

    D.backToLogin?.addEventListener('click', (e) => {
      e.preventDefault();
      D.recoveryForm.classList.add('hidden');
      D.loginForm.classList.remove('hidden');
      D.recoveryMessage.textContent = '';
      D.loginName.focus();
    });

    D.btnSendRecovery?.addEventListener('click', sendRecoveryEmail);
    D.recoveryEmail?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendRecoveryEmail();
    });

    // ═══ Reset password (callback do email) ═══
    D.btnResetPassword?.addEventListener('click', resetPassword);
    D.resetNewPassword?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') D.resetConfirmPassword?.focus();
    });
    D.resetConfirmPassword?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') resetPassword();
    });

    // ═══ Change password (usuario logado) ═══
    D.btnChangePassword?.addEventListener('click', openChangePasswordModal);
    D.changePasswordClose?.addEventListener('click', () => {
      D.changePasswordModal.classList.remove('active');
    });
    D.btnSavePassword?.addEventListener('click', saveNewPassword);
    D.changeNewPassword?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') D.changeConfirmPassword?.focus();
    });
    D.changeConfirmPassword?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveNewPassword();
    });
    D.changePasswordModal?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) D.changePasswordModal.classList.remove('active');
    });

    // ═══ User dropdown menu ═══
    D.userMenuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      D.userMenuWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!D.userMenuWrapper.contains(e.target)) {
        D.userMenuWrapper.classList.remove('open');
      }
    });

    D.userDropdown.querySelectorAll('.dropdown-item').forEach((item) => {
      item.addEventListener('click', () => {
        D.userMenuWrapper.classList.remove('open');
      });
    });

    // Theme toggle via dropdown
    D.dropdownThemeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(SK.theme, nextTheme);
      applyTheme(nextTheme);
      updateThemeLabel();
    });

    // Colaboradores via dropdown
    D.dropdownManageUsers.addEventListener('click', openUserModal);

    // Colunas via dropdown
    D.dropdownManageColumns.addEventListener('click', openColNew);

    // Exportar via dropdown
    D.dropdownExport.addEventListener('click', exportCSV);

    // Logout via dropdown
    D.dropdownLogout.addEventListener('click', async () => {
      await signOut();
      user = null;
      authSession = null;
      D.app.classList.remove('active');
      D.loginScreen.classList.remove('hidden');
      D.loginName.value = '';
      D.loginPassword.value = '';
    });

    // ═══ Toolbar ═══
    D.btnNewTicket.addEventListener('click', openNew);
    D.userModalClose.addEventListener('click', () => D.userModal.classList.remove('active'));
    D.btnSubmitUser.addEventListener('click', submitNewUser);

    // ═══ Filters ═══
    document.querySelectorAll('.filter-btn').forEach((b) => b.addEventListener('click', handleFilter));
    D.moduleFilter.addEventListener('change', (e) => { moduleFilter = e.target.value; renderBoard(); });
    D.clientFilter.addEventListener('change', (e) => { clientFilter = e.target.value; renderBoard(); });

    // ═══ Search ═══
    if (D.searchInput) {
      D.searchInput.addEventListener('input', (e) => { searchQuery = e.target.value; renderBoard(); });
      D.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { searchQuery = ''; D.searchInput.value = ''; renderBoard(); }
      });
    }
    if (D.searchClear) {
      D.searchClear.addEventListener('click', () => {
        searchQuery = '';
        if (D.searchInput) D.searchInput.value = '';
        if (D.searchInput) D.searchInput.focus();
        renderBoard();
      });
    }

    // ═══ Date filter ═══
    if (D.dateFrom) {
      D.dateFrom.addEventListener('change', (e) => { dateFrom = e.target.value; renderBoard(); });
    }
    if (D.dateTo) {
      D.dateTo.addEventListener('change', (e) => { dateTo = e.target.value; renderBoard(); });
    }

    // ═══ Limpar TODOS os filtros ═══
    if (D.clearAllFilters) {
      D.clearAllFilters.addEventListener('click', () => {
        filter = 'all';
        moduleFilter = 'all';
        clientFilter = 'all';
        searchQuery = '';
        dateFrom = '';
        dateTo = '';

        document.querySelectorAll('.filter-btn').forEach((b) => {
          b.classList.remove('active', 'active-bug', 'active-improvement');
        });
        document.querySelector('.filter-btn[data-filter="all"]')?.classList.add('active');

        if (D.moduleFilter) D.moduleFilter.value = 'all';
        if (D.clientFilter) D.clientFilter.value = 'all';
        if (D.searchInput) D.searchInput.value = '';
        if (D.dateFrom) D.dateFrom.value = '';
        if (D.dateTo) D.dateTo.value = '';

        renderBoard();
        toast('Filtros limpos!', 'success');
      });
    }

    // ═══ Detail modal ═══
    D.modalClose.addEventListener('click', () => {
  D.detailModal.classList.remove('active');
  clearTicketHash();
});
    if (D.btnEditTicket) D.btnEditTicket.addEventListener('click', enterEditMode);
    if (D.btnDeleteTicket) D.btnDeleteTicket.addEventListener('click', confirmDeleteTicket);

    // ═══ Comments ═══
    setupCommentDelegation();

    D.btnSendComment.addEventListener('click', submitComment);
    D.commentAttachInput.addEventListener('change', () => {
      processFiles(D.commentAttachInput.files, pendingCommentAttachments, renderCommentAttachPreviews);
      D.commentAttachInput.value = '';
    });
    D.commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(); }
    });
    D.commentInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // ═══ New ticket modal ═══
    D.newTicketClose.addEventListener('click', () => D.newTicketModal.classList.remove('active'));
    D.typeBug.addEventListener('click', () => selT('bug'));
    D.typeImprovement.addEventListener('click', () => selT('improvement'));
    D.btnSubmitTicket.addEventListener('click', submitTk);

    // ═══ Column modal ═══
    D.columnModalClose.addEventListener('click', () => D.columnModal.classList.remove('active'));
    D.btnSubmitColumn.addEventListener('click', submitCol);

    // ═══ Confirm dialog ═══
    D.confirmCancel.addEventListener('click', () => {
      D.confirmDialog.classList.remove('active');
      delColId = null;
      deleteTicketId = null;
      deleteCommentId = null;
    });
    D.confirmOk.addEventListener('click', () => {
      if (deleteCommentId) handleDeleteComment();
      else if (deleteTicketId) handleDeleteTicket();
      else if (delColId) handleDel();
    });

    // ═══ Lightbox ═══
    D.lightbox.addEventListener('click', (e) => { if (e.target === D.lightbox) closeLightbox(); });
    D.lightboxClose.addEventListener('click', closeLightbox);

    // ═══ Close modals on overlay ═══
    [D.detailModal, D.newTicketModal, D.columnModal].forEach((m) => {
  m.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      m.classList.remove('active');
      if (m === D.detailModal) clearTicketHash();
    }
  });
});

    // ═══ Attachment zone ═══
    setupAttachZone();
  }

  /* ═══════════════════════════════════════
     BOOT
  ═══════════════════════════════════════ */
    async function boot() {
    bind();

    // Checa se veio do link de redefinicao de senha
    const isRecovery = await handleRecoveryCallback();

    var ls = document.getElementById('loadingScreen');
    if (ls) ls.remove();

    if (isRecovery) return; // Tela de redefinicao ja esta visivel

    // Fluxo normal
    let hasSession = false;
    try {
      hasSession = await restoreSession();
    } catch (e) {}

    if (hasSession) {
      try {
        await load();
      } catch (e) {}
    }

    if (hasSession) {
      D.loginScreen.classList.add('hidden');
      D.app.classList.add('active');
      setupUI();
      renderBoard();
      handleTicketHash();
    } else {
      D.loginScreen.classList.remove('hidden');
    }
  }
  boot();

})();