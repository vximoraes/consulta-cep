import './style.css';

const cepInput = document.querySelector<HTMLInputElement>('#cep')!;
const logradouroInput = document.querySelector<HTMLInputElement>('#logradouro')!;
const numeroInput = document.querySelector<HTMLInputElement>('#numero')!;
const bairroInput = document.querySelector<HTMLInputElement>('#bairro')!;
const estadoSelect = document.querySelector<HTMLSelectElement>('#estados')!;
const cidadeSelect = document.querySelector<HTMLSelectElement>('#cidades')!;

popularEstados();

cepInput.addEventListener('blur', preencherEnderecoPorCep);
estadoSelect.addEventListener('change', atualizarCidades);

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