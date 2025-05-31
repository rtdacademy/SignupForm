#!/bin/bash

echo "Firebase Functions Memory Monitor"
echo "================================"

while true; do
    clear
    echo "Firebase Functions Memory Monitor - $(date)"
    echo "================================"
    
    # Find Firebase processes
    FIREBASE_PIDS=$(pgrep -f "firebase.*functions")
    
    if [ -z "$FIREBASE_PIDS" ]; then
        echo "No Firebase functions emulator processes found"
    else
        echo "Memory usage by Firebase processes:"
        echo "PID     %MEM    RSS(MB)  COMMAND"
        echo "---     ----    -------  -------"
        
        for pid in $FIREBASE_PIDS; do
            ps -p $pid -o pid,%mem,rss,cmd --no-headers | awk '{printf "%-7s %-7s %-8.1f %s\n", $1, $2, $3/1024, $4}'
        done
        
        echo ""
        echo "Total memory usage:"
        ps -p $(echo $FIREBASE_PIDS | tr ' ' ',') -o rss --no-headers | awk '{sum += $1} END {printf "Total RSS: %.1f MB\n", sum/1024}'
    fi
    
    sleep 5
done