#!/bin/bash

echo "========================================"
echo "  Sensor Data Collector - Server Setup"
echo "========================================"
echo ""

show_menu() {
    echo "Select server to run:"
    echo "1. Node.js Server"
    echo "2. Python Server"
    echo "3. Install Node.js Dependencies"
    echo "4. Install Python Dependencies"
    echo "5. Exit"
    echo ""
}

while true; do
    show_menu
    read -p "Enter your choice (1-5): " choice
    
    case $choice in
        1)
            echo ""
            echo "Starting Node.js server..."
            echo "Server will be available at http://localhost:3000"
            echo "Press Ctrl+C to stop the server"
            echo ""
            node example_server.js
            break
            ;;
        2)
            echo ""
            echo "Starting Python server..."
            echo "Server will be available at http://localhost:3000"
            echo "Press Ctrl+C to stop the server"
            echo ""
            python3 example_server.py
            break
            ;;
        3)
            echo ""
            echo "Installing Node.js dependencies..."
            npm install
            echo ""
            echo "Done! You can now run the Node.js server."
            echo ""
            read -p "Press Enter to continue..."
            ;;
        4)
            echo ""
            echo "Installing Python dependencies..."
            pip3 install flask flask-cors
            echo ""
            echo "Done! You can now run the Python server."
            echo ""
            read -p "Press Enter to continue..."
            ;;
        5)
            echo ""
            echo "Goodbye!"
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            echo ""
            ;;
    esac
done
