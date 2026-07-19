# Dockerfile para M13 - Reportes
FROM node:20-slim

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el código fuente
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto
EXPOSE 8094

# Comando de ejecución
CMD ["npm", "start"]
