# Problemas da Arquitetura Atual

A arquitetura atual apresenta algumas limitações que podem impactar o desempenho e a escalabilidade do sistema conforme o volume de usuários e transações aumenta.

Um dos principais pontos é a dependência direta das APIs de bancos parceiros durante a requisição. Como essas chamadas fazem parte do fluxo síncrono da aplicação, qualquer instabilidade ou lentidão nesses serviços pode afetar diretamente o tempo de resposta para o usuário.

Outro ponto é que o processamento das transações, incluindo a classificação feita pelo modelo de machine learning, acontece dentro da própria requisição HTTP. Esse tipo de processamento pode aumentar a latência da aplicação, principalmente quando o volume de transações analisadas cresce.

Também é importante considerar o crescimento contínuo do volume de dados armazenados. Com o tempo, consultas ao banco podem se tornar mais custosas, principalmente se não houver uma estratégia adequada de modelagem e acesso aos dados.

Por fim, todas as etapas do fluxo, como busca de transações, classificação e persistência, estão fortemente acopladas. Isso reduz a flexibilidade da arquitetura e dificulta a evolução do sistema.