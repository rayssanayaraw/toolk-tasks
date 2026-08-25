import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Método não permitido.' }, 405);

  const authorization = request.headers.get('Authorization');
  if (!authorization) return json({ error: 'Não autenticado.' }, 401);

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authorization } },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) return json({ error: 'Sessão inválida.' }, 401);

  const { data: adminProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileError || adminProfile?.role !== 'admin') {
    return json({ error: 'Apenas administradores podem cadastrar colaboradores.' }, 403);
  }

  const { name, email, password, role } = await request.json();
  if (!name || !email || !password || !['user', 'admin'].includes(role)) {
    return json({ error: 'Dados de cadastro inválidos.' }, 400);
  }
  if (password.length < 6) return json({ error: 'A senha precisa ter pelo menos 6 caracteres.' }, 400);

  const { data: created, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    return json({ error: createError?.message || 'Não foi possível criar a conta.' }, 400);
  }

  const { error: insertError } = await adminClient.from('profiles').insert({
    id: created.user.id,
    name,
    role,
  });
  if (insertError) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    return json({ error: 'A conta não pôde ser associada ao perfil.' }, 400);
  }

  return json({ id: created.user.id, name, role }, 201);
});
