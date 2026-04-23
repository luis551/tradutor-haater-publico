# Tradutor Haater // Pacote Publico

Essa e a pasta para enviar aos jogadores.

Ela nao inclui os arquivos de mestre com frases de desbloqueio em texto puro.
O app publico trabalha com comparacao por hash, entao as chaves nao ficam expostas de forma direta.

## Como abrir

No Windows:

1. De duplo clique em `iniciar_tradutor_haater.bat`

Ou pelo terminal:

```powershell
python "C:\Users\expeto\Desktop\arg smo\tradutor_haater_publico_jogadores\abrir_tradutor_haater.py"
```

## Como usar

1. Clique em `Abrir volume`.
2. Leia o quadro `Primeiro estudo`.
3. Cole uma linha ou pagina em Haater Antigo na `Mesa de Traducao`.
4. Veja a traducao parcial ou completa no folio ao lado.
5. Quando a margem responder, clique em `Registrar estudo`.
6. Se a frase parecer uma chave, teste no `Lacre Ritual`.
7. Consulte `Biblioteca Recuperada` e `Margens Anotadas`.
8. Escolha uma folha aberta e salve sua teoria em `Registrar anotacao`.
9. Se bater duvida, clique em `Estou perdido` ou no `?`.
10. Acompanhe o `Historico do Estudo` pelos sinais de cada evento.
11. Se uma reacao rara acontecer, veja se a `Camara Velada` respondeu.
12. Use o filtro das margens e clique em `Exportar dossie` quando quiser compartilhar.
13. O export agora sai como um arquivo `HTML` bonito, proprio para abrir no navegador ou salvar em PDF.

Atalho:

- `Ctrl + Enter` tambem registra estudo.
- `Ctrl + Enter` na area de anotacao tambem salva a nota.

## Conteudo desta pasta

- `index.html`
- `styles.css`
- `app.js`
- `abrir_tradutor_haater.py`
- `iniciar_tradutor_haater.bat`
- `.nojekyll`
- `.gitignore`

## GitHub Pages

Esta pasta ja esta no formato certo para GitHub Pages.

Fluxo recomendado:

1. Crie um repositorio so para o pacote publico.
2. Suba o conteudo desta pasta na raiz do repositorio.
3. No GitHub, abra `Settings > Pages`.
4. Em `Build and deployment`, escolha `Deploy from a branch`.
5. Selecione a branch principal e a pasta `/ (root)`.
6. Aguarde o link publico ser gerado.

## Observacao

Se alguem souber inspecionar codigo de cliente, ainda existe como investigar partes do funcionamento.
Mas as frases de desbloqueio nao estao mais salvas em texto puro aqui.
