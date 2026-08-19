import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createClient } from '@supabase/supabase-js';

const appUrl = process.env.CARBOARD_APP_URL ?? 'http://127.0.0.1:4173';
const supabaseUrl = process.env.CARBOARD_SUPABASE_URL;
const publishableKey = process.env.CARBOARD_SUPABASE_PUBLISHABLE_KEY;
const chromePath = process.env.CARBOARD_CHROME_PATH
  ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const debugPort = 9333;

if (!supabaseUrl || !publishableKey) {
  throw new Error('Defina CARBOARD_SUPABASE_URL e CARBOARD_SUPABASE_PUBLISHABLE_KEY.');
}

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const waitFor = async (check, message, timeout = 10000) => {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < timeout) {
    try {
      const value = await check();
      if (value) return value;
    } catch (error) {
      lastError = error;
    }
    await wait(80);
  }
  throw new Error(`${message}${lastError ? `: ${lastError.message}` : ''}`);
};

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const email = `navigation-${suffix}@carboard.dev`;
const password = 'CarBoard-navigation-2026!';
const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const { data: signUp, error: signUpError } = await supabase.auth.signUp({ email, password });
assert(!signUpError && signUp.session, `Não foi possível criar a sessão de navegação: ${signUpError?.message}`);
const { error: vehicleError } = await supabase.rpc('create_vehicle_with_components', {
  p_brand: 'Honda',
  p_model: 'Fit',
  p_year: 2016,
  p_current_mileage: 84500,
  p_nickname: 'Fit de teste',
});
assert(!vehicleError, `Não foi possível criar o veículo de navegação: ${vehicleError?.message}`);

const profileDirectory = await mkdtemp(join(tmpdir(), 'carboard-chrome-'));
const chrome = spawn(chromePath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDirectory}`,
  'about:blank',
], { stdio: 'ignore' });

let socket;
try {
  const page = await waitFor(async () => {
    const response = await fetch(`http://127.0.0.1:${debugPort}/json/list`);
    if (!response.ok) return undefined;
    const targets = await response.json();
    return targets.find((target) => target.type === 'page' && target.url === 'about:blank')
      ?? targets.find((target) => target.type === 'page');
  }, 'Chrome DevTools não iniciou');

  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener('open', resolve, { once: true });
    socket.addEventListener('error', reject, { once: true });
  });

  let commandId = 0;
  const pending = new Map();
  socket.addEventListener('message', ({ data }) => {
    const message = JSON.parse(data);
    if (!message.id || !pending.has(message.id)) return;
    const { resolve, reject } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) reject(new Error(message.error.message));
    else resolve(message.result);
  });

  const command = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++commandId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  const evaluate = async (expression) => {
    const result = await command('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  const navigate = async (path) => {
    await command('Page.navigate', { url: `${appUrl}${path}` });
    try {
      await waitFor(
        () => evaluate("document.querySelector('.cb-bottom-nav') !== null"),
        `BottomNavigation não apareceu em ${path}`,
      );
    } catch (error) {
      const state = await evaluate(`({
        path: location.pathname,
        title: document.title,
        body: document.body?.innerText?.slice(0, 500),
        storageKeys: Object.keys(localStorage),
      })`);
      throw new Error(`${error.message}. Estado da página: ${JSON.stringify(state)}`);
    }
  };

  const click = (selector) => evaluate(`(() => {
    const element = document.querySelector(${JSON.stringify(selector)});
    if (!element) return false;
    element.click();
    return true;
  })()`);

  const clickButtonText = (containerSelector, label) => evaluate(`(() => {
    const container = document.querySelector(${JSON.stringify(containerSelector)});
    const button = [...(container?.querySelectorAll('button') ?? [])]
      .find((candidate) => candidate.textContent?.trim().includes(${JSON.stringify(label)}));
    if (!button) return false;
    button.click();
    return true;
  })()`);

  const overlayIsOpen = (selector) => evaluate(`(() => {
    const overlay = document.querySelector(${JSON.stringify(selector)});
    return Boolean(overlay && (overlay.presented || overlay.classList.contains('show-modal')));
  })()`);

  const menuIsOpen = () => evaluate(`document.querySelector('ion-menu.cb-side-menu')?.isOpen() ?? false`);

  const pressHardwareBack = () => evaluate(`(async () => {
    const handlers = [];
    document.dispatchEvent(new CustomEvent('ionBackButton', {
      detail: { register: (priority, handler) => handlers.push({ priority, handler }) }
    }));
    handlers.sort((left, right) => right.priority - left.priority);
    if (!handlers[0]) return false;
    await handlers[0].handler(() => {});
    return handlers[0].priority;
  })()`);

  await command('Page.enable');
  await command('Runtime.enable');
  await command('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await command('Page.navigate', { url: `${appUrl}/auth/login` });
  await waitFor(() => evaluate('document.readyState === "complete"'), 'Login não carregou');
  const storageKey = `sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`;
  await evaluate(`localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(JSON.stringify(signUp.session))})`);
  await navigate('/home');

  for (const width of [360, 390, 430]) {
    await command('Emulation.setDeviceMetricsOverride', {
      width,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    await navigate('/home');
    const triggerHitTest = await evaluate(`(() => {
      const trigger = document.querySelector('.cb-quick-action-trigger');
      if (!trigger) return false;
      const bounds = trigger.getBoundingClientRect();
      const hit = document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2);
      return bounds.width >= 56 && bounds.height >= 56 && Boolean(hit && trigger.contains(hit));
    })()`);
    assert(triggerHitTest, `O botão + não está integralmente clicável em ${width}px.`);

    assert(await click('.cb-quick-action-trigger'), `O botão + não foi encontrado em ${width}px.`);
    await waitFor(() => overlayIsOpen('ion-modal.cb-quick-sheet'), `QuickActionSheet não abriu em ${width}px.`);
    const pathBeforeSheetBack = await evaluate('location.pathname');
    assert(await pressHardwareBack() === 100, `Back não priorizou o sheet em ${width}px.`);
    await waitFor(async () => !(await overlayIsOpen('ion-modal.cb-quick-sheet')), `Back não fechou o sheet em ${width}px.`);
    assert(await evaluate('location.pathname') === pathBeforeSheetBack, `Back navegou antes de fechar o sheet em ${width}px.`);

    assert(await click('button[aria-label="Abrir menu"]'), `Hamburger não foi encontrado em ${width}px.`);
    await waitFor(menuIsOpen, `Menu não abriu em ${width}px.`);
    const pathBeforeMenuBack = await evaluate('location.pathname');
    assert(await pressHardwareBack() === 99, `Back não priorizou o menu em ${width}px.`);
    await waitFor(async () => !(await menuIsOpen()), `Back não fechou o menu em ${width}px.`);
    assert(await evaluate('location.pathname') === pathBeforeMenuBack, `Back navegou antes de fechar o menu em ${width}px.`);
  }

  for (const path of ['/home', '/vehicle', '/expenses', '/history']) {
    await navigate(path);
    assert(await click('.cb-quick-action-trigger'), `Botão + não respondeu em ${path}.`);
    await waitFor(() => overlayIsOpen('ion-modal.cb-quick-sheet'), `Sheet não abriu em ${path}.`);
    const labels = await evaluate(`[...document.querySelectorAll('.cb-action-item')].map((item) => item.textContent?.trim())`);
    assert(
      ['Abastecimento', 'Manutenção', 'Problema', 'Melhoria', 'Atualizar quilometragem']
        .every((label) => labels.includes(label)),
      `Ações incompletas no sheet aberto em ${path}.`,
    );
    await pressHardwareBack();
    await waitFor(async () => !(await overlayIsOpen('ion-modal.cb-quick-sheet')), `Sheet ficou preso em ${path}.`);
  }

  for (const [label, expectedPath] of [
    ['Abastecimento', '/register/fuel'],
    ['Manutenção', '/register/maintenance'],
    ['Problema', '/register/problem'],
    ['Melhoria', '/register/improvement'],
  ]) {
    await navigate('/home');
    await click('.cb-quick-action-trigger');
    await waitFor(() => overlayIsOpen('ion-modal.cb-quick-sheet'), `Sheet não abriu para ${label}.`);
    assert(await clickButtonText('.cb-quick-sheet', label), `Ação ${label} não foi encontrada.`);
    await waitFor(() => evaluate(`location.pathname === ${JSON.stringify(expectedPath)}`), `${label} não navegou para ${expectedPath}.`);
  }

  await navigate('/home');
  await click('.cb-quick-action-trigger');
  await waitFor(() => overlayIsOpen('ion-modal.cb-quick-sheet'), 'Sheet não abriu para Atualizar quilometragem.');
  assert(await clickButtonText('.cb-quick-sheet', 'Atualizar quilometragem'), 'Ação Atualizar quilometragem não foi encontrada.');
  await waitFor(() => overlayIsOpen('ion-modal.cb-mileage-sheet'), 'MileageUpdateSheet não abriu.');
  assert(await pressHardwareBack() === 100, 'Back não priorizou MileageUpdateSheet.');
  await waitFor(async () => !(await overlayIsOpen('ion-modal.cb-mileage-sheet')), 'Back não fechou MileageUpdateSheet.');

  for (const [label, expectedPath] of [
    ['Início', '/home'],
    ['Meu Carro', '/vehicle'],
    ['Gastos', '/expenses'],
    ['Histórico', '/history'],
  ]) {
    await navigate('/home');
    await click('button[aria-label="Abrir menu"]');
    await waitFor(menuIsOpen, `Menu não abriu para ${label}.`);
    assert(await clickButtonText('.cb-side-menu', label), `Item ${label} não foi encontrado no menu.`);
    await waitFor(() => evaluate(`location.pathname === ${JSON.stringify(expectedPath)}`), `${label} não navegou para ${expectedPath}.`);
    await waitFor(async () => !(await menuIsOpen()), `Menu permaneceu aberto após navegar para ${label}.`);
  }

  await navigate('/home');
  await click('button[aria-label="Abrir menu"]');
  await waitFor(menuIsOpen, 'Menu não abriu para logout.');
  assert(await clickButtonText('.cb-side-menu__footer', 'Sair'), 'Ação Sair não foi encontrada.');
  await waitFor(() => evaluate('location.pathname === "/auth/login"'), 'Logout real não redirecionou para login.');
  await waitFor(async () => !(await menuIsOpen()), 'Menu permaneceu aberto após logout.');

  console.log(JSON.stringify({
    viewports: '360px, 390px e 430px validados',
    quickAction: 'funcional em Home, Meu Carro, Gastos e Histórico',
    actions: 'quatro rotas e MileageUpdateSheet validados',
    menu: 'abertura, quatro rotas, fechamento e logout real validados',
    androidBack: 'sheet, mileage e menu fecham antes da navegação',
  }));
} finally {
  socket?.close();

  if (chrome.exitCode === null) {
    const chromeExit = new Promise((resolve) => chrome.once('exit', resolve));
    chrome.kill('SIGTERM');
    await Promise.race([chromeExit, wait(3_000)]);
  }

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await rm(profileDirectory, { recursive: true, force: true });
      break;
    } catch (error) {
      if (attempt === 2) {
        console.warn(`Não foi possível remover o perfil temporário: ${error.message}`);
        break;
      }

      await wait(250);
    }
  }
}
