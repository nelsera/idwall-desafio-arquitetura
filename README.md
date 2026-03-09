# IDWall - Desafio de Arquitetura

Este repositório contém a proposta de arquitetura para resolver o
problema de **recomendação de gastos a partir de transações
financeiras**.

A solução foi estruturada utilizando **C4 Model** para documentação
arquitetural e separação clara entre **API, processamento assíncrono e
integrações externas**.

------------------------------------------------------------------------

# Visão Geral da Solução

A arquitetura proposta segue alguns princípios principais:

-   Processamento assíncrono para tarefas pesadas
-   Desacoplamento entre API e processamento
-   Escalabilidade horizontal
-   Uso de cache para consultas frequentes
-   Integração com serviços externos de classificação e bancos

Fluxo simplificado:

1.  Usuário solicita recomendações
2.  API registra a solicitação
3.  API publica tarefa na fila
4.  Worker processa a tarefa
5.  Worker consulta bancos e classifica transações
6.  Resultado é persistido no banco
7.  Cache é atualizado
8.  Usuário consulta o resultado via API

------------------------------------------------------------------------

# Estrutura do Projeto

    IDWALL-DESAFIO-ARQUITETURA

    1_documentos
     ├── 1.1_entendimento-do-problema.md
     ├── 1.2_problemas-da-arquitetura-atual.md
     ├── 1.3_arquitetura-proposta.md
     ├── 1.4_decisoes-de-arquitetura.md
     ├── 1.5_escalabilidade.md
     ├── 1.6_seguranca.md
     └── 1.7_tradeoffs.md

    2_diagramas
     ├── 2.1_c4-contexto.puml
     ├── 2.2_c4-containers.puml
     ├── 2.3_c4_componentes.puml
     └── 2.4_fluxo-sequencia.puml

------------------------------------------------------------------------

# Documentação

-   [1.1 Entendimento do
    problema](1_documentos/1.1_entendimento-do-problema.md)
-   [1.2 Problemas da arquitetura
    atual](1_documentos/1.2_problemas-da-arquitetura-atual.md)
-   [1.3 Arquitetura proposta](1_documentos/1.3_arquitetura-proposta.md)
-   [1.4 Decisões de
    arquitetura](1_documentos/1.4_decisoes-de-arquitetura.md)
-   [1.5 Escalabilidade](1_documentos/1.5_escalabilidade.md)
-   [1.6 Segurança](1_documentos/1.6_seguranca.md)
-   [1.7 Tradeoffs](1_documentos/1.7_tradeoffs.md)

------------------------------------------------------------------------

# Diagramas de Arquitetura

-   [2.1 C4 Contexto](2_diagramas/2.1_c4-contexto.puml)
-   [2.2 C4 Containers](2_diagramas/2.2_c4-containers.puml)
-   [2.3 C4 Componentes](2_diagramas/2.3_c4_componentes.puml)
-   [2.4 Fluxo sequência](2_diagramas/2.4_fluxo-sequencia.puml)

------------------------------------------------------------------------

# Tecnologias consideradas na arquitetura

-   Node.js
-   PostgreSQL
-   Redis
-   RabbitMQ
-   APIs externas de bancos
-   Serviço de classificação de transações

------------------------------------------------------------------------

# Como Executar o Projeto

## Pré‑requisitos

-   Docker
-   Docker Compose
-   Node.js

## Subindo o ambiente

Na raiz do projeto execute:

    docker compose up --build

Isso irá iniciar:

-   API
-   Worker de processamento
-   Banco de dados
-   Cache
-   Serviços auxiliares

## Acessando o Frontend

Após subir o ambiente, o frontend poderá ser acessado em:

    http://localhost:5173

## Acessando a API

A API estará disponível em:

    http://localhost:3001

------------------------------------------------------------------------

# Observações

O processamento de recomendações ocorre de forma **assíncrona**,
portanto:

1.  O usuário solicita a recomendação
2.  A API cria uma requisição
3.  O Worker processa os dados em background
4.  O resultado fica disponível posteriormente para consulta

Essa abordagem permite **maior escalabilidade e resiliência da
aplicação**.