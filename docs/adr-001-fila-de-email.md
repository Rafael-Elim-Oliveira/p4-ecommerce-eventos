# ADR 001 - Fila de email  

## Contexto  

Anteriormente, o pedido só repondia depois qie o e-mail era enviado e uma falha no e-mail derrubava o pedido.  


## Decisão  
  
Foi adotado uma estrutura de lista do Redis utilizando os comando `LPUSH` e `BRPOR` para enviar pedidos na API e consumir pedidos no worker respectivamente, substituindo o uso do publish/subscribe. Isto porque o `LPUSH` e `BRPOR` elimina as principais desvantagens do publish/subscribe: mensagens temporárias que poderiam nunca ser enviadas para o cliente ou mensagens duplicadas. `LPUSH` resolve o primeiro problema ao armazenar o pedido até um worker esteja disponível, enquanto o `BRPOR` garante atomicidade e segurança ao remover o item da lista e o entregar a apena um único worker.  


## Consequência  

Desta forma, o `POST /orders` retorna assim que o pedido é salvo no banco e iserido na
fila; falhas no provedor não afetam a gravação nem o pagamentos dos pedidos e, pode-se 
aumentar ou diminuir a quantidade de instâncias do worker conforme o volume de pedidos.