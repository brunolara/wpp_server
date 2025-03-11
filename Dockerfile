FROM node:slim AS app

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update && apt-get install gnupg wget -y && \
  wget --quiet --output-document=- https://dl-ssl.google.com/linux/linux_signing_key.pub | gpg --dearmor > /etc/apt/trusted.gpg.d/google-archive.gpg && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install google-chrome-stable -y --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app
# Copia apenas os arquivos de dependências para aproveitar o cache do Docker
COPY package*.json ./


# Instala as dependências do projeto
RUN npm install

RUN node node_modules/puppeteer/install.js

# Copia o restante do código para o container
COPY . .

# Expõe a porta que sua aplicação utilizará (ajuste conforme necessário)
EXPOSE 3000

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/google-chrome"

# Comando para iniciar a aplicação
CMD ["npm", "run", "serve"]
