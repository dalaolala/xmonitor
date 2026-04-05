#!/bin/bash
if [ "$EUID" -ne 0 ]; then
 echo "Please run as root"
 exit 1
fi

function install_monitor_fe() {
 wget -O setup-monitor-fe.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-monitor-fe.sh"
 chmod +x setup-monitor-fe.sh
 ./setup-monitor-fe.sh
}

function install_monitor() {
 wget -O setup-monitor.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-monitor.sh"
 chmod +x setup-monitor.sh
 ./setup-monitor.sh
}

function uninstall_monitor() {
 systemctl stop x_monitor
 systemctl disable x_monitor
 rm -f /etc/systemd/system/x_monitor.service
 rm -rf /etc/x_monitor
 systemctl daemon-reload
 echo "Monitor backend uninstalled"
}

function view_monitor_config() {
 if [ -f /etc/x_monitor/config.json ]; then
     cat /etc/x_monitor/config.json
 else
     echo "Monitor config not found"
 fi
}

function install_client() {
 echo "Please provide client installation parameters:"
 read -p "Enter auth_secret: " auth_secret
 read -p "Enter URL: " url
 read -p "Enter name: " name
 wget -O setup-client.sh "https://raw.githubusercontent.com/dalaolala/xmonitor/refs/heads/main/backend/setup-client.sh"
 chmod +x setup-client.sh
 ./setup-client.sh "$auth_secret" "$url" "$name"
}

function uninstall_client() {
 systemctl stop x_client
 systemctl disable x_client
 rm -f /etc/systemd/system/x_client.service
 rm -rf /etc/x_monitor
 systemctl daemon-reload
 echo "Client uninstalled"
}

function view_client_config() {
 if [ -f /etc/x_monitor/client.json ]; then
     cat /etc/x_monitor/client.json
 else
     echo "Client config not found"
 fi
}

while true; do
 echo "    _    _    _ _        __  __             _ _             "
 echo "   / \  | | _(_) | ___  |  \/  | ___  _ __ (_) |_ ___  _ __ "
 echo "  / _ \ | |/ / | |/ _ \ | |\/| |/ _ \| '_ \| | __/ _ \| '__|"
 echo " / ___ \|   <| | |  __/ | |  | | (_) | | | | | || (_) | |   "
 echo "/_/   \_\_|\_\_|_|\___| |_|  |_|\___/|_| |_|_|\__\___/|_|   "
 echo "                                                            "
 echo "=================================================="
 echo "X Monitor 管理脚本 Powered by KunBuFenZi"
 echo "=================================================="
 echo "0.安装主控前端"
 echo "1.安装主控后端"
 echo "2.卸载主控后端"
 echo "3.查看主控config"
 echo "4.安装被控"
 echo "5.卸载被控"
 echo "6.查看被控config"
 echo "7.退出"
 echo "============================================="
 
 read -p "Please select an option (0-7): " choice
 
 case $choice in
     0) install_monitor_fe ;;
     1) install_monitor ;;
     2) uninstall_monitor ;;
     3) view_monitor_config ;;
     4) install_client ;;
     5) uninstall_client ;;
     6) view_client_config ;;
     7) exit 0 ;;
     *) echo "Invalid option" ;;
 esac
 
 echo
 read -p "Press Enter to continue..."
 clear
done
