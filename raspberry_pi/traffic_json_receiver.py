import json
import requests
import time
import sys
import os
from datetime import datetime

# Configure logging
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("traffic_json_receiver.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Global variables to store the current state
current_state = {}

def process_json_data(data):
    """
    Process the received JSON data and convert it to the required variable format
    """
    try:
        logger.info("Processing received JSON data")
        
        # Create a dictionary to hold all the variables
        variables = {}
        
        # Extract control mode
        variables["manualcontrol_mode"] = data.get("manualcontrol_mode", False)
        variables["autocontrol_mode"] = data.get("autocontrol_mode", False)
        variables["semicontrol_mode"] = data.get("semicontrol_mode", False)
        
        # Extract pole URLs
        for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
            variables[f"url_{pole}"] = data.get(f"url_{pole}", f"http://192.168.1.{10+int(pole[0])+int(ord(pole[1])-65)}")
        
        # Extract manual control signals
        for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
            for signal in ["red", "yel", "grnL", "grnS", "grnR", "yel_blink"]:
                variables[f"manual_control_pole_{pole}_{signal}_light"] = data.get(f"manual_control_pole_{pole}_{signal}_light", False)
        
        # Extract pole timing data
        for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
            for timing in ["red", "yel", "grnL", "grnS", "grnR", "ped", "buz"]:
                variables[f"pole_{pole}_{timing}_time"] = data.get(f"pole_{pole}_{timing}_time", 1)
        
        # Extract common yellow time
        variables["all_pole_yellow_time"] = data.get("all_pole_yellow_time", 1)
        
        # Extract green priorities
        for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
            variables[f"green_priority_pole_{pole}"] = data.get(f"green_priority_pole_{pole}", "123")
        
        # Extract time zone settings
        variables["use_time_zone"] = data.get("use_time_zone", False)
        variables["total_no_of_time_zones"] = data.get("total_no_of_time_zones", 1)
        variables["time_zone_number"] = data.get("time_zone_number", 1)
        
        # Extract time zone data
        for zone in range(1, 9):
            variables[f"time_zone_{zone}_start_hr"] = data.get(f"time_zone_{zone}_start_hr", 12)
            variables[f"time_zone_{zone}_start_min"] = data.get(f"time_zone_{zone}_start_min", 0)
            variables[f"time_zone_{zone}_end_hr"] = data.get(f"time_zone_{zone}_end_hr", 12)
            variables[f"time_zone_{zone}_end_min"] = data.get(f"time_zone_{zone}_end_min", 0)
            
            # Extract blink mode enabled flag for this time zone
            variables[f"blink_mode_enabled_time_zone_{zone}"] = data.get(f"blink_mode_enabled_time_zone_{zone}", False)
            
            # Extract route sequence for this time zone
            variables[f"route_sequence_{zone}"] = data.get(f"route_sequence_{zone}", [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])
            
            # Extract time periods for each pole in this time zone
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                for timing in ["red", "yel", "grnL", "grnS", "grnR", "ped", "buz"]:
                    variables[f"pole_{pole}_{timing}_time_time_zone_{zone}"] = data.get(f"pole_{pole}_{timing}_time_time_zone_{zone}", 1)
        
        # Extract route matrix
        variables["route_matrix"] = data.get("route_matrix", [])
        
        # Extract all pole test modes
        variables["all_pole_red_test"] = data.get("all_pole_red_test", False)
        variables["all_pole_yellow_test"] = data.get("all_pole_yellow_test", False)
        variables["all_pole_green_test"] = data.get("all_pole_green_test", False)
        variables["all_pole_yellow_blink"] = data.get("all_pole_yellow_blink", False)
        variables["all_pole_all_light_blink"] = data.get("all_pole_all_light_blink", False)
        
        # Update the current state
        global current_state
        current_state = variables
        
        # Log success
        logger.info("Successfully processed JSON data")
        
        return variables
    except Exception as e:
        logger.error(f"Error processing JSON data: {str(e)}")
        return None

def handle_webhook(json_data):
    """
    Handle the webhook request with JSON data
    """
    try:
        logger.info("Received webhook request")
        
        # Process the JSON data
        variables = process_json_data(json_data)
        
        if variables:
            # Save the variables to a Python file
            save_variables_to_file(variables)
            
            # Apply the configuration to the traffic controller
            apply_configuration(variables)
            
            return True
        else:
            logger.error("Failed to process JSON data")
            return False
    except Exception as e:
        logger.error(f"Error handling webhook: {str(e)}")
        return False

def save_variables_to_file(variables):
    """
    Save the variables to a Python file
    """
    try:
        logger.info("Saving variables to file")
        
        # Create the file path
        file_path = os.path.join(os.path.dirname(__file__), "traffic_variables.py")
        
        # Create a backup of the existing file if it exists
        if os.path.exists(file_path):
            backup_path = f"{file_path}.bak.{int(time.time())}"
            os.rename(file_path, backup_path)
            logger.info(f"Created backup of existing file: {backup_path}")
        
        # Write the variables to the file
        with open(file_path, "w") as f:
            f.write("# Traffic Junction Control Variables\n")
            f.write(f"# Generated on {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # Write URL settings
            f.write("##############################\n")
            f.write("# URL Set from the SW for each Traffic Pole.\n\n")
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                f.write(f"url_{pole} = \"{variables.get(f'url_{pole}', '')}\"\n\n")
            
            # Write control modes
            f.write("###########################################################################################\n")
            f.write("## Main Control Modes\n\n")
            f.write(f"manualcontrol_mode = {variables.get('manualcontrol_mode', False)}\n")
            f.write(f"autocontrol_mode = {variables.get('autocontrol_mode', False)}\n")
            f.write(f"semicontrol_mode = {variables.get('semicontrol_mode', False)}\n\n")
            
            # Write manual control signals
            f.write("################################################\n")
            f.write("###Manual Control Signals\n")
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                for signal in ["red", "yel", "grnL", "grnS", "grnR", "yel_blink"]:
                    f.write(f"manual_control_pole_{pole}_{signal}_light = {variables.get(f'manual_control_pole_{pole}_{signal}_light', False)}\n")
                f.write("\n")
            
            # Write route matrix
            f.write("## Light Settings configured for each route Total 14 routes for each pole between 1A to 4B\n")
            f.write("# ##############################################################################################################################################################################################################################################################################################################################################################################################\n")
            f.write("route_matrix = [\n")
            f.write("#                   1A     1A     1A     1A     1A     1A      1A     1A     1A     1A     1A     1A        2A     2A     2A     2A     2A     2A      2B     2B     2B     2B     2B     2B       3A     3A     3A     3A     3A     3A      3B     3B     3B     3B     3B     3B       4A     4A     4A     4A     4A     4A       4B     4B     4B     4B     4B     4B  \n")
            f.write("#                   R       Y     GL     GS     GR     GA      R       Y     GL     GS     GR     GA        R       Y     GL     GS     GR     GA      R       Y     GL     GS     GR     GA       R       Y     GL     GS     GR     GA      R       Y     GL     GS     GR     GA       R       Y     GL     GS     GR     GA       R       Y     GL     GS     GR     GA  \n")
            
            # Write each route in the matrix
            route_matrix = variables.get("route_matrix", [])
            for i, route in enumerate(route_matrix):
                f.write(f"#ROUTE{i+1}#\n")
                f.write(f"                 {route},\n")
            
            f.write("                \n")
            f.write("                ]\n")
            f.write("###############################################################################################################################################################################################################################################################################################################################################################################################\n")
            f.write("##############################################################################################################################################################################################################################################################################################################################################################################################\n")
            f.write("##############################################################################################################################################################################################################################################################################################################################################################################################\n\n")
            
            # Write pole timing data
            f.write("##If time zones not used and if its continuous control, then below will be the timings used.\n")
            f.write("##This can be considered as Time zone 1 as Default time zone values only but not the actual TIME based.\n\n")
            
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                for timing in ["red", "yel", "grnL", "grnS", "grnR", "ped", "buz"]:
                    f.write(f"pole_{pole}_{timing}_time = {variables.get(f'pole_{pole}_{timing}_time', 1)}\n")
                f.write("\n")
            
            # Write common yellow time
            f.write("## All pole yellow time is the common time fixed from the user entry for yellow time\n")
            f.write("## This time shall be same for all yellow poles\n\n")
            f.write(f"all_pole_yellow_time = {variables.get('all_pole_yellow_time', 1)} ## 0 - 300 Max\n\n")
            
            # Write green priorities
            f.write("## Green priority for Green Left, Green Straight & Green Right\n")
            f.write("## Encoded in the order with three numbers 1,2,3 together a signle value as 123 with any combinations\n\n")
            
            for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                f.write(f"green_priority_pole_{pole} = {variables.get(f'green_priority_pole_{pole}', '123')}\n")
            
            f.write("\n##################################################################################################################\n")
            
            # Write time zone settings
            f.write("## Total number of Time zones availabel for this controller, fixed to 8 for now\n\n")
            f.write(f"total_no_of_time_zones = {variables.get('total_no_of_time_zones', 1)}\n\n")
            
            # Write time zone data
            f.write("## Time Zone Start time & End time in 24 hr format for Eight Time zones Maximum\n\n")
            
            for zone in range(1, 9):
                f.write(f"time_zone_{zone}_start_hr = {variables.get(f'time_zone_{zone}_start_hr', 12)}\n")
                f.write(f"time_zone_{zone}_start_min = {variables.get(f'time_zone_{zone}_start_min', 0)}\n")
                f.write(f"time_zone_{zone}_end_hr = {variables.get(f'time_zone_{zone}_end_hr', 12)}\n")
                f.write(f"time_zone_{zone}_end_min = {variables.get(f'time_zone_{zone}_end_min', 0)}\n\n")
            
            # Write time zone usage flag
            f.write("## Indicates to use Time zone based control or all time continuous control\n")
            f.write(f"use_time_zone = {variables.get('use_time_zone', False)}\n\n")
            
            # Write current time zone number
            f.write("## 1 to 8 Max time Zones, here it indicates the current time zone number\n")
            f.write(f"time_zone_number = {variables.get('time_zone_number', 1)} \n\n")
            
            # Write time periods for each time zone
            f.write("#################################################\n")
            f.write("## All durations are max 1 - 300\n")
            f.write("#################################################\n")
            
            for zone in range(1, 9):
                f.write(f"## Zone {zone} Time periods of each light\n\n")
                
                for pole in ["1A", "1B", "2A", "2B", "3A", "3B", "4A", "4B"]:
                    for timing in ["red", "yel", "grnL", "grnS", "grnR", "ped", "buz"]:
                        f.write(f"pole_{pole}_{timing}_time_time_zone_{zone} = {variables.get(f'pole_{pole}_{timing}_time_time_zone_{zone}', 1)}\n")
                    f.write("\n")
                
                f.write(f"{'#' * (zone * 10)}\n")
            
            # Write route sequences
            f.write("\n## Route sequence mentioned at each time zone\n")
            for zone in range(1, 9):
                f.write(f"route_sequence_{zone} = {variables.get(f'route_sequence_{zone}', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14])}\n")
            
            f.write("\n## Blink modes is enabled or route sequence to be followed for each time zone\n")
            for zone in range(1, 9):
                f.write(f"blink_mode_enabled_time_zone_{zone} = {variables.get(f'blink_mode_enabled_time_zone_{zone}', False)}\n")
            
            # Write all pole test modes
            f.write("\n## List of variables from control all signals\n")
            f.write(f"all_pole_red_test = {variables.get('all_pole_red_test', False)}\n")
            f.write(f"all_pole_yellow_test = {variables.get('all_pole_yellow_test', False)}\n")
            f.write(f"all_pole_green_test = {variables.get('all_pole_green_test', False)}\n")
            f.write(f"all_pole_yellow_blink = {variables.get('all_pole_yellow_blink', False)}\n")
            f.write(f"all_pole_all_light_blink = {variables.get('all_pole_all_light_blink', False)}\n")
            
            f.write("\n##################################################################################################################\n")
        
        logger.info(f"Variables saved to file: {file_path}")
        return True
    except Exception as e:
        logger.error(f"Error saving variables to file: {str(e)}")
        return False

def apply_configuration(variables):
    """
    Apply the configuration to the traffic controller
    """
    try:
        logger.info("Applying configuration to traffic controller")
        
        # Here you would implement the logic to apply the configuration
        # to the actual traffic controller hardware
        
        # For now, we'll just log that we would apply the configuration
        logger.info("Configuration would be applied to traffic controller")
        
        # If you have actual hardware control code, you would call it here
        
        return True
    except Exception as e:
        logger.error(f"Error applying configuration: {str(e)}")
        return False

def start_webhook_server(port=8080):
    """
    Start the webhook server
    """
    from flask import Flask, request, jsonify
    
    app = Flask(__name__)
    
    @app.route('/webhook', methods=['POST'])
    def webhook():
        try:
            json_data = request.json
            
            if not json_data:
                return jsonify({"status": "error", "message": "No JSON data received"}), 400
            
            success = handle_webhook(json_data)
            
            if success:
                return jsonify({"status": "success", "message": "Configuration applied successfully"}), 200
            else:
                return jsonify({"status": "error", "message": "Failed to apply configuration"}), 500
        except Exception as e:
            logger.error(f"Error in webhook endpoint: {str(e)}")
            return jsonify({"status": "error", "message": f"Internal server error: {str(e)}"}), 500
    
    @app.route('/status', methods=['GET'])
    def status():
        """
        Return the current status of the traffic controller
        """
        return jsonify({
            "status": "running",
            "timestamp": datetime.now().isoformat(),
            "current_state": current_state
        }), 200
    
    logger.info(f"Starting webhook server on port {port}")
    app.run(host='0.0.0.0', port=port)

if __name__ == "__main__":
    # Start the webhook server
    start_webhook_server()
