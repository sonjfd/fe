FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ARG VITE_BACKEND_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_GOOGLE_REDIRECT_URI

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_REDIRECT_URI=$VITE_GOOGLE_REDIRECT_URI

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]


#docker build -t fe . --build-arg VITE_BACKEND_URL="http://localhost:8080" --build-arg VITE_GOOGLE_CLIENT_ID="633655029851-o3speubclis9u3219d9rh3b4abvvhqlr.apps.googleusercontent.com" --build-arg VITE_GOOGLE_REDIRECT_URI="http://localhost:8080/login/oauth2/code/google"

