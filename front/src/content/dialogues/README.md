# Cadastro de diálogos

Cada diálogo deve ficar em seu próprio arquivo neste diretório. O arquivo exporta um objeto que utiliza `satisfies Dialogue`, garantindo a estrutura durante o build sem adicionar validação ao pacote do navegador.

Para cadastrar um diálogo:

1. Crie um arquivo com nome descritivo, por exemplo `fazendo-check-in.ts`.
2. Preencha os metadados, personagens e falas seguindo o tipo `Dialogue`.
3. Inclua traduções escritas e revisadas para todas as falas.
4. Cadastre uma resposta principal e, quando fizer sentido, uma alternativa.
5. Adicione ao `catalog.ts` apenas os metadados e o carregador dinâmico.
6. Mantenha `turnCount` igual à quantidade real de falas.

O catálogo é carregado na listagem. O conteúdo completo de cada roteiro só é baixado quando o usuário abre a prática correspondente.
