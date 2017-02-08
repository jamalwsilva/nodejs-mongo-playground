# nodejs-mongo-playground
Testando Índices no mongo

## Antes de proseguir
Instale o MongoDB numa versão ^3.2. Se estiver rodando com pouca memória dê preferência para o 3.4 pois o wiredtiger possui requisitos mínimos de memória menores (256Mib em vez de 1GiB em versões anteriores)

Instale o Node.js pois todos os scripts para popular o banco e manipular índices estão escritos em nodejs (quaisquer versões  ~6.9.0 | ~7.0.0 servirão).

O único script que depende apenas do mongo é o `bin/mongo-queries.js`. Este possui algumas queries definidas de modo a testar utilização dos índices. Cada query nele é aplicada a todas as collections com o prefixo `/^messages_/` na base `logs`.

Matenha o code style consistente instalando o [editorconfig](http://editorconfig.org) e [jscs](http://jscs.info).

## Instruções de instalação
```
# clone do repositório e instalação de dependências
git clone https://github.com/jamalwsilva/nodejs-mongo-playground.git
cd nodejs-mongo-playground
npm install
```

## Criar índices, popular banco e testar consultas
```shell
# paciencia, este demora
npm run createindexes && npm run populate 

# roda algumas consultas em todas as collections criadas # demora um bocado também
npm -s run sendqueries > resources/query-results.jsonl

# count nas collections (deve retornar 10M para cada uma)
mongo logs <<< " \
db.getCollectionNames() \
  .filter(coll => coll.match(/^messages/)) \
  .map(coll => { return { name: coll, count: db[coll].count() } }); \
"

# visualizar resultados das consultas
jq . resources/query-results.jsonl | less

# analisar somente durações e quantidade de itens retornada no cursor para cada query
jq '{
  coll: .collection,
  queries: [.queries[] | {count: .count, coll: .collection, query: .query | tojson, duration: .duration}]
}' resources/query-results.jsonl | less
```

## Ambientes testados
- CentOS-7.2
- Ubuntu-14.04

## Links úteis
- https://docs.mongodb.com/manual/reference/configuration-options/#storage.wiredTiger.engineConfig.cacheSizeGB
- http://mongodb.github.io/node-mongodb-native/2.0/api/
- https://docs.mongodb.com/manual/indexes/
- https://github.com/stedolan/jq.git
- http://editorconfig.org (ver [.editorconfig](.editorconfig))
- http://jscs.info (ver [.jscs](.jscsrc))
