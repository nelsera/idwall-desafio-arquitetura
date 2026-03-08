# Trade-offs da Arquitetura

A arquitetura proposta melhora a escalabilidade e a resiliência do sistema, mas também introduz algumas complexidades que precisam ser consideradas.

## Maior complexidade operacional

A introdução de filas e workers adiciona novos componentes à arquitetura. Isso aumenta a complexidade de operação e monitoramento do sistema.

## Processamento assíncrono

Como parte do processamento ocorre em background, o resultado pode não estar disponível imediatamente após a requisição do usuário.

## Necessidade de monitoramento

Com mais componentes distribuídos, torna-se importante investir em observabilidade, monitoramento e tratamento de falhas para garantir o funcionamento correto do sistema.

Mesmo com esses pontos, os benefícios em escalabilidade, resiliência e desacoplamento tornam essa abordagem mais adequada para sistemas com grande volume de dados e requisições.