#!/usr/bin/env python3
"""
Traffic Junction JSON Monitor

This script continuously monitors for JSON configuration updates from the web frontend
and processes them on the Raspberry Pi. It prints relevant variable values to demonstrate
real-time updates when the web interface changes.

Usage:
python3 traffic_json_monitor.py
"""

import json
import time
import os
import logging
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("traffic_monitor.log"),
        logging.StreamHandler(sys.stdout)
    ]
)

# Import initial variables
try:
    from traffic_start_variables import *
    logging.info("Successfully imported initial variables")
except ImportError:
    logging.error("Failed to import traffic_start_variables.py")
    # Define default values for essential variables
    manualcontrol_mode = False
    autocontrol_mode = True
    semicontrol_mode = False
    route_matrix = []
    all_pole_yellow_blink = False
    time_zone_number = 1

# Configuration
JSON_FILE_PATH = "traffic_config.json"
BACKUP_DIR = "backups"
SERVER_PORT = 8080

# Ensure backup directory exists
os.makedirs(BACKUP_DIR, exist_ok=True)

# Global variables to track state
last_update_time = None
current_config = {}

class ConfigState:
    """Class to store and manage the current configuration state"""
    def __init__(self):
        self.manualcontrol_mode = manualcontrol_mode
        self.autocontrol_mode = autocontrol_mode
        self.semicontrol_mode = semicontrol_mode
        self.all_pole_yellow_blink = all_pole_yellow_blink
        self.selected_pole = None
        self.active_route = None
        self.time_zone_number = time_zone_number
        self.last_command = None
        
    def update_from_json(self, config_data):
        """Update state from JSON configuration data"""
        if 'controlMode' in config_data:
            mode = config_data['controlMode']
            self.manualcontrol_mode = (mode == 'manual')
            self.autocontrol_mode = (mode == 'auto')
            self.semicontrol_mode = (mode == 'semi')
            logging.info(f"Control mode updated to: {mode}")
        
        if 'selectedPole' in config_data:
            self.selected_pole = config_data['selectedPole']
            logging.info(f"Selected pole updated to: {self.selected_pole}")
            
        if 'activeRoute' in config_data:
            self.active_route = config_data['activeRoute']
            logging.info(f"Active route updated to: {self.active_route}")
            
        if 'yellowBlink' in config_data:
            self.all_pole_yellow_blink = config_data['yellowBlink']
            logging.info(f"Yellow blink mode: {'Enabled' if self.all_pole_yellow_blink else 'Disabled'}")
            
        if 'timeZone' in config_data:
            self.time_zone_number = config_data['timeZone']
            logging.info(f"Time zone updated to: {self.time_zone_number}")
            
        if 'command' in config_data:
            self.last_command = config_data['command']
            logging.info(f"Received command: {self.last_command}")
            
        # Print current state after update
        self.print_current_state()
    
    def print_current_state(self):
        """Print the current state of the traffic controller"""
        print("\n" + "="*50)
        print("TRAFFIC JUNCTION CONTROLLER - CURRENT STATE")
        print("="*50)
        print(f"Control Mode: {'Manual' if self.manualcontrol_mode else 'Auto' if self.autocontrol_mode else 'Semi'}")
        print(f"Selected Pole: {self.selected_pole or 'None'}")
        print(f"Active Route: {self.active_route or 'None'}")
        print(f"Yellow Blink Mode: {'Enabled' if self.all_pole_yellow_blink else 'Disabled'}")
        print(f"Current Time Zone: {self.time_zone_number}")
        print(f"Last Command: {self.last_command or 'None'}")
        print("="*50)

# Initialize config state
config_state = ConfigState()

class WebhookHandler(BaseHTTPRequestHandler):
    """HTTP request handler for receiving JSON updates from the web frontend"""
    
    def _set_response(self, status_code=200, content_type="application/json"):
        self.send_response(status_code)
        self.send_header('Content-type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')  # Allow CORS
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_OPTIONS(self):
        """Handle OPTIONS requests for CORS preflight"""
        self._set_response()
    
    def do_POST(self):
        """Handle POST requests with JSON configuration updates"""
        global last_update_time, current_config
        
        try:
            # Get content length
            content_length = int(self.headers['Content-Length'])
            
            # Read the request body
            post_data = self.rfile.read(content_length)
            
            # Parse JSON data
            try:
                config = json.loads(post_data.decode())
                logging.info(f"Received JSON configuration update: {json.dumps(config, indent=2)}")
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
            
            # Update last update time and current config
            last_update_time = datetime.now()
            current_config = config
            
            # Update the config state
            config_state.update_from_json(config)
            
            # Send success response
            self._set_response()
            self.wfile.write(json.dumps({"status": "success", "timestamp": timestamp}).encode())
            
        except Exception as e:
            logging.error(f"Error processing webhook: {e}")
            self._set_response(500)
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def do_GET(self):
        """Handle GET requests for health check and status"""
        if self.path == '/health':
            # Health check endpoint
            self._set_response()
            self.wfile.write(json.dumps({
                "status": "healthy",
                "lastUpdate": last_update_time.isoformat() if last_update_time else None
            }).encode())
        elif self.path == '/status':
            # Status endpoint
            self._set_response()
            status_data = {
                "controlMode": "manual" if config_state.manualcontrol_mode else "auto" if config_state.autocontrol_mode else "semi",
                "selectedPole": config_state.selected_pole,
                "activeRoute": config_state.active_route,
                "yellowBlink": config_state.all_pole_yellow_blink,
                "timeZone": config_state.time_zone_number,
                "lastCommand": config_state.last_command,
                "lastUpdate": last_update_time.isoformat() if last_update_time else None
            }
            self.wfile.write(json.dumps(status_data).encode())
        else:
            self._set_response(404)
            self.wfile.write(json.dumps({"error": "Not found"}).encode())

def run_server():
    """Run the webhook server to receive JSON updates"""
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

def process_json_file():
    """Process the JSON configuration file if it exists"""
    if os.path.exists(JSON_FILE_PATH):
        try:
            with open(JSON_FILE_PATH, 'r') as f:
                config = json.load(f)
                config_state.update_from_json(config)
                logging.info("Loaded configuration from file")
        except Exception as e:
            logging.error(f"Error loading configuration from file: {e}")

def main():
    """Main function to run the JSON receiver"""
    logging.info("Starting Traffic Junction JSON Monitor")
    
    # Process existing JSON file if available
    process_json_file()
    
    # Print initial state
    config_state.print_current_state()
    
    # Run the webhook server
    run_server()

if __name__ == "__main__":
    main()
