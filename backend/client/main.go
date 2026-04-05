package main

import (
	"akile_monitor/client/model"
	"bytes"
	"compress/gzip"
	"context"
	"flag"
	"github.com/cloudwego/hertz/pkg/common/json"
	"github.com/henrylee2cn/goutil/calendar/cron"
	"log"
	"math/rand"
	"os"
	"os/signal"
	"time"

	"github.com/gorilla/websocket"
)

const (
	minReconnectInterval = 1 * time.Second  // 最小重连间隔
	maxReconnectInterval = 30 * time.Second // 最大重连间隔
	pingInterval         = 30 * time.Second // 心跳间隔
)

// reconnectState 管理重连状态
type reconnectState struct {
	interval time.Duration
	attempts int
}

// reset 重置重连状态（连接成功后调用）
func (r *reconnectState) reset() {
	r.interval = 0
	r.attempts = 0
}

// nextInterval 计算下一次重连间隔（指数退避 + 随机抖动）
func (r *reconnectState) nextInterval() time.Duration {
	r.attempts++
	if r.interval == 0 {
		r.interval = minReconnectInterval
	} else {
		r.interval *= 2
		if r.interval > maxReconnectInterval {
			r.interval = maxReconnectInterval
		}
	}
	// 添加随机抖动（±20%）
	jitter := time.Duration(float64(r.interval) * (0.8 + 0.4*rand.Float64()))
	return jitter
}

func main() {
	LoadConfig()

	go func() {
		c := cron.New()
		c.AddFunc("* * * * * *", func() {
			TrackNetworkSpeed()
		})
		c.Start()
	}()

	flag.Parse()
	log.SetFlags(0)

	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	// 主循环：连接 -> 工作 -> 断开 -> 重连
	var reconnect reconnectState
	for {
		// 尝试连接
		conn, err := connectWithAuth()
		if err != nil {
			waitDuration := reconnect.nextInterval()
			log.Printf("连接失败 (尝试 %d 次)，%v 后重试: %v\n", reconnect.attempts, waitDuration, err)
			time.Sleep(waitDuration)
			continue
		}

		// 连接成功，重置重连状态
		reconnect.reset()
		log.Println("已连接到服务端，开始上报数据...")

		// 工作循环
		err = runConnection(conn, interrupt)
		conn.Close()

		// 检查是否为用户主动中断
		if err == nil {
			log.Println("正常退出")
			return
		}

		// 连接断开，准备重连
		waitDuration := reconnect.nextInterval()
		log.Printf("连接断开: %v，%v 后重连...\n", err, waitDuration)
		time.Sleep(waitDuration)
	}
}

// connectWithAuth 建立连接并进行认证
func connectWithAuth() (*websocket.Conn, error) {
	log.Printf("正在连接到 %s ...\n", cfg.Url)

	c, _, err := websocket.DefaultDialer.Dial(cfg.Url, nil)
	if err != nil {
		return nil, err
	}

	// 发送认证
	err = c.WriteMessage(websocket.TextMessage, []byte(cfg.AuthSecret))
	if err != nil {
		c.Close()
		return nil, err
	}

	// 等待认证响应
	_, message, err := c.ReadMessage()
	if err != nil {
		c.Close()
		return nil, err
	}

	if string(message) != "auth success" {
		c.Close()
		return nil, err
	}

	log.Println("认证成功")
	return c, nil
}

// runConnection 运行连接工作循环，返回 nil 表示正常退出，否则返回错误
func runConnection(conn *websocket.Conn, interrupt chan os.Signal) error {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	done := make(chan error, 1)

	// 启动心跳 goroutine
	go heartbeatLoop(ctx, conn, done)

	// 启动数据上报 goroutine
	go reportLoop(ctx, conn, done)

	// 等待中断信号或错误
	select {
	case err := <-done:
		return err
	case <-interrupt:
		log.Println("收到中断信号，正在关闭连接...")
		// 发送关闭帧
		err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		if err != nil {
			return err
		}
		// 等待服务器关闭或超时
		select {
		case <-done:
		case <-time.After(time.Second):
		}
		return nil // 正常退出
	}
}

// heartbeatLoop 心跳循环
func heartbeatLoop(ctx context.Context, conn *websocket.Conn, done chan error) {
	ticker := time.NewTicker(pingInterval)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			// 发送 ping
			err := conn.WriteMessage(websocket.PingMessage, nil)
			if err != nil {
				done <- err
				return
			}
		}
	}
}

// reportLoop 数据上报循环
func reportLoop(ctx context.Context, conn *websocket.Conn, done chan error) {
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case t := <-ticker.C:
			var D struct {
				Host      *model.Host
				State     *model.HostState
				TimeStamp int64
			}
			D.Host = GetHost()
			D.State = GetState()
			D.TimeStamp = t.Unix()

			// gzip 压缩 json
			dataBytes, err := json.Marshal(D)
			if err != nil {
				log.Println("json.Marshal error:", err)
				continue // 序列化错误不退出，继续下一轮
			}

			var buf bytes.Buffer
			gz := gzip.NewWriter(&buf)
			if _, err := gz.Write(dataBytes); err != nil {
				log.Println("gzip.Write error:", err)
				gz.Close()
				continue
			}

			if err := gz.Close(); err != nil {
				log.Println("gzip.Close error:", err)
				continue
			}

			err = conn.WriteMessage(websocket.TextMessage, buf.Bytes())
			if err != nil {
				done <- err
				return
			}
		}
	}
}