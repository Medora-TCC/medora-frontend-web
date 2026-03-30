# Informações
Este repositório está utilizando TurboRepo, ferramenta para gerenciamento de monorepos

## Dependências necessárias
pnpm (Packet manager)
```bash
npm install -g pnpm@latest-10
```

Turbo
```bash
pnpm add turbo --global
```

## Comandos úteis

```bash
turbo dev
```
Inicia todos os projetos em modo dev (com HotReload)

```bash
turbo build
```
Realiza o build de todos os projetos

## Estrutura de pastas
- /apps -> Local onde os projetos estão localizados
- /packages -> Local onde os pacotes/bibliotecas estão localizados
- /packages/shared -> Biblioteca a ser usada no projeto
- /packages/shared/src/components -> Componentes reutilizáveis

## Aviso
Ao adicionar algo ao pacote shared (componente, interface, etc.) é necessário:
    - Exportar o item no próprio arquivo
    - Exportar item no arquivo index.ts
    - Realizar o build do pacote para que as modificações/adições entrem em vigor com o comando.
```bash
    cd packages/shared
    pnpm run build
```