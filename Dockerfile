# Use a multi-stage build for the Next.js app
FROM node:14 AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json .

# Install dependencies
RUN npm install

# Copy the rest of the Next.js app
COPY src/ .

# Build the Next.js app
RUN npm run build

# Use a lightweight image for the final stage
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy the built Next.js app from the builder stage
COPY --from=builder .next/ .
COPY --from=builder public/ .
COPY --from=builder package*.json .

# Install only production dependencies
RUN npm install --only=production

# Copy the GPT-4All API server
COPY src/gpt4all .

# Install GPT-4All dependencies
RUN pip install fastapi pydantic gpt4all uvicorn

# Expose the ports for Next.js and FastAPI
EXPOSE 3000 8000

# Start both the Next.js app and the GPT-4All API server
CMD ["sh", "-c", "npm start & uvicorn gpt4all.gpt4all_api:app --host 0.0.0.0 --port 8000"]