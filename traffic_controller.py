#!/usr/bin/env python3
"""
Traffic Controller for Raspberry Pi

This script controls the GPIO pins based on the configuration received from the web interface.
It reads the traffic_start_variables.py file and applies the settings to the GPIO pins.
"""

import os
import time
import logging
import threading
import importlib
import sys
import json
from datetime import datetime

# Try to import RPi.GPIO, but provide a mock if not available (for development)
try:
    import RPi.GPIO as GPIO
    GPIO_AVAILABLE = True
except ImportError:
    print("RPi.GPIO not available, using mock implementation")
    GPIO_AVAILABLE = False
    
    # Mock GPIO for development
    class MockGPIO:
        BCM = "BCM"
        OUT = "OUT"
        HIGH = 1
        LOW = 0
        
        def __init__(self):
            self.pins = {}
            self.mode = None
            
        def setmode(self, mode):
            self.mode = mode
            print(f"GPIO mode set to {mode}")
            
        def setup(self, pin, mode):
            self.pins[pin] = {"mode": mode, "value": 0}
            print(f"Pin {pin} setup as {mode}")
            
        def output(self, pin, value):
            if pin in self.pins:
                self.pins[pin]["value"] = value
                print(f"Pin {pin} set to {value}")
            else:
                print(f"Error: Pin {pin} not set up")
                
        def cleanup(self):
            self.pins = {}
            print("GPIO cleanup")
    
    GPIO = MockGPIO()

# Configuration
VARIABLES_FILE = "/home/pi/traffic_junction/traffic_start_variables.py"
LOG_FILE = "/home/pi/traffic_junction/traffic_controller.log"

# Setup logging
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

# GPIO pin mapping for each pole and light
# Format: {pole_name: {light_type: gpio_pin}}
GPIO_MAPPING = {
    "1A": {
        "red": 2,
        "yellow": 3,
        "greenLeft": 4,
        "greenStraight": 17,
        "greenRight": 27
    },
    "1B": {
        "red": 22,
        "yellow": 10,
        "greenLeft": 9,
        "greenStraight": 11,
        "greenRight": 5
    },
    "2A": {
        "red": 6,
        "yellow": 13,
        "greenLeft": 19,
        "greenStraight": 26,
        "greenRight": 21
    },
    "2B": {
        "red": 20,
        "yellow": 16,
        "greenLeft": 12,
        "greenStraight": 7,
        "greenRight": 8
    },
    "3A": {
        "red": 25,
        "yellow": 24,
        "greenLeft": 23,
        "greenStraight": 18,
        "greenRight": 15
    },
    "3B": {
        "red": 14,
        "yellow": 4,
        "greenLeft": 3,
        "greenStraight": 2,
        "greenRight": 0
    },  14,
        "yellow": 4,
        "greenLeft": 3,
        "greenStraight": 2,
        "greenRight": 0
    },
    "4A": {
        "red": 1,
        "yellow": 5,
        "greenLeft": 6,
        "greenStraight": 7,
        "greenRight": 8
    },
    "4B": {
        "red": 9,
        "yellow": 10,
        "greenLeft": 11,
        "greenStraight": 12,
        "greenRight": 13
    }
}

class TrafficController:
    """Class to control traffic lights based on configuration"""
    
    def __init__(self):
        self.variables = {}
        self.running = False
        self.current_route = 1
        self.current_time_zone = 1
        self.control_thread = None
        
        # Initialize GPIO
        if GPIO_AVAILABLE:
            GPIO.setmode(GPIO.BCM)
            self._setup_gpio_pins()
    
    def _setup_gpio_pins(self):
        """Set up all GPIO pins as outputs"""
        for pole, lights in GPIO_MAPPING.items():
            for light, pin in lights.items():
                GPIO.setup(pin, GPIO.OUT)
                GPIO.output(pin, GPIO.LOW)  # Start with all lights off
        logging.info("GPIO pins initialized")
    
    def load_variables(self):
        """Load variables from the traffic_start_variables.py file"""
        try:
            # Add the directory containing the file to the Python path
            sys.path.append(os.path.dirname(VARIABLES_FILE))
            
            # Import the module
            module_name = os.path.basename(VARIABLES_FILE).replace('.py', '')
            # Force reload to get the latest changes
            if module_name in sys.modules:
                importlib.reload(sys.modules[module_name])
            else:
                importlib.import_module(module_name)
            
            traffic_vars = sys.modules[module_name]
            
            # Get all variables from the module
            self.variables = {name: getattr(traffic_vars, name) for name in dir(traffic_vars) 
                             if not name.startswith('__') and not callable(getattr(traffic_vars, name))}
            
            logging.info(f"Successfully loaded {len(self.variables)} variables from {VARIABLES_FILE}")
            
            # Determine current time zone if time zones are used
            if self.variables.get('use_time_zone', False):
                self._determine_current_time_zone()
            
            return True
        except Exception as e:
            logging.error(f"Error loading variables from {VARIABLES_FILE}: {e}")
            return False
    
    def _determine_current_time_zone(self):
        """Determine the current time zone based on the current time"""
        try:
            now = datetime.now()
            current_hour = now.hour
            current_minute = now.minute
            current_time_minutes = current_hour * 60 + current_minute
            
            for zone in range(1, 9):
                start_hr = self.variables.get(f'time_zone_{zone}_start_hr', 0)
                start_min = self.variables.get(f'time_zone_{zone}_start_min', 0)
                end_hr = self.variables.get(f'time_zone_{zone}_end_hr', 0)
                end_min = self.variables.get(f'time_zone_{zone}_end_min', 0)
                
                start_time_minutes = start_hr * 60 + start_min
                end_time_minutes = end_hr * 60 + end_min
                
                # Handle time zones that cross midnight
                if end_time_minutes < start_time_minutes:
                    # Time zone crosses midnight
                    if current_time_minutes >= start_time_minutes or current_time_minutes < end_time_minutes:
                        self.current_time_zone = zone
                        break
                else:
                    # Normal time zone
                    if start_time_minutes <= current_time_minutes < end_time_minutes:
                        self.current_time_zone = zone
                        break
            
            logging.info(f"Current time zone determined to be {self.current_time_zone}")
        except Exception as e:
            logging.error(f"Error determining current time zone: {e}")
    
    def start_control(self):
        """Start the traffic control process"""
        if self.running:
            logging.warning("Traffic control already running")
            return
        
        self.running = True
        self.control_thread = threading.Thread(target=self._control_loop)
        self.control_thread.daemon = True
        self.control_thread.start()
        logging.info("Traffic control started")
    
    def stop_control(self):
        """Stop the traffic control process"""
        self.running = False
        if self.control_thread:
            self.control_thread.join(timeout=2.0)
        self._turn_off_all_lights()
        logging.info("Traffic control stopped")
    
    def _turn_off_all_lights(self):
        """Turn off all traffic lights"""
        if GPIO_AVAILABLE:
            for pole, lights in GPIO_MAPPING.items():
                for light, pin in lights.items():
                    GPIO.output(pin, GPIO.LOW)
        logging.info("All lights turned off")
    
    def _control_loop(self):
        """Main control loop for traffic lights"""
        try:
            while self.running:
                # Reload variables to get the latest settings
                self.load_variables()
                
                # Check control mode
                if self.variables.get('manualcontrol_mode', False):
                    self._handle_manual_control()
                elif self.variables.get('autocontrol_mode', False):
                    self._handle_auto_control()
                elif self.variables.get('semicontrol_mode', False):
                    self._handle_semi_control()
                else:
                    # Default to auto control if no mode is set
                    self._handle_auto_control()
                
                # Sleep briefly to prevent CPU hogging
                time.sleep(0.1)
        except Exception as e:
            logging.error(f"Error in control loop: {e}")
            self.running = False
    
    def _handle_manual_control(self):
        """Handle manual control mode"""
        try:
            # In manual mode, directly set the lights based on manual control variables
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                for light in ["red", "yel", "grnL", "grnS", "grnR", "yel_blink"]:
                    var_name = f"manual_control_pole_{pole}_{light}_light"
                    if var_name in self.variables:
                        light_state = self.variables[var_name]
                        
                        # Handle special case for yellow blink
                        if light == "yel_blink" and light_state:
                            self._set_yellow_blink(pole)
                            continue
                        
                        # Map the light name to the GPIO mapping name
                        gpio_light = {
                            "red": "red",
                            "yel": "yellow",
                            "grnL": "greenLeft",
                            "grnS": "greenStraight",
                            "grnR": "greenRight"
                        }.get(light)
                        
                        if gpio_light and pole in GPIO_MAPPING and gpio_light in GPIO_MAPPING[pole]:
                            pin = GPIO_MAPPING[pole][gpio_light]
                            GPIO.output(pin, GPIO.HIGH if light_state else GPIO.LOW)
            
            # Sleep to prevent rapid changes
            time.sleep(0.5)
        except Exception as e:
            logging.error(f"Error in manual control: {e}")
    
    def _handle_auto_control(self):
        """Handle automatic control mode"""
        try:
            # Get the current time zone
            if self.variables.get('use_time_zone', False):
                self._determine_current_time_zone()
                time_zone = self.current_time_zone
            else:
                time_zone = 1  # Default to time zone 1
            
            # Check if blink mode is enabled for this time zone
            blink_mode_var = f"blink_mode_enabled_time_zone_{time_zone}"
            if self.variables.get(blink_mode_var, False):
                self._handle_blink_mode(time_zone)
                return
            
            # Get the route sequence for this time zone
            route_sequence_var = f"route_sequence_{time_zone}"
            if route_sequence_var in self.variables:
                route_sequence = self.variables[route_sequence_var]
                
                # Get the next route in the sequence
                if not hasattr(self, 'sequence_index') or self.sequence_index >= len(route_sequence):
                    self.sequence_index = 0
                
                route = route_sequence[self.sequence_index]
                self.sequence_index += 1
                
                # Apply the route
                self._apply_route(route, time_zone)
            else:
                logging.warning(f"Route sequence for time zone {time_zone} not found")
        except Exception as e:
            logging.error(f"Error in auto control: {e}")
    
    def _handle_semi_control(self):
        """Handle semi-automatic control mode"""
        # Semi-automatic mode is a mix of auto and manual
        # For now, we'll just use auto control as a base
        self._handle_auto_control()
    
    def _handle_blink_mode(self, time_zone):
        """Handle blink mode for a time zone"""
        try:
            # In blink mode, all yellow lights blink
            blink_on = int(time.time()) % 2 == 0  # Toggle every second
            
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                # Turn off all other lights
                for light in ["red", "greenLeft", "greenStraight", "greenRight"]:
                    if pole in GPIO_MAPPING and light in GPIO_MAPPING[pole]:
                        pin = GPIO_MAPPING[pole][light]
                        GPIO.output(pin, GPIO.LOW)
                
                # Blink yellow lights
                if pole in GPIO_MAPPING and "yellow" in GPIO_MAPPING[pole]:
                    pin = GPIO_MAPPING[pole]["yellow"]
                    GPIO.output(pin, GPIO.HIGH if blink_on else GPIO.LOW)
            
            # Sleep for half a second to create the blink effect
            time.sleep(0.5)
        except Exception as e:
            logging.error(f"Error in blink mode: {e}")
    
    def _set_yellow_blink(self, pole):
        """Set a specific pole's yellow light to blink"""
        try:
            # Blink based on current time
            blink_on = int(time.time()) % 2 == 0  # Toggle every second
            
            if pole in GPIO_MAPPING and "yellow" in GPIO_MAPPING[pole]:
                pin = GPIO_MAPPING[pole]["yellow"]
                GPIO.output(pin, GPIO.HIGH if blink_on else GPIO.LOW)
        except Exception as e:
            logging.error(f"Error setting yellow blink for pole {pole}: {e}")
    
    def _apply_route(self, route, time_zone):
        """Apply a specific route configuration"""
        try:
            # Get the route matrix
            route_matrix = self.variables.get('route_matrix', [])
            
            if route <= 0 or route > len(route_matrix):
                logging.error(f"Invalid route number: {route}")
                return
            
            # Get the route configuration (0-indexed)
            route_config = route_matrix[route - 1]
            
            # Apply the configuration to each pole
            index = 0
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                for light in ["red", "yellow", "greenLeft", "greenStraight", "greenRight", "GA"]:
                    # Skip GA (not used in GPIO mapping)
                    if light == "GA":
                        index += 1
                        continue
                    
                    if index < len(route_config):
                        light_state = route_config[index]
                        
                        if pole in GPIO_MAPPING and light in GPIO_MAPPING[pole]:
                            pin = GPIO_MAPPING[pole][light]
                            GPIO.output(pin, GPIO.HIGH if light_state else GPIO.LOW)
                    
                    index += 1
            
            # Get the timing for this route and time zone
            timing_var = f"pole_1A_red_time_time_zone_{time_zone}"  # Use any timing as reference
            timing = self.variables.get(timing_var, 5)  # Default to 5 seconds
            
            # Sleep for the specified time
            time.sleep(timing)
        except Exception as e:
            logging.error(f"Error applying route {route}: {e}")
    
    def cleanup(self):
        """Clean up GPIO pins"""
        if GPIO_AVAILABLE:
            GPIO.cleanup()
        logging.info("GPIO cleanup complete")

def main():
    """Main function to run the traffic controller"""
    controller = TrafficController()
    
    try:
        # Load initial variables
        if controller.load_variables():
            # Start the control process
            controller.start_control()
            
            # Keep the main thread running
            while True:
                time.sleep(1)
        else:
            logging.error("Failed to load variables, exiting")
    except KeyboardInterrupt:
        logging.info("Traffic controller stopped by user")
    except Exception as e:
        logging.error(f"Error in traffic controller: {e}")
    finally:
        controller.stop_control()
        controller.cleanup()

if __name__ == "__main__":
    main()
