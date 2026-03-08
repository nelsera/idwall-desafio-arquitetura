# Arquitetura Proposta

Para resolver os problemas da arquitetura atual, a proposta é adotar um modelo mais desacoplado, reduzindo dependências síncronas e permitindo que o processamento seja distribuído.

A principal mudança é separar o momento em que o usuário faz a requisição do momento em que o processamento mais pesado acontece.

Quando o usuário solicita suas recomendações, a API registra a requisição e envia uma tarefa para processamento assíncrono. Esse processamento inclui a busca de transações nas APIs dos bancos parceiros, a classificação das transações e o armazenamento dos resultados.

Os workers ficam responsáveis por consumir essas tarefas, executar o processamento e persistir os dados no banco.

Com essa abordagem, tarefas mais pesadas deixam de bloquear a requisição do usuário e podem ser executadas em paralelo.

Isso permite escalar o sistema de forma mais eficiente e reduz o impacto de falhas em serviços externos.