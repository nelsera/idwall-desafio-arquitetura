# Entendimento do Problema

O sistema descrito no desafio permite que usuários consultem suas transações financeiras e recebam recomendações de gastos com base em seu histórico.

Para gerar essas recomendações, a aplicação consulta APIs de bancos parceiros para obter as transações do usuário. Essas transações são então processadas por um classificador de machine learning responsável por categorizar os gastos.

Após esse processamento, os dados são armazenados em banco de dados e utilizados para gerar as recomendações retornadas ao usuário.

---

## Fluxo atual da aplicação

De forma simplificada, o fluxo atual funciona da seguinte forma:

1. O usuário realiza uma consulta na aplicação.
2. A API busca as transações em APIs de bancos parceiros.
3. As transações passam por um classificador de machine learning.
4. Os dados processados são persistidos no banco de dados.
5. A API retorna recomendações de gastos ao usuário.

---

## Desafios identificados

Essa abordagem cria alguns desafios importantes.

### Dependência de APIs externas

Como a consulta depende diretamente das APIs de parceiros, qualquer instabilidade externa pode afetar o funcionamento da aplicação.

### Tempo de resposta

O processamento e classificação das transações acontecem durante a própria requisição, o que pode aumentar o tempo de resposta conforme o volume de dados cresce.

### Crescimento do volume de dados

Outro ponto é o crescimento contínuo do volume de transações armazenadas, o que pode impactar o desempenho das consultas ao banco de dados.

---

## Objetivo da nova arquitetura

Considerando esse cenário, a nova arquitetura deve buscar:

- reduzir a dependência de chamadas síncronas
- melhorar a resiliência do sistema
- permitir escalabilidade para grande volume de usuários e transações