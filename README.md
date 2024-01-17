# wpp_server

Servidor para envio de mensagens via whatsapp com typescript+nodeJS, 
usando uma lib alternativa e grátis: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js).
Cria-se uma fila com [bullMQ](https://docs.bullmq.io/), e cada mensagem é colocada em uma fila, e processada uma por vez, evitando problemas de banimento de numero, 
e eventuais erros de concorrência.<br>
Possui três endpoints: 

### POST /sendMessage
Envia uma mensagem com texto plano. Ex: 
```json
{
    "to": "5545999999999",
    "body": "Olá, como vai"
}
```

### POST /sendMessageBulk
Envia várias mensagens com texto plano . Ex:
```json
[
  {
    "to": "5545999999999",
    "body": "Olá, como vai"
  },
  {
    "to": "5545999999999",
    "body": "Você está bem?"
  }
]
```


### POST /sendFile (Arquivo em bas64)
Envia um arquivo encodado em base64:
```json
{
    "to": "5545999999999",
    "base64File": "",
    "mimeType": "application/pdf",
    "fileName": "Nome.pdf"
}
```

### POST /sendFile (Arquivo remoto)
Envia um arquivo apartir de uma URL externa:
```json
{
    "to": "45991564481",
    "fileUrl": "https://www.africau.edu/images/default/sample.pdf",
    "fileName": "Nome.pdf"
}
```

### GET /ping
Request simples para checar se o whatsapp está funcional


### GET /message/:id
Request simples para pegar os dados da mensagem atual (usar o uuid retornado no envio da mensagem)


### Autenticação
Toda request deve conter no header o campo <b>authorization</b>, e o valor terá de ser o mesmo configurado no config.json do projeto
