#!/usr/bin/env python3
"""
Twitch HLS Proxy Server
Запуск: python server.py
Откройте: http://localhost:8080
"""

import http.server
import socketserver
import json
import urllib.request
import urllib.parse
import urllib.error
import re
import os
import random
import string
import socket
import time

PORT = 8080
CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko'  # Public Twitch client ID

class TimeoutHTTPHandler(http.server.SimpleHTTPRequestHandler):
    """Хендлер с таймаутами"""
    timeout = 30
    
    def handle_one_request(self):
        """Обработка одного запроса с защитой от разрыва соединения"""
        try:
            super().handle_one_request()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Клиент разорвал соединение - игнорируем
            pass
        except Exception as e:
            # Логируем другие ошибки
            print(f"Error handling request: {e}")

class TwitchProxyHandler(TimeoutHTTPHandler):
    
    def do_GET(self):
        try:
            # API для получения плейлиста
            if self.path.startswith('/api/playlist/'):
                channel = self.path.split('/api/playlist/')[1].split('?')[0].lower()
                self.get_playlist(channel)
            # API для проверки онлайн статуса
            elif self.path.startswith('/api/status/'):
                channel = self.path.split('/api/status/')[1].split('?')[0].lower()
                self.get_status(channel)
            # Прокси для сегментов видео
            elif self.path.startswith('/api/proxy/'):
                url = urllib.parse.unquote(self.path.split('/api/proxy/')[1])
                self.proxy_request(url)
            else:
                # Обычные статические файлы
                super().do_GET()
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Клиент разорвал соединение - ничего не делаем
            pass
        except Exception as e:
            print(f"Error in do_GET: {e}")
            try:
                self.send_error(500, f"Internal Server Error: {str(e)}")
            except:
                pass
    
    def get_access_token(self, channel):
        """Получение access token через GraphQL"""
        url = 'https://gql.twitch.tv/gql'
        
        payload = {
            "operationName": "PlaybackAccessToken",
            "extensions": {
                "persistedQuery": {
                    "version": 1,
                    "sha256Hash": "0828119ded1c13477966434e15800ff57ddacf13ba1911c129dc2200705b0712"
                }
            },
            "variables": {
                "isLive": True,
                "login": channel,
                "isVod": False,
                "vodID": "",
                "playerType": "embed"
            }
        }
        
        headers = {
            'Client-ID': CLIENT_ID,
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        # Несколько попыток с задержкой
        for attempt in range(3):
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode('utf-8'),
                    headers=headers,
                    method='POST'
                )
                with urllib.request.urlopen(req, timeout=10) as response:
                    data = json.loads(response.read().decode('utf-8'))
                    token_data = data.get('data', {}).get('streamPlaybackAccessToken')
                    if token_data:
                        return {
                            'token': token_data.get('value'),
                            'sig': token_data.get('signature')
                        }
            except urllib.error.URLError as e:
                print(f'Error getting token for {channel} (attempt {attempt + 1}): {e}')
                if attempt < 2:  # Не ждем после последней попытки
                    time.sleep(1)
            except Exception as e:
                print(f'Error getting token for {channel}: {e}')
                break
        
        return None
    
    def get_playlist(self, channel):
        """Получение HLS плейлиста"""
        try:
            token_data = self.get_access_token(channel)
            
            if not token_data:
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.apple.mpegurl')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'#EXTM3U\n#EXT-X-ERROR:Stream offline or unavailable')
                return
            
            # Формируем URL плейлиста
            random_str = ''.join(random.choices(string.ascii_lowercase + string.digits, k=32))
            
            params = {
                'allow_source': 'true',
                'allow_audio_only': 'true',
                'allow_spectre': 'true',
                'p': random.randint(100000, 9999999),
                'player': 'twitchweb',
                'playlist_include_framerate': 'true',
                'segment_preference': '4',
                'sig': token_data['sig'],
                'token': token_data['token'],
                'cdm': 'wv',
                'player_version': '1.20.0',
                'player_backend': 'mediaplayer'
            }
            
            playlist_url = f"https://usher.ttvnw.net/api/channel/hls/{channel}.m3u8?{urllib.parse.urlencode(params)}"
            
            # Запрашиваем плейлист
            req = urllib.request.Request(playlist_url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            })
            
            with urllib.request.urlopen(req, timeout=15) as response:
                playlist = response.read().decode('utf-8')
                
                # Проксируем URL-ы сегментов через наш сервер
                lines = playlist.split('\n')
                modified_lines = []
                for line in lines:
                    if line.startswith('http') and not line.startswith('https://usher.ttvnw.net'):
                        # Заменяем URL на наш прокси
                        proxied_url = f'/api/proxy/{urllib.parse.quote(line, safe="")}'
                        modified_lines.append(proxied_url)
                    else:
                        modified_lines.append(line)
                
                # Отправляем ответ
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.apple.mpegurl')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'no-cache')
                self.end_headers()
                
                self.wfile.write('\n'.join(modified_lines).encode('utf-8'))
                
        except urllib.error.HTTPError as e:
            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.apple.mpegurl')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if e.code == 404:
                self.wfile.write(b'#EXTM3U\n#EXT-X-ERROR:Stream offline')
            else:
                self.wfile.write(f'#EXTM3U\n#EXT-X-ERROR:HTTP {e.code}'.encode('utf-8'))
        except (socket.timeout, urllib.error.URLError) as e:
            self.send_response(200)
            self.send_header('Content-Type', 'application/vnd.apple.mpegurl')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(f'#EXTM3U\n#EXT-X-ERROR:Connection timeout'.encode('utf-8'))
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Клиент разорвал соединение - игнорируем
            pass
        except Exception as e:
            try:
                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.apple.mpegurl')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(f'#EXTM3U\n#EXT-X-ERROR:{str(e)}'.encode('utf-8'))
            except:
                pass
    
    def get_status(self, channel):
        """Проверка онлайн статуса"""
        try:
            token_data = self.get_access_token(channel)
            
            result = {
                'channel': channel,
                'online': token_data is not None
            }
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Cache-Control', 'no-cache')
            self.end_headers()
            
            self.wfile.write(json.dumps(result).encode('utf-8'))
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Клиент разорвал соединение - игнорируем
            pass
        except Exception as e:
            print(f"Error in get_status: {e}")
            try:
                self.send_error(500, f"Error: {str(e)}")
            except:
                pass
    
    def proxy_request(self, url):
        """Проксирование запросов к Twitch CDN"""
        try:
            # Проверяем, что URL валидный
            if not url or not url.startswith(('http://', 'https://')):
                self.send_error(400, "Invalid URL")
                return
            
            # Создаем запрос к CDN
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Origin': 'https://www.twitch.tv',
                'Referer': 'https://www.twitch.tv/'
            })
            
            # Получаем контент с таймаутом
            with urllib.request.urlopen(req, timeout=20) as response:
                content_type = response.headers.get('Content-Type', 'application/octet-stream')
                content_length = response.headers.get('Content-Length')
                
                # Отправляем заголовки
                self.send_response(200)
                self.send_header('Content-Type', content_type)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Cache-Control', 'max-age=30')  # Кэшируем на 30 секунд
                if content_length:
                    self.send_header('Content-Length', content_length)
                self.end_headers()
                
                # Отправляем контент частями
                while True:
                    try:
                        chunk = response.read(8192)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        self.wfile.flush()
                    except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
                        # Клиент разорвал соединение - прекращаем отправку
                        break
                    except Exception as e:
                        print(f"Error sending chunk: {e}")
                        break
                        
        except urllib.error.HTTPError as e:
            try:
                self.send_response(e.code)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(f'Proxy HTTP error: {e.code}'.encode('utf-8'))
            except:
                pass
        except (socket.timeout, urllib.error.URLError) as e:
            try:
                self.send_response(504)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(b'Proxy timeout')
            except:
                pass
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            # Клиент разорвал соединение - игнорируем
            pass
        except Exception as e:
            try:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(f'Proxy error: {str(e)}'.encode('utf-8'))
            except:
                pass
    
    def do_OPTIONS(self):
        """CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.send_header('Access-Control-Max-Age', '86400')  # 24 часа
        self.end_headers()
    
    def log_message(self, format, *args):
        """Красивый лог"""
        if '/api/' in args[0]:
            print(f'[API] {args[0]}')
        elif not any(x in args[0] for x in ['.js', '.css', '.ico', '.png', '.jpg', '.gif']):
            print(f'[FILE] {args[0]}')
    
    def end_headers(self):
        """Дополнительные заголовки"""
        self.send_header('Connection', 'close')  # Закрываем соединение после каждого ответа
        super().end_headers()


def run_server():
    # Настраиваем сокет для предотвращения ошибок соединения
    socketserver.TCPServer.allow_reuse_address = True
    
    with socketserver.TCPServer(("", PORT), TwitchProxyHandler) as httpd:
        # Устанавливаем таймаут для сокета
        httpd.timeout = 30
        httpd.socket.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
        
        print(f"""
╔══════════════════════════════════════════════════════════════╗
║           🎮 Twitch Multi-Stream Proxy Server 🎮             ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║   Сервер запущен на: http://localhost:{PORT}                  ║
║                                                              ║
║   API endpoints:                                             ║
║   • /api/playlist/{{channel}} - HLS плейлист                  ║
║   • /api/status/{{channel}}   - Онлайн статус                 ║
║                                                              ║
║   Нажмите Ctrl+C для остановки                               ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
        """)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[Server] Остановка...")
            httpd.shutdown()
        except Exception as e:
            print(f"\n[Server] Ошибка: {e}")
            httpd.shutdown()


if __name__ == '__main__':
    run_server()
