#!/bin/bash
# Quiz App - 超短縮起動スクリプト
# Windows: curl -s https://raw.githubusercontent.com/muumuu8181/quiz-app/master/q | cmd
# Mac/Linux: curl -s https://raw.githubusercontent.com/muumuu8181/quiz-app/master/q | bash

if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows
    curl -s https://raw.githubusercontent.com/muumuu8181/quiz-app/master/quiz-app-launcher.bat | cmd
else
    # Mac/Linux
    curl -s https://raw.githubusercontent.com/muumuu8181/quiz-app/master/quiz-app-launcher.sh | bash
fi