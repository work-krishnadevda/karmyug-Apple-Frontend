# ================== CONFIG ==================

$LOCAL_PROJECT_PATH="D:\projects\real-apple-project\frontend\real_apple_frontend"
$LOCAL_BUILD_PATH="$LOCAL_PROJECT_PATH\build"

$SSH_USER="root"
$SERVER_IP="154.12.228.119"
$SERVER_CLIENT_PATH="/www/wwwroot/api.realapple.in/public/client"
$PROJECT_ROOT_PATH="/www/wwwroot/api.realapple.in"

$PM2_APP_NAME="Real_apple_API"

Write-Host "DEPLOY STARTED"

# ------------------ LOCAL CHECKS ------------------

if (!(Test-Path $LOCAL_PROJECT_PATH)) {
    Write-Error "Project path not found"
    exit 1
}

Set-Location $LOCAL_PROJECT_PATH

if (!(Test-Path $LOCAL_BUILD_PATH)) {
    Write-Error "Build folder not found. Run npm run build first."
    exit 1
}

if (!(Test-Path "$LOCAL_BUILD_PATH\index.html")) {
    Write-Error "index.html missing in build folder"
    exit 1
}

Write-Host "Local build verified"

# ------------------ SERVER BACKUP ------------------

Write-Host "Taking server backup..."

ssh "$SSH_USER@$SERVER_IP" "
cd $SERVER_CLIENT_PATH
if [ -d build ]; then
  mv build build_backup_\$(date +%Y_%m_%d_%H%M)
fi
mkdir -p build
"

# ------------------ UPLOAD BUILD ------------------

Write-Host "Uploading build to server..."

scp -r "$LOCAL_BUILD_PATH\*" "${SSH_USER}@${SERVER_IP}:${SERVER_CLIENT_PATH}/build/"

# ------------------ DEPLOY ------------------

Write-Host "Deploying build..."

ssh "$SSH_USER@$SERVER_IP" "
cd $PROJECT_ROOT_PATH
cp public/client/build/index.html public/index.html
rm -rf public/static
cp -r public/client/build/static public/
pm2 restart $PM2_APP_NAME
pm2 list
"

Write-Host "DEPLOY COMPLETED"
Write-Host "Website should be live now"
