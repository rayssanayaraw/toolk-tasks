/**
 * ═══════════════════════════════════════
 *  TaskFlow — Sistema de Chamados
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
    moduleFilter: $('moduleFilter'),
    clientFilter: $('clientFilter'),
    searchInput: $('searchInput'),
    searchClear: $('searchClear'),
    board: $('board'),
    detailModal: $('detailModal'),
    modalId: $('modalId'),
    modalTitle: $('modalTitle'),
    modalDescription: $('modalDescription'),
    modalDetails: $('modalDetails'),
    modalClose: $('modalClose'),
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
    D.themeToggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    D.themeToggle.setAttribute('title', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
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

      user = { name: profile.name, role: profile.role };
      return true;
    } catch (error) {
      console.error(error);
      authSession = null;
      user = null;
      localStorage.removeItem(SK.authSession);
      return false;
    }
  }

  async function createUserByAdmin(name, email, password, role) {
    const response = await fetch(`${SB_FUNCTIONS_API}/create-user`, {
      method: 'POST',
      headers: {
        apikey: SB_KEY,
        Authorization: `Bearer ${authSession.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, role }),
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
        authorRole: ticket.author_role,
        createdAt: ticket.created_at,
        updatedAt: ticket.updated_at,
        comments: remoteComments
          .filter((comment) => comment.ticket_id === ticket.id)
          .map((comment) => ({
            id: comment.id,
            author: comment.author,
            role: comment.role,
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
          author_role: ticket.authorRole,
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
        author_role: ticket.authorRole,
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
    if (!ticket.attachments?.length) {
      console.log('[ATTACH] Sem anexos para salvar');
      return;
    }

    console.log('[ATTACH] Iniciando upload de', ticket.attachments.length, 'anexo(s)');

    for (const attachment of ticket.attachments) {
      let url = attachment.data;

      if (attachment.file) {
        console.log('[ATTACH] Fazendo upload do arquivo:', attachment.name);
        try {
          url = await uploadToStorage(attachment.file, `tickets/${ticket.id}`);
          console.log('[ATTACH] Upload OK, URL:', url);
        } catch (err) {
          console.error('[ATTACH] Upload FALHOU:', err);
          toast('Erro no upload da imagem: ' + err.message, 'error');
          continue;
        }
      }

      console.log('[ATTACH] Salvando no banco:', { ticket_id: ticket.id, name: attachment.name, url });
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
        console.log('[ATTACH] Salvo no banco OK');
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
        role: comment.role,
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

      user = { name: profile.name, role: profile.role };
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
    setupUI();
    renderBoard();
  }

  function setupUI() {
    const ini = user.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    D.userAvatar.textContent = ini;
    D.userAvatar.className = 'user-avatar ' + user.role;
    D.userName.textContent = user.name;
    D.roleTag.textContent = user.role === 'admin' ? 'Admin' : 'Usuário';
    D.roleTag.className = 'role-tag ' + user.role;
    D.btnManageColumns.style.display = user.role === 'admin' ? 'flex' : 'none';
    D.btnManageUsers.style.display = user.role === 'admin' ? 'flex' : 'none';
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
              <span class="role-tag ${profile.role}">${profile.role === 'admin' ? 'Admin' : 'Usuário'}</span>
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
    D.newUserRole.value = 'user';
    D.userFormError.textContent = '';
    D.userModal.classList.add('active');
    await loadRegisteredUsers();
  }

  async function submitNewUser() {
    const name = D.newUserName.value.trim();
    const email = D.newUserEmail.value.trim();
    const password = D.newUserPassword.value;
    const role = D.newUserRole.value;

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
      await createUserByAdmin(name, email, password, role);
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

    if (user.role === 'admin') {
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
    }

    renderStats();
  }

  function colHeader(c, n) {
    const a = user.role === 'admin';
    return `
      <div class="column-header">
        <div class="column-title-group">
          <div class="column-indicator" style="background:${c.color}"></div>
          <span class="column-title">${esc(c.name)}</span>
        </div>
        <span class="column-count">${n}</span>
        ${
          a
            ? `<div class="column-actions">
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
              </div>`
            : ''
        }
      </div>`;
  }

  function setupColumnDrag(element, column) {
    if (user.role !== 'admin') return;

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
      if (user.role === 'admin') {
        c.setAttribute('draggable', 'true');
        c.addEventListener('dragstart', onDragStart);
        c.addEventListener('dragend', onDragEnd);
      }
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
    if (user.role !== 'admin') return;
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
      if (user.role !== 'admin') return;
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
      if (user.role !== 'admin' || !dragId) return;

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
      authorRole: user.role,
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
     DETAIL MODAL
  ═══════════════════════════════════════ */
 async function openDetail(id) {
  tkId = id;
  const t = tickets.find((x) => x.id === id);
  if (!t) return;

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

  // Busca anexos do ticket e dos comentários no Supabase
  D.attachSection.style.display = 'block';
  D.attachGrid.innerHTML = '<p style="font-size:0.85rem;color:var(--text-muted)">Carregando anexos...</p>';

  try {
    const allAttachments = await sbRequest(
      `attachments?ticket_id=eq.${id}&select=id,ticket_id,comment_id,name,url`
    );

    // Anexos diretos do ticket (sem comment_id)
    t.attachments = allAttachments
      .filter((a) => !a.comment_id)
      .map((a) => ({ name: a.name, data: a.url }));

    // Anexos vinculados aos comentários
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

  // Renderiza a galeria do ticket
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

  // Controles de Administrador
  if (user.role === 'admin') {
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
  } else {
    D.adminControls.classList.remove('visible');
  }

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

if (D.lightboxClose) {
  D.lightboxClose.addEventListener('click', () => {
    D.lightbox.classList.remove('active');
  });
}

if (D.lightbox) {
  D.lightbox.addEventListener('click', (e) => {
    if (e.target === D.lightbox) {
      D.lightbox.classList.remove('active');
    }
  });
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
      .map((c) => {
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

        return `
          <div class="comment">
            <div class="comment-avatar ${c.role}">${ini}</div>
            <div class="comment-body">
              <div class="comment-header">
                <span class="comment-author">${esc(c.author)}</span>
                <span class="role-tag ${c.role}" style="font-size:0.6rem;padding:1px 6px;">
                  ${c.role === 'admin' ? 'Admin' : 'Usuário'}
                </span>
                <span class="comment-time">${time}</span>
              </div>
              <p class="comment-text">${esc(c.text)}</p>
              ${
                c.attachments?.length
                  ? `<div class="comment-attachments">${c.attachments
                      .map(
                        (attachment, attachmentIndex) =>
                          `<img src="${attachment.data}" alt="${esc(attachment.name)}" title="${esc(attachment.name)}" data-comment-index="${t.comments.indexOf(c)}" data-attachment-index="${attachmentIndex}">`
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
  }

  function submitComment() {
    const text = D.commentInput.value.trim();
    if (!text || !tkId) return;

    const t = tickets.find((x) => x.id === tkId);
    if (!t) return;

    if (!t.comments) t.comments = [];

    t.comments.push({
      author: user.name,
      role: user.role,
      text,
      createdAt: new Date().toISOString(),
      attachments: [...pendingCommentAttachments],
    });

    const newComment = t.comments[t.comments.length - 1];
    t.updatedAt = new Date().toISOString();
    Promise.all([saveSingleTicket(t), saveComment(t, newComment)]).catch((error) => {
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

    D.confirmTitle.textContent = `Excluir "${c.name}"?`;
    D.confirmText.textContent =
      n > 0
        ? `Coluna com ${n} chamado(s). Eles serão movidos para a primeira coluna.`
        : 'Ação irreversível.';

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
     EVENTS
  ═══════════════════════════════════════ */
  function bind() {
    applyTheme(localStorage.getItem(SK.theme) || 'dark');
    D.themeToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem(SK.theme, nextTheme);
      applyTheme(nextTheme);
    });

    // Login
    D.btnLogin.addEventListener('click', handleLogin);
    D.loginName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
    D.loginPassword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleLogin();
    });

    // Logout
    D.btnLogout.addEventListener('click', async () => {
      await signOut();
      user = null;
      authSession = null;
      D.app.classList.remove('active');
      D.loginScreen.classList.remove('hidden');
      D.loginName.value = '';
      D.loginPassword.value = '';
    });

    // Toolbar
    D.btnNewTicket.addEventListener('click', openNew);
    D.btnManageColumns.addEventListener('click', openColNew);
    D.btnManageUsers.addEventListener('click', openUserModal);
    D.userModalClose.addEventListener('click', () => D.userModal.classList.remove('active'));
    D.btnSubmitUser.addEventListener('click', submitNewUser);

    // Filters
    document.querySelectorAll('.filter-btn').forEach((b) => {
      b.addEventListener('click', handleFilter);
    });
    D.moduleFilter.addEventListener('change', (e) => {
      moduleFilter = e.target.value;
      renderBoard();
    });
    D.clientFilter.addEventListener('change', (e) => {
      clientFilter = e.target.value;
      renderBoard();
    });

    // Search box
    if (D.searchInput) {
      D.searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderBoard();
      });
      D.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchQuery = '';
          D.searchInput.value = '';
          renderBoard();
        }
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

    // Detail modal
    D.modalClose.addEventListener('click', () => {
      D.detailModal.classList.remove('active');
    });

    // Comments
    D.btnSendComment.addEventListener('click', submitComment);
    D.commentAttachInput.addEventListener('change', () => {
      processFiles(D.commentAttachInput.files, pendingCommentAttachments, renderCommentAttachPreviews);
      D.commentAttachInput.value = '';
    });
    D.commentInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitComment();
      }
    });
    D.commentInput.addEventListener('input', function () {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // New ticket modal
    D.newTicketClose.addEventListener('click', () => {
      D.newTicketModal.classList.remove('active');
    });
    D.typeBug.addEventListener('click', () => selT('bug'));
    D.typeImprovement.addEventListener('click', () => selT('improvement'));
    D.btnSubmitTicket.addEventListener('click', submitTk);

    // Column modal
    D.columnModalClose.addEventListener('click', () => {
      D.columnModal.classList.remove('active');
    });
    D.btnSubmitColumn.addEventListener('click', submitCol);

    // Confirm dialog
    D.confirmCancel.addEventListener('click', () => {
      D.confirmDialog.classList.remove('active');
      delColId = null;
    });
    D.confirmOk.addEventListener('click', handleDel);

    // Lightbox
    D.lightbox.addEventListener('click', (e) => {
      if (e.target === D.lightbox) closeLightbox();
    });
    D.lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeLightbox();
    });

    // Close modals on overlay click
    [D.detailModal, D.newTicketModal, D.columnModal].forEach((m) => {
      m.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) m.classList.remove('active');
      });
    });

    // Attachment zone
    setupAttachZone();
  }

  /* ═══════════════════════════════════════
     BOOT
  ═══════════════════════════════════════ */
  async function boot() {
    bind();

    let hasSession = false;
    try {
      hasSession = await restoreSession();
    } catch (e) {}

    try {
      await load();
    } catch (e) {}

    var ls = document.getElementById('loadingScreen');
    if (ls) ls.remove();

    if (hasSession) {
      D.loginScreen.classList.add('hidden');
      D.app.classList.add('active');
      setupUI();
      renderBoard();
    } else {
      D.loginScreen.classList.remove('hidden');
    }
}
boot();

})();