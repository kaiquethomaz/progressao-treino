# 🏋️ Progressão de Treino

Aplicação web para gerenciar sua **rotina semanal de academia** e acompanhar a
**evolução das cargas** em cada exercício, com gráficos interativos.

Projeto full-stack construído com uma única linguagem (TypeScript), banco
relacional PostgreSQL e pronto para deploy **gratuito**.

## ✨ Funcionalidades

- **Catálogo de exercícios** (CRUD completo) organizado por grupo muscular
- **Rotina semanal** — monte cada dia com exercícios e metas de séries × repetições
- **Registro de treinos** — ao registrar, o sistema sugere a última carga usada
- **Gráficos de progresso** — evolução de carga e 1RM estimado por exercício
- **Dashboard** — volume por semana, recordes e treinos recentes
- **Autenticação** — login com email + senha (hash bcrypt) e sessão em cookie httpOnly

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Frontend + Backend | **Next.js 16** (App Router) + React + TypeScript |
| Estilo | Tailwind CSS |
| Gráficos | Recharts |
| Banco de dados | **PostgreSQL** |
| ORM | **Prisma 7** (com driver adapter `pg`) |
| Containers | Docker + Docker Compose |

O "backend" são as **Server Actions** do Next.js (`src/lib/actions/`), que rodam
no servidor e conversam com o banco via Prisma — sem precisar de uma API separada.

## 🗃️ Modelo de dados

```
User ─┬─< Exercise ─────< RoutineDayExercise >───┐
      ├─< Routine ──< RoutineDay ────────────────┘
      └─< WorkoutSession ──< SetEntry >── Exercise
```

Relacionamentos ricos: uma rotina tem vários dias, cada dia tem vários
exercícios (com metas), e cada sessão de treino registra várias séries (carga,
repetições, RPE) — a base para os gráficos de progressão.

## 🚀 Como rodar localmente

Pré-requisitos: **Node.js 24+**. (Não precisa instalar PostgreSQL — o Prisma
sobe um Postgres local para você.)

```bash
# 1. Instalar dependências
npm install

# 2. Subir o banco Postgres local (deixe rodando num terminal separado)
npx prisma dev

# 3. Copiar as URLs que o comando acima imprimir para o arquivo .env
#    (veja .env.example)

# 4. Criar as tabelas
npm run db:migrate

# 5. (Opcional) Popular com dados de exemplo
npm run db:seed

# 6. Rodar a aplicação
npm run dev
```

Acesse http://localhost:3000

> **Primeiro acesso:** o app pede login. Como ainda não há senha, você será
> levado para `/setup` para criar a sua. Depois disso, use `/login` normalmente.

### Autenticação

Implementação própria, sem bibliotecas externas de auth:

- Senha guardada com **hash bcrypt** (nunca em texto puro)
- Sessão em **cookie httpOnly** (o navegador não expõe ao JavaScript), com o
  token guardado como **hash** na tabela `Session`
- O guard `requireUser()` fica junto do acesso a dados (`getCurrentUser`), então
  **todas as páginas e Server Actions exigem login** automaticamente
- App de login único (pessoal). Para multiusuário, o modelo de dados já está
  pronto (cada registro pertence a um `User`)

### Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run db:studio` | Interface visual do banco (Prisma Studio) |
| `npm run db:seed` | Popula o banco com dados de exemplo |

## 🐳 Rodando com Docker

Sobe **banco + migrações + aplicação** com um comando:

```bash
docker compose up --build
```

> ⚠️ Os arquivos Docker não foram executados no ambiente onde o projeto foi
> criado (Docker não estava instalado). Teste-os antes de usar em produção.

## ☁️ Deploy gratuito (sem VPS)

1. **Banco:** crie um PostgreSQL grátis no [Neon](https://neon.tech) ou
   [Prisma Postgres](https://www.prisma.io/postgres) e copie a connection string.
2. **App:** conecte o repositório na [Vercel](https://vercel.com).
3. Na Vercel, defina a variável de ambiente `DATABASE_URL` com a string do passo 1.
4. Após o primeiro deploy, rode as migrações no banco de produção:
   ```bash
   DATABASE_URL="sua-url-de-producao" npx prisma migrate deploy
   ```

## 📁 Estrutura

```
src/
├── app/                # Páginas (App Router)
│   ├── page.tsx        # Dashboard
│   ├── exercicios/     # CRUD de exercícios
│   ├── rotina/         # Rotina semanal
│   ├── registrar/      # Registro de treino
│   └── progresso/      # Gráficos de evolução
├── components/         # Componentes de UI e gráficos
├── lib/
│   ├── actions/        # Server Actions (a lógica de backend)
│   ├── prisma.ts       # Cliente do banco
│   └── calc.ts         # Cálculos (1RM, volume)
└── generated/prisma/   # Cliente Prisma gerado (não versionado)
prisma/
├── schema.prisma       # Modelo de dados
├── migrations/         # Histórico de migrações
└── seed.ts             # Dados de exemplo
```
