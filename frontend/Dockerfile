FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV REACT_APP_API_BASE_URL=http://backend:8000
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
