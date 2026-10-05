FROM node:20-slim
WORKDIR /app
COPY backend/package.json .
RUN npm install express cors multer exifr pg
COPY backend/ .
COPY db ./db
ENV SCHEMA=./db/schema.sql
CMD ["npm","start"]
