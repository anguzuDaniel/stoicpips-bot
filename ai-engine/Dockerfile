# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose port (Cloud Run sets PORT env var, usually 8080)
ENV PORT=8080
EXPOSE 8080

# Run command
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
