FROM node:20-alpine

RUN npm install -g pnpm@8.15.9

WORKDIR /app

COPY package.json .npmrc ./

RUN pnpm install --shamefully-hoist && \
    pnpm add -D vite@5.3.1 @vitejs/plugin-react@4.3.1

COPY . .

EXPOSE 5173

CMD ["./node_modules/.bin/vite", "--host", "--port", "5173"]