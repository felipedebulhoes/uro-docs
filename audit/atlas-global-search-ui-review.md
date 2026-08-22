# Revisão de interface — Pesquisa Global do Atlas

Data: 22 de agosto de 2026.

- A ação fixa **“Buscar no Atlas”** está visível no canto inferior direito do índice, sem sobrepor os filtros por categoria, subespecialidade, evidência ou conteúdo visual.
- O rótulo expõe o atalho **⌘K** e mantém descrição acessível para abrir a pesquisa global.
- O índice continua exibindo 69 procedimentos e preserva os filtros existentes após a inclusão da ação global.

Na validação por atalho de teclado, **⌘/Ctrl+K** abriu o diálogo corretamente. A consulta **“sangramento”** retornou resultados contextuais de complicações em procedimentos distintos, incluindo adrenalectomia, circuncisão, enucleação prostática, micro-TESE, nefrectomias, NLP, prostatectomia, RTU-B, uretrotomia e vasectomia. Cada resultado apresentou procedimento, tipo de conteúdo, título da seção e trecho explicativo.

A seleção do resultado de complicação da circuncisão navegou para a entrada correta com o fragmento `#section-5`, abriu diretamente o acordeão **“Complicações e seu manejo”** e preservou o contexto de orientação pós-operatória e figuras da técnica.

Após a ampliação do diálogo, a pesquisa global exibiu filtros rápidos para **Todos**, **Procedimentos**, **Técnica**, **Complicações** e **Referências**, além de ações por resultado para salvar em favoritos e copiar o link direto. A disposição manteve os metadados contextuais e os controles auxiliares visíveis sem bloquear a leitura dos resultados.

A marcação de favorito alterou a ação para **“Remover dos favoritos”**, confirmando a persistência local da seleção. A ação de cópia de link permaneceu disponível ao lado do favorito em cada resultado contextual.

Após a inclusão dos controles de gestão, o diálogo preservou o acesso aos resultados e ações individuais, com remoção contextual de favorito pelo ícone de fechar e comandos explícitos para limpar favoritos e histórico quando houver itens persistidos.

Na revisão posterior à reorganização dos controles, o diálogo continuou abrindo pelo atalho de teclado e preservou a identificação de favorito em cada resultado. A interface foi revalidada junto com os testes automatizados.

Os controles de limpeza foram consolidados como itens nativos da lista de comandos, sob os grupos de **Favoritos** e **Buscas recentes**. Essa composição preserva a navegação por teclado e garante que as ações sejam renderizadas como opções interativas do diálogo.

Na validação final, o comando **“Limpar favoritos”** apareceu sob o resultado salvo e manteve as ações individuais de remover favorito e copiar link. A mesma estrutura é aplicada ao histórico quando há buscas recentes registradas.
