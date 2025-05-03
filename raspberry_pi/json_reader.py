#!/usr/bin/env python3
"""
JSON Reader for Traffic Junction Control System

This script continuously reads the JSON configuration file from the web server
and applies the settings to control the traffic junction hardware.

Usage:
    python3 json_reader.py

Configuration:
    - Set the WEB_SERVER_URL to your web hosting platform URL
    - Set the JSON_FILE_PATH to the location where you want to save the JSON file
    - Set the POLL_INTERVAL to control how frequently to check for updates (in seconds)
"""

import json
import time
import os
import requests
import logging
from datetime import datetime

# Configuration
WEB_SERVER_URL = "https://your-web-server.com/api/get-json-config"
JSON_FILE_PATH = "/home/pi/traffic_junction/config.json"
BACKUP_DIR = "/home/pi/traffic_junction/backups"
POLL_INTERVAL = 5  # seconds
LOG_FILE = "/home/pi/traffic_junction/json_reader.log"

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# Ensure backup directory exists
os.makedirs(BACKUP_DIR, exist_ok=True)

# GPIO pin mapping for traffic lights
# Format: {pole: {signal: gpio_pin}}
GPIO_MAPPING = {
    "P1A": {
        "red": 2,
        "yellow": 3,
        "greenLeft": 4,
        "greenStraight": 17,
        "greenRight": 27
    },
    "P1B": {
        "red": 22,
        "yellow": 10,
        "greenLeft": 9,
        "greenStraight": 11,
        "greenRight": 5
    },
    # Add mappings for other poles (P2A, P2B, P3A, P3B, P4A, P4B)
}

def setup_gpio():
    """Initialize GPIO pins for traffic light control"""
    try:
        import RPi.GPIO as GPIO
        GPIO.setmode(GPIO.BCM)
        
        # Set up all pins as outputs
        for pole in GPIO_MAPPING:
            for signal in GPIO_MAPPING[pole]:
                pin = GPIO_MAPPING[pole][signal]
                GPIO.setup(pin, GPIO.OUT)
                GPIO.output(pin, GPIO.LOW)  # Start with all lights off
        
        logging.info("GPIO setup completed successfully")
        return GPIO
    except ImportError:
        logging.warning("RPi.GPIO module not available. Running in simulation mode.")
        return None
    except Exception as e:
        logging.error(f"Error setting up GPIO: {e}")
        return None

def fetch_json_config():
    """Fetch the JSON configuration from the web server"""
    try:
        response = requests.get(WEB_SERVER_URL, timeout=10)
        response.raise_for_status()  # Raise an exception for HTTP errors
        
        # Parse JSON response
        config = response.json()
        
        # Save to file
        with open(JSON_FILE_PATH, 'w') as f:
            json.dump(config, f, indent=2)
        
        # Create a backup with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(BACKUP_DIR, f"config_{timestamp}.json")
        with open(backup_path, 'w') as f:
            json.dump(config, f, indent=2)
        
        logging.info(f"Successfully fetched and saved JSON configuration")
        return config
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching JSON configuration: {e}")
        return None
    except json.JSONDecodeError as e:
        logging.error(f"Error parsing JSON response: {e}")
        return None
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        return None

def load_local_json_config():
    """Load the JSON configuration from the local file"""
    try:
        if os.path.exists(JSON_FILE_PATH):
            with open(JSON_FILE_PATH, 'r') as f:
                config = json.load(f)
            logging.info("Loaded configuration from local file")
            return config
        else:
            logging.warning("Local configuration file not found")
            return None
    except Exception as e:
        logging.error(f"Error loading local configuration: {e}")
        return None

def apply_configuration(config, GPIO):
    """Apply the configuration to control the traffic lights"""
    if not config:
        logging.warning("No configuration to apply")
        return
    
    try:
        # Extract the current control mode
        control_mode = config.get("controlMode", "auto")
        logging.info(f"Current control mode: {control_mode}")
        
        if control_mode == "auto":
            apply_auto_control(config, GPIO)
        elif control_mode == "manual":
            apply_manual_control(config, GPIO)
        elif control_mode == "semi":
            apply_semi_control(config, GPIO)
        else:
            logging.warning(f"Unknown control mode: {control_mode}")
    except Exception as e:
        logging.error(f"Error applying configuration: {e}")

def apply_auto_control(config, GPIO):
    """Apply auto control mode settings"""
    if not GPIO:
        logging.info("Simulation mode: Would apply auto control settings")
        return
    
    try:
        # Get current time
        now = datetime.now()
        current_time = now.strftime("%H:%M")
        
        # Find the active time zone
        time_zones = config.get("timeZones", [])
        active_zone = None
        
        for zone in time_zones:
            start_time = zone.get("startTime", "00:00")
            end_time = zone.get("endTime", "23:59")
            
            # Handle time zones that span across midnight
            if start_time > end_time:
                if current_time >= start_time or current_time < end_time:
                    active_zone = zone
                    break
            else:
                if start_time <= current_time < end_time:
                    active_zone = zone
                    break
        
        if not active_zone:
            logging.warning("No active time zone found for current time")
            return
        
        logging.info(f"Active time zone: {active_zone.get('name')}")
        
        # Get the sequence for the active time zone
        sequence_str = active_zone.get("sequence", "")
        sequence = [int(s.strip()) for s in sequence_str.split(",") if s.strip().isdigit()]
        
        if not sequence:
            logging.warning("No valid sequence found in active time zone")
            return
        
        # Get the current step in the sequence (based on time)
        # This is a simple implementation - you might want to use a more sophisticated approach
        seconds_since_midnight = now.hour * 3600 + now.minute * 60 + now.second
        step_index = (seconds_since_midnight // 10) % len(sequence)  # Change route every 10 seconds
        current_route = sequence[step_index]
        
        logging.info(f"Current route in sequence: {current_route}")
        
        # Apply the current route
        apply_route(config, GPIO, current_route)
        
    except Exception as e:
        logging.error(f"Error in auto control mode: {e}")

def apply_manual_control(config, GPIO):
    """Handle manual control mode settings"""
    if not GPIO:
        logging.info("Simulation mode: Would apply manual control settings")
        return
    
    try:
        # Process manual control variables in the format manual_control_pole_1A_red_light
        for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
            # Map signal types to GPIO mapping keys
            signal_map = {
                "red": "red",
                "yel": "yellow",
                "grnL": "greenLeft",
                "grnS": "greenStraight",
                "grnR": "greenRight",
                "yel_blink": "yellow"  # Special case for yellow blink
            }
            
            # Check each signal type
            for signal_type, gpio_key in signal_map.items():
                var_name = f"manual_control_pole_{pole}_{signal_type}_light"
                
                if var_name in config:
                    light_state = config[var_name]
                    
                    # Handle special case for yellow blink
                    if signal_type == "yel_blink" and light_state:
                        #self._set_yellow_blink(pole) #Removed self
                        continue
                    
                    # Normal light control
                    if pole in GPIO_MAPPING and gpio_key in GPIO_MAPPING[pole]:
                        pin = GPIO_MAPPING[pole][gpio_key]
                        GPIO.output(pin, GPIO.HIGH if light_state else GPIO.LOW)
        
        # Sleep to prevent rapid changes
        time.sleep(0.5)
    except Exception as e:
        logging.error(f"Error in manual control: {e}")

def apply_semi_control(config, GPIO):
    """Apply semi-automatic control mode settings"""
    if not GPIO:
        logging.info("Simulation mode: Would apply semi-control settings")
        return
    
    try:
        # Check if there's an active manual override
        manual_override = config.get("manualOverride", {})
        is_override_active = manual_override.get("active", False)
        
        if is_override_active:
            # Apply the manual override route
            override_route = manual_override.get("route")
            if override_route:
                logging.info(f"Applying manual override route: {override_route}")
                apply_route(config, GPIO, override_route)
        else:
            # Fall back to auto control behavior
            apply_auto_control(config, GPIO)
    
    except Exception as e:
        logging.error(f"Error in semi-control mode: {e}")

def apply_route(config, GPIO, route_number):
    """Apply a specific route configuration"""
    if not GPIO:
        logging.info(f"Simulation mode: Would apply route {route_number}")
        return
    
    try:
        # Get the signal sequences
        signal_sequences = config.get("signalSequences", {})
        route_sequence = signal_sequences.get(str(route_number), {})
        
        if not route_sequence:
            logging.warning(f"No sequence found for route {route_number}")
            return
        
        logging.info(f"Applying route {route_number}")
        
        # Apply the sequence to each pole
        for pole, signals in route_sequence.items():
            if pole not in GPIO_MAPPING:
                continue
                
            # Turn off all signals first
            for signal in GPIO_MAPPING[pole]:
                GPIO.output(GPIO_MAPPING[pole][signal], GPIO.LOW)
            
            # Turn on signals based on the sequence
            for signal, value in signals.items():
                if signal not in GPIO_MAPPING[pole]:
                    continue
                    
                if value == "1" or value == "D":
                    GPIO.output(GPIO_MAPPING[pole][signal], GPIO.HIGH)
                elif value == "A" and signal == "greenAll":
                    # Turn on all green signals
                    if "greenLeft" in GPIO_MAPPING[pole]:
                        GPIO.output(GPIO_MAPPING[pole]["greenLeft"], GPIO.HIGH)
                    if "greenStraight" in GPIO_MAPPING[pole]:
                        GPIO.output(GPIO_MAPPING[pole]["greenStraight"], GPIO.HIGH)
                    if "greenRight" in GPIO_MAPPING[pole]:
                        GPIO.output(GPIO_MAPPING[pole]["greenRight"], GPIO.HIGH)
    
    except Exception as e:
        logging.error(f"Error applying route {route_number}: {e}")

def main():
    """Main function to run the JSON reader"""
    logging.info("Starting Traffic Junction JSON Reader")
    
    # Setup GPIO
    GPIO = setup_gpio()
    
    # Load initial configuration from local file
    config = load_local_json_config()
    if config:
        apply_configuration(config, GPIO)
    
    # Main loop
    while True:
        try:
            # Fetch new configuration
            new_config = fetch_json_config()
            
            if new_config:
                # Apply the new configuration
                apply_configuration(new_config, GPIO)
            
            # Wait for the next poll interval
            time.sleep(POLL_INTERVAL)
            
        except KeyboardInterrupt:
            logging.info("Program terminated by user")
            break
        except Exception as e:
            logging.error(f"Unexpected error in main loop: {e}")
            time.sleep(POLL_INTERVAL)  # Wait before retrying
    
    # Cleanup
    if GPIO:
        try:
            import RPi.GPIO as GPIO_module
            GPIO_module.cleanup()
            logging.info("GPIO cleanup completed")
        except Exception as e:
            logging.error(f"Error during GPIO cleanup: {e}")
    
    logging.info("Traffic Junction JSON Reader stopped")

if __name__ == "__main__":
    main()
