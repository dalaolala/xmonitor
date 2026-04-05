#!/bin/bash
# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

# Stop existing service if running
systemctl stop x_monitor

# Get system architecture
ARCH=$(uname -m)
MONITOR_FILE="x_monitor-linux-amd64"

# Set appropriate monitor file based on architecture
if [ "$ARCH" = "x86_64" ]; then
    MONITOR_FILE="x_monitor-linux-amd64"
elif [ "$ARCH" = "aarch64" ]; then
    MONITOR_FILE="x_monitor-linux-arm64"
elif [ "$ARCH" = "x86_64" ] && [ "$(uname -s)" = "Darwin" ]; then
    MONITOR_FILE="x_monitor-darwin-amd64"
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi

# Create directory and change to it
mkdir -p /etc/x_monitor/
cd /etc/x_monitor/

# Download monitor
wget -O x_monitor https://github.com/dalaolala/xmonitor/releases/latest/download/$MONITOR_FILE
chmod 777 x_monitor

# Create service file
cat > /etc/systemd/system/x_monitor.service <<EOF
[Unit]
Description=X Monitor Service
After=network.target nss-lookup.target
Wants=network.target

[Service]
User=root
Group=root
Type=simple
LimitAS=infinity
LimitRSS=infinity
LimitCORE=infinity
LimitNOFILE=999999999
WorkingDirectory=/etc/x_monitor/
ExecStart=/etc/x_monitor/x_monitor
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Get user input
read -p "Enter auth_secret: " auth_secret
read -p "Enter listen port (default 3000): " listen
listen=${listen:-"3000"}
read -p "Enter hook_token: " hook_token

# Get enable_tg choice and related information
while true; do
    read -p "Enable Telegram notifications? (y/n): " enable_tg_choice
    case $enable_tg_choice in
        [Yy]* ) 
            enable_tg=true
            read -p "Enter Telegram bot token: " tg_token
            read -p "Enter Telegram chat ID: " tg_chat_id
            break;;
        [Nn]* ) 
            enable_tg=false
            tg_token="your_telegram_bot_token"
            tg_chat_id=0
            break;;
        * ) echo "Please answer y or n.";;
    esac
done

# Create config file
cat > /etc/x_monitor/config.json <<EOF
{
  "auth_secret": "${auth_secret}",
  "listen": ":${listen}",
  "enable_tg": ${enable_tg},
  "tg_token": "${tg_token}",
  "hook_uri": "/hook",
  "update_uri": "/monitor",
  "web_uri": "/ws",
  "hook_token": "${hook_token}",
  "tg_chat_id": ${tg_chat_id}
}
EOF

# Set permissions
chmod 644 /etc/x_monitor/config.json
chmod 644 /etc/systemd/system/x_monitor.service

# Start service
systemctl daemon-reload
systemctl enable x_monitor.service
systemctl start x_monitor.service

echo "Installation complete! Service status:"
systemctl status x_monitor.service
