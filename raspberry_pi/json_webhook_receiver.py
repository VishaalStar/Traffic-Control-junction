#!/usr/bin/env python3
"""
JSON Webhook Receiver for Traffic Junction Control System

This script sets up a simple web server that receives JSON configuration updates
from the web hosting platform and saves them to a local file.

Usage:
    python3 json_webhook_receiver.py

Configuration:
    - Set the SERVER_PORT to the port you want the webhook server to listen on
    - Set the JSON_FILE_PATH to the location where you want to save the JSON file
    - Set the SECRET_KEY to a secure key that the web hosting platform will use to authenticate
"""

import json
import os
import logging
from datetime import datetime
from http.server import HTTPServer, BaseHTTPRequestHandler
import hashlib
import hmac

# Configuration
SERVER_PORT = 8080
JSON_FILE_PATH = "/home/pi/traffic_junction/config.json"
BACKUP_DIR = "/home/pi/traffic_junction/backups"
SECRET_KEY = "your-secret-key-here"  # Change this to a secure key
LOG_FILE = "/home/pi/traffic_junction/webhook_receiver.log"

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Ensure backup directory exists
os.makedirs(BACKUP_DIR, exist_ok=True)

class WebhookHandler(BaseHTTPRequestHandler):
    def _set_response(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.end_headers()
    
    def do_POST(self):
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Verify signature if provided
            if 'X-Signature' in self.headers:
                signature = self.headers['X-Signature']
                computed_signature = hmac.new(
                    SECRET_KEY.encode(),
                    post_data,
                    hashlib.sha256
                ).hexdigest()
                
                if signature != computed_signature:
                    logging.warning("Invalid signature received")
                    self._set_response(403)
                    self.wfile.write(json.dumps({"error": "Invalid signature"}).encode())
                    return
            
            # Parse JSON data
            try:
                config = json.loads(post_data.decode())
            except json.JSONDecodeError as e:
                logging.error(f"Invalid JSON received: {e}")
                self._set_response(400)
                self.wfile.write(json.dumps({"error": "Invalid JSON"}).encode())
                return
            
            # Save to file
            with open(JSON_FILE_PATH, 'w') as f:
                json.dump(config, f, indent=2)
            
            # Create a backup with timestamp
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(BACKUP_DIR, f"config_{timestamp}.json")
            with open(backup_path, 'w') as f:
                json.dump(config, f, indent=2)
            
            logging.info(f"Received and saved JSON configuration update")
            
            # Send success response
            self._set_response()
            self.wfile.write(json.dumps({"status": "success"}).encode())
            
        except Exception as e:
            logging.error(f"Error processing webhook: {e}")
            self._set_response(500)
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_GET(self):
        if self.path == '/health':
            # Health check endpoint
            self._set_response()
            self.wfile.write(json.dumps({"status": "healthy"}).encode())
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

def run_server():
    """Run the webhook server"""
    server_address = ('', SERVER_PORT)
    httpd = HTTPServer(server_address, WebhookHandler)
    logging.info(f"Starting webhook server on port {SERVER_PORT}")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logging.info("Server stopped by user")
    except Exception as e:
        logging.error(f"Server error: {e}")
    finally:
        httpd.server_close()
        logging.info("Server stopped")

if __name__ == "__main__":
    run_server()
