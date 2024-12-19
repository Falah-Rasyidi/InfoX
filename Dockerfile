# Use Ubuntu as base image
FROM ubuntu:latest

# Create and set working directory
RUN mkdir /usr/src/InfoX
WORKDIR /usr/src/InfoX

# Install node
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y nodejs \
    npm

# Install python
RUN apt-get update && apt-get install -y python3
RUN apt-get install -y python3-pip

# Copy all folders (node_modules excepted in .dockerignore)
COPY . .

# Download node modules and python packages
RUN npm install
RUN pip install -r requirements.txt --break-system-packages

# Expose port 3000 for nextjs
# Expose port 5000 for uvicorn
EXPOSE 3000
EXPOSE 5000