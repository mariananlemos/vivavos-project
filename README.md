# Vivavós

**Informação para o paciente, em voz alta e em palavras simples.**

🔗 **Acesse:** https://vivavos.vercel.app/

O Vivavós é um site que ajuda **pessoas idosas** a entender **remédios** e **exames**. A pessoa tira (ou envia) uma foto da caixa do remédio ou do papel do exame, e o Vivavós lê o que está escrito e explica com palavras simples. Tocando em **Ouvir**, a explicação é falada **em português do Brasil**.

## Projeto acadêmico

Projeto desenvolvido na **Universidade Federal do ABC (UFABC)** para a disciplina **Interação Humano-Computador (IHC)**.

**Alunos:**

- Gabriela Bernardes
- Raissa Galdino
- Mariana Lemos
- Gabriel Lima

## Como funciona

1. **Tire ou envie a foto:** da caixa do remédio ou do resultado do exame.
2. **Confira o que foi lido:** o site mostra o que leu e pergunta “Está certo?”. A pessoa responde com os botões ou, depois de tocar em Ouvir, com a voz (“sim” / “não”).
3. **Ouça a explicação:** só depois da confirmação, o site explica:
   - **Remédio:** para que serve, como tomar, cuidados e uso com outros remédios, a partir da bula registrada na ANVISA.
   - **Exame:** o resultado, se ficou dentro, acima ou abaixo do valor esperado **impresso no próprio laudo**, e o que fazer.

### Regras de segurança

- **Nunca adivinha:** se a foto estiver borrada, escura ou cortada, pede outra foto.
- **Confirma antes de explicar:** nada é explicado sem o “sim” da pessoa.
- **Fonte oficial:** bula da ANVISA para remédios; para exames, só o valor de referência do laudo (sem diagnóstico).
- **Não substitui o médico:** todas as telas avisam isso.
- **Privacidade (LGPD):** pede consentimento e as fotos são apagadas logo depois da leitura.

## Acessibilidade

Pensado para o público idoso e seguindo as recomendações do governo (eMAG):

- **Libras** com o [VLibras](https://github.com/spbgovbr-vlibras) (widget oficial do Governo Federal).
- **Voz em português do Brasil** com a API de voz da OpenAI, com a voz do navegador como reserva. Ela só fala quando a pessoa toca em um botão de ouvir, e a velocidade é ajustável.
- **Comandos de voz:** “sim”, “não”, “de novo”, “mais devagar”, “mais rápido”.
- **Letra maior** (A− / A+) e **alto contraste**.
- **Atalhos de teclado:** Alt+1 (conteúdo), Alt+2 (menu), Alt+3 (rodapé).
- Botões grandes, textos curtos e fonte Atkinson Hyperlegible, feita para leitura fácil.

## Tecnologias

- **Frontend:** React 18, Vite e Tailwind CSS
- **Backend:** funções serverless da Vercel (pasta `api/`)
- **IA:** OpenAI (visão para ler as fotos e voz para falar)
- **Voz no navegador:** Web Speech API (reconhecimento de voz e voz de reserva)

## Como rodar no seu computador

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18 ou mais novo e uma chave da [OpenAI](https://platform.openai.com/api-keys).

1. Clone o repositório e entre na pasta:

   ```bash
   git clone https://github.com/mariananlemos/vivavos-project.git
   cd vivavos-project
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Crie o arquivo `.env` a partir do exemplo e coloque a sua chave da OpenAI:

   ```bash
   cp .env.example .env
   ```

   ```env
   OPENAI_API_KEY=sua-chave-aqui
   ```

4. Rode o site:

   ```bash
   npm run dev
   ```

5. Abra http://localhost:5173 no **Google Chrome** ou no **Microsoft Edge** (os comandos de voz funcionam melhor nesses navegadores).

> Sem a chave da OpenAI, o site **no seu computador** abre em **modo demonstração**: a leitura mostra resultados de exemplo, com um aviso na tela, e a voz usa a do navegador. **No site publicado, sem a chave, a leitura fica indisponível** e nenhum resultado é mostrado.

## Publicar na Vercel

1. Instale e faça login na Vercel: `npx vercel login`
2. Cadastre a chave (ela fica só na Vercel): `npx vercel env add OPENAI_API_KEY production`
3. Publique: `npx vercel deploy --prod`

As rotas da pasta `api/` viram funções serverless. Elas só aceitam chamadas do próprio site e têm limite de uso por pessoa. Mesmo assim, recomendamos configurar um limite de gastos no painel da OpenAI.

## Estrutura

```
api/
  identify-medicine.js   leitura da caixa do remédio + bula
  identify-exam.js       leitura do exame + comparação com o laudo
  speak.js               voz em português do Brasil (OpenAI)
  _lib/                  visão, bulário, avaliação de exames e proteções
src/
  screens/               telas (início, fluxo da foto, resultados)
  components/            cabeçalho, barra de acessibilidade, rodapé, botões
  hooks/                 voz (falar e ouvir) e acessibilidade
```

---

*O Vivavós ajuda a ler. Ele não substitui o médico nem o farmacêutico.*
