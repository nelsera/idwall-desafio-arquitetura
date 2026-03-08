# Decisões de Arquitetura

A arquitetura proposta busca reduzir dependências síncronas, melhorar a resiliência do sistema e permitir que o processamento escale conforme o volume de dados aumenta.

Algumas decisões importantes foram consideradas na solução.

## Processamento assíncrono

O processamento das transações não acontece diretamente durante a requisição do usuário. A API registra a solicitação e envia uma tarefa para processamento em background, evitando aumentar o tempo de resposta da aplicação.

## Uso de filas

As filas permitem desacoplar a API do processamento das transações. Dessa forma, tarefas podem ser processadas por diferentes workers e executadas em paralelo.

## Separação entre API e workers

A API fica responsável apenas por receber requisições e registrar tarefas. Os workers executam o processamento das transações e a classificação dos dados.

Essa separação permite escalar cada parte do sistema de forma independente.

## Resiliência a falhas externas

Como o processamento acontece de forma assíncrona, falhas temporárias em APIs de parceiros não impactam diretamente a requisição do usuário. As tarefas podem ser reprocessadas posteriormente.