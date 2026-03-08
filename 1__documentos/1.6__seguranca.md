# Segurança

Como o sistema lida com dados financeiros dos usuários, a segurança deve ser considerada em todas as etapas da arquitetura.

A comunicação entre os serviços deve ocorrer sempre utilizando conexões seguras (HTTPS/TLS), garantindo a proteção dos dados em trânsito.

Também é importante garantir que apenas serviços autorizados tenham acesso aos dados armazenados. Para isso, devem ser utilizados mecanismos de autenticação e controle de acesso entre os componentes da arquitetura.

Outro ponto importante é a proteção dos dados armazenados, adotando criptografia em repouso quando necessário e boas práticas de gerenciamento de credenciais.

Além disso, registros de auditoria e monitoramento ajudam a identificar acessos indevidos e possíveis falhas de segurança ao longo do tempo.