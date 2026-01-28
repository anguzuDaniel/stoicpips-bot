# Use official Python runtime as a parent image
FROM python:3.9-slim

# Set working directory
# Set working directory
WORKDIR /app

# Install system dependencies (required for XGBoost/Scikit-learn on Linux)
RUN apt-get update && apt-get install -y libgomp1 && rm -rf /var/lib/apt/lists/*

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
# Run command
CMD ["python", "main.py"]
