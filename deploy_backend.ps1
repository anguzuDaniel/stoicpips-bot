$env:SUPABASE_URL="https://qjdacnftlkdnzjkshjrq.supabase.co"
$env:SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFqZGFjbmZ0bGtkbnpqa3NoanJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTgzODAsImV4cCI6MjA3OTczNDM4MH0._kV1X37Ln8DJf8RgRt8JDTHz5bsXR0DeZcuQ3bmARhM"
$env:SUPABASE_DATABASE_PASSWORD="-dzLa-*9xhn@9Rh"
$env:DERIV_WS_URL="wss://ws.derivws.com/websockets/v3"
$env:DERIV_REAL_API_TOKEN="a0B3zxQbk4V8iq4"
$env:DERIV_API_TOKEN="XeGjLeCICcHb3oz"
$env:DERIV_APP_ID="113529"
$env:JWT_SECRET="3f7b2e9c1a5d8f0e4b6a9c2d7f1e8a3b5c6d9e0f2a4b6c8d1e3f5a7b9c2d4e6f8a0b2c4d6e8f0a2b4c6d8e0"
$env:ENCRYPTION_KEY="5d8f0e4b6a9c2d7f1e8a3b5c6d9e0f2a4b6c8d1e3f5a7b9c2d4e6f8a0b2c4"

# 1. Build Image using Cloud Build
Write-Host "Building Docker image..."
$IMAGE_TAG="us-central1-docker.pkg.dev/dunam/cloud-run-source-deploy/dunam-backend:latest"
gcloud builds submit --tag $IMAGE_TAG .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Build failed."
    exit 1
}

# 2. Deploy to Cloud Run
Write-Host "Deploying to Cloud Run..."
gcloud run deploy dunam-backend `
  --image $IMAGE_TAG `
  --region us-central1 `
  --allow-unauthenticated `
  --port 4000 `
  --set-env-vars "SUPABASE_URL=$env:SUPABASE_URL,SUPABASE_ANON_KEY=$env:SUPABASE_ANON_KEY,SUPABASE_DATABASE_PASSWORD=$env:SUPABASE_DATABASE_PASSWORD,DERIV_WS_URL=$env:DERIV_WS_URL,DERIV_REAL_API_TOKEN=$env:DERIV_REAL_API_TOKEN,DERIV_API_TOKEN=$env:DERIV_API_TOKEN,DERIV_APP_ID=$env:DERIV_APP_ID,JWT_SECRET=$env:JWT_SECRET,ENCRYPTION_KEY=$env:ENCRYPTION_KEY"
