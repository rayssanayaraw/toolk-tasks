(function () {
  'use strict';

  const API = 'https://izqmuktylbixzldbkzod.supabase.co/rest/v1/';
  const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6cW11a3R5bGJpeHpsZGJrem9kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1OTUwNDgsImV4cCI6MjEwMzE3MTA0OH0.kP9uN9ZASnjZBoDd_Lhv-H0aXan7hZOqH-_NAVF8oyM';
  const session = JSON.parse(localStorage.getItem('taskflow_auth_session') || 'null');
  const state = { tickets: [], columns: [], type: 'all', module: 'all', client: 'all', from: '', to: '' };
  const $ = (id) => document.getElementById(id);
  const esc = (value) => { const element = document.createElement('div'); element.textContent = value == null ? '' : value; return element.innerHTML; };

  if (!session?.access_token) {
    window.location.href = 'index.html';
    return;
  }

  async function request(path) {
    const response = await fetch(API + path, { headers: { apikey: KEY, Authorization: `Bearer ${session.access_token}` } });
    if (!response.ok) throw new Error('Não foi possível carregar os dados do relatório.');
    return response.json();
  }

  function fillSelect(id, values, label) {
    $(id).innerHTML = `<option value="all">${label}</option>` + [...new Set(values.filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')).map((value) => `<option value="${esc(value)}">${esc(value)}</option>`).join('');
  }

  function filteredTickets() {
    return state.tickets.filter((ticket) => {
      if (state.type !== 'all' && ticket.type !== state.type) return false;
      if (state.module !== 'all' && ticket.module !== state.module) return false;
      if (state.client !== 'all' && ticket.client !== state.client) return false;
      const date = new Date(ticket.created_at); date.setHours(0, 0, 0, 0);
      if (state.from && date < new Date(state.from + 'T00:00:00')) return false;
      if (state.to && date > new Date(state.to + 'T23:59:59')) return false;
      return true;
    });
  }

  function render() {
    const tickets = filteredTickets();
    const total = tickets.length;
    const doneColumn = state.columns.find((column) => /conclu|done|resol/i.test(column.name)) || state.columns[state.columns.length - 1];
    const done = doneColumn ? tickets.filter((ticket) => ticket.status === doneColumn.id).length : 0;
    const urgent = tickets.filter((ticket) => ticket.priority === 'alta').length;
    const bugs = tickets.filter((ticket) => ticket.type === 'bug').length;
    const percent = (value) => total ? Math.round(value / total * 100) : 0;
    const statusRows = state.columns.map((column) => {
      const count = tickets.filter((ticket) => ticket.status === column.id).length;
      return `<div class="report-bar-row"><span>${esc(column.name)}</span><div class="report-bar"><i style="width:${percent(count)}%;background:${column.color}"></i></div><strong>${count}</strong></div>`;
    }).join('');
    const modules = [...new Set(tickets.map((ticket) => ticket.module || 'Não informado'))].map((module) => ({ module, count: tickets.filter((ticket) => (ticket.module || 'Não informado') === module).length })).sort((a, b) => b.count - a.count).slice(0, 5);
    const moduleRows = modules.length ? modules.map(({ module, count }) => `<div class="report-ranking-row"><span>${esc(module)}</span><strong>${count}</strong><em>${percent(count)}%</em></div>`).join('') : '<p class="report-empty">Nenhum chamado no período.</p>';
    $('reportSubtitle').textContent = `${total} chamado${total === 1 ? '' : 's'} no recorte atual`;
    $('reportUpdated').textContent = `Atualizado às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    $('reportView').innerHTML = `<div class="report-kpis"><article class="report-kpi"><span>Total de chamados</span><strong>${total}</strong><small>base filtrada</small></article><article class="report-kpi report-kpi-accent"><span>Taxa de conclusão</span><strong>${percent(done)}%</strong><small>${done} concluído${done === 1 ? '' : 's'}</small></article><article class="report-kpi"><span>Alta prioridade</span><strong>${urgent}</strong><small>${percent(urgent)}% da fila</small></article><article class="report-kpi"><span>Bugs registrados</span><strong>${bugs}</strong><small>${percent(bugs)}% do total</small></article></div><div class="report-grid"><article class="report-panel"><div class="report-panel-title"><div><span class="eyebrow">FLUXO</span><h2>Chamados por status</h2></div><span class="report-total">${total} total</span></div><div class="report-bars">${statusRows || '<p class="report-empty">Sem status disponível.</p>'}</div></article><article class="report-panel"><div class="report-panel-title"><div><span class="eyebrow">CONCENTRAÇÃO</span><h2>Módulos com mais chamados</h2></div></div><div class="report-ranking">${moduleRows}</div></article></div>`;
  }

  function bindFilters() {
    [['typeFilter', 'type'], ['moduleFilter', 'module'], ['clientFilter', 'client']].forEach(([id, key]) => $(id).addEventListener('change', (event) => { state[key] = event.target.value; render(); }));
    [['dateFrom', 'from'], ['dateTo', 'to']].forEach(([id, key]) => $(id).addEventListener('change', (event) => { state[key] = event.target.value; render(); }));
    $('clearFilters').addEventListener('click', () => { state.type = state.module = state.client = 'all'; state.from = state.to = ''; ['typeFilter', 'moduleFilter', 'clientFilter'].forEach((id) => $(id).value = 'all'); ['dateFrom', 'dateTo'].forEach((id) => $(id).value = ''); render(); });
    $('themeToggle').addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light'; localStorage.setItem('taskflow_theme', theme); document.documentElement.dataset.theme = theme; });
  }

  async function start() {
    $('reportUser').textContent = session.user?.email || '';
    document.documentElement.dataset.theme = localStorage.getItem('taskflow_theme') || 'dark';
    bindFilters();
    try {
      const [columns, tickets] = await Promise.all([request('columns?select=*&order=position.asc'), request('tickets?select=*')]);
      state.columns = columns.length ? columns : [{ id: 'backlog', name: 'Backlog', color: '#64748b' }, { id: 'progress', name: 'Em Progresso', color: '#3b82f6' }, { id: 'testing', name: 'Em Teste', color: '#f59e0b' }, { id: 'done', name: 'Concluído', color: '#10b981' }];
      state.tickets = tickets;
      fillSelect('moduleFilter', tickets.map((ticket) => ticket.module), 'Todos os módulos');
      fillSelect('clientFilter', tickets.map((ticket) => ticket.client), 'Todas as empresas');
      render();
    } catch (error) { $('reportError').textContent = error.message; $('reportError').hidden = false; }
  }

  start();
}());
