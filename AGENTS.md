<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Regras do Projeto
- **NÃO abrir navegador local nem executar testes automatizados no browser**: Nunca execute subagentes de navegador, abrir URLs locais ou testar visualmente no navegador. Apenas configure o código, valide a compilação/tipagem e deixe os testes manuais exclusivamente para o usuário.
- **Segurança de credenciais**: Jamais exibir senhas ou credenciais em mensagens, avisos ou telas.

