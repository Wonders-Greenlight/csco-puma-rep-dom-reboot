FROM node:18-alpine

ARG SHOPIFY_API_KEY
ENV SHOPIFY_API_KEY=$SHOPIFY_API_KEY
EXPOSE 8081
WORKDIR /app
COPY app .
RUN source .env
RUN npm install
RUN cd frontend && npm install && source .env && npm run build
CMD ["npm", "run", "serve"]
