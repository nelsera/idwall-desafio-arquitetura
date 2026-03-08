# Escalabilidade

A arquitetura proposta foi pensada para suportar o crescimento do volume de usuários, transações e requisições sem concentrar toda a carga na API principal.

Como o processamento das transações acontece de forma assíncrona, é possível adicionar novos workers conforme a demanda aumenta. Isso permite distribuir melhor a carga e processar múltiplas tarefas em paralelo.

Outro ponto importante é que a API deixa de executar operações mais pesadas durante a requisição, ficando mais leve e com maior capacidade de atender novas chamadas.

Essa abordagem também ajuda o sistema a lidar melhor com picos de uso, já que as tarefas podem ser enfileiradas e processadas de forma gradual, sem sobrecarregar o fluxo principal da aplicação.