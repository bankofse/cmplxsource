#!/bin/bash
consul agent -dc dev -data-dir ./consul -server -ui-dir /Users/michael/Downloads/dist -bootstrap-expect 1
