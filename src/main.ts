import './style.css';

const cepInput = document.querySelector<HTMLInputElement>('#cep')!;
const logradouroInput = document.querySelector<HTMLInputElement>('#logradouro')!;
const numeroInput = document.querySelector<HTMLInputElement>('#numero')!;
const bairroInput = document.querySelector<HTMLInputElement>('#bairro')!;
const estadoSelect = document.querySelector<HTMLSelectElement>('#estados')!;
const cidadeSelect = document.querySelector<HTMLSelectElement>('#cidades')!;
const copiarBtn = document.querySelector<HTMLButtonElement>('#copiar')!;
const themeToggleBtn = document.querySelector<HTMLButtonElement>('#theme-toggle')!;

popularEstados();

cepInput.addEventListener('blur', preencherEnderecoPorCep);
estadoSelect.addEventListener('change', atualizarCidades);
themeToggleBtn.addEventListener('click', alternarTema);

function alternarTema() {
    const atual = document.documentElement.getAttribute('data-theme');
    const proximo = atual === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', proximo);
    localStorage.setItem('theme', proximo);
}

async function popularEstados() {
    try {
        const estados = await obterEstados();
        estados.forEach(({ sigla, nome }: { sigla: string; nome: string }) => {
            const option = document.createElement('option');
            option.value = sigla;
            option.textContent = nome;
            estadoSelect.appendChild(option);
        });
    } catch {
        console.error('Erro ao carregar estados.');
    }
}

async function atualizarCidades() {
    if (!estadoSelect.value) return;
    try {
        const cidades = await obterCidades(estadoSelect.value);
        cidadeSelect.options.length = 1;
        cidades.forEach(({ nome }: { nome: string }) => {
            const option = document.createElement('option');
            option.value = nome;
            option.textContent = nome;
            cidadeSelect.appendChild(option);
        });
    } catch {
        console.error('Erro ao carregar cidades.');
    }
}

async function preencherEnderecoPorCep() {
    try {
        const dados = await buscarCep(cepInput.value);
        logradouroInput.value = dados.street || '';
        bairroInput.value = dados.neighborhood || '';
        estadoSelect.value = dados.state || '';
        await atualizarCidades();
        cidadeSelect.value = dados.city || '';
        numeroInput.focus();
    } catch {
        console.error('CEP não encontrado.');
    }
}

copiarBtn.addEventListener('click', async () => {
    const lines = [
        `CEP: ${cepInput.value || ''}`,
        `Logradouro: ${logradouroInput.value || ''}`,
        `Número: ${numeroInput.value || ''}`,
        `Bairro: ${bairroInput.value || ''}`,
        `Cidade: ${cidadeSelect.value || ''}`,
        `Estado: ${estadoSelect.value || ''}`,
    ];
    const text = lines.join('\n');
    try {
        await navigator.clipboard.writeText(text);
        const prev = copiarBtn.textContent;
        copiarBtn.textContent = 'Copiado!';
        setTimeout(() => (copiarBtn.textContent = prev ?? 'Copiar'), 1500);
    } catch (err) {
        console.error('Erro ao copiar:', err);
        alert('Não foi possível copiar para a área de transferência.');
    }
});

// Funções utilitárias de requisição.

async function buscarCep(cep: string) {
    const resp = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`);
    if (!resp.ok) {
        console.error('Erro ao buscar CEP');
        return {};
    }
    return resp.json();
}

async function obterEstados() {
    const resp = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    if (!resp.ok) {
        console.error('Erro ao buscar estados');
        return [];
    }
    return resp.json();
}

async function obterCidades(siglaEstado: string) {
    const resp = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${siglaEstado}/municipios?orderBy=nome`);
    if (!resp.ok) {
        console.error('Erro ao buscar cidades');
        return [];
    }
    return resp.json();
}
