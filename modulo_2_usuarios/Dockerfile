FROM node:20-slim

# Instalar dependencias necesarias para compilar módulos nativos (como bcrypt)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar solo los archivos de dependencias primero para aprovechar caché
COPY package*.json ./

# Instalar dentro del contenedor (se compilará para Linux)
RUN npm install

# Copiar el resto del código
COPY . .

# Compilar TypeScript
RUN npm run build

EXPOSE 3000
CMD ["node", "dist/main.js"]
FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/app.js"]